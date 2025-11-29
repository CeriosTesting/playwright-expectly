import { expect as baseExpect } from "@playwright/test";

export const expectNumber = baseExpect.extend({
	/**
	 * Asserts that an array of numbers is in ascending order (smallest to largest).
	 *
	 * @param actual - Array of numbers or numeric strings
	 *
	 * @example
	 * // Validate sorted prices
	 * const prices = [9.99, 19.99, 29.99, 49.99];
	 * await expectNumber(prices).toHaveAscendingOrder();
	 *
	 * @example
	 * // Check scores from API
	 * const scores = await page.locator('.score').allTextContents();
	 * await expectNumber(scores).toHaveAscendingOrder();
	 */
	async toHaveAscendingOrder(actual: number[] | string[]) {
		const assertionName = "toHaveAscendingOrder";
		let pass: boolean;
		let matcherResult: any;

		const expected: string[] | number[] = sortedExpected(actual, "ascending");
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
	 * Asserts that an array of numbers is in descending order (largest to smallest).
	 *
	 * @param actual - Array of numbers or numeric strings
	 *
	 * @example
	 * // Validate ranked scores
	 * const rankings = [100, 95, 87, 75, 60];
	 * await expectNumber(rankings).toHaveDescendingOrder();
	 *
	 * @example
	 * // Check leaderboard
	 * await expectNumber(leaderboardScores).toHaveDescendingOrder();
	 */
	async toHaveDescendingOrder(actual: number[] | string[]) {
		const assertionName = "toHaveDescendingOrder";
		let pass: boolean;
		let matcherResult: any;

		const expected: string[] | number[] = sortedExpected(actual, "descending");
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
	 * Asserts that an array of numbers sums to the expected value.
	 *
	 * @param actual - Array of numbers
	 * @param expected - The expected sum
	 *
	 * @example
	 * // Validate cart total
	 * const itemPrices = [10.99, 5.50, 15.00];
	 * await expectNumber(itemPrices).toHaveSum(31.49);
	 *
	 * @example
	 * // Check vote count
	 * await expectNumber([45, 32, 23]).toHaveSum(100);
	 */
	async toHaveSum(actual: number[], expected: number) {
		const assertionName = "toHaveSum";
		const sum = actual.reduce((acc, val) => acc + val, 0);
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
	/**
	 * Asserts that an array of numbers has the expected average (mean).
	 *
	 * @param actual - Array of numbers
	 * @param expected - The expected average
	 *
	 * @example
	 * // Validate test scores average
	 * const scores = [85, 90, 95, 80];
	 * await expectNumber(scores).toHaveAverage(87.5);
	 *
	 * @example
	 * // Check rating average
	 * await expectNumber(ratings).toHaveAverage(4.5);
	 */
	async toHaveAverage(actual: number[], expected: number) {
		const assertionName = "toHaveAverage";
		const average = actual.length > 0 ? actual.reduce((acc, val) => acc + val, 0) / actual.length : 0;
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
	/**
	 * Asserts that an array of numbers has the expected median (middle value).
	 *
	 * @param actual - Array of numbers
	 * @param expected - The expected median
	 *
	 * @example
	 * // Validate median salary
	 * const salaries = [50000, 60000, 70000, 80000, 90000];
	 * await expectNumber(salaries).toHaveMedian(70000);
	 *
	 * @example
	 * // Check median response time
	 * await expectNumber(responseTimes).toHaveMedian(250);
	 */
	async toHaveMedian(actual: number[], expected: number) {
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
	/**
	 * Asserts that an array's minimum value equals the expected number.
	 *
	 * @param actual - Array of numbers
	 * @param expected - The expected minimum value
	 *
	 * @example
	 * // Validate lowest price
	 * const prices = [19.99, 9.99, 29.99, 15.00];
	 * await expectNumber(prices).toHaveMin(9.99);
	 *
	 * @example
	 * // Check minimum temperature
	 * await expectNumber(temperatures).toHaveMin(-5);
	 */
	async toHaveMin(actual: number[], expected: number) {
		const assertionName = "toHaveMin";
		const min = actual.length > 0 ? Math.min(...actual) : Number.NaN;
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
	/**
	 * Asserts that an array's maximum value equals the expected number.
	 *
	 * @param actual - Array of numbers
	 * @param expected - The expected maximum value
	 *
	 * @example
	 * // Validate highest score
	 * const scores = [78, 92, 85, 95, 88];
	 * await expectNumber(scores).toHaveMax(95);
	 *
	 * @example
	 * // Check peak value
	 * await expectNumber(metrics).toHaveMax(1000);
	 */
	async toHaveMax(actual: number[], expected: number) {
		const assertionName = "toHaveMax";
		const max = actual.length > 0 ? Math.max(...actual) : Number.NaN;
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
	/**
	 * Asserts that an array's range (max - min) equals the expected number.
	 *
	 * @param actual - Array of numbers
	 * @param expected - The expected range
	 *
	 * @example
	 * // Validate data spread
	 * const values = [10, 15, 20, 25, 30];
	 * await expectNumber(values).toHaveRange(20); // 30 - 10 = 20
	 *
	 * @example
	 * // Check temperature variation
	 * await expectNumber(dailyTemps).toHaveRange(15);
	 */
	async toHaveRange(actual: number[], expected: number) {
		const assertionName = "toHaveRange";
		const min = actual.length > 0 ? Math.min(...actual) : Number.NaN;
		const max = actual.length > 0 ? Math.max(...actual) : Number.NaN;
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
	/**
	 * Asserts that all numbers in an array fall within the specified range (inclusive).
	 *
	 * @param actual - Array of numbers
	 * @param min - The minimum allowed value
	 * @param max - The maximum allowed value
	 *
	 * @example
	 * // Validate percentages
	 * const percentages = [45, 67, 89, 92, 78];
	 * await expectNumber(percentages).toBeAllBetween(0, 100);
	 *
	 * @example
	 * // Check scores within range
	 * await expectNumber(testScores).toBeAllBetween(60, 100);
	 */
	async toBeAllBetween(actual: number[], min: number, max: number) {
		const assertionName = "toBeAllBetween";
		const outOfRange = actual.filter(val => val < min || val > max);
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
	/**
	 * Asserts that all numbers in an array are positive (greater than 0).
	 *
	 * @param actual - Array of numbers
	 *
	 * @example
	 * // Validate positive values
	 * const prices = [10.99, 5.50, 15.00];
	 * await expectNumber(prices).toBeAllPositive();
	 *
	 * @example
	 * // Check counts
	 * await expectNumber(userCounts).toBeAllPositive();
	 */
	async toBeAllPositive(actual: number[]) {
		const assertionName = "toBeAllPositive";
		const nonPositive = actual.filter(val => val <= 0);
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
	/**
	 * Asserts that all numbers in an array are negative (less than 0).
	 *
	 * @param actual - Array of numbers
	 *
	 * @example
	 * // Validate negative adjustments
	 * const adjustments = [-5, -10, -3.50];
	 * await expectNumber(adjustments).toBeAllNegative();
	 *
	 * @example
	 * // Check losses
	 * await expectNumber(lossValues).toBeAllNegative();
	 */
	async toBeAllNegative(actual: number[]) {
		const assertionName = "toBeAllNegative";
		const nonNegative = actual.filter(val => val >= 0);
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
	/**
	 * Asserts that all numbers in an array are integers (whole numbers).
	 *
	 * @param actual - Array of numbers
	 *
	 * @example
	 * // Validate item counts
	 * const quantities = [1, 5, 10, 3];
	 * await expectNumber(quantities).toBeAllIntegers();
	 *
	 * @example
	 * // Check whole numbers
	 * await expectNumber(votes).toBeAllIntegers();
	 */
	async toBeAllIntegers(actual: number[]) {
		const assertionName = "toBeAllIntegers";
		const nonIntegers = actual.filter(val => !Number.isInteger(val));
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
	/**
	 * Asserts that all numbers in an array are greater than a specified value.
	 *
	 * @param actual - Array of numbers
	 * @param value - The threshold value
	 *
	 * @example
	 * // Validate minimum threshold
	 * const scores = [75, 82, 91, 88];
	 * await expectNumber(scores).toBeAllGreaterThan(70);
	 *
	 * @example
	 * // Check above baseline
	 * await expectNumber(measurements).toBeAllGreaterThan(0);
	 */
	async toBeAllGreaterThan(actual: number[], value: number) {
		const assertionName = "toBeAllGreaterThan";
		const notGreater = actual.filter(val => val <= value);
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
	/**
	 * Asserts that all numbers in an array are less than a specified value.
	 *
	 * @param actual - Array of numbers
	 * @param value - The threshold value
	 *
	 * @example
	 * // Validate maximum limit
	 * const responseTimes = [150, 200, 180, 220];
	 * await expectNumber(responseTimes).toBeAllLessThan(250);
	 *
	 * @example
	 * // Check under cap
	 * await expectNumber(costs).toBeAllLessThan(1000);
	 */
	async toBeAllLessThan(actual: number[], value: number) {
		const assertionName = "toBeAllLessThan";
		const notLess = actual.filter(val => val >= value);
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
	/**
	 * Asserts that numbers are in strictly ascending order (each element > previous).
	 *
	 * Unlike toHaveAscendingOrder, this rejects equal consecutive values.
	 *
	 * @param actual - Array of numbers
	 *
	 * @example
	 * // Validate increasing values
	 * const growth = [10, 20, 35, 50];
	 * await expectNumber(growth).toHaveStrictlyAscendingOrder();
	 *
	 * @example
	 * // This would fail (has equal consecutive values)
	 * await expectNumber([1, 2, 2, 3]).not.toHaveStrictlyAscendingOrder();
	 */
	async toHaveStrictlyAscendingOrder(actual: number[]) {
		const assertionName = "toHaveStrictlyAscendingOrder";
		let firstViolationIndex = -1;

		for (let i = 0; i < actual.length - 1; i++) {
			if (actual[i] >= actual[i + 1]) {
				firstViolationIndex = i;
				break;
			}
		}

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
	/**
	 * Asserts that numbers are in strictly descending order (each element < previous).
	 *
	 * Unlike toHaveDescendingOrder, this rejects equal consecutive values.
	 *
	 * @param actual - Array of numbers
	 *
	 * @example
	 * // Validate decreasing values
	 * const decline = [100, 75, 50, 25];
	 * await expectNumber(decline).toHaveStrictlyDescendingOrder();
	 *
	 * @example
	 * // This would fail (has equal consecutive values)
	 * await expectNumber([5, 4, 4, 3]).not.toHaveStrictlyDescendingOrder();
	 */
	async toHaveStrictlyDescendingOrder(actual: number[]) {
		const assertionName = "toHaveStrictlyDescendingOrder";
		let firstViolationIndex = -1;

		for (let i = 0; i < actual.length - 1; i++) {
			if (actual[i] <= actual[i + 1]) {
				firstViolationIndex = i;
				break;
			}
		}

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
	/**
	 * Asserts that an array is monotonic (consistently ascending or descending).
	 *
	 * A monotonic array never changes direction - it only goes up, only goes down,
	 * or stays flat (equal consecutive values allowed).
	 *
	 * @param actual - Array of numbers
	 *
	 * @example
	 * // Valid monotonic arrays
	 * await expectNumber([1, 2, 2, 3, 4]).toBeMonotonic(); // Ascending
	 * await expectNumber([5, 4, 3, 3, 1]).toBeMonotonic(); // Descending
	 * await expectNumber([2, 2, 2, 2]).toBeMonotonic(); // Flat
	 *
	 * @example
	 * // Not monotonic (changes direction)
	 * await expectNumber([1, 3, 2, 4]).not.toBeMonotonic();
	 */
	async toBeMonotonic(actual: number[]) {
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

		// Check if ascending (or equal)
		const isAscending = actual.every((val, i) => i === 0 || actual[i - 1] <= val);
		// Check if descending (or equal)
		const isDescending = actual.every((val, i) => i === 0 || actual[i - 1] >= val);

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
	 * Asserts that all numbers in an array are unique (no duplicates).
	 *
	 * @param actual - Array of numbers
	 *
	 * @example
	 * // Validate unique IDs
	 * const userIds = [101, 202, 303, 404];
	 * await expectNumber(userIds).toHaveUniqueValues();
	 *
	 * @example
	 * // Check for duplicates
	 * await expectNumber([1, 2, 2, 3]).not.toHaveUniqueValues();
	 */
	async toHaveUniqueValues(actual: number[]) {
		const assertionName = "toHaveUniqueValues";
		const seen = new Set<number>();
		const duplicates = new Set<number>();

		for (const val of actual) {
			if (seen.has(val)) {
				duplicates.add(val);
			}
			seen.add(val);
		}

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
	/**
	 * Asserts that an array contains consecutive integers (e.g., 1, 2, 3, 4).
	 *
	 * The array will be sorted before checking, so [3, 1, 2] would pass.
	 * All values must be integers.
	 *
	 * @param actual - Array of numbers
	 *
	 * @example
	 * // Validate sequential IDs
	 * const pageNumbers = [1, 2, 3, 4, 5];
	 * await expectNumber(pageNumbers).toHaveConsecutiveIntegers();
	 *
	 * @example
	 * // Order doesn't matter
	 * await expectNumber([5, 3, 4, 2, 1]).toHaveConsecutiveIntegers();
	 *
	 * @example
	 * // This would fail (missing 3)
	 * await expectNumber([1, 2, 4, 5]).not.toHaveConsecutiveIntegers();
	 */
	async toHaveConsecutiveIntegers(actual: number[]) {
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

function sortedExpected(actual: number[] | string[], order: "ascending" | "descending"): number[] | string[] {
	if (actual.every(item => typeof item === "number")) {
		const copy = [...actual] as number[];
		return order === "ascending" ? copy.sort((n1, n2) => n1 - n2) : copy.sort((n1, n2) => n2 - n1);
	} else {
		const copy = [...actual] as string[];
		return order === "ascending" ? copy.sort() : copy.sort().reverse();
	}
}
