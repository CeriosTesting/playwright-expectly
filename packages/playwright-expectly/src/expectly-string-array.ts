import { withMatcherState } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import type { StringOrderOptions } from "./matchers/common-utils";
import {
	assertReceivedType,
	checkMonotonic,
	findDuplicates,
	findStrictAscendingViolation,
	findStrictDescendingViolation,
	sortedExpected,
	stringComparator,
} from "./matchers/common-utils";

/**
 * Expectly Custom matchers for string array validations.
 */
export const expectlyStringArrayMatchers = withMatcherState({
	toHaveAscendingOrder(actual: string[], options?: StringOrderOptions) {
		const assertionName = "toHaveAscendingOrder";
		assertReceivedType(assertionName, actual, "string array");
		let pass: boolean;
		let matcherResult: { actual?: unknown } | undefined;

		const expected: string[] = sortedExpected(actual, "ascending", stringComparator(options));
		try {
			baseExpect(actual).toEqual(expected);
			matcherResult = { actual };
			pass = true;
		} catch (e: unknown) {
			matcherResult = undefined;
			if (
				e !== null &&
				e !== undefined &&
				typeof e === "object" &&
				"matcherResult" in e &&
				e.matcherResult !== null &&
				e.matcherResult !== undefined &&
				typeof e.matcherResult === "object" &&
				"actual" in e.matcherResult
			) {
				matcherResult = { actual: e.matcherResult.actual };
			}
			pass = false;
		}

		const message = (): string =>
			this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			}) +
			"\n\n" +
			`Expected array to ${this.isNot ? "not " : ""}be in ascending order\n\n` +
			`Expected: ${this.utils.printExpected(expected)}\n` +
			`Received: ${this.utils.printReceived(matcherResult?.actual ?? actual)}`;

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: matcherResult?.actual,
		};
	},
	toHaveDescendingOrder(actual: string[], options?: StringOrderOptions) {
		const assertionName = "toHaveDescendingOrder";
		assertReceivedType(assertionName, actual, "string array");
		let pass: boolean;
		let matcherResult: { actual?: unknown } | undefined;

		const expected: string[] = sortedExpected(actual, "descending", stringComparator(options));
		try {
			baseExpect(actual).toEqual(expected);
			matcherResult = { actual };
			pass = true;
		} catch (e: unknown) {
			matcherResult = undefined;
			if (
				e !== null &&
				e !== undefined &&
				typeof e === "object" &&
				"matcherResult" in e &&
				e.matcherResult !== null &&
				e.matcherResult !== undefined &&
				typeof e.matcherResult === "object" &&
				"actual" in e.matcherResult
			) {
				matcherResult = { actual: e.matcherResult.actual };
			}
			pass = false;
		}

		const message = (): string =>
			this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			}) +
			"\n\n" +
			`Expected array to ${this.isNot ? "not " : ""}be in descending order\n\n` +
			`Expected: ${this.utils.printExpected(expected)}\n` +
			`Received: ${this.utils.printReceived(matcherResult?.actual ?? actual)}`;

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: matcherResult?.actual,
		};
	},
	toHaveStrictlyAscendingOrder(actual: string[], options?: StringOrderOptions) {
		const assertionName = "toHaveStrictlyAscendingOrder";
		assertReceivedType(assertionName, actual, "string array");
		const firstViolationIndex = findStrictAscendingViolation(actual, stringComparator(options));
		const pass = firstViolationIndex === -1;

		const message = (): string => {
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
	toHaveStrictlyDescendingOrder(actual: string[], options?: StringOrderOptions) {
		const assertionName = "toHaveStrictlyDescendingOrder";
		assertReceivedType(assertionName, actual, "string array");
		const firstViolationIndex = findStrictDescendingViolation(actual, stringComparator(options));
		const pass = firstViolationIndex === -1;

		const message = (): string => {
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
	toBeMonotonic(actual: string[], options?: StringOrderOptions) {
		const assertionName = "toBeMonotonic";
		assertReceivedType(assertionName, actual, "string array");

		if (actual.length <= 1) {
			return {
				message: (): string =>
					this.utils.matcherHint(assertionName, undefined, undefined, {
						isNot: this.isNot,
					}),
				pass: true,
				name: assertionName,
			};
		}

		const { isAscending, isDescending } = checkMonotonic(actual, stringComparator(options));
		const pass = isAscending || isDescending;

		const message = (): string => {
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
		assertReceivedType(assertionName, actual, "string array");
		const duplicates = findDuplicates(actual);
		const pass = duplicates.size === 0;

		const message = (): string => {
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

export const expectlyStringArray: Expect<typeof expectlyStringArrayMatchers> =
	baseExpect.extend(expectlyStringArrayMatchers);
