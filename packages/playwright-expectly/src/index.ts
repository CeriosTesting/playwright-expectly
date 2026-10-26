// Ensure Playwright matcher type augmentation is applied whenever this package is imported.
import "./types/matcher-types";

// Main export - the merged expect with all custom matchers
export { expectly, expectlyMatchers } from "./expectly";

// Return-aware native Playwright retries
export { withReturn } from "./expectly-return";
export type {
	ExpectWithReturn,
	PollAndReturnMatchers,
	PollAndReturnOptions,
	ToPassAndReturnMatchers,
	ToPassAndReturnOptions,
} from "./expectly-return";

// Individual matcher exports for granular usage
export { expectlyAny, expectlyAnyMatchers } from "./expectly-any";
export { expectlyCollection, expectlyCollectionMatchers } from "./expectly-collection";
export { expectlyDate, expectlyDateMatchers } from "./expectly-date";
export { expectlyFunction, expectlyFunctionMatchers } from "./expectly-function";
export {
	expectlyLocator,
	expectlyLocatorMatchers,
	expectlyLocatorAttributes,
	expectlyLocatorAttributesMatchers,
	expectlyLocatorCount,
	expectlyLocatorCountMatchers,
	expectlyLocatorOrder,
	expectlyLocatorOrderMatchers,
	expectlyLocatorPositioning,
	expectlyLocatorPositioningMatchers,
	expectlyLocatorState,
	expectlyLocatorStateMatchers,
	expectlyLocatorText,
	expectlyLocatorTextMatchers,
	expectlyLocatorVisibility,
	expectlyLocatorVisibilityMatchers,
} from "./expectly-locator/index";
export type { CountOptions, StylesOptions, TextOrderOptions } from "./expectly-locator/index";
export { expectlyNumberArray, expectlyNumberArrayMatchers } from "./expectly-number-array";
export { expectlyObjectArray, expectlyObjectArrayMatchers } from "./expectly-object-array";
export { expectlyPage, expectlyPageMatchers } from "./expectly-page";
export type { CookieOptions } from "./expectly-page";
export type { NumericToleranceOptions, StringOrderOptions } from "./matchers/common-utils";
export type { UrlValidationOptions, UUIDVersion } from "./matchers/text-validation-utils";
export { expectlyString, expectlyStringMatchers } from "./expectly-string";
export { expectlyStringArray, expectlyStringArrayMatchers } from "./expectly-string-array";

// Date/time parsing, type guards and public date/time types
export * from "./date-time/index";
