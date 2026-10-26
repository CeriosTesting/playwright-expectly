import { withMatcherState, runPolledMatcher } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import { expect as baseExpect, Locator } from "@playwright/test";

/** Counts the matching elements that Playwright considers visible, without waiting for any of them. */
export async function countVisibleElements(locator: Locator): Promise<number> {
	const handles = await locator.elementHandles();
	try {
		const visArr = await Promise.all(handles.map(async (h) => h.isVisible()));
		return visArr.filter(Boolean).length;
	} finally {
		// Dispose every handle, even when visibility checks fail or the page closes.
		await Promise.allSettled(handles.map((h) => h.dispose()));
	}
}

/**
 * Visibility validation matchers for Playwright locators.
 */
export const expectlyLocatorVisibilityMatchers = withMatcherState({
	async toHaveCountVisible(locator: Locator, count: number, options?: PollOptions) {
		const assertionName = "toHaveCountVisible";
		let pass: boolean = false;
		let visibleCount: number = 0;
		let locatorError: Error | undefined;

		// An impossible count would never match, so `.not` would pass without checking anything.
		if (typeof count !== "number" || !Number.isInteger(count) || count < 0) {
			throw new TypeError(`${assertionName}: count must be a non-negative integer, got: ${String(count)}`);
		}

		pass = await runPolledMatcher(this, options, async () => {
			try {
				visibleCount = await countVisibleElements(locator);
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

export const expectlyLocatorVisibility: Expect<typeof expectlyLocatorVisibilityMatchers> = baseExpect.extend(
	expectlyLocatorVisibilityMatchers,
);
