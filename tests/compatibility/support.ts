import { expectlyMatchers } from "@cerios/playwright-expectly";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";
import { expect as baseExpect, mergeExpects } from "@playwright/test";

type MatcherResult = { pass: boolean; message: () => string };

/** A consumer support module for `playwright-expectly check-matchers` on the minimum Playwright version. */
export const localMatchers = {
	toBeLocalThing(received: unknown): MatcherResult {
		return { pass: received === "local", message: () => "expected the local thing" };
	},
};

export const expectlyExpect = baseExpect.extend(expectlyMatchers);
export const fuzzyExpect = baseExpect.extend(expectlyFuzzyMatchers);
export const localExpect = baseExpect.extend(localMatchers);
export const expect = mergeExpects(baseExpect, expectlyExpect, fuzzyExpect, localExpect);
