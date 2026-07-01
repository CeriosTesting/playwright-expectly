// Import matcher-types to activate the global PlaywrightTest.Matchers augmentation
import "./types/matcher-types";

import { PollOptions } from "@cerios/playwright-expectly-core";
import { expect, ExpectMatcherState, Locator, MatcherReturnType } from "@playwright/test";

import { expectlyFuzzyLocatorMatchers } from "./expectly-fuzzy-locator";
import { expectlyFuzzyStringMatchers } from "./expectly-fuzzy-string";

let isExpectlyFuzzySetup = false;

const expectlyFuzzyMatchers = {
	...expectlyFuzzyStringMatchers,
	...expectlyFuzzyLocatorMatchers,
	toMatchFuzzy(
		this: ExpectMatcherState,
		received: string | Locator,
		expected: string,
		threshold?: number,
		options?: PollOptions,
	): MatcherReturnType | Promise<MatcherReturnType> {
		if (received && typeof received === "object" && "innerText" in received) {
			return expectlyFuzzyLocatorMatchers.toMatchFuzzy.call(this, received, expected, threshold, options);
		}
		return expectlyFuzzyStringMatchers.toMatchFuzzy.call(this, received, expected, threshold);
	},
};

/**
 * Sets up Expectly Fuzzy by extending Playwright's expect with the fuzzy matchers.
 * This function extends Playwright's expect in the current process.
 *
 * In some Playwright versions or project setups, calling this from `playwright.config.ts`
 * may appear to work. However, config-time setup is not guaranteed to affect the `expect`
 * instance used inside test workers.
 *
 * The reliable approach is to call this in the same worker context that imports and uses
 * Playwright's expect, typically from a shared test fixtures module that re-exports `expect`
 * and `test`.
 *
 * Importing this module also augments Playwright's `Matchers` interface,
 * providing full type support for `toMatchFuzzy` on the native `expect`.
 *
 * @example
 * // Sometimes seen in playwright.config.ts, but not guaranteed across worker boundaries
 * import { setupExpectlyFuzzy } from '@cerios/playwright-expectly-fuzzy';
 *
 * setupExpectlyFuzzy();
 *
 * @example
 * // In tests/fixtures.ts
 * import { expect, test } from '@playwright/test';
 * import { setupExpectlyFuzzy } from '@cerios/playwright-expectly-fuzzy';
 *
 * setupExpectlyFuzzy();
 *
 * export { expect, test };
 */
export function setupExpectlyFuzzy(): void {
	if (isExpectlyFuzzySetup) {
		return;
	}

	expect.extend(expectlyFuzzyMatchers);
	isExpectlyFuzzySetup = true;
}
