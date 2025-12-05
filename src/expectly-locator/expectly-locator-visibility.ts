import { expect as baseExpect, Locator } from "@playwright/test";

/**
 * Visibility validation matchers for Playwright locators.
 */
export const expectlyLocatorVisibility = baseExpect.extend({
	/**
	 * Asserts that the locator has the expected number of visible elements.
	 *
	 * @param locator - The Playwright locator to check
	 * @param count - The expected number of visible elements
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check visible items in a list
	 * await expectLocator(page.locator('.list-item')).toHaveCountVisible(3);
	 *
	 * @example
	 * // Validate visible table rows with custom timeout
	 * await expectLocator(page.locator('tbody tr')).toHaveCountVisible(5, { timeout: 5000 });
	 */
	async toHaveCountVisible(locator: Locator, count: number, options?: { timeout?: number }) {
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
							const visArr = await Promise.all(handles.map(h => h.isVisible()));
							visibleCount = visArr.filter(Boolean).length;
							return visibleCount === count;
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
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
