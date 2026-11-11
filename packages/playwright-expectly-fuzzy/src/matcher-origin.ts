/**
 * Registry symbol under which Expectly matchers carry their origin ("<package>#<name>"). It is shared
 * with @cerios/playwright-expectly, whose `check-matchers` command reads it: two functions with the same
 * tag count as the same implementation, so this package loaded twice (its CommonJS and ESM builds) does
 * not look like a duplicate of itself.
 */
const MATCHER_ORIGIN: symbol = Symbol.for("@cerios/playwright-expectly:matcher-origin");

type AnyMatcher = (...args: never[]) => unknown;

export function tagMatcherOrigin<T extends Record<string, AnyMatcher>>(matchers: T, packageName: string): T {
	for (const [name, matcher] of Object.entries(matchers)) {
		if (!Object.prototype.hasOwnProperty.call(matcher, MATCHER_ORIGIN)) {
			Object.defineProperty(matcher, MATCHER_ORIGIN, { value: `${packageName}#${name}` });
		}
	}
	return matchers;
}
