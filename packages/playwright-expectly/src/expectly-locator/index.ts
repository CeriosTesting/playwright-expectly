import type { Expect } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { expectlyLocatorAttributesMatchers } from "./expectly-locator-attributes";
import { expectlyLocatorCountMatchers } from "./expectly-locator-count";
import { expectlyLocatorOrderMatchers } from "./expectly-locator-order";
import { expectlyLocatorPositioningMatchers } from "./expectly-locator-positioning";
import { expectlyLocatorStateMatchers } from "./expectly-locator-state";
import { expectlyLocatorTextMatchers } from "./expectly-locator-text";
import { expectlyLocatorVisibilityMatchers } from "./expectly-locator-visibility";

/**
 * Combined raw matchers object for all locator matchers.
 * Can be used with expect.extend() to add all locator matchers at once.
 */
export const expectlyLocatorMatchers = {
	...expectlyLocatorTextMatchers,
	...expectlyLocatorAttributesMatchers,
	...expectlyLocatorPositioningMatchers,
	...expectlyLocatorStateMatchers,
	...expectlyLocatorVisibilityMatchers,
	...expectlyLocatorCountMatchers,
	...expectlyLocatorOrderMatchers,
} as typeof expectlyLocatorTextMatchers &
	typeof expectlyLocatorAttributesMatchers &
	typeof expectlyLocatorPositioningMatchers &
	typeof expectlyLocatorStateMatchers &
	typeof expectlyLocatorVisibilityMatchers &
	typeof expectlyLocatorCountMatchers &
	typeof expectlyLocatorOrderMatchers;

/**
 * Unified expectly locator matchers.
 * Combines all locator matcher categories into a single interface.
 *
 * This is the main export for locator matchers, providing all functionality
 * in one place while maintaining the modular structure internally.
 */
export const expectlyLocator: Expect<{}> = baseExpect.extend<typeof expectlyLocatorMatchers>(expectlyLocatorMatchers);

export { expectlyLocatorAttributes, expectlyLocatorAttributesMatchers } from "./expectly-locator-attributes";
export type { StylesOptions } from "./expectly-locator-attributes";
export { expectlyLocatorCount, expectlyLocatorCountMatchers } from "./expectly-locator-count";
export type { CountOptions } from "./expectly-locator-count";
export { expectlyLocatorOrder, expectlyLocatorOrderMatchers } from "./expectly-locator-order";
export type { TextOrderOptions } from "./expectly-locator-order";
export { expectlyLocatorPositioning, expectlyLocatorPositioningMatchers } from "./expectly-locator-positioning";
export { expectlyLocatorState, expectlyLocatorStateMatchers } from "./expectly-locator-state";
export { expectlyLocatorText, expectlyLocatorTextMatchers } from "./expectly-locator-text";
export { expectlyLocatorVisibility, expectlyLocatorVisibilityMatchers } from "./expectly-locator-visibility";
