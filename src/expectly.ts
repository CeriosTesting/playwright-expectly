import type { Expect } from "@playwright/test";
import { mergeExpects } from "@playwright/test";

import { expectlyAny, expectlyAnyMatchers } from "./expectly-any";
import { expectlyDate, expectlyDateMatchers } from "./expectly-date";
import { expectlyLocator, expectlyLocatorMatchers } from "./expectly-locator";
import { expectlyNumberArray, expectlyNumberArrayMatchers } from "./expectly-number-array";
import { expectlyObjectArray, expectlyObjectArrayMatchers } from "./expectly-object-array";
import { expectlyString, expectlyStringMatchers } from "./expectly-string";
import { expectlyStringArray, expectlyStringArrayMatchers } from "./expectly-string-array";

// Extract matcher types from each expectly module
type ExtractMatchers<T> = T extends Expect<infer M> ? M : never;

type ExpectlyMatchers = ExtractMatchers<typeof expectlyAny> &
	ExtractMatchers<typeof expectlyDate> &
	ExtractMatchers<typeof expectlyLocator> &
	ExtractMatchers<typeof expectlyNumberArray> &
	ExtractMatchers<typeof expectlyObjectArray> &
	ExtractMatchers<typeof expectlyString> &
	ExtractMatchers<typeof expectlyStringArray>;

/**
 * Expectly - Enhanced Playwright Test Assertions
 *
 * A comprehensive collection of custom matchers that extend Playwright's built-in expect
 * functionality with powerful, expressive assertions for:
 *
 * - **Any Type Matchers**: Validate primitives, objects, arrays, and type checks
 * - **Date Matchers**: Compare dates, check ranges, validate order, and temporal assertions
 * - **Locator Matchers**: Assert on web elements, attributes, text patterns, and validation
 * - **Number Matchers**: Statistical checks, ordering, ranges, and numeric validations
 * - **Object Array Matchers**: Sort validation and uniqueness checks for object collections
 * - **String Matchers**: Pattern matching, format validation, and text assertions
 * - **String Array Matchers**: Sorting, ordering, and uniqueness validations for string arrays
 *
 * Simply import and use like Playwright's standard expect:
 *
 * Made with ❤️ by Ronald Veth from Cerios
 */
export const expectly: Expect<ExpectlyMatchers> = mergeExpects(
	expectlyAny,
	expectlyDate,
	expectlyLocator,
	expectlyNumberArray,
	expectlyObjectArray,
	expectlyString,
	expectlyStringArray
);

/**
 * Combined raw matchers object containing all expectly matchers.
 * Can be used with expect.extend() to add all matchers to the global expect.
 *
 * @example
 * import { expect } from '@playwright/test';
 * import { expectlyMatchers } from 'playwright-expectly';
 *
 * expect.extend(expectlyMatchers);
 */
export const expectlyMatchers = {
	...expectlyAnyMatchers,
	...expectlyDateMatchers,
	...expectlyLocatorMatchers,
	...expectlyNumberArrayMatchers,
	...expectlyObjectArrayMatchers,
	...expectlyStringMatchers,
	...expectlyStringArrayMatchers,
};
