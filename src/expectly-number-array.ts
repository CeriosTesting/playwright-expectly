import { expect as baseExpect } from "@playwright/test";

import {
	checkMonotonic,
	findDuplicates,
	findNonMatching,
	findStrictAscendingViolation,
	findStrictDescendingViolation,
	getMinMax,
	sortedExpected,
} from "./matchers/common-utils";
import { withMatcherState } from "./matchers/matcher-state-utils";

/**
 * Expextly Custom matchers for number array validations.
 */
export const expectlyNumberArrayMatchers = withMatcherState({
	toHaveAscendingOrder(actual: number[]) {
		const assertionName = "toHaveAscendingOrder";
		let pass: boolean;
		let matcherResult: { actual?: unknown } | undefined;

		const expected: number[] = sortedExpected(actual, "ascending");
		try {
			baseExpect(actual).toEqual(expected);
			matcherResult = { actual };
			pass = true;
		} catch (e: unknown) {
			matcherResult = undefined;
			if (
				e != null &&
				typeof e === "object" &&
				"matcherResult" in e &&
				e.matcherResult != null &&
				typeof e.matcherResult === "object" &&
				"actual" in e.matcherResult
			) {
				matcherResult = { actual: e.matcherResult.actual };
			}
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
	toHaveDescendingOrder(actual: number[]) {
		const assertionName = "toHaveDescendingOrder";
		let pass: boolean;
		let matcherResult: { actual?: unknown } | undefined;

		const expected: number[] = sortedExpected(actual, "descending");
		try {
			baseExpect(actual).toEqual(expected);
			matcherResult = { actual };
			pass = true;
		} catch (e: unknown) {
			matcherResult = undefined;
			if (
				e != null &&
				typeof e === "object" &&
				"matcherResult" in e &&
				e.matcherResult != null &&
				typeof e.matcherResult === "object" &&
				"actual" in e.matcherResult
			) {
				matcherResult = { actual: e.matcherResult.actual };
			}
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
	toHaveSum(actual: number[], expected: number) {
		const assertionName = "toHaveSum";
		let sum = 0;
		for (let i = 0; i < actual.length; i++) {
			sum += actual[i];
		}
		const pass = Math.abs(sum - expected) < Number.EPSILON;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(expected), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected sum to not equal ${this.utils.printExpected(expected)}\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected sum: ${this.utils.printExpected(expected)}\n` +
					`Received sum: ${this.utils.printReceived(sum)}\n\n` +
					`Array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: sum,
		};
	},
	toHaveAverage(actual: number[], expected: number) {
		const assertionName = "toHaveAverage";
		let sum = 0;
		for (let i = 0; i < actual.length; i++) {
			sum += actual[i];
		}
		const average = actual.length > 0 ? sum / actual.length : 0;
		const pass = Math.abs(average - expected) < Number.EPSILON;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(expected), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected average to not equal ${this.utils.printExpected(expected)}\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected average: ${this.utils.printExpected(expected)}\n` +
					`Received average: ${this.utils.printReceived(average)}\n\n` +
					`Array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: average,
		};
	},
	toHaveMedian(actual: number[], expected: number) {
		const assertionName = "toHaveMedian";
		const sorted = [...actual].sort((a, b) => a - b);
		const median =
			sorted.length === 0
				? 0
				: sorted.length % 2 === 0
					? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
					: sorted[Math.floor(sorted.length / 2)];
		const pass = Math.abs(median - expected) < Number.EPSILON;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(expected), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected median to not equal ${this.utils.printExpected(expected)}\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected median: ${this.utils.printExpected(expected)}\n` +
					`Received median: ${this.utils.printReceived(median)}\n\n` +
					`Array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: median,
		};
	},
	toHaveMin(actual: number[], expected: number) {
		const assertionName = "toHaveMin";
		const { min } = getMinMax(actual);
		const pass = min === expected;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(expected), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected minimum value to not equal ${this.utils.printExpected(expected)}\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected minimum: ${this.utils.printExpected(expected)}\n` +
					`Received minimum: ${this.utils.printReceived(min)}\n\n` +
					`Array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: min,
		};
	},
	toHaveMax(actual: number[], expected: number) {
		const assertionName = "toHaveMax";
		const { max } = getMinMax(actual);
		const pass = max === expected;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(expected), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected maximum value to not equal ${this.utils.printExpected(expected)}\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected maximum: ${this.utils.printExpected(expected)}\n` +
					`Received maximum: ${this.utils.printReceived(max)}\n\n` +
					`Array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: max,
		};
	},
	toHaveRange(actual: number[], expected: number) {
		const assertionName = "toHaveRange";
		const { min, max } = getMinMax(actual);
		const range = max - min;
		const pass = range === expected;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(expected), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected range (max - min) to not equal ${this.utils.printExpected(expected)}\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected range: ${this.utils.printExpected(expected)}\n` +
					`Received range: ${this.utils.printReceived(range)} (min: ${min}, max: ${max})\n\n` +
					`Array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: range,
		};
	},
	toBeAllBetween(actual: number[], min: number, max: number) {
		const assertionName = "toBeAllBetween";
		const outOfRange = findNonMatching(actual, val => val >= min && val <= max);
		const pass = outOfRange.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, `${min}, ${max}`, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected some values to be outside range [${min}, ${max}]\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all values to be between ${min} and ${max}\n\n` +
					`Out of range values (${outOfRange.length}): ${this.utils.printReceived(outOfRange)}\n\n` +
					`Full array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: [min, max],
		};
	},
	toBeAllPositive(actual: number[]) {
		const assertionName = "toBeAllPositive";
		const nonPositive = findNonMatching(actual, val => val > 0);
		const pass = nonPositive.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected some values to not be positive (> 0)\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all values to be positive (> 0)\n\n` +
					`Non-positive values (${nonPositive.length}): ${this.utils.printReceived(nonPositive)}\n\n` +
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
	toBeAllNegative(actual: number[]) {
		const assertionName = "toBeAllNegative";
		const nonNegative = findNonMatching(actual, val => val < 0);
		const pass = nonNegative.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected some values to not be negative (< 0)\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all values to be negative (< 0)\n\n` +
					`Non-negative values (${nonNegative.length}): ${this.utils.printReceived(nonNegative)}\n\n` +
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
	toBeAllIntegers(actual: number[]) {
		const assertionName = "toBeAllIntegers";
		const nonIntegers = findNonMatching(actual, val => Number.isInteger(val));
		const pass = nonIntegers.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected some values to not be integers\n\nArray: ${this.utils.printReceived(actual)}`;
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all values to be integers\n\n` +
					`Non-integer values (${nonIntegers.length}): ${this.utils.printReceived(nonIntegers)}\n\n` +
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
	toBeAllGreaterThan(actual: number[], value: number) {
		const assertionName = "toBeAllGreaterThan";
		const notGreater = findNonMatching(actual, val => val > value);
		const pass = notGreater.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(value), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected some values to not be greater than ${value}\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all values to be greater than ${value}\n\n` +
					`Values not greater than ${value} (${notGreater.length}): ${this.utils.printReceived(notGreater)}\n\n` +
					`Full array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: value,
		};
	},
	toBeAllLessThan(actual: number[], value: number) {
		const assertionName = "toBeAllLessThan";
		const notLess = findNonMatching(actual, val => val < value);
		const pass = notLess.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(value), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected some values to not be less than ${value}\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all values to be less than ${value}\n\n` +
					`Values not less than ${value} (${notLess.length}): ${this.utils.printReceived(notLess)}\n\n` +
					`Full array (${actual.length} elements): ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: value,
		};
	},
	toHaveStrictlyAscendingOrder(actual: number[]) {
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
					`Found violation at index ${firstViolationIndex}: ${actual[firstViolationIndex]} >= ${actual[firstViolationIndex + 1]}\n\n` +
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
	toHaveStrictlyDescendingOrder(actual: number[]) {
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
					`Found violation at index ${firstViolationIndex}: ${actual[firstViolationIndex]} <= ${actual[firstViolationIndex + 1]}\n\n` +
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
	toBeMonotonic(actual: number[]) {
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
	toHaveUniqueValues(actual: number[]) {
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
	toHaveConsecutiveIntegers(actual: number[]) {
		const assertionName = "toHaveConsecutiveIntegers";

		if (actual.length === 0) {
			return {
				message: () =>
					this.utils.matcherHint(assertionName, undefined, undefined, {
						isNot: this.isNot,
					}) +
					"\n\n" +
					"Cannot check consecutive integers on empty array",
				pass: false,
				name: assertionName,
			};
		}

		// Check if all are integers
		const allIntegers = actual.every(val => Number.isInteger(val));
		if (!allIntegers) {
			return {
				message: () =>
					this.utils.matcherHint(assertionName, undefined, undefined, {
						isNot: this.isNot,
					}) +
					"\n\n" +
					`Expected array to contain only integers\n\n` +
					`Array: ${this.utils.printReceived(actual)}`,
				pass: false,
				name: assertionName,
			};
		}

		// Check if consecutive
		const sorted = [...actual].sort((a, b) => a - b);
		let isConsecutive = true;
		let firstGap = -1;

		for (let i = 0; i < sorted.length - 1; i++) {
			if (sorted[i + 1] - sorted[i] !== 1) {
				isConsecutive = false;
				firstGap = i;
				break;
			}
		}

		const pass = isConsecutive;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to not contain consecutive integers\n\n` +
					`Array: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to contain consecutive integers (e.g., [1,2,3,4])\n\n` +
					`Found gap at indices ${firstGap} and ${firstGap + 1}: ${sorted[firstGap]} → ${sorted[firstGap + 1]} (difference: ${sorted[firstGap + 1] - sorted[firstGap]})\n\n` +
					`Sorted array: ${this.utils.printReceived(sorted)}\n` +
					`Original array: ${this.utils.printReceived(actual)}`
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

export const expectlyNumberArray = baseExpect.extend(expectlyNumberArrayMatchers);
