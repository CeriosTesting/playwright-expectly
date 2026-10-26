/**
 * The result of every date matcher. It lives in its own dependency-free module, so published
 * declarations reference this small interface instead of Playwright's internal types or the
 * Temporal implementation.
 */
export interface DateMatcherResult {
	message: () => string;
	pass: boolean;
	name: string;
	expected?: unknown;
	actual?: unknown;
}
