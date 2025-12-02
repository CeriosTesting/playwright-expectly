// Main export - the merged expect with all custom matchers
export { expectly } from "./expectly";

// Individual matcher exports for granular usage
export { expectlyAny } from "./expectly-any";
export { expectlyDate } from "./expectly-date";
export {
	expectlyLocator,
	expectlyLocatorAttributes,
	expectlyLocatorPositioning,
	expectlyLocatorState,
	expectlyLocatorText,
} from "./expectly-locator/index";
export { expectlyNumberArray } from "./expectly-number-array";
export { expectlyObjectArray } from "./expectly-object-array";
export { expectlyString } from "./expectly-string";
export { expectlyStringArray } from "./expectly-string-array";
