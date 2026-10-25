import { isDeepStrictEqual } from "node:util";

import { withMatcherState } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

/**
 * Expectly Custom matchers for object array validations.
 */
export const expectlyObjectArrayMatchers = withMatcherState({
	toHaveOnlyUniqueObjects(actual: object[]) {
		const assertionName = "toHaveOnlyUniqueObjects";
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

		// Check if property exists on both objects
		if (!Object.prototype.hasOwnProperty.call(currentObj, propertyName)) {
			return {
				isValid: false,
				errorMessage: `Property "${propertyName}" not found on object at index ${i}`,
			};
		}

		if (!Object.prototype.hasOwnProperty.call(nextObj, propertyName)) {
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

		// Perform comparison based on order
		if (order === "ascending") {
			if (currentValue > nextValue) {
				return {
					isValid: false,
					errorMessage: `Found out of order at indices ${i} and ${i + 1}: ${JSON.stringify(currentValue)} > ${JSON.stringify(nextValue)}`,
				};
			}
		} else {
			// descending
			if (currentValue < nextValue) {
				return {
					isValid: false,
					errorMessage: `Found out of order at indices ${i} and ${i + 1}: ${JSON.stringify(currentValue)} < ${JSON.stringify(nextValue)}`,
				};
			}
		}
	}

	return { isValid: true, errorMessage: "" };
}
