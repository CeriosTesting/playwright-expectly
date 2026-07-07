// Import matcher-types to activate the global PlaywrightTest.Matchers augmentation
import "./types/matcher-types";

import { expect } from "@playwright/test";

import { expectlyFuzzyMatchers } from "./expectly-fuzzy";

let isExpectlyFuzzySetup = false;

/**
 * Sets up Expectly Fuzzy by extending Playwright's expect with the fuzzy matchers.
 *
 * @deprecated Prefer building your own `tests/support/expect.ts` in your project that extends
 * Playwright's `expect` and captures the return value, e.g.
 * `export const expect = baseExpect.extend(expectlyFuzzyMatchers)`, instead of calling this
 * function.
 *
 * Playwright's `expect.extend()` only mutates the *original* `expect` object in place for
 * matcher names that don't collide with a Playwright built-in, so relying on this function's
 * discarded return value can silently fail to apply certain overrides regardless of where it's
 * called (see `@cerios/playwright-expectly`'s `setupExpectly()` deprecation notice for the full
 * explanation). `toMatchFuzzy` doesn't collide with any Playwright built-in, so this function
 * continues to work correctly — it is deprecated for consistency and to steer everyone toward
 * the single reliable pattern of capturing `.extend()`'s return value yourself.
 *
 * Importing this module also augments Playwright's `Matchers` interface,
 * providing full type support for `toMatchFuzzy` on the native `expect`.
 *
 * @example
 * // Recommended instead:
 * // tests/support/expect.ts
 * import { expect as baseExpect, test as base } from '@playwright/test';
 * import { expectlyFuzzyMatchers } from '@cerios/playwright-expectly-fuzzy';
 *
 * export const expect = baseExpect.extend(expectlyFuzzyMatchers);
 * export const test = base;
 *
 * @example
 * // Legacy usage (deprecated)
 * // tests/fixtures.ts
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
