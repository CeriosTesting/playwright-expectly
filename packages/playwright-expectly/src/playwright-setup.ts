// Import matcher-types to activate the global PlaywrightTest.Matchers augmentation
import "./types/matcher-types";

import { expect } from "@playwright/test";

import { expectlyMatchers } from "./expectly";

let isExpectlySetup = false;

/**
 * Sets up Expectly by extending Playwright's expect with all custom matchers.
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
 * providing full type support for all expectly matchers on the native `expect`.
 *
 * @example
 * // Sometimes seen in playwright.config.ts, but not guaranteed across worker boundaries
 * import { setupExpectly } from '@cerios/playwright-expectly';
 *
 * setupExpectly();
 *
 * @example
 * // In tests/fixtures.ts
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
