// Ensure Playwright matcher type augmentation is applied whenever this package is imported.
import "./types/matcher-types";

// Main export - the merged expect with all fuzzy matchers
export { expectlyFuzzy, expectlyFuzzyMatchers } from "./expectly-fuzzy";

// Individual matcher exports for granular usage
export { expectlyFuzzyString, expectlyFuzzyStringMatchers } from "./expectly-fuzzy-string";
export { expectlyFuzzyLocator, expectlyFuzzyLocatorMatchers } from "./expectly-fuzzy-locator";
export type { FuzzyOptions } from "./fuzzy-score";
