// Main export - the merged expect with all custom matchers
export { expectly, expectlyMatchers } from "./expectly";

// Setup helper for extending Playwright's native expect (also provides type augmentation)
export { setupExpectly } from "./playwright-setup";

// Individual matcher exports for granular usage
export { expectlyAny, expectlyAnyMatchers } from "./expectly-any";
export { expectlyDate, expectlyDateMatchers } from "./expectly-date";
export {
	expectlyLocator,
	expectlyLocatorMatchers,
	expectlyLocatorAttributes,
	expectlyLocatorAttributesMatchers,
	expectlyLocatorPositioning,
	expectlyLocatorPositioningMatchers,
	expectlyLocatorState,
	expectlyLocatorStateMatchers,
	expectlyLocatorText,
	expectlyLocatorTextMatchers,
	expectlyLocatorVisibility,
	expectlyLocatorVisibilityMatchers,
} from "./expectly-locator/index";
export { expectlyNumberArray, expectlyNumberArrayMatchers } from "./expectly-number-array";
export { expectlyObjectArray, expectlyObjectArrayMatchers } from "./expectly-object-array";
export { expectlyString, expectlyStringMatchers } from "./expectly-string";
export { expectlyStringArray, expectlyStringArrayMatchers } from "./expectly-string-array";
