// Import matcher-types to activate the global PlaywrightTest.Matchers augmentation
import "./types/matcher-types";

import { PollOptions } from "@cerios/playwright-expectly-core";
import { expect, ExpectMatcherState, Locator, MatcherReturnType } from "@playwright/test";

import { expectlyFuzzyLocatorMatchers } from "./expectly-fuzzy-locator";
import { expectlyFuzzyStringMatchers } from "./expectly-fuzzy-string";

const expectlyFuzzyMatchers = {
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

export function setupExpectlyFuzzy(): void {
	expect.extend(expectlyFuzzyMatchers);
}
