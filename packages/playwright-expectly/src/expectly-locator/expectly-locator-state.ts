import { assertLocators, hasElements, runPolledMatcher, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect, errors, Locator } from "@playwright/test";

type StabilityOptions = Pick<PollOptions, "timeout"> & {
	stabilityDuration?: number;
	checkInterval?: number;
};

const DEFAULT_STABILITY_DURATION = 500;
const DEFAULT_CHECK_INTERVAL = 100;

type StabilitySettings = {
	stabilityDuration: number;
	checkInterval: number;
	/** Zero means no timeout, as in Playwright. */
	timeout: number;
};

/**
 * Resolves the stability settings. Defaults shrink to fit a short assertion timeout, so a short expect
 * timeout in the config does not turn `toBeStable()` into a configuration error.
 */
function resolveStabilitySettings(options: StabilityOptions | undefined, defaultTimeout: number): StabilitySettings {
	const timeout = options?.timeout ?? defaultTimeout;
	const stabilityDuration =
		options?.stabilityDuration ??
		(timeout > 0 ? Math.min(DEFAULT_STABILITY_DURATION, Math.floor(timeout / 2)) : DEFAULT_STABILITY_DURATION);
	const checkInterval =
		options?.checkInterval ?? Math.max(1, Math.min(DEFAULT_CHECK_INTERVAL, Math.floor(stabilityDuration / 2)));
	return { stabilityDuration, checkInterval, timeout };
}

function validateStabilityOptions({ checkInterval, stabilityDuration, timeout }: StabilitySettings): void {
	if (checkInterval <= 0) {
		throw new Error(`checkInterval must be positive, got: ${checkInterval}ms`);
	}
	if (stabilityDuration <= 0) {
		throw new Error(`stabilityDuration must be positive, got: ${stabilityDuration}ms`);
	}
	if (timeout < 0) {
		throw new Error(`timeout must not be negative, got: ${timeout}ms`);
	}
	if (checkInterval > stabilityDuration / 2) {
		throw new Error(
			`checkInterval (${checkInterval}ms) cannot be greater than half of stabilityDuration (${stabilityDuration / 2}ms). ` +
				`At least 2 checks are required during the stability period to ensure reliable detection.`,
		);
	}
	// A zero timeout waits as long as needed.
	if (timeout === 0) return;
	if (stabilityDuration >= timeout) {
		throw new Error(
			`stabilityDuration (${stabilityDuration}ms) must be less than timeout (${timeout}ms). ` +
				`The timeout must allow time for both content changes and stabilization.`,
		);
	}
	const minimumTimeout = checkInterval + stabilityDuration;
	if (timeout < minimumTimeout) {
		throw new Error(
			`timeout (${timeout}ms) is too short. Minimum required: ${minimumTimeout}ms ` +
				`(checkInterval ${checkInterval}ms + stabilityDuration ${stabilityDuration}ms). ` +
				`The timeout must allow at least one check plus full stabilization period.`,
		);
	}
}

function isTimeoutError(error: unknown): boolean {
	return error instanceof errors.TimeoutError || (error instanceof Error && error.name === "TimeoutError");
}

interface StabilityPollResult {
	/** Whether the content stayed unchanged for the stability duration. */
	stable: boolean;
	/** Whether the element was found at least once. */
	found: boolean;
	/** Whether polling stopped early because the page was closed. */
	interrupted: boolean;
	/** How many times the content was read. */
	checks: number;
}

async function pollForStability(
	state: ExpectMatcherState,
	locator: Locator,
	{ checkInterval, stabilityDuration, timeout }: StabilitySettings,
): Promise<StabilityPollResult> {
	let lastSnapshot: string | null = null;
	let stableSince: number | null = null;
	let checks = 0;

	// `.not.toBeStable()` means the content kept changing for the whole timeout, so stability is awaited under
	// `.not` as well (`until: true`) instead of returning at the first change.
	const stable = await runPolledMatcher(
		state,
		{ timeout, intervals: [checkInterval] },
		async () => {
			let snapshot: string | null = null;
			// A missing or detaching element restarts the stability window; other errors (such as strict mode
			// violations) are not retryable and are thrown.
			if (await hasElements(locator)) {
				try {
					snapshot = await locator.innerHTML({ timeout: checkInterval });
				} catch (error: unknown) {
					if (!isTimeoutError(error)) throw error;
				}
			}
			if (snapshot === null) {
				lastSnapshot = null;
				stableSince = null;
				return false;
			}
			checks++;
			if (snapshot !== lastSnapshot) {
				lastSnapshot = snapshot;
				stableSince = Date.now();
				return false;
			}
			return stableSince !== null && Date.now() - stableSince >= stabilityDuration;
		},
		{ target: locator.page(), until: true },
	);

	return { stable, found: checks > 0, interrupted: !stable && locator.page().isClosed(), checks };
}

/**
 * Element state and behavior matchers for Playwright locators.
 * These matchers validate dynamic behavior and element states.
 */
export const expectlyLocatorStateMatchers = withMatcherState({
	async toBeStable(locator: Locator, options?: StabilityOptions) {
		const assertionName = "toBeStable";
		assertLocators([locator]);
		const settings = resolveStabilitySettings(options, this.timeout);
		const { stabilityDuration, checkInterval, timeout } = settings;

		validateStabilityOptions(settings);

		const result = await pollForStability(this, locator, settings);
		// Like Playwright's assertions, an element that never appears fails the `.not` form too; so does polling
		// that was cut short by the page closing, since stability could not be determined either way.
		const pass = result.interrupted || !result.found ? this.isNot : result.stable;

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});
			const settingsText = `Stability duration required: ${stabilityDuration}ms\nCheck interval: ${checkInterval}ms`;

			if (result.interrupted) {
				return `${hint}\n\nCould not determine whether the locator content is stable.\n${settingsText}`;
			}

			if (!result.found) {
				return `${hint}\n\nLocator was not found or never became available within ${timeout}ms.\n${settingsText}`;
			}

			if (this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator content to not be stable for ${stabilityDuration}ms\n` +
					`But it remained unchanged`
				);
			}

			return (
				`${hint}\n\nLocator content did not stabilize within ${timeout}ms.\n` +
				`Content was checked ${result.checks} time(s) but kept changing.\n${settingsText}`
			);
		};

		return {
			message,
			pass,
			name: assertionName,
		};
	},
});

export const expectlyLocatorState: Expect<typeof expectlyLocatorStateMatchers> =
	baseExpect.extend(expectlyLocatorStateMatchers);
