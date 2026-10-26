import * as fuzz from "fuzzball";

export type FuzzyOptions = {
	/**
	 * Compare letter case too. By default both strings are lowercased before scoring.
	 * Punctuation and whitespace runs are always treated as word separators.
	 */
	caseSensitive?: boolean;
};

/**
 * Unicode-aware replacement for fuzzball's default `full_process`, which strips every non-ASCII
 * character: canonical composition (so "e" followed by U+0301 equals "é"), separators collapsed to single spaces,
 * and optional lowercasing.
 */
function preprocess(text: string, caseSensitive: boolean): string {
	const words = text
		.normalize("NFC")
		.replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
		.trim();
	return caseSensitive ? words : words.toLowerCase();
}

/** Word-order-insensitive similarity from 0 to 100 (rounded to an integer, as fuzzball reports it). */
export function fuzzyScore(actual: string, expected: string, options?: FuzzyOptions): number {
	const caseSensitive = options?.caseSensitive ?? false;
	const processedActual = preprocess(actual, caseSensitive);
	const processedExpected = preprocess(expected, caseSensitive);
	// fuzzball scores two empty strings as 0; strings that are equal after preprocessing are a full match.
	if (processedActual === processedExpected) return 100;
	return fuzz.token_sort_ratio(processedActual, processedExpected, { full_process: false });
}

export function validateThreshold(assertionName: string, threshold: unknown): void {
	if (typeof threshold !== "number" || !Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
		throw new Error(`${assertionName}: threshold must be a finite number between 0 and 100, got: ${String(threshold)}`);
	}
}
