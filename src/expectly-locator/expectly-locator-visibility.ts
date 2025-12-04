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
		const pollInterval = 100;
		const timeout = options?.timeout ?? this.timeout;
		const start = Date.now();
		let visibleCount = 0;

		while (Date.now() - start < timeout) {
			const handles = await locator.elementHandles();
			const visArr = await Promise.all(handles.map(h => h.isVisible()));
			visibleCount = visArr.filter(Boolean).length;
			if (visibleCount === count) break;
			await new Promise(res => setTimeout(res, pollInterval));
		}

		const pass = visibleCount === count;
		return {
			pass,
			message: () =>
				pass
					? `Expected number of visible elements NOT to be ${count}, but it was.`
					: `Timed out: ${timeout}ms.\n\nLocator: ${locator}\nExpected number of visible elements: "${count}" \nReceived number of visible elements: "${visibleCount}"`,
		};
	},
});
