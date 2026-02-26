// Import matcher-types to activate the global PlaywrightTest.Matchers augmentation
import "./types/matcher-types";

import { expect } from "@playwright/test";

import { expectlyMatchers } from "./expectly";

/**
 * Sets up Expectly by extending Playwright's expect with all custom matchers.
 * This function should be called in the global setup file (e.g., playwright-config.ts)
 * to ensure that all tests have access to the enhanced assertions provided by Expectly.
 *
 * Importing this module also augments Playwright's `Matchers` interface,
 * providing full type support for all expectly matchers on the native `expect`.
 *
 * @example
 * // In playwright.config.ts
 * import { setupExpectly } from '@cerios/playwright-expectly';
 *
 * setupExpectly();
 */
export function setupExpectly() {
	expect.extend(expectlyMatchers);
}
