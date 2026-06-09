// Ensure Playwright matcher type augmentation is applied whenever this package is imported.
import "./types/matcher-types";

import { PollOptions } from "@cerios/playwright-expectly-core";
import { expect as baseExpect, ExpectMatcherState, Locator, MatcherReturnType } from "@playwright/test";

import { expectlyFuzzyLocatorMatchers } from "./expectly-fuzzy-locator";
import { expectlyFuzzyStringMatchers } from "./expectly-fuzzy-string";

export const expectlyFuzzyMatchers = {
	...expectlyFuzzyStringMatchers,
	...expectlyFuzzyLocatorMatchers,
	async toMatchFuzzy(
		this: ExpectMatcherState,
		received: string | Locator,
		expected: string,
		threshold?: number,
		options?: PollOptions,
	): Promise<MatcherReturnType> {
		if (received && typeof received === "object" && "innerText" in received) {
			return expectlyFuzzyLocatorMatchers.toMatchFuzzy.call(this, received, expected, threshold, options);
		}
		return expectlyFuzzyStringMatchers.toMatchFuzzy.call(this, received, expected, threshold);
	},
};

export const expectlyFuzzy = baseExpect.extend(expectlyFuzzyMatchers);

export { expectlyFuzzyString, expectlyFuzzyStringMatchers } from "./expectly-fuzzy-string";
export { expectlyFuzzyLocator, expectlyFuzzyLocatorMatchers } from "./expectly-fuzzy-locator";
export { setupExpectlyFuzzy } from "./playwright-setup";
