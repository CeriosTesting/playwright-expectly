import type { MatcherReturnType } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { ExpectMatcherState, Locator } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { expectlyAnyMatchers } from "./expectly-any";
import { expectlyCollectionMatchers } from "./expectly-collection";
import { expectlyDateMatchers } from "./expectly-date";
import { expectlyFunctionMatchers } from "./expectly-function";
import { expectlyLocatorMatchers, expectlyLocatorTextMatchers } from "./expectly-locator";
import { expectlyNumberArrayMatchers } from "./expectly-number-array";
import { expectlyObjectArrayMatchers } from "./expectly-object-array";
import { expectlyPageMatchers } from "./expectly-page";
import type { ExpectWithReturn } from "./expectly-return";
import { withReturn } from "./expectly-return";
import { expectlyStringMatchers } from "./expectly-string";
import { expectlyStringArrayMatchers } from "./expectly-string-array";
import type { StringOrderOptions } from "./matchers/common-utils";
import type { UrlValidationOptions, UUIDVersion } from "./matchers/text-validation-utils";
function isLocatorMatcherTarget(received: string | Locator): received is Locator {
	return (
		typeof received === "object" &&
		received !== null &&
		typeof (received as Partial<Locator>).innerText === "function" &&
		typeof (received as Partial<Locator>).count === "function"
	);
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
	toBeValidUrl(
		this: ExpectMatcherState,
		received: string | Locator,
		options?: PollOptions & UrlValidationOptions,
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toBeValidUrl.call(this, received, options);
		}
		return expectlyStringMatchers.toBeValidUrl.call(this, received, options);
	},
	toBeAlphanumeric(
		this: ExpectMatcherState,
		received: string | Locator,
		options?: PollOptions & { unicode?: boolean },
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toBeAlphanumeric.call(this, received, options);
		}
		return expectlyStringMatchers.toBeAlphanumeric.call(this, received, options);
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
		version?: UUIDVersion,
		options?: PollOptions,
	): SharedTextMatcherReturn {
		if (isLocatorMatcherTarget(received)) {
			return expectlyLocatorTextMatchers.toBeUUID.call(this, received, version, options);
		}

		return expectlyStringMatchers.toBeUUID.call(this, received, version);
	},
};

type OverlappingTextMatcherNames = keyof typeof expectlyTextMatchers;

function isNumberArray(received: unknown): received is number[] {
	return Array.isArray(received) && received.every((value) => typeof value === "number");
}

type ArrayMatcherReturn = MatcherReturnType;
/** Number and string arrays share these names; dispatch on the element type so messages print the right values. */
const expectlyArrayOrderMatchers = {
	toHaveAscendingOrder(this: ExpectMatcherState, received: unknown, options?: StringOrderOptions): ArrayMatcherReturn {
		if (isNumberArray(received)) return expectlyNumberArrayMatchers.toHaveAscendingOrder.call(this, received);
		return expectlyStringArrayMatchers.toHaveAscendingOrder.call(this, received as string[], options);
	},
	toHaveDescendingOrder(this: ExpectMatcherState, received: unknown, options?: StringOrderOptions): ArrayMatcherReturn {
		if (isNumberArray(received)) return expectlyNumberArrayMatchers.toHaveDescendingOrder.call(this, received);
		return expectlyStringArrayMatchers.toHaveDescendingOrder.call(this, received as string[], options);
	},
	toHaveStrictlyAscendingOrder(
		this: ExpectMatcherState,
		received: unknown,
		options?: StringOrderOptions,
	): ArrayMatcherReturn {
		if (isNumberArray(received)) return expectlyNumberArrayMatchers.toHaveStrictlyAscendingOrder.call(this, received);
		return expectlyStringArrayMatchers.toHaveStrictlyAscendingOrder.call(this, received as string[], options);
	},
	toHaveStrictlyDescendingOrder(
		this: ExpectMatcherState,
		received: unknown,
		options?: StringOrderOptions,
	): ArrayMatcherReturn {
		if (isNumberArray(received)) return expectlyNumberArrayMatchers.toHaveStrictlyDescendingOrder.call(this, received);
		return expectlyStringArrayMatchers.toHaveStrictlyDescendingOrder.call(this, received as string[], options);
	},
	toBeMonotonic(this: ExpectMatcherState, received: unknown, options?: StringOrderOptions): ArrayMatcherReturn {
		if (isNumberArray(received)) return expectlyNumberArrayMatchers.toBeMonotonic.call(this, received);
		return expectlyStringArrayMatchers.toBeMonotonic.call(this, received as string[], options);
	},
	toHaveUniqueValues(this: ExpectMatcherState, received: unknown): ArrayMatcherReturn {
		if (isNumberArray(received)) return expectlyNumberArrayMatchers.toHaveUniqueValues.call(this, received);
		return expectlyStringArrayMatchers.toHaveUniqueValues.call(this, received as string[]);
	},
};

type OverlappingArrayMatcherNames = keyof typeof expectlyArrayOrderMatchers;
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
	...expectlyCollectionMatchers,
	...expectlyDateMatchers,
	...expectlyFunctionMatchers,
	...expectlyLocatorMatchers,
	...expectlyNumberArrayMatchers,
	...expectlyObjectArrayMatchers,
	...expectlyPageMatchers,
	...expectlyStringMatchers,
	...expectlyStringArrayMatchers,
	...expectlyTextMatchers,
	...expectlyArrayOrderMatchers,
} as typeof expectlyAnyMatchers &
	typeof expectlyCollectionMatchers &
	typeof expectlyDateMatchers &
	typeof expectlyFunctionMatchers &
	Omit<typeof expectlyLocatorMatchers, OverlappingTextMatcherNames> &
	Omit<typeof expectlyNumberArrayMatchers, OverlappingArrayMatcherNames> &
	typeof expectlyObjectArrayMatchers &
	typeof expectlyPageMatchers &
	Omit<typeof expectlyStringMatchers, OverlappingTextMatcherNames> &
	Omit<typeof expectlyStringArrayMatchers, OverlappingArrayMatcherNames> &
	typeof expectlyTextMatchers &
	typeof expectlyArrayOrderMatchers;

/**
 * Expectly - Enhanced Playwright Test Assertions
 *
 * A comprehensive collection of custom matchers that extend Playwright's built-in expect
 * functionality with powerful, expressive assertions for:
 *
 * - **Any Type Matchers**: Validate primitives, objects, arrays, and type checks
 * - **Date Matchers**: Compare dates, check ranges, validate order, temporal assertions
 * - **Locator Matchers**: Assert on web elements, attributes, text patterns, and validation
 * - **Number Matchers**: Statistical checks, ordering, ranges, numeric validations
 * - **Object Array Matchers**: Sort validation and uniqueness checks for object collections
 * - **String Matchers**: Pattern matching, format validation, and text assertions
 * - **String Array Matchers**: Sorting, ordering, and uniqueness validations for string arrays
 *
 * Simply import and use like Playwright's standard expect:
 *
 * Made with love by Ronald Veth from Cerios
 */
export const expectly: ExpectWithReturn<typeof expectlyMatchers> = withReturn(
	baseExpect.extend<typeof expectlyMatchers>(expectlyMatchers),
);
