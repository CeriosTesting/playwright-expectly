/**
 * The result of a matcher helper. It is a structural type of this package rather than Playwright's
 * `MatcherReturnType`, so generated declarations name it instead of an internal Playwright module path
 * (which strict package managers cannot resolve). It is assignable to Playwright's `MatcherReturnType`.
 */
export interface ExpectlyMatcherResult {
	message: () => string;
	pass: boolean;
	name: string;
	expected?: unknown;
	actual?: unknown;
}
