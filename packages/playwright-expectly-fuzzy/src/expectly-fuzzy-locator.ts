import { withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import { expect as baseExpect, Locator } from "@playwright/test";
import * as fuzz from "fuzzball";

/**
 * Expectly Custom matcher for fuzzy locator text validation.
 */
export const expectlyFuzzyLocatorMatchers = withMatcherState({
	async toMatchFuzzy(locator: Locator, expected: string, threshold = 80, options?: PollOptions) {
		const assertionName = "toMatchFuzzy";
		let pass: boolean = false;
		let actual: string = "";
		let score: number = 0;
		let locatorError: Error | undefined;

		if (typeof threshold !== "number" || !Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
			throw new Error(
				`${assertionName}: threshold must be a finite number between 0 and 100, got: ${String(threshold)}`,
			);
		}

		const pollCondition = this.isNot ? (s: number): boolean => s < threshold : (s: number): boolean => s >= threshold;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							score = fuzz.token_sort_ratio(actual, expected);
							return pollCondition(score);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = score >= threshold;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
			pass = score >= threshold;
		}

		const message = (): string => {
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

export const expectlyFuzzyLocator = baseExpect.extend(expectlyFuzzyLocatorMatchers);
