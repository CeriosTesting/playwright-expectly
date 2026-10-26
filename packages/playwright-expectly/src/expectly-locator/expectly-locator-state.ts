import { withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
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
	pass: boolean;
	/** Whether the element was found at least once. */
	found: boolean;
	errorMessage?: string;
}

async function pollForStability(
	locator: Locator,
	{ checkInterval, stabilityDuration, timeout }: StabilitySettings,
): Promise<StabilityPollResult> {
	let lastSnapshot: string | null = null;
	let stableStartTime: number | null = null;
	let successfulChecks = 0;
	const deadline = timeout ? Date.now() + timeout : Infinity;

	while (Date.now() < deadline) {
		let currentSnapshot: string | null = null;
		// A missing or detaching element restarts the stability window; other errors (such as strict mode
		// violations) are not retryable and are thrown.
		if ((await locator.count()) > 0) {
			try {
				currentSnapshot = await locator.innerHTML({ timeout: checkInterval });
			} catch (e: unknown) {
				if (!isTimeoutError(e)) throw e;
			}
		}

		if (currentSnapshot === null) {
			lastSnapshot = null;
			stableStartTime = null;
		} else {
			successfulChecks++;
			if (lastSnapshot === null || currentSnapshot !== lastSnapshot) {
				lastSnapshot = currentSnapshot;
				stableStartTime = Date.now();
			} else if (Date.now() - (stableStartTime ?? Date.now()) >= stabilityDuration) {
				return { pass: true, found: true };
			}
		}

		// Do not sleep past the deadline.
		const remaining = deadline - Date.now();
		if (remaining <= 0) break;
		await new Promise((resolve) => setTimeout(resolve, Math.min(checkInterval, remaining)));
	}

	if (successfulChecks === 0) {
		return {
			pass: false,
			found: false,
			errorMessage:
				`Locator was not found or never became available within ${timeout}ms.\n` +
				`Stability duration required: ${stabilityDuration}ms\n` +
				`Check interval: ${checkInterval}ms`,
		};
	}

	return {
		pass: false,
		found: true,
		errorMessage:
			`Locator content did not stabilize within ${timeout}ms.\n` +
			`Content was checked ${successfulChecks} time(s) but kept changing.\n` +
			`Stability duration required: ${stabilityDuration}ms\n` +
			`Check interval: ${checkInterval}ms`,
	};
}

/**
 * Element state and behavior matchers for Playwright locators.
 * These matchers validate dynamic behavior and element states.
 */
export const expectlyLocatorStateMatchers = withMatcherState({
	async toBeStable(locator: Locator, options?: StabilityOptions) {
		const assertionName = "toBeStable";
		const settings = resolveStabilitySettings(options, this.timeout);
		const { stabilityDuration, timeout } = settings;

		validateStabilityOptions(settings);

		const result = await pollForStability(locator, settings);
		const { errorMessage } = result;
		// Like Playwright's assertions, an element that never appears fails the `.not` form too.
		const pass = result.found ? result.pass : this.isNot;

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage && (!result.found || (!pass && !this.isNot))) {
				return `${hint}\n\n${errorMessage}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator content to not be stable for ${stabilityDuration}ms\n` +
					`But it remained unchanged`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator content to be stable for ${stabilityDuration}ms within ${timeout}ms\n` +
					`But content kept changing`
				);
			}

			return hint;
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
