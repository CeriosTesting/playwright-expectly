import { expect as baseExpect, Locator } from "@playwright/test";

/**
 * Element state and behavior matchers for Playwright locators.
 * These matchers validate dynamic behavior and element states.
 */
export const expectlyLocatorState = baseExpect.extend({
	/**
	 * Asserts that the locator's content remains stable (unchanged) for a specified duration.
	 * This is useful for waiting until dynamic content has finished updating.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration
	 * @param options.stabilityDuration - Duration in ms that content must remain unchanged (default: 500)
	 * @param options.checkInterval - Interval in ms between stability checks (default: 100)
	 * @param options.timeout - Maximum time in ms to wait for stability (default: playwright timeout)
	 *
	 * @example
	 * // Wait for element to stop changing
	 * await expectLocator(page.locator('.live-updates')).toBeStable();
	 *
	 * @example
	 * // Custom stability requirements
	 * await expectLocator(page.locator('.loading-content')).toBeStable({
	 *   stabilityDuration: 1000,
	 *   checkInterval: 200,
	 *   timeout: 10000
	 * });
	 */
	async toBeStable(
		locator: Locator,
		options?: {
			/**
			 * Duration in ms that content must remain unchanged (default: 500)
			 */
			stabilityDuration?: number;
			/**
			 * Interval in ms between stability checks (default: 100)
			 */
			checkInterval?: number;
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeStable";
		const stabilityDuration = options?.stabilityDuration ?? 500;
		const checkInterval = options?.checkInterval ?? 100;
		const timeout = options?.timeout ?? this.timeout;

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
					`At least 2 checks are required during the stability period to ensure reliable detection.`
			);
		}
		if (stabilityDuration >= timeout) {
			throw new Error(
				`stabilityDuration (${stabilityDuration}ms) must be less than timeout (${timeout}ms). ` +
					`The timeout must allow time for both content changes and stabilization.`
			);
		}
		const minimumTimeout = checkInterval + stabilityDuration;
		if (timeout < minimumTimeout) {
			throw new Error(
				`timeout (${timeout}ms) is too short. Minimum required: ${minimumTimeout}ms ` +
					`(checkInterval ${checkInterval}ms + stabilityDuration ${stabilityDuration}ms). ` +
					`The timeout must allow at least one check plus full stabilization period.`
			);
		}

		let pass = false;
		let errorMessage: string | undefined;
		let lastSnapshot: string | null = null;
		let stableStartTime: number | null = null;
		let lastError: string | undefined;
		let successfulChecks = 0;
		const startTime = Date.now();

		try {
			while (Date.now() - startTime < timeout) {
				try {
					const innerHTML = await locator.innerHTML({ timeout: checkInterval });
					const currentSnapshot = innerHTML;
					successfulChecks++;
					lastError = undefined;

					if (lastSnapshot === null) {
						// First check
						lastSnapshot = currentSnapshot;
						stableStartTime = Date.now();
					} else if (currentSnapshot === lastSnapshot) {
						// Content hasn't changed
						const stableDuration = Date.now() - (stableStartTime ?? Date.now());
						if (stableDuration >= stabilityDuration) {
							// Content has been stable long enough
							pass = true;
							break;
						}
					} else {
						// Content changed, reset stability timer
						lastSnapshot = currentSnapshot;
						stableStartTime = Date.now();
					}
				} catch (e: any) {
					// Track the error for better diagnostics
					lastError = e.message;
					// If locator not found or not ready yet, reset
					lastSnapshot = null;
					stableStartTime = null;
				}

				await new Promise(resolve => setTimeout(resolve, checkInterval));
			}

			if (!pass) {
				if (successfulChecks === 0) {
					// Never successfully retrieved content
					errorMessage =
						`Locator was not found or never became available within ${timeout}ms.\n` +
						(lastError ? `Last error: ${lastError}\n` : "") +
						`Stability duration required: ${stabilityDuration}ms\n` +
						`Check interval: ${checkInterval}ms`;
				} else {
					// Content kept changing
					errorMessage =
						`Locator content did not stabilize within ${timeout}ms.\n` +
						`Content was checked ${successfulChecks} time(s) but kept changing.\n` +
						`Stability duration required: ${stabilityDuration}ms\n` +
						`Check interval: ${checkInterval}ms`;
				}
			}
		} catch (e: any) {
			pass = false;
			errorMessage = e.message;
		}

		const message = () => {
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
