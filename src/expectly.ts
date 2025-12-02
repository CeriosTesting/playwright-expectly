import type { Expect } from "@playwright/test";
import { mergeExpects } from "@playwright/test";
import { expectlyAny } from "src/expectly-any";
import { expectlyDate } from "src/expectly-date";
import { expectlyLocator } from "src/expectly-locator";
import { expectlyNumberArray } from "src/expectly-number-array";
import { expectlyObjectArray } from "src/expectly-object-array";
import { expectlyString } from "src/expectly-string";
import { expectlyStringArray } from "src/expectly-string-array";

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
) as any;
