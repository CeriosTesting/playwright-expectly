import { isDeepStrictEqual } from "node:util";

import { withMatcherState } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { assertReceivedType } from "./matchers/common-utils";

/**
 * Expectly Custom matchers for object array validations.
 */
export const expectlyObjectArrayMatchers = withMatcherState({
	toHaveOnlyUniqueObjects(actual: object[]) {
		const assertionName = "toHaveOnlyUniqueObjects";
		assertReceivedType(assertionName, actual, "array");
		const duplicateObjects = getDuplicateObjects(actual);
		const pass = duplicateObjects.length === 0;

		const message = pass
			? (): string =>
					this.utils.matcherHint(assertionName, undefined, undefined, {
						isNot: this.isNot,
					}) +
					"\n\n" +
					`Expected array: ${this.utils.printReceived(actual)}\n` +
					`Expected to contain duplicate objects, but all objects were unique.`
			: (): string =>
					this.utils.matcherHint(assertionName, undefined, undefined, {
						isNot: this.isNot,
					}) +
					"\n\n" +
					`Expected array to contain only unique objects, but found ${this.utils.printExpected(duplicateObjects.length)} duplicate(s):\n\n` +
					`Duplicates:\n${this.utils.printReceived(duplicateObjects)}\n\n` +
					`Full array (${actual.length} items):\n${this.utils.printReceived(actual)}`;

		return {
			message,
			pass,
			name: assertionName,
		};
	},
	toHaveObjectsInAscendingOrderBy(actual: object[], propertyName: string) {
		const assertionName = "toHaveObjectsInAscendingOrderBy";
		assertReceivedType(assertionName, actual, "array");
		const validation = validateSortOrder(actual, propertyName, "ascending");
		const pass = validation.isValid;

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(propertyName), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to not be sorted in ascending order by property ${this.utils.printExpected(propertyName)}\n\n` +
					`Received array (${actual.length} items):\n${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to be sorted in ascending order by property ${this.utils.printExpected(propertyName)}\n\n` +
					`${validation.errorMessage}\n\n` +
					`Received array (${actual.length} items):\n${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: propertyName,
		};
	},
	toHaveObjectsInDescendingOrderBy(actual: object[], propertyName: string) {
		const assertionName = "toHaveObjectsInDescendingOrderBy";
		assertReceivedType(assertionName, actual, "array");
		const validation = validateSortOrder(actual, propertyName, "descending");
		const pass = validation.isValid;

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, String(propertyName), {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to not be sorted in descending order by property ${this.utils.printExpected(propertyName)}\n\n` +
					`Received array (${actual.length} items):\n${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected array to be sorted in descending order by property ${this.utils.printExpected(propertyName)}\n\n` +
					`${validation.errorMessage}\n\n` +
					`Received array (${actual.length} items):\n${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: propertyName,
		};
	},
});

export const expectlyObjectArray: Expect<typeof expectlyObjectArrayMatchers> =
	baseExpect.extend(expectlyObjectArrayMatchers);

// Compare live values, including Dates, Maps, Sets, bigint and cycles. No cross-call cache.
function getDuplicateObjects(arr: object[]): object[] {
	const representatives: object[] = [];
	const duplicates = new Set<object>();
	for (const value of arr) {
		const existing = representatives.find((candidate) => isDeepStrictEqual(candidate, value));
		if (existing !== undefined) duplicates.add(existing);
		else representatives.push(value);
	}
	return [...duplicates];
}

interface SortOrderValidation {
	isValid: boolean;
	errorMessage: string;
}

function validateSortOrder(
	arr: object[],
	propertyName: string,
	order: "ascending" | "descending",
): SortOrderValidation {
	// Empty or single element arrays are always sorted
	if (arr.length <= 1) {
		return { isValid: true, errorMessage: "" };
	}

	for (let i = 0; i < arr.length - 1; i++) {
		const currentObj = arr[i];
		const nextObj = arr[i + 1];

		// Check if property exists on both objects (own, inherited or a getter)
		if (!hasProperty(currentObj, propertyName)) {
			return {
				isValid: false,
				errorMessage: `Property "${propertyName}" not found on object at index ${i}`,
			};
		}

		if (!hasProperty(nextObj, propertyName)) {
			return {
				isValid: false,
				errorMessage: `Property "${propertyName}" not found on object at index ${i + 1}`,
			};
		}

		const currentValue: unknown = Reflect.get(currentObj, propertyName);
		const nextValue: unknown = Reflect.get(nextObj, propertyName);

		// Check if values are comparable
		const currentType = typeof currentValue;
		const nextType = typeof nextValue;

		if (currentType !== nextType) {
			return {
				isValid: false,
				errorMessage: `Type mismatch at indices ${i} and ${i + 1}: ${currentType} vs ${nextType}`,
			};
		}

		// Handle null/undefined
		if (currentValue === null || currentValue === undefined) {
			return {
				isValid: false,
				errorMessage: `Property "${propertyName}" is ${currentValue === null ? "null" : "undefined"} at index ${i}`,
			};
		}

		if (nextValue === null || nextValue === undefined) {
			return {
				isValid: false,
				errorMessage: `Property "${propertyName}" is ${nextValue === null ? "null" : "undefined"} at index ${i + 1}`,
			};
		}

		assertOrderable(currentValue, propertyName, i);
		assertOrderable(nextValue, propertyName, i + 1);
		const comparison = compareOrderable(currentValue, nextValue);

		// Perform comparison based on order
		if (order === "ascending") {
			if (comparison > 0) {
				return {
					isValid: false,
					errorMessage: `Found out of order at indices ${i} and ${i + 1}: ${formatValue(currentValue)} > ${formatValue(nextValue)}`,
				};
			}
		} else {
			// descending
			if (comparison < 0) {
				return {
					isValid: false,
					errorMessage: `Found out of order at indices ${i} and ${i + 1}: ${formatValue(currentValue)} < ${formatValue(nextValue)}`,
				};
			}
		}
	}

	return { isValid: true, errorMessage: "" };
}

function hasProperty(value: unknown, propertyName: string): boolean {
	return value !== null && value !== undefined && propertyName in Object(value);
}

/**
 * Only values with a total order can be sorted: `<` and `>` are both false for NaN, Invalid Date and
 * plain objects, which would make any order look valid.
 */
function assertOrderable(value: unknown, propertyName: string, index: number): void {
	let problem: string | undefined;
	if (typeof value === "number" && Number.isNaN(value)) {
		problem = "NaN";
	} else if (value instanceof Date) {
		if (Number.isNaN(value.getTime())) problem = "an Invalid Date";
	} else if (typeof value === "object" && value !== null) {
		problem = `a ${value.constructor?.name ?? "object"}`;
	} else if (typeof value === "function" || typeof value === "symbol") {
		problem = `a ${typeof value}`;
	}
	if (problem) {
		throw new TypeError(
			`Property "${propertyName}" at index ${index} is ${problem}, which cannot be ordered. ` +
				"Sort by numbers, strings, bigints, booleans or valid Dates.",
		);
	}
}

function compareOrderable(left: unknown, right: unknown): number {
	const leftValue = left instanceof Date ? left.getTime() : (left as number | string | bigint | boolean);
	const rightValue = right instanceof Date ? right.getTime() : (right as number | string | bigint | boolean);
	if (leftValue < rightValue) return -1;
	if (leftValue > rightValue) return 1;
	return 0;
}

function formatValue(value: unknown): string {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "bigint") return `${value}n`;
	return JSON.stringify(value);
}
