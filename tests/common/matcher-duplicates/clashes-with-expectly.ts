import { expect as baseExpect, mergeExpects } from "@playwright/test";

import { expectlyMatchers } from "../../../packages/playwright-expectly/src/expectly";

type MatcherResult = { pass: boolean; message: () => string };

/** A project matcher that silently replaces the Expectly matcher of the same name. */
export const myMatchers = {
	toBeValidEmail(received: unknown): MatcherResult {
		return { pass: typeof received === "string" && received.includes("@"), message: () => "my own email check" };
	},
};

export const expect = mergeExpects(baseExpect, baseExpect.extend(expectlyMatchers), baseExpect.extend(myMatchers));
