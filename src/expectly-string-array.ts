import { expect as baseExpect } from "@playwright/test";

import {
	checkMonotonic,
	findDuplicates,
	findStrictAscendingViolation,
	findStrictDescendingViolation,
	sortedExpected,
} from "./matchers/common-utils";
import { withMatcherState } from "./matchers/matcher-state-utils";

/**
 * Expextly Custom matchers for string array validations.
 */
export const expectlyStringArrayMatchers = withMatcherState({
	toHaveAscendingOrder(actual: string[]) {
		const assertionName = "toHaveAscendingOrder";
		let pass: boolean;
		let matcherResult: { actual?: unknown } | undefined;

		const expected: string[] = sortedExpected(actual, "ascending");
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
	toHaveDescendingOrder(actual: string[]) {
		const assertionName = "toHaveDescendingOrder";
		let pass: boolean;
		let matcherResult: { actual?: unknown } | undefined;

		const expected: string[] = sortedExpected(actual, "descending");
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

export const expectlyStringArray = baseExpect.extend(expectlyStringArrayMatchers);
