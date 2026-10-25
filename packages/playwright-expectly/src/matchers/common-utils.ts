/**
 * Common utility functions for matchers
 */

/**
 * Sorts an array in ascending or descending order
 * @param actual - Array to sort
 * @param order - Sort order: "ascending" or "descending"
 * @returns Sorted copy of the array
 */
export function sortedExpected<T extends number | string>(actual: T[], order: "ascending" | "descending"): T[] {
	validateFiniteNumbers(actual);
	return [...actual].sort((left, right) => {
		if (typeof left === "number" && typeof right === "number") {
			return order === "ascending" ? left - right : right - left;
		}

		const leftString = String(left);
		const rightString = String(right);
		if (leftString === rightString) {
			return 0;
		}

		if (order === "ascending") {
			return leftString < rightString ? -1 : 1;
		}

		return leftString > rightString ? -1 : 1;
	});
}

/**
 * Checks if an array is in strictly ascending order (each element > previous)
 * @param actual - Array to check
 * @returns Index of first violation, or -1 if all valid
 */
export function findStrictAscendingViolation<T>(actual: T[]): number {
	validateFiniteNumbers(actual);
	for (let i = 0; i < actual.length - 1; i++) {
		if (!(actual[i] < actual[i + 1])) {
			return i;
		}
	}
	return -1;
}

/**
 * Checks if an array is in strictly descending order (each element < previous)
 * @param actual - Array to check
 * @returns Index of first violation, or -1 if all valid
 */
export function findStrictDescendingViolation<T>(actual: T[]): number {
	validateFiniteNumbers(actual);
	for (let i = 0; i < actual.length - 1; i++) {
		if (!(actual[i] > actual[i + 1])) {
			return i;
		}
	}
	return -1;
}

/**
 * Checks if an array is monotonic (consistently ascending or descending)
 * @param actual - Array to check
 * @returns Object with isAscending and isDescending flags
 */
export function checkMonotonic<T>(actual: T[]): { isAscending: boolean; isDescending: boolean } {
	validateFiniteNumbers(actual);
	if (actual.length <= 1) {
		return { isAscending: true, isDescending: true };
	}

	const isAscending = actual.every((val, i) => i === 0 || actual[i - 1] <= val);
	const isDescending = actual.every((val, i) => i === 0 || actual[i - 1] >= val);

	return { isAscending, isDescending };
}

/**
 * Finds duplicate values in an array
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

/** Small absolute tolerance near zero, relative tolerance for larger magnitudes. */
export function numbersEqual(actual: number, expected: number): boolean {
	validateFiniteNumbers([expected]);
	return (
		Number.isFinite(actual) &&
		Math.abs(actual - expected) <= Number.EPSILON * Math.max(1, Math.abs(actual), Math.abs(expected))
	);
}
