import type { Expect } from "@playwright/test";
import { mergeExpects } from "@playwright/test";

import { expectlyLocatorAttributes, expectlyLocatorAttributesMatchers } from "./expectly-locator-attributes";
import { expectlyLocatorPositioning, expectlyLocatorPositioningMatchers } from "./expectly-locator-positioning";
import { expectlyLocatorState, expectlyLocatorStateMatchers } from "./expectly-locator-state";
import { expectlyLocatorText, expectlyLocatorTextMatchers } from "./expectly-locator-text";
import { expectlyLocatorVisibility, expectlyLocatorVisibilityMatchers } from "./expectly-locator-visibility";

// Extract matcher types from each module
type ExtractMatchers<T> = T extends Expect<infer M> ? M : never;

type ExpectlyLocatorMatchers = ExtractMatchers<typeof expectlyLocatorText> &
	ExtractMatchers<typeof expectlyLocatorAttributes> &
	ExtractMatchers<typeof expectlyLocatorPositioning> &
	ExtractMatchers<typeof expectlyLocatorState> &
	ExtractMatchers<typeof expectlyLocatorVisibility>;

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
};

/**
 * Unified expectly locator matchers.
 * Combines all locator matcher categories into a single interface.
 *
 * This is the main export for locator matchers, providing all functionality
 * in one place while maintaining the modular structure internally.
 */
export const expectlyLocator: Expect<ExpectlyLocatorMatchers> = mergeExpects(
	expectlyLocatorText,
	expectlyLocatorAttributes,
	expectlyLocatorPositioning,
	expectlyLocatorState,
	expectlyLocatorVisibility,
);

export { expectlyLocatorAttributes, expectlyLocatorAttributesMatchers } from "./expectly-locator-attributes";
export { expectlyLocatorPositioning, expectlyLocatorPositioningMatchers } from "./expectly-locator-positioning";
export { expectlyLocatorState, expectlyLocatorStateMatchers } from "./expectly-locator-state";
export { expectlyLocatorText, expectlyLocatorTextMatchers } from "./expectly-locator-text";
export { expectlyLocatorVisibility, expectlyLocatorVisibilityMatchers } from "./expectly-locator-visibility";
