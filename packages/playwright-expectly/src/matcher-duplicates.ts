// Public duplicate-matcher API: the check from matcher-duplicates-check.ts with Playwright's `expect` as
// the default source of built-in matcher names.
import { expect as baseExpect } from "@playwright/test";

import type {
	DuplicateMatcherReport,
	ExpectLike,
	FindDuplicateMatchersOptions,
	MatcherSource,
} from "./matcher-duplicates-check";
import {
	assertNoDuplicateMatchers as assertNoDuplicateMatchersWith,
	findDuplicateMatchers as findDuplicateMatchersWith,
	playwrightBuiltinMatcherNames as playwrightBuiltinMatcherNamesOf,
} from "./matcher-duplicates-check";

export { DuplicateMatcherError, formatDuplicateMatcherReport } from "./matcher-duplicates-check";
export type {
	DuplicateMatcherReport,
	ExpectLike,
	FindDuplicateMatchersOptions,
	MatcherDictionary,
	MatcherFunction,
	MatcherNameConflict,
	MatcherSource,
	MatcherSourceSummary,
} from "./matcher-duplicates-check";

function withDefaults(options: FindDuplicateMatchersOptions = {}): FindDuplicateMatchersOptions {
	return { expect: baseExpect, ...options };
}

/**
 * The names of Playwright's built-in matchers, read from an expect instance (the base `expect` by default).
 * Before Playwright 1.60, custom matchers registered with `expect.extend()` are listed next to the built-ins
 * and cannot be told apart; pass `builtinNames` to `findDuplicateMatchers()` explicitly when that matters.
 */
export function playwrightBuiltinMatcherNames(expectLike: ExpectLike = baseExpect): string[] {
	return playwrightBuiltinMatcherNamesOf(expectLike);
}

/**
 * Compares matcher sources by name. A name counts as a duplicate when two or more sources define it with
 * a different implementation; the same function in several sources (or the same package loaded twice) is
 * fine. Names that replace a Playwright built-in matcher are reported separately.
 *
 * @example
 * findDuplicateMatchers({ expectly: expectlyMatchers, fuzzy: expectlyFuzzyMatchers, mine: myMatchers });
 */
export function findDuplicateMatchers(
	sources: Record<string, MatcherSource>,
	options?: FindDuplicateMatchersOptions,
): DuplicateMatcherReport {
	return findDuplicateMatchersWith(sources, withDefaults(options));
}

/**
 * Like `findDuplicateMatchers()`, but throws a `DuplicateMatcherError` that lists the duplicates and
 * built-in overrides, so a single test or global setup can guard the project's expect.
 */
export function assertNoDuplicateMatchers(
	sources: Record<string, MatcherSource>,
	options?: FindDuplicateMatchersOptions,
): DuplicateMatcherReport {
	return assertNoDuplicateMatchersWith(sources, withDefaults(options));
}
