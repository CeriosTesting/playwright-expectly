import { arrayBufferEquality, equals, iterableEquality, sparseArrayEquality, typeEquality } from "@jest/expect-utils";

/*
 * Deep equality with the exact semantics of Playwright's `toEqual` / `toStrictEqual`, which use these same
 * @jest/expect-utils testers. Calling `expect(...).toEqual()` inside a matcher instead would add a nested
 * "Expect toEqual" step to the test report for every comparison.
 *
 * An error thrown during comparison (e.g. by a user's asymmetric matcher) counts as "not equal", as it did
 * when these checks were try/catch-wrapped `toEqual` calls.
 */

const toStrictEqualTesters = [iterableEquality, typeEquality, sparseArrayEquality, arrayBufferEquality];

/** `expect(actual).toEqual(expected)` semantics, including asymmetric matchers such as `expect.any(Number)`. */
export function isEqual(actual: unknown, expected: unknown): boolean {
	try {
		return equals(actual, expected, [iterableEquality]);
	} catch {
		return false;
	}
}

/** `expect(actual).toStrictEqual(expected)` semantics. */
export function isStrictEqual(actual: unknown, expected: unknown): boolean {
	try {
		return equals(actual, expected, toStrictEqualTesters, true);
	} catch {
		return false;
	}
}
