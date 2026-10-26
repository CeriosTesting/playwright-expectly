import { withMatcherState } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { assertReceivedType } from "./matchers/common-utils";
import type { ExpectlyMatcherResult } from "./matchers/matcher-result";

/** `toEqual` semantics, including asymmetric matchers such as `expect.any(Number)`. */
function deepEquals(actual: unknown, expected: unknown): boolean {
	try {
		baseExpect(actual).toEqual(expected);
		return true;
	} catch {
		return false;
	}
}

function containsEqual(values: readonly unknown[], expected: unknown): boolean {
	return values.some((value) => deepEquals(value, expected));
}

/** Pairs every expected member with a distinct received member, so duplicates must appear as often. */
function unmatchedMembers(received: readonly unknown[], expected: readonly unknown[]): unknown[] {
	const used = new Set<number>();
	const unmatched: unknown[] = [];
	for (const member of expected) {
		const index = received.findIndex((value, i) => !used.has(i) && deepEquals(value, member));
		if (index === -1) unmatched.push(member);
		else used.add(index);
	}
	return unmatched;
}

function assertObject(assertionName: string, received: unknown): asserts received is Record<PropertyKey, unknown> {
	if (typeof received !== "object" || received === null || Array.isArray(received)) {
		throw new TypeError(
			`${assertionName}: received value must be an object, got: ${received === null ? "null" : Array.isArray(received) ? "array" : typeof received}`,
		);
	}
}

function assertArgumentArray(assertionName: string, label: string, value: unknown): asserts value is unknown[] {
	if (!Array.isArray(value)) throw new TypeError(`${assertionName}: ${label} must be an array`);
}

function assertPredicate(
	assertionName: string,
	predicate: unknown,
): asserts predicate is (value: unknown, index: number) => unknown {
	if (typeof predicate !== "function") throw new TypeError(`${assertionName}: predicate must be a function`);
}

function result(
	state: ExpectMatcherState,
	assertionName: string,
	pass: boolean,
	expectation: string,
	details: () => string,
	expected?: unknown,
	actual?: unknown,
): ExpectlyMatcherResult {
	const message = (): string => {
		const hint = state.utils.matcherHint(assertionName, undefined, undefined, { isNot: state.isNot });
		return `${hint}\n\nExpected value to ${state.isNot ? "not " : ""}${expectation}\n${details()}`;
	};
	return { message, pass, name: assertionName, expected, actual };
}

/** Own enumerable string and symbol keys. */
function ownKeys(value: Record<PropertyKey, unknown>): PropertyKey[] {
	return Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));
}

/**
 * Array and object content matchers: members (order-insensitive), predicates, keys and entries.
 * Values are compared with `toEqual` semantics, so asymmetric matchers work as members and values.
 */
export const expectlyCollectionMatchers = withMatcherState({
	toSatisfyAll(received: unknown[], predicate: (value: unknown, index: number) => unknown) {
		const assertionName = "toSatisfyAll";
		assertReceivedType(assertionName, received, "array");
		assertPredicate(assertionName, predicate);
		const failing = received.flatMap((value, index) => (predicate(value, index) ? [] : [index]));
		return result(
			this,
			assertionName,
			failing.length === 0,
			"have every element satisfy the predicate",
			() =>
				failing.length > 0
					? `Failing indexes: ${failing.join(", ")}\nFailing values: ${this.utils.printReceived(failing.map((i) => received[i]))}`
					: `Received: ${this.utils.printReceived(received)}`,
			undefined,
			received,
		);
	},
	toSatisfyAny(received: unknown[], predicate: (value: unknown, index: number) => unknown) {
		const assertionName = "toSatisfyAny";
		assertReceivedType(assertionName, received, "array");
		assertPredicate(assertionName, predicate);
		const index = received.findIndex((value, i) => Boolean(predicate(value, i)));
		return result(
			this,
			assertionName,
			index !== -1,
			"have at least one element satisfy the predicate",
			() =>
				index !== -1
					? `Satisfied at index ${index}: ${this.utils.printReceived(received[index])}`
					: `Received: ${this.utils.printReceived(received)}`,
			undefined,
			received,
		);
	},
	toIncludeSameMembers(received: unknown[], expected: unknown[]) {
		const assertionName = "toIncludeSameMembers";
		assertReceivedType(assertionName, received, "array");
		assertArgumentArray(assertionName, "expected", expected);
		const missing = unmatchedMembers(received, expected);
		const extra = unmatchedMembers(expected, received);
		return result(
			this,
			assertionName,
			missing.length === 0 && extra.length === 0,
			"have the same members in any order",
			() =>
				`Expected: ${this.utils.printExpected(expected)}\nReceived: ${this.utils.printReceived(received)}` +
				(missing.length > 0 ? `\nMissing: ${this.utils.printExpected(missing)}` : "") +
				(extra.length > 0 ? `\nUnexpected: ${this.utils.printReceived(extra)}` : ""),
			expected,
			received,
		);
	},
	toIncludeAllMembers(received: unknown[], expected: unknown[]) {
		const assertionName = "toIncludeAllMembers";
		assertReceivedType(assertionName, received, "array");
		assertArgumentArray(assertionName, "expected", expected);
		const missing = unmatchedMembers(received, expected);
		return result(
			this,
			assertionName,
			missing.length === 0,
			"include all of these members",
			() =>
				`Expected: ${this.utils.printExpected(expected)}\nReceived: ${this.utils.printReceived(received)}` +
				(missing.length > 0 ? `\nMissing: ${this.utils.printExpected(missing)}` : ""),
			expected,
			received,
		);
	},
	toIncludeAnyMembers(received: unknown[], expected: unknown[]) {
		const assertionName = "toIncludeAnyMembers";
		assertReceivedType(assertionName, received, "array");
		assertArgumentArray(assertionName, "expected", expected);
		const found = expected.filter((member) => containsEqual(received, member));
		return result(
			this,
			assertionName,
			found.length > 0,
			"include at least one of these members",
			() =>
				`Expected any of: ${this.utils.printExpected(expected)}\nReceived: ${this.utils.printReceived(received)}` +
				(found.length > 0 ? `\nFound: ${this.utils.printReceived(found)}` : ""),
			expected,
			received,
		);
	},
	toContainKey(received: object, key: PropertyKey) {
		const assertionName = "toContainKey";
		assertObject(assertionName, received);
		return result(
			this,
			assertionName,
			Object.prototype.hasOwnProperty.call(received, key),
			`have own key ${this.utils.printExpected(key)}`,
			() => `Received keys: ${this.utils.printReceived(ownKeys(received))}`,
			key,
			received,
		);
	},
	toContainKeys(received: object, keys: PropertyKey[]) {
		const assertionName = "toContainKeys";
		assertObject(assertionName, received);
		assertArgumentArray(assertionName, "keys", keys);
		const missing = keys.filter((key) => !Object.prototype.hasOwnProperty.call(received, key));
		return result(
			this,
			assertionName,
			missing.length === 0,
			`have all own keys ${this.utils.printExpected(keys)}`,
			() =>
				(missing.length > 0 ? `Missing keys: ${this.utils.printExpected(missing)}\n` : "") +
				`Received keys: ${this.utils.printReceived(ownKeys(received))}`,
			keys,
			received,
		);
	},
	toContainAllKeys(received: object, keys: PropertyKey[]) {
		const assertionName = "toContainAllKeys";
		assertObject(assertionName, received);
		assertArgumentArray(assertionName, "keys", keys);
		const actualKeys = ownKeys(received);
		const missing = keys.filter((key) => !actualKeys.includes(key));
		const extra = actualKeys.filter((key) => !keys.includes(key));
		return result(
			this,
			assertionName,
			missing.length === 0 && extra.length === 0,
			`have exactly the keys ${this.utils.printExpected(keys)}`,
			() =>
				(missing.length > 0 ? `Missing keys: ${this.utils.printExpected(missing)}\n` : "") +
				(extra.length > 0 ? `Unexpected keys: ${this.utils.printReceived(extra)}\n` : "") +
				`Received keys: ${this.utils.printReceived(actualKeys)}`,
			keys,
			received,
		);
	},
	toContainEntry(received: object, entry: [PropertyKey, unknown]) {
		const assertionName = "toContainEntry";
		assertObject(assertionName, received);
		if (!Array.isArray(entry) || entry.length !== 2) {
			throw new TypeError(`${assertionName}: entry must be a [key, value] pair`);
		}
		const [key, value] = entry;
		const has = Object.prototype.hasOwnProperty.call(received, key);
		return result(
			this,
			assertionName,
			has && deepEquals(received[key], value),
			`have entry ${this.utils.printExpected(key)}: ${this.utils.printExpected(value)}`,
			() =>
				has
					? `Received value: ${this.utils.printReceived(received[key])}`
					: `Received keys: ${this.utils.printReceived(ownKeys(received))}`,
			entry,
			received,
		);
	},
	toContainEntries(received: object, entries: [PropertyKey, unknown][]) {
		const assertionName = "toContainEntries";
		assertObject(assertionName, received);
		assertArgumentArray(assertionName, "entries", entries);
		const mismatched = entries.filter(
			([key, value]) => !Object.prototype.hasOwnProperty.call(received, key) || !deepEquals(received[key], value),
		);
		return result(
			this,
			assertionName,
			mismatched.length === 0,
			`have all entries ${this.utils.printExpected(entries)}`,
			() =>
				(mismatched.length > 0 ? `Missing or different: ${this.utils.printExpected(mismatched)}\n` : "") +
				`Received: ${this.utils.printReceived(received)}`,
			entries,
			received,
		);
	},
	toBeEmptyObject(received: unknown) {
		const assertionName = "toBeEmptyObject";
		const isObject = typeof received === "object" && received !== null && !Array.isArray(received);
		const keys = isObject ? ownKeys(received as Record<PropertyKey, unknown>) : [];
		return result(
			this,
			assertionName,
			isObject && keys.length === 0,
			"be an empty object",
			() =>
				isObject
					? `Received keys: ${this.utils.printReceived(keys)}`
					: `Received: ${this.utils.printReceived(received)} (not an object)`,
			undefined,
			received,
		);
	},
});

export const expectlyCollection: Expect<typeof expectlyCollectionMatchers> =
	baseExpect.extend(expectlyCollectionMatchers);
