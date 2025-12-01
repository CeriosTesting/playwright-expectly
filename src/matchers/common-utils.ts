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
	const copy = [...actual];

	if (actual.every(item => typeof item === "number")) {
		const nums = copy as number[];
		return (order === "ascending" ? nums.sort((n1, n2) => n1 - n2) : nums.sort((n1, n2) => n2 - n1)) as T[];
	} else {
		const strings = copy as string[];
		return (order === "ascending" ? strings.sort() : strings.sort().reverse()) as T[];
	}
}

/**
 * Validates if a date is a valid Date object
 * @param date - Date to validate
 * @returns True if valid, false otherwise
 */
export function isValidDate(date: Date): boolean {
	return date instanceof Date && !Number.isNaN(date.getTime());
}

/**
 * Validates a date and throws an error if invalid
 * @param date - Date to validate
 * @param paramName - Parameter name for error message
 * @throws Error if date is invalid
 */
export function validateDate(date: Date, paramName: string): void {
	if (!isValidDate(date)) {
		throw new Error(`Invalid ${paramName}: ${date}`);
	}
}

/**
 * Formats an array of dates for display
 * @param dates - Array of dates to format
 * @returns Array of ISO string representations
 */
export function formatDatesForDisplay(dates: Date[]): string[] {
	return dates.map(date => date.toISOString());
}

/**
 * Sorts an array of dates in ascending or descending order
 * @param actual - Array of dates to sort
 * @param order - Sort order: "ascending" or "descending"
 * @returns Sorted copy of the array
 */
export function sortedDates(actual: Date[], order: "ascending" | "descending"): Date[] {
	const copy = [...actual];
	// Validate all dates
	for (const date of copy) {
		if (!isValidDate(date)) {
			throw new Error(`Invalid date in array: ${date}`);
		}
	}
	return order === "ascending"
		? copy.sort((a, b) => a.getTime() - b.getTime())
		: copy.sort((a, b) => b.getTime() - a.getTime());
}

/**
 * Checks if an array is in strictly ascending order (each element > previous)
 * @param actual - Array to check
 * @returns Index of first violation, or -1 if all valid
 */
export function findStrictAscendingViolation<T>(actual: T[]): number {
	for (let i = 0; i < actual.length - 1; i++) {
		if (actual[i] >= actual[i + 1]) {
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
	for (let i = 0; i < actual.length - 1; i++) {
		if (actual[i] <= actual[i + 1]) {
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
	return actual.filter(val => !predicate(val));
}

/**
 * Calculates min and max values in a single pass through the array
 * @param actual - Array of numbers
 * @returns Object with min and max values, or NaN for empty arrays
 */
export function getMinMax(actual: number[]): { min: number; max: number } {
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
