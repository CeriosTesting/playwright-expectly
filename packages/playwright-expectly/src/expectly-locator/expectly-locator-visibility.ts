import { withMatcherState, runPolledMatcher } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import { expect as baseExpect, Locator } from "@playwright/test";

/**
 * Visibility validation matchers for Playwright locators.
 */
export const expectlyLocatorVisibilityMatchers = withMatcherState({
	async toHaveCountVisible(locator: Locator, count: number, options?: PollOptions) {
		const assertionName = "toHaveCountVisible";
		let pass: boolean = false;
		let visibleCount: number = 0;
		let locatorError: Error | undefined;

		pass = await runPolledMatcher(this, options, async () => {
			try {
				const handles = await locator.elementHandles();
				const visArr = await Promise.all(handles.map(async (h) => h.isVisible()));
				visibleCount = visArr.filter(Boolean).length;
				return visibleCount === count;
			} catch (e: unknown) {
				locatorError = e instanceof Error ? e : new Error(String(e));
				throw e;
			}
		});
		if (locatorError) {
			throw locatorError;
		}

		const message = (): string => {
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
