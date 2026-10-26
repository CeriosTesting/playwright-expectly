import type { PollOptions } from "@cerios/playwright-expectly-core";
import type { Locator } from "@playwright/test";

import type { FuzzyOptions } from "../fuzzy-score";

declare global {
	export namespace PlaywrightTest {
		export interface Matchers<R, T> {
			/**
			 * Asserts that a string fuzzy-matches the expected string using fuzzball's token-sort ratio algorithm.
			 *
			 * The comparison is word-order-insensitive: `"hello world"` and `"world hello"` score 100.
			 * Scores range from 0 to 100. The assertion passes when the score meets or exceeds the threshold.
			 *
			 * Particularly useful for validating AI-generated text where wording, phrasing, or word order
			 * may vary but the content is semantically equivalent.
			 *
			 * Before scoring, both strings are Unicode-normalized (NFC), punctuation and whitespace runs become
			 * single word separators, and letter case is ignored unless `caseSensitive` is set. So
			 * `"HELLO, World!"` and `"hello world"` score 100, and a threshold of 100 does not mean byte-equal.
			 * Scores are rounded to integers.
			 *
			 * @param expected - The string to compare against
			 * @param threshold - Minimum similarity score (0–100). Defaults to 80.
			 * @param options - `caseSensitive`, plus polling configuration for locators
			 *
			 * @example
			 * expect('Hello World').toMatchFuzzy('Hello Wrold');         // passes (default threshold 80)
			 * expect('world hello').toMatchFuzzy('hello world');         // passes (word-order-insensitive)
			 * expect('Hello World').toMatchFuzzy('Hi Earth', 60);        // passes with lower threshold
			 * expect('completely different').toMatchFuzzy('hello world'); // fails
			 * expect('Hello World').toMatchFuzzy('hello world', 100, { caseSensitive: true }); // fails
			 */
			toMatchFuzzy(
				expected: T extends string | Locator ? string : never,
				threshold?: number,
				options?: FuzzyOptions & (T extends Locator ? PollOptions : unknown),
			): T extends Locator ? Promise<R> : R;
		}
	}
}
