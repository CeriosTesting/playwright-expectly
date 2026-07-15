import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import { expect as baseExpect, ExpectMatcherState, Locator, MatcherReturnType } from "@playwright/test";

import { expectlyFuzzyLocatorMatchers } from "./expectly-fuzzy-locator";
import { expectlyFuzzyStringMatchers } from "./expectly-fuzzy-string";

function isLocatorMatcherTarget(received: string | Locator): received is Locator {
	return typeof received === "object" && received !== null && "innerText" in received;
}

const expectlyFuzzySharedMatchers = {
	toMatchFuzzy(
		this: ExpectMatcherState,
		received: string | Locator,
		expected: string,
		threshold?: number,
		options?: PollOptions,
	): MatcherReturnType | Promise<MatcherReturnType> {
		if (isLocatorMatcherTarget(received)) {
			return expectlyFuzzyLocatorMatchers.toMatchFuzzy.call(this, received, expected, threshold, options);
		}

		return expectlyFuzzyStringMatchers.toMatchFuzzy.call(this, received, expected, threshold);
	},
};

type OverlappingFuzzyMatcherNames = keyof typeof expectlyFuzzySharedMatchers;

/**
 * Combined raw matchers object containing all expectly-fuzzy matchers.
 * Can be used with expect.extend() to add all matchers to the global expect.
 *
 * @example
 * import { expect } from '@playwright/test';
 * import { expectlyFuzzyMatchers } from '@cerios/playwright-expectly-fuzzy';
 *
 * expect.extend(expectlyFuzzyMatchers);
 */
export const expectlyFuzzyMatchers = {
	...expectlyFuzzyStringMatchers,
	...expectlyFuzzyLocatorMatchers,
	...expectlyFuzzySharedMatchers,
} as Omit<typeof expectlyFuzzyStringMatchers, OverlappingFuzzyMatcherNames> &
	Omit<typeof expectlyFuzzyLocatorMatchers, OverlappingFuzzyMatcherNames> &
	typeof expectlyFuzzySharedMatchers;

/**
 * Expectly Fuzzy - standalone merged expect instance with all fuzzy matchers.
 *
 * @example
 * import { expectlyFuzzy } from '@cerios/playwright-expectly-fuzzy';
 *
 * expectlyFuzzy("Hello Wrold").toMatchFuzzy("Hello World");
 */
export const expectlyFuzzy: Expect<{}> = baseExpect.extend<typeof expectlyFuzzyMatchers>(expectlyFuzzyMatchers);
