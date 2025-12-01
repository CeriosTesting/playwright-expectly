import { expect as baseExpect } from "@playwright/test";

/**
 * Expextly Custom matchers for object array validations.
 */
export const expectlyObjectArray = baseExpect.extend({
	/**
	 * Asserts that an array contains only unique objects (no duplicates).
	 *
	 * Uses deep equality comparison via JSON serialization to detect duplicates.
	 * Handles circular references gracefully.
	 *
	 * @param actual - Array of objects to check
	 *
	 * @example
	 * // Validate unique records
	 * const users = [
	 *   { id: 1, name: 'Alice' },
	 *   { id: 2, name: 'Bob' },
	 *   { id: 3, name: 'Charlie' }
	 * ];
	 * await expectObjectArray(users).toHaveOnlyUniqueObjects();
	 *
	 * @example
	 * // This would fail (duplicate objects)
	 * const items = [{ id: 1 }, { id: 1 }];
	 * await expectObjectArray(items).not.toHaveOnlyUniqueObjects();
	 */
	toHaveOnlyUniqueObjects(actual: object[]) {
		const assertionName = "toHaveOnlyUniqueObjects";
		const duplicateObjects = getDuplicateObjects(actual);
		const pass = duplicateObjects.length === 0;

		const message = pass
			? () =>
					this.utils.matcherHint(assertionName, undefined, undefined, {
						isNot: this.isNot,
					}) +
					"\n\n" +
					`Expected array: ${this.utils.printReceived(actual)}\n` +
					`Expected to contain duplicate objects, but all objects were unique.`
			: () =>
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
	/**
	 * Asserts that an array of objects is sorted in ascending order by a specific property.
	 *
	 * @param actual - Array of objects to check
	 * @param propertyName - The property name to sort by
	 *
	 * @example
	 * // Validate sorted by age
	 * const users = [
	 *   { name: 'Alice', age: 25 },
	 *   { name: 'Bob', age: 30 },
	 *   { name: 'Charlie', age: 35 }
	 * ];
	 * await expectObjectArray(users).toHaveObjectsInAscendingOrderBy('age');
	 *
	 * @example
	 * // Check alphabetical sorting
	 * const products = [
	 *   { id: 1, name: 'Apple' },
	 *   { id: 2, name: 'Banana' },
	 *   { id: 3, name: 'Cherry' }
	 * ];
	 * await expectObjectArray(products).toHaveObjectsInAscendingOrderBy('name');
	 */
	toHaveObjectsInAscendingOrderBy(actual: object[], propertyName: string) {
		const assertionName = "toHaveObjectsInAscendingOrderBy";
		const validation = validateSortOrder(actual, propertyName, "ascending");
		const pass = validation.isValid;

		const message = () => {
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
	/**
	 * Asserts that an array of objects is sorted in descending order by a specific property.
	 *
	 * @param actual - Array of objects to check
	 * @param propertyName - The property name to sort by
	 *
	 * @example
	 * // Validate sorted by score (high to low)
	 * const players = [
	 *   { name: 'Alice', score: 950 },
	 *   { name: 'Bob', score: 850 },
	 *   { name: 'Charlie', score: 750 }
	 * ];
	 * await expectObjectArray(players).toHaveObjectsInDescendingOrderBy('score');
	 *
	 * @example
	 * // Check reverse chronological order
	 * const posts = [
	 *   { title: 'Latest', date: '2024-12-31' },
	 *   { title: 'Earlier', date: '2024-11-15' },
	 *   { title: 'Oldest', date: '2024-01-01' }
	 * ];
	 * await expectObjectArray(posts).toHaveObjectsInDescendingOrderBy('date');
	 */
	toHaveObjectsInDescendingOrderBy(actual: object[], propertyName: string) {
		const assertionName = "toHaveObjectsInDescendingOrderBy";
		const validation = validateSortOrder(actual, propertyName, "descending");
		const pass = validation.isValid;

		const message = () => {
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

// Cache for memoizing safeStringify results
const stringifyCache = new WeakMap<object, string>();

/**
 * Safely serializes an object to a string for comparison.
 * Handles circular references by tracking them during traversal.
 * Uses memoization to cache results for better performance.
 */
function safeStringify(obj: any): string {
	// Check cache first for non-primitive values
	if (obj !== null && typeof obj === "object") {
		const cached = stringifyCache.get(obj);
		if (cached !== undefined) {
			return cached;
		}
	}

	try {
		const seen = new WeakMap<object, number>();
		let counter = 0;

		const normalize = (value: any): any => {
			if (value === null || value === undefined) {
				return value;
			}

			if (typeof value !== "object") {
				return value;
			}

			// Check for circular reference
			if (seen.has(value)) {
				return `[Circular:${seen.get(value)}]`;
			}

			// Track this object
			const id = counter++;
			seen.set(value, id);

			if (Array.isArray(value)) {
				return value.map(item => normalize(item));
			}

			// Handle regular objects
			const sortedKeys = Object.keys(value).sort();
			const normalized: any = {};
			for (const key of sortedKeys) {
				normalized[key] = normalize(value[key]);
			}
			return normalized;
		};

		const result = JSON.stringify(normalize(obj));

		// Cache the result for objects
		if (obj !== null && typeof obj === "object") {
			stringifyCache.set(obj, result);
		}

		return result;
	} catch (error) {
		// Fallback for any other serialization errors
		const result = `[Unserializable: ${error instanceof Error ? error.message : String(error)}]`;
		if (obj !== null && typeof obj === "object") {
			stringifyCache.set(obj, result);
		}
		return result;
	}
}

function getDuplicateObjects(arr: object[]): object[] {
	const seen = new Map<string, boolean>();
	const duplicateSet = new Set<string>();

	// First pass: identify all duplicate serialized values
	for (let i = 0; i < arr.length; i++) {
		const serialized = safeStringify(arr[i]);
		if (seen.has(serialized)) {
			duplicateSet.add(serialized);
		} else {
			seen.set(serialized, true);
		}
	}

	// Second pass: collect unique duplicate objects
	const duplicateObjects: object[] = [];
	const addedDuplicates = new Set<string>();
	for (let i = 0; i < arr.length; i++) {
		const serialized = safeStringify(arr[i]);
		if (duplicateSet.has(serialized) && !addedDuplicates.has(serialized)) {
			duplicateObjects.push(arr[i]);
			addedDuplicates.add(serialized);
		}
	}

	return duplicateObjects;
}

interface SortOrderValidation {
	isValid: boolean;
	errorMessage: string;
}

function validateSortOrder(
	arr: object[],
	propertyName: string,
	order: "ascending" | "descending"
): SortOrderValidation {
	// Empty or single element arrays are always sorted
	if (arr.length <= 1) {
		return { isValid: true, errorMessage: "" };
	}

	for (let i = 0; i < arr.length - 1; i++) {
		const currentObj = arr[i] as any;
		const nextObj = arr[i + 1] as any;

		// Check if property exists on both objects
		if (!(propertyName in currentObj)) {
			return {
				isValid: false,
				errorMessage: `Property "${propertyName}" not found on object at index ${i}`,
			};
		}

		if (!(propertyName in nextObj)) {
			return {
				isValid: false,
				errorMessage: `Property "${propertyName}" not found on object at index ${i + 1}`,
			};
		}

		const currentValue = currentObj[propertyName];
		const nextValue = nextObj[propertyName];

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
