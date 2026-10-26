/**
 * Common utility functions for matchers
 */

/** Returns a negative number when `left` sorts before `right`, positive when after, 0 when equal. */
export type Comparator<T> = (left: T, right: T) => number;

export type StringOrderOptions = {
	/**
	 * Compare digit sequences by numeric value, so `"2"` sorts before `"10"` and `"9.99"` before `"19.99"`.
	 */
	numeric?: boolean;
	/**
	 * Compare with the rules of a locale (an `Intl.Collator` locale), for example `"de"` or `"sv"`.
	 * Without `numeric` or `locale`, strings are compared by UTF-16 code units, so uppercase sorts before lowercase.
	 */
	locale?: string | string[];
};

/** A locale-aware comparator for the given options, or undefined for the default code-unit order. */
export function stringComparator(options?: StringOrderOptions): Comparator<string> | undefined {
	if (options?.numeric === undefined && options?.locale === undefined) return undefined;
	return new Intl.Collator(options.locale, { numeric: options.numeric ?? false }).compare;
}

function defaultCompare<T>(left: T, right: T): number {
	if (typeof left === "number" && typeof right === "number") {
		return left - right;
	}
	const leftString = String(left);
	const rightString = String(right);
	if (leftString === rightString) return 0;
	return leftString < rightString ? -1 : 1;
}

/**
 * Sorts an array in ascending or descending order
 * @param actual - Array to sort
 * @param order - Sort order: "ascending" or "descending"
 * @param compare - Optional comparator; numbers and code-unit string order by default
 * @returns Sorted copy of the array
 */
export function sortedExpected<T extends number | string>(
	actual: T[],
	order: "ascending" | "descending",
	compare: Comparator<T> = defaultCompare,
): T[] {
	validateFiniteNumbers(actual);
	return [...actual].sort((left, right) => (order === "ascending" ? compare(left, right) : compare(right, left)));
}

/**
 * Checks if an array is in strictly ascending order (each element > previous)
 * @param actual - Array to check
 * @param compare - Optional comparator; `<` by default
 * @returns Index of first violation, or -1 if all valid
 */
export function findStrictAscendingViolation<T>(actual: T[], compare?: Comparator<T>): number {
	validateFiniteNumbers(actual);
	for (let i = 0; i < actual.length - 1; i++) {
		if (compare ? !(compare(actual[i], actual[i + 1]) < 0) : !(actual[i] < actual[i + 1])) {
			return i;
		}
	}
	return -1;
}

/**
 * Checks if an array is in strictly descending order (each element < previous)
 * @param actual - Array to check
 * @param compare - Optional comparator; `>` by default
 * @returns Index of first violation, or -1 if all valid
 */
export function findStrictDescendingViolation<T>(actual: T[], compare?: Comparator<T>): number {
	validateFiniteNumbers(actual);
	for (let i = 0; i < actual.length - 1; i++) {
		if (compare ? !(compare(actual[i], actual[i + 1]) > 0) : !(actual[i] > actual[i + 1])) {
			return i;
		}
	}
	return -1;
}

/**
 * Checks if an array is monotonic (consistently ascending or descending)
 * @param actual - Array to check
 * @param compare - Optional comparator; `<=` and `>=` by default
 * @returns Object with isAscending and isDescending flags
 */
export function checkMonotonic<T>(
	actual: T[],
	compare?: Comparator<T>,
): { isAscending: boolean; isDescending: boolean } {
	validateFiniteNumbers(actual);
	if (actual.length <= 1) {
		return { isAscending: true, isDescending: true };
	}

	const isAscending = actual.every(
		(val, i) => i === 0 || (compare ? compare(actual[i - 1], val) <= 0 : actual[i - 1] <= val),
	);
	const isDescending = actual.every(
		(val, i) => i === 0 || (compare ? compare(actual[i - 1], val) >= 0 : actual[i - 1] >= val),
	);

	return { isAscending, isDescending };
}

/**
 * Finds duplicate values in an array. Values are compared with SameValueZero (like `Set`), so `0` and `-0`
 * are duplicates and `NaN` would equal itself.
 * @param actual - Array to check
 * @returns Set of duplicate values
 */
export function findDuplicates<T>(actual: T[]): Set<T> {
	validateFiniteNumbers(actual);
	const seen = new Set<T>();
	const duplicates = new Set<T>();

	for (const val of actual) {
		if (seen.has(val)) {
			duplicates.add(val);
		}
		seen.add(val);
	}

	return duplicates;
}

/**
 * Filters array elements that don't match a predicate
 * @param actual - Array to filter
 * @param predicate - Test function
 * @returns Array of elements that failed the predicate
 */
export function findNonMatching<T>(actual: T[], predicate: (value: T) => boolean): T[] {
	return actual.filter((val) => !predicate(val));
}

/**
 * Calculates min and max values in a single pass through the array
 * @param actual - Array of numbers
 * @returns Object with min and max values, or NaN for empty arrays
 */
export function getMinMax(actual: number[]): { min: number; max: number } {
	validateFiniteNumbers(actual);
	if (actual.length === 0) {
		return { min: Number.NaN, max: Number.NaN };
	}
	let min = actual[0];
	let max = actual[0];
	for (let i = 1; i < actual.length; i++) {
		if (actual[i] < min) min = actual[i];
		if (actual[i] > max) max = actual[i];
	}
	return { min, max };
}

/** Reject unordered numeric values consistently, also in shared number/string matchers. */
export function validateFiniteNumbers(values: readonly unknown[]): void {
	if (values.some((value) => typeof value === "number" && !Number.isFinite(value))) {
		throw new TypeError("Numeric matchers require finite numbers; NaN and Infinity are not supported.");
	}
}

export type NumericToleranceOptions = {
	/**
	 * Maximum absolute difference between the computed and the expected value. Defaults to a bound on the
	 * rounding error of the computation, so exact decimal expectations such as `0.1 + 0.2 === 0.3` pass.
	 */
	tolerance?: number;
};

/** How a computed value was derived, to bound its floating-point rounding error. */
export type RoundingContext = {
	/** Number of floating-point operations that accumulated into the value. */
	operations: number;
	/** Largest magnitude involved, e.g. the sum of absolute values for a sum. */
	magnitude: number;
};

/**
 * Compares a computed value with the expected value. Without an explicit tolerance, each operation may
 * contribute one rounding error relative to the largest magnitude involved, so the bound grows with the
 * number of terms: summing `0.1` a hundred times equals `10`.
 */
export function numbersClose(
	actual: number,
	expected: number,
	context: RoundingContext,
	options?: NumericToleranceOptions,
): boolean {
	validateFiniteNumbers([expected]);
	if (!Number.isFinite(actual)) return false;
	const tolerance = options?.tolerance;
	if (tolerance !== undefined) {
		if (typeof tolerance !== "number" || !Number.isFinite(tolerance) || tolerance < 0) {
			throw new TypeError(`tolerance must be a non-negative finite number, got: ${String(tolerance)}`);
		}
		return Math.abs(actual - expected) <= tolerance;
	}
	const magnitude = Math.max(1, Math.abs(actual), Math.abs(expected), context.magnitude);
	return Math.abs(actual - expected) <= Number.EPSILON * Math.max(1, context.operations) * magnitude;
}

/** Throws a descriptive TypeError when a matcher receives a value of the wrong type. */
export function assertReceivedType(
	assertionName: string,
	received: unknown,
	expected: "string" | "array" | "number array" | "string array",
): void {
	let valid: boolean;
	switch (expected) {
		case "string":
			valid = typeof received === "string";
			break;
		case "array":
			valid = Array.isArray(received);
			break;
		case "number array":
			valid = Array.isArray(received) && received.every((value) => typeof value === "number");
			break;
		case "string array":
			valid = Array.isArray(received) && received.every((value) => typeof value === "string");
			break;
	}
	if (!valid) {
		throw new TypeError(`${assertionName}: received value must be a ${expected}, got: ${describeType(received)}`);
	}
}

function describeType(value: unknown): string {
	if (value === null) return "null";
	if (Array.isArray(value)) {
		const kinds = [...new Set(value.map((item) => (item === null ? "null" : typeof item)))];
		return kinds.length > 0 ? `array of ${kinds.join(" | ")}` : "array";
	}
	if (typeof value === "object") return value.constructor?.name ?? "object";
	return typeof value;
}
