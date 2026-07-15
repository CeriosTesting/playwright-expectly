import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import type { ExpectMatcherState, Locator, MatcherReturnType } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { expectlyAnyMatchers } from "./expectly-any";
import { expectlyDateMatchers } from "./expectly-date";
import { expectlyLocatorMatchers, expectlyLocatorTextMatchers } from "./expectly-locator";
import { expectlyNumberArrayMatchers } from "./expectly-number-array";
import { expectlyObjectArrayMatchers } from "./expectly-object-array";
import { expectlyStringMatchers } from "./expectly-string";
import { expectlyStringArrayMatchers } from "./expectly-string-array";

function isLocatorMatcherTarget(received: string | Locator): received is Locator {
	return typeof received === "object" && received !== null && "innerText" in received;
}

type SharedTextMatcherReturn = MatcherReturnType | Promise<MatcherReturnType>;

const expectlyTextMatchers = {
	toStartWith(
		this: ExpectMatcherState,
		received: string | Locator,
		expected: string,
		options?: PollOptions,
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toStartWith.call(this, received, expected, options);
		}

		return expectlyStringMatchers.toStartWith.call(this, received, expected);
	},
	toEndWith(
		this: ExpectMatcherState,
		received: string | Locator,
		expected: string,
		options?: PollOptions,
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toEndWith.call(this, received, expected, options);
		}

		return expectlyStringMatchers.toEndWith.call(this, received, expected);
	},
	toMatchPattern(
		this: ExpectMatcherState,
		received: string | Locator,
		pattern: RegExp,
		options?: PollOptions,
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toMatchPattern.call(this, received, pattern, options);
		}

		return expectlyStringMatchers.toMatchPattern.call(this, received, pattern);
	},
	toBeValidEmail(this: ExpectMatcherState, received: string | Locator, options?: PollOptions): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toBeValidEmail.call(this, received, options);
		}

		return expectlyStringMatchers.toBeValidEmail.call(this, received);
	},
	toBeValidUrl(this: ExpectMatcherState, received: string | Locator, options?: PollOptions): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toBeValidUrl.call(this, received, options);
		}

		return expectlyStringMatchers.toBeValidUrl.call(this, received);
	},
	toBeAlphanumeric(
		this: ExpectMatcherState,
		received: string | Locator,
		options?: PollOptions,
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toBeAlphanumeric.call(this, received, options);
		}

		return expectlyStringMatchers.toBeAlphanumeric.call(this, received);
	},
	toBeNumericString(
		this: ExpectMatcherState,
		received: string | Locator,
		options?: PollOptions,
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toBeNumericString.call(this, received, options);
		}

		return expectlyStringMatchers.toBeNumericString.call(this, received);
	},
	toBeUUID(
		this: ExpectMatcherState,
		received: string | Locator,
		version?: 1 | 3 | 4 | 5,
		options?: PollOptions,
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toBeUUID.call(this, received, version, options);
		}

		return expectlyStringMatchers.toBeUUID.call(this, received, version);
	},
};

type OverlappingTextMatcherNames = keyof typeof expectlyTextMatchers;

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
	...expectlyTextMatchers,
} as typeof expectlyAnyMatchers &
	typeof expectlyDateMatchers &
	Omit<typeof expectlyLocatorMatchers, OverlappingTextMatcherNames> &
	typeof expectlyNumberArrayMatchers &
	typeof expectlyObjectArrayMatchers &
	Omit<typeof expectlyStringMatchers, OverlappingTextMatcherNames> &
	typeof expectlyStringArrayMatchers &
	typeof expectlyTextMatchers;

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
export const expectly: Expect<{}> = baseExpect.extend<typeof expectlyMatchers>(expectlyMatchers);
