import { expect as baseExpect, Locator } from "@playwright/test";

import { withMatcherState } from "../matchers/matcher-state-utils";
import { PollOptions } from "../types/poll-options";

type StabilityOptions = Pick<PollOptions, "timeout"> & {
	stabilityDuration?: number;
	checkInterval?: number;
};

function validateStabilityOptions(checkInterval: number, stabilityDuration: number, timeout: number): void {
	if (checkInterval <= 0) {
		throw new Error(`checkInterval must be positive, got: ${checkInterval}ms`);
	}
	if (stabilityDuration <= 0) {
		throw new Error(`stabilityDuration must be positive, got: ${stabilityDuration}ms`);
	}
	if (timeout <= 0) {
		throw new Error(`timeout must be positive, got: ${timeout}ms`);
	}
	if (checkInterval > stabilityDuration / 2) {
		throw new Error(
			`checkInterval (${checkInterval}ms) cannot be greater than half of stabilityDuration (${stabilityDuration / 2}ms). ` +
				`At least 2 checks are required during the stability period to ensure reliable detection.`,
		);
	}
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

interface StabilityPollResult {
	pass: boolean;
	errorMessage?: string;
}

async function pollForStability(
	locator: Locator,
	checkInterval: number,
	stabilityDuration: number,
	timeout: number,
): Promise<StabilityPollResult> {
	let lastSnapshot: string | null = null;
	let stableStartTime: number | null = null;
	let lastError: Error | undefined;
	let successfulChecks = 0;
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		try {
			const currentSnapshot = await locator.innerHTML({ timeout: checkInterval });
			successfulChecks++;
			lastError = undefined;

			if (lastSnapshot === null) {
				lastSnapshot = currentSnapshot;
				stableStartTime = Date.now();
			} else if (currentSnapshot === lastSnapshot) {
				const stableDuration = Date.now() - (stableStartTime ?? Date.now());
				if (stableDuration >= stabilityDuration) {
					return { pass: true };
				}
			} else {
				lastSnapshot = currentSnapshot;
				stableStartTime = Date.now();
			}
		} catch (e: unknown) {
			lastError = e instanceof Error ? e : new Error(String(e));
			lastSnapshot = null;
			stableStartTime = null;
		}

		await new Promise((resolve) => setTimeout(resolve, checkInterval));
	}

	if (successfulChecks === 0 && lastError) {
		throw lastError;
	}

	if (successfulChecks === 0) {
		return {
			pass: false,
			errorMessage:
				`Locator was not found or never became available within ${timeout}ms.\n` +
				`Stability duration required: ${stabilityDuration}ms\n` +
				`Check interval: ${checkInterval}ms`,
		};
	}

	return {
		pass: false,
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
		const stabilityDuration = options?.stabilityDuration ?? 500;
		const checkInterval = options?.checkInterval ?? 100;
		const timeout = options?.timeout ?? this.timeout;

		validateStabilityOptions(checkInterval, stabilityDuration, timeout);

		let pass = false;
		let errorMessage: string | undefined;

		try {
			const result = await pollForStability(locator, checkInterval, stabilityDuration, timeout);
			pass = result.pass;
			errorMessage = result.errorMessage;
		} catch (e: unknown) {
			pass = false;
			errorMessage = e instanceof Error ? e.message : String(e);
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage && !pass && !this.isNot) {
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

export const expectlyLocatorState = baseExpect.extend(expectlyLocatorStateMatchers);
