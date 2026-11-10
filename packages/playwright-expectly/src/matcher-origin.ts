/**
 * Registry symbol under which Expectly matchers carry their origin ("<package>#<name>"). A registry
 * symbol is readable across copies of the package: its CommonJS and ESM builds, or source next to dist.
 */
export const MATCHER_ORIGIN: symbol = Symbol.for("@cerios/playwright-expectly:matcher-origin");

type AnyMatcher = (...args: never[]) => unknown;

/**
 * Tags every matcher with the package and name that define it. The duplicate-matcher check treats two
 * functions with the same tag as the same implementation, so a package that is loaded twice does not
 * look like a duplicate of itself.
 */
export function tagMatcherOrigin<T extends Record<string, AnyMatcher>>(matchers: T, packageName: string): T {
	for (const [name, matcher] of Object.entries(matchers)) {
		if (!Object.prototype.hasOwnProperty.call(matcher, MATCHER_ORIGIN)) {
			Object.defineProperty(matcher, MATCHER_ORIGIN, { value: `${packageName}#${name}` });
		}
	}
	return matchers;
}

/** The origin tag of a matcher, or `undefined` for functions that were not tagged. */
export function matcherOrigin(matcher: AnyMatcher): string | undefined {
	const origin: unknown = (matcher as unknown as Record<symbol, unknown>)[MATCHER_ORIGIN];
	return typeof origin === "string" ? origin : undefined;
}
