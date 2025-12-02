import type { Expect } from "@playwright/test";
import { mergeExpects } from "@playwright/test";
import { expectlyLocatorAttributes } from "./expectly-locator-attributes";
import { expectlyLocatorPositioning } from "./expectly-locator-positioning";
import { expectlyLocatorState } from "./expectly-locator-state";
import { expectlyLocatorText } from "./expectly-locator-text";

// Extract matcher types from each module
type ExtractMatchers<T> = T extends Expect<infer M> ? M : never;

type ExpectlyLocatorMatchers = ExtractMatchers<typeof expectlyLocatorText> &
	ExtractMatchers<typeof expectlyLocatorAttributes> &
	ExtractMatchers<typeof expectlyLocatorPositioning> &
	ExtractMatchers<typeof expectlyLocatorState>;

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
	expectlyLocatorState
) as any;

export { expectlyLocatorAttributes } from "./expectly-locator-attributes";
export { expectlyLocatorPositioning } from "./expectly-locator-positioning";
export { expectlyLocatorState } from "./expectly-locator-state";
export { expectlyLocatorText } from "./expectly-locator-text";
