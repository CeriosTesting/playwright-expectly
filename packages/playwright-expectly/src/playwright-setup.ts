// Import matcher-types to activate the global PlaywrightTest.Matchers augmentation
import "./types/matcher-types";

import { expect } from "@playwright/test";

import { expectlyMatchers } from "./expectly";

let isExpectlySetup = false;

/**
 * Sets up Expectly by extending Playwright's expect with all custom matchers.
 *
 * @deprecated Prefer building your own `tests/support/expect.ts` in your project that extends
 * Playwright's `expect` and captures the return value, e.g.
 * `export const expect = baseExpect.extend(expectlyMatchers)`, instead of calling this function.
 *
 * Playwright's `expect.extend()` only mutates the *original* `expect` object in place for
 * matcher names that don't collide with a Playwright built-in. `toBeCloseTo` collides with
 * Playwright's own built-in numeric matcher, so calling `expect.extend(expectlyMatchers)`
 * (what this function does) can never make the Date `toBeCloseTo` matcher work through the
 * native `expect` — no matter where this function is called (`playwright.config.ts`, a worker
 * fixtures file, or a spec file). This is not a config/worker timing issue; it's how
 * `expect.extend()` is implemented. The only reliable pattern is capturing the return value of
 * `.extend()` yourself, e.g. `export const expect = baseExpect.extend(expectlyMatchers)`, in
 * your own `tests/support/expect.ts`.
 *
 * This function is kept for backward compatibility and still works correctly for every
 * matcher that doesn't collide with a Playwright built-in.
 *
 * Importing this module also augments Playwright's `Matchers` interface,
 * providing full type support for all expectly matchers on the native `expect`.
 *
 * @example
 * // Recommended instead:
 * // tests/support/expect.ts
 * import { expect as baseExpect, test as base } from '@playwright/test';
 * import { expectlyMatchers } from '@cerios/playwright-expectly';
 *
 * export const expect = baseExpect.extend(expectlyMatchers);
 * export const test = base;
 *
 * @example
 * // Legacy usage (deprecated)
 * // tests/fixtures.ts
 * import { expect, test } from '@playwright/test';
 * import { setupExpectly } from '@cerios/playwright-expectly';
 *
 * setupExpectly();
 *
 * export { expect, test };
 */
export function setupExpectly(): void {
	if (isExpectlySetup) {
		return;
	}

	expect.extend(expectlyMatchers);
	isExpectlySetup = true;
}
