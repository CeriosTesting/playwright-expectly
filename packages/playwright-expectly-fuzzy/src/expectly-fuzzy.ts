import { PollOptions } from "@cerios/playwright-expectly-core";
import { expect as baseExpect, ExpectMatcherState, Locator, MatcherReturnType } from "@playwright/test";

import { expectlyFuzzyLocatorMatchers } from "./expectly-fuzzy-locator";
import { expectlyFuzzyStringMatchers } from "./expectly-fuzzy-string";

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
	toMatchFuzzy(
		this: ExpectMatcherState,
		received: string | Locator,
		expected: string,
		threshold?: number,
		options?: PollOptions,
	): MatcherReturnType | Promise<MatcherReturnType> {
		if (received && typeof received === "object" && "innerText" in received) {
			return expectlyFuzzyLocatorMatchers.toMatchFuzzy.call(this, received, expected, threshold, options);
		}
		return expectlyFuzzyStringMatchers.toMatchFuzzy.call(this, received, expected, threshold);
	},
};

/**
 * Expectly Fuzzy - standalone merged expect instance with all fuzzy matchers.
 *
 * @example
 * import { expectlyFuzzy } from '@cerios/playwright-expectly-fuzzy';
 *
 * expectlyFuzzy("Hello Wrold").toMatchFuzzy("Hello World");
 */
export const expectlyFuzzy = baseExpect.extend(expectlyFuzzyMatchers);
