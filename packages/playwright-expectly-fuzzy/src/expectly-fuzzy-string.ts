import { withMatcherState } from "@cerios/playwright-expectly-core";
import { expect as baseExpect } from "@playwright/test";
import * as fuzz from "fuzzball";

/**
 * Expectly Custom matcher for fuzzy string validation.
 */
export const expectlyFuzzyStringMatchers = withMatcherState({
	toMatchFuzzy(matcher: string, expected: string, threshold = 80) {
		const assertionName = "toMatchFuzzy";
		const actual = matcher;
		if (typeof threshold !== "number" || !Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
			throw new Error(
				`${assertionName}: threshold must be a finite number between 0 and 100, got: ${String(threshold)}`,
			);
		}
		const score: number = fuzz.token_sort_ratio(matcher, expected);
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

export const expectlyFuzzyString = baseExpect.extend(expectlyFuzzyStringMatchers);
