import { mergeExpects } from "@playwright/test";
import { expectAny } from "src/expect-any-extensions";
import { expectDate } from "src/expect-date-extensions";
import { expectLocator } from "src/expect-locator-extensions";
import { expectNumber } from "src/expect-number-extensions";
import { expectObjectArray } from "src/expect-object-array-extensions";
import { expectString } from "src/expect-string-extensions";

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
 *
 * Simply import and use like Playwright's standard expect:
 *
 * Made with ❤️ by Ronald Veth from Cerios
 */
export const expectly = mergeExpects(
	expectAny,
	expectDate,
	expectLocator,
	expectNumber,
	expectObjectArray,
	expectString
);
