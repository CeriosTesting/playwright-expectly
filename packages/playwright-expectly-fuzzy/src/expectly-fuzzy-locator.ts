import { locatorNotFoundMessage, pollLocators, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import { expect as baseExpect, Locator } from "@playwright/test";

import { type FuzzyOptions, fuzzyScore, validateThreshold } from "./fuzzy-score";

/**
 * Expectly Custom matcher for fuzzy locator text validation.
 */
export const expectlyFuzzyLocatorMatchers = withMatcherState({
	async toMatchFuzzy(locator: Locator, expected: string, threshold = 80, options?: PollOptions & FuzzyOptions) {
		const assertionName = "toMatchFuzzy";
		let score: number = 0;

		validateThreshold(assertionName, threshold);

		const { pass, snapshot } = await pollLocators(
			this,
			options && { timeout: options.timeout, intervals: options.intervals },
			[locator],
			(actionOptions) => locator.innerText(actionOptions),
			(text) => {
				score = fuzzyScore(text, expected, options);
				return score >= threshold;
			},
		);
		const actual = snapshot?.found ? snapshot.value : "";

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, snapshot);
			if (notFound) return notFound;
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not fuzzy match: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Similarity score: ${score} (threshold: ${threshold})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to fuzzy match: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Similarity score: ${score} (threshold: ${threshold})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual,
		};
	},
});

export const expectlyFuzzyLocator: Expect<typeof expectlyFuzzyLocatorMatchers> =
	baseExpect.extend(expectlyFuzzyLocatorMatchers);
