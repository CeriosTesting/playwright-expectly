import { expect as baseExpect, Locator } from "@playwright/test";

import { withMatcherState } from "../matchers/matcher-state-utils";
import { PollOptions } from "../types/poll-options";

/**
 * Visibility validation matchers for Playwright locators.
 */
export const expectlyLocatorVisibilityMatchers = withMatcherState({
	async toHaveCountVisible(locator: Locator, count: number, options?: PollOptions) {
		const assertionName = "toHaveCountVisible";
		let pass: boolean = false;
		let visibleCount: number = 0;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							const handles = await locator.elementHandles();
							const visArr = await Promise.all(handles.map(async h => h.isVisible()));
							visibleCount = visArr.filter(Boolean).length;
							return visibleCount === count;
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					}
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected number of visible elements to not be: ${this.utils.printExpected(count)}\n` +
					`Received: ${this.utils.printReceived(visibleCount)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected number of visible elements: ${this.utils.printExpected(count)}\n` +
					`Received: ${this.utils.printReceived(visibleCount)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: count,
			actual: visibleCount,
		};
	},
});

export const expectlyLocatorVisibility = baseExpect.extend(expectlyLocatorVisibilityMatchers);
