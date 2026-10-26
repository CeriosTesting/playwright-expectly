import { withMatcherState } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { type FuzzyOptions, fuzzyScore, validateThreshold } from "./fuzzy-score";

/**
 * Expectly Custom matcher for fuzzy string validation.
 */
export const expectlyFuzzyStringMatchers = withMatcherState({
	toMatchFuzzy(matcher: string, expected: string, threshold = 80, options?: FuzzyOptions) {
		const assertionName = "toMatchFuzzy";
		const actual = matcher;
		validateThreshold(assertionName, threshold);
		if (typeof actual !== "string") {
			throw new TypeError(
				`${assertionName}: received value must be a string, got: ${actual === null ? "null" : typeof actual}`,
			);
		}
		const score: number = fuzzyScore(actual, expected, options);
		const pass = score >= threshold;

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not fuzzy match: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Similarity score: ${score} (threshold: ${threshold})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to fuzzy match: ${this.utils.printExpected(expected)}\n` +
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

export const expectlyFuzzyString: Expect<typeof expectlyFuzzyStringMatchers> =
	baseExpect.extend(expectlyFuzzyStringMatchers);
