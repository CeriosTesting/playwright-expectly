import { expect as baseExpect } from "@playwright/test";
import {
	checkMonotonic,
	findDuplicates,
	findStrictAscendingViolation,
	findStrictDescendingViolation,
	sortedExpected,
} from "./matchers/common-utils";

/**
 * Expextly Custom matchers for string array validations.
 */
export const expectlyStringArray = baseExpect.extend({
	/**
	 * Asserts that an array of strings is in ascending order (alphabetically A-Z).
	 *
	 * @param actual - Array of strings
	 *
	 * @example
	 * // Validate sorted names
	 * const names = ["Alice", "Bob", "Charlie", "David"];
	 * await expectStringArray(names).toHaveAscendingOrder();
	 *
	 * @example
	 * // Check sorted categories from API
	 * const categories = await page.locator('.category').allTextContents();
	 * await expectStringArray(categories).toHaveAscendingOrder();
	 */
	toHaveAscendingOrder(actual: string[]) {
		const assertionName = "toHaveAscendingOrder";
		let pass: boolean;
		let matcherResult: any;

		const expected: string[] = sortedExpected(actual, "ascending");
		try {
			baseExpect(actual).toEqual(expected);
			matcherResult = actual;
			pass = true;
		} catch (e: any) {
			matcherResult = e.matcherResult;
			pass = false;
		}

		const message = () =>
			this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			}) +
			"\n\n" +
			`Expected array to ${this.isNot ? "not " : ""}be in ascending order\n\n` +
			`Expected: ${this.utils.printExpected(expected)}\n` +
			`Received: ${this.utils.printReceived(matcherResult?.actual || actual)}`;

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: matcherResult?.actual,
		};
	},
	/**
	 * Asserts that an array of strings is in descending order (alphabetically Z-A).
	 *
	 * @param actual - Array of strings
	 *
	 * @example
	 * // Validate reverse sorted list
	 * const items = ["Zebra", "Yak", "Xylophone", "Watermelon"];
	 * await expectStringArray(items).toHaveDescendingOrder();
	 *
	 * @example
	 * // Check descending sort
	 * expectStringArray(sortedList).toHaveDescendingOrder();
	 */
	toHaveDescendingOrder(actual: string[]) {
		const assertionName = "toHaveDescendingOrder";
		let pass: boolean;
		let matcherResult: any;

		const expected: string[] = sortedExpected(actual, "descending");
		try {
			baseExpect(actual).toEqual(expected);
			matcherResult = { actual };
			pass = true;
		} catch (e: any) {
			matcherResult = e.matcherResult;
			pass = false;
		}

		const message = () =>
			this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			}) +
			"\n\n" +
			`Expected array to ${this.isNot ? "not " : ""}be in descending order\n\n` +
			`Expected: ${this.utils.printExpected(expected)}\n` +
			`Received: ${this.utils.printReceived(matcherResult?.actual || actual)}`;

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: matcherResult?.actual,
		};
	},
	/**
	 * Asserts that strings are in strictly ascending order (each element > previous).
	 *
	 * Unlike toHaveAscendingOrder, this rejects equal consecutive values.
	 *
	 * @param actual - Array of strings
	 *
	 * @example
	 * // Validate increasing values
	 * const versions = ["v1.0", "v1.1", "v2.0", "v3.0"];
	 * await expectStringArray(versions).toHaveStrictlyAscendingOrder();
	 *
	 * @example
	 * // This would fail (has equal consecutive values)
	 * expectStringArray(["a", "b", "b", "c"]).not.toHaveStrictlyAscendingOrder();
	 */
	toHaveStrictlyAscendingOrder(actual: string[]) {
		const assertionName = "toHaveStrictlyAscendingOrder";
		const firstViolationIndex = findStrictAscendingViolation(actual);
		const pass = firstViolationIndex === -1;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to not be in strictly ascending order (each element > previous)\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to be in strictly ascending order (each element > previous)\n\n` +
					`Found violation at index ${firstViolationIndex}: "${actual[firstViolationIndex]}" >= "${actual[firstViolationIndex + 1]}"\n\n` +
					`Array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
		};
	},
	/**
	 * Asserts that strings are in strictly descending order (each element < previous).
	 *
	 * Unlike toHaveDescendingOrder, this rejects equal consecutive values.
	 *
	 * @param actual - Array of strings
	 *
	 * @example
	 * // Validate decreasing values
	 * const priorities = ["urgent", "high", "medium", "low"];
	 * await expectStringArray(priorities).toHaveStrictlyDescendingOrder();
	 *
	 * @example
	 * // This would fail (has equal consecutive values)
	 * expectStringArray(["z", "y", "y", "x"]).not.toHaveStrictlyDescendingOrder();
	 */
	toHaveStrictlyDescendingOrder(actual: string[]) {
		const assertionName = "toHaveStrictlyDescendingOrder";
		const firstViolationIndex = findStrictDescendingViolation(actual);
		const pass = firstViolationIndex === -1;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to not be in strictly descending order (each element < previous)\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to be in strictly descending order (each element < previous)\n\n` +
					`Found violation at index ${firstViolationIndex}: "${actual[firstViolationIndex]}" <= "${actual[firstViolationIndex + 1]}"\n\n` +
					`Array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
		};
	},
	/**
	 * Asserts that an array is monotonic (consistently ascending or descending).
	 *
	 * A monotonic array never changes direction - it only goes up, only goes down,
	 * or stays flat (equal consecutive values allowed).
	 *
	 * @param actual - Array of strings
	 *
	 * @example
	 * // Valid monotonic arrays
	 * expectStringArray(["a", "b", "b", "c", "d"]).toBeMonotonic(); // Ascending
	 * await expectStringArray(["z", "y", "x", "x", "w"]).toBeMonotonic(); // Descending
	 * await expectStringArray(["same", "same", "same"]).toBeMonotonic(); // Flat
	 *
	 * @example
	 * // Not monotonic (changes direction)
	 * expectStringArray(["a", "c", "b", "d"]).not.toBeMonotonic();
	 */
	toBeMonotonic(actual: string[]) {
		const assertionName = "toBeMonotonic";

		if (actual.length <= 1) {
			return {
				message: () =>
					this.utils.matcherHint(assertionName, undefined, undefined, {
						isNot: this.isNot,
					}),
				pass: true,
				name: assertionName,
			};
		}

		const { isAscending, isDescending } = checkMonotonic(actual);
		const pass = isAscending || isDescending;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to not be monotonic (not consistently ascending or descending)\n\n` +
					`Array is ${isAscending ? "ascending" : "descending"}: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to be monotonic (consistently ascending or descending)\n\n` +
					`Array has mixed ordering: ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
		};
	},
	/**
	 * Asserts that all strings in an array are unique (no duplicates).
	 *
	 * @param actual - Array of strings
	 *
	 * @example
	 * // Validate unique usernames
	 * const usernames = ["alice", "bob", "charlie", "david"];
	 * await expectStringArray(usernames).toHaveUniqueValues();
	 *
	 * @example
	 * // Check for duplicates
	 * expectStringArray(["a", "b", "b", "c"]).not.toHaveUniqueValues();
	 */
	toHaveUniqueValues(actual: string[]) {
		const assertionName = "toHaveUniqueValues";
		const duplicates = findDuplicates(actual);
		const pass = duplicates.size === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to contain duplicate values\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to contain only unique values\n\n` +
					`Duplicate values (${duplicates.size}): ${this.utils.printReceived(Array.from(duplicates))}\n\n` +
					`Full array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
		};
	},
});
