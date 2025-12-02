import { expect as baseExpect } from "@playwright/test";

/**
 * Expextly Custom matchers for any type validations.
 */
export const expectlyAny = baseExpect.extend({
	/**
	 * Asserts that the received value matches at least one of the provided possibilities.
	 *
	 * Supports comparison of:
	 * - Primitive values (strings, numbers, booleans)
	 * - Objects (using deep equality via JSON comparison)
	 * - Special values like NaN
	 *
	 * @param received - The value to check
	 * @param possibilities - One or more values to compare against
	 *
	 * @example
	 * // Primitive values
	 * expectAny(status).toBeAnyOf(200, 201, 204);
	 * expectAny(color).toBeAnyOf('red', 'green', 'blue');
	 *
	 * @example
	 * // Objects
	 * expectAny(response).toBeAnyOf(
	 *   { status: 'success', code: 200 },
	 *   { status: 'created', code: 201 }
	 * );
	 *
	 * @example
	 * // Mixed types
	 * expectAny(value).toBeAnyOf(null, undefined, 0, '');
	 */
	toBeAnyOf(received: any, ...possibilities: any[]) {
		const assertionName = "toBeAnyOf";
		const pass = possibilities.some(possibility => {
			try {
				// Handle object comparison
				if (
					typeof possibility === "object" &&
					possibility !== null &&
					typeof received === "object" &&
					received !== null
				) {
					return JSON.stringify(possibility) === JSON.stringify(received);
				}
				// Handle primitive comparison including NaN
				if (Number.isNaN(possibility) && Number.isNaN(received)) {
					return true;
				}
				return possibility === received;
			} catch {
				return possibility === received;
			}
		});

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to not be any of the provided possibilities\n\n` +
					`Received: ${this.utils.printReceived(received)}\n` +
					`Possibilities: ${this.utils.printExpected(possibilities)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to be one of the provided possibilities\n\n` +
					`Received: ${this.utils.printReceived(received)}\n` +
					`Possibilities: ${this.utils.printExpected(possibilities)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: possibilities,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is either null or undefined.
	 *
	 * This is a convenient matcher for checking nullish values,
	 * which is common when dealing with optional properties or API responses.
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Testing optional values
	 * expectAny(user.middleName).toBeNullish();
	 * expectAny(response.data).not.toBeNullish();
	 *
	 * @example
	 * // API response validation
	 * const config = await api.getConfig();
	 * expectAny(config.optionalField).toBeNullish();
	 */
	toBeNullish(received: any) {
		const assertionName = "toBeNullish";
		const pass = received === null || received === undefined;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to not be nullish (null or undefined)\n\n` +
					`Received: ${this.utils.printReceived(received)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to be nullish (null or undefined)\n\n` +
					`Received: ${this.utils.printReceived(received)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is an integer number.
	 *
	 * An integer is a whole number without decimal places.
	 * This uses Number.isInteger() internally, which returns false for
	 * NaN, Infinity, and non-number types.
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid integers
	 * expectAny(42).toBeInteger();
	 * expectAny(0).toBeInteger();
	 * expectAny(-100).toBeInteger();
	 *
	 * @example
	 * // Testing API responses
	 * const userCount = await page.locator('.user-count').textContent();
	 * expectAny(Number(userCount)).toBeInteger();
	 *
	 * @example
	 * // Negative assertions
	 * expectAny(3.14).not.toBeInteger();
	 * expectAny('42').not.toBeInteger();
	 */
	toBeInteger(received: any) {
		const assertionName = "toBeInteger";
		const pass = Number.isInteger(received);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected value to not be an integer\n\nReceived: ${this.utils.printReceived(received)}`;
			}

			if (!pass && !this.isNot) {
				const receivedType = typeof received;
				return (
					hint +
					"\n\n" +
					`Expected value to be an integer\n\n` +
					`Received: ${this.utils.printReceived(received)} (${receivedType})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is a floating-point number (has decimal places).
	 *
	 * A float must be:
	 * - A number type
	 * - Not NaN
	 * - Not an integer
	 * - A finite value (not Infinity or -Infinity)
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid floats
	 * expectAny(3.14).toBeFloat();
	 * expectAny(0.5).toBeFloat();
	 * expectAny(-2.718).toBeFloat();
	 *
	 * @example
	 * // Testing calculations
	 * const price = 19.99;
	 * const tax = price * 0.08;
	 * expectAny(tax).toBeFloat();
	 *
	 * @example
	 * // Not floats
	 * expectAny(42).not.toBeFloat(); // Integer
	 * expectAny(NaN).not.toBeFloat(); // NaN
	 * expectAny(Infinity).not.toBeFloat(); // Infinity
	 */
	toBeFloat(received: any) {
		const assertionName = "toBeFloat";
		const pass =
			typeof received === "number" &&
			!Number.isNaN(received) &&
			!Number.isInteger(received) &&
			Number.isFinite(received);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to not be a float (number with decimal places)\n\n` +
					`Received: ${this.utils.printReceived(received)}`
				);
			}

			if (!pass && !this.isNot) {
				const receivedType = typeof received;
				let reason = "";
				if (receivedType !== "number") {
					reason = ` (type is ${receivedType})`;
				} else if (Number.isNaN(received)) {
					reason = " (value is NaN)";
				} else if (!Number.isFinite(received)) {
					reason = " (value is Infinity)";
				} else if (Number.isInteger(received)) {
					reason = " (value is an integer)";
				}
				return (
					hint +
					"\n\n" +
					`Expected value to be a float (number with decimal places)\n\n` +
					`Received: ${this.utils.printReceived(received)}${reason}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is a primitive type.
	 *
	 * Primitive types in JavaScript are:
	 * - string
	 * - number
	 * - boolean
	 * - null
	 * - undefined
	 * - bigint
	 * - symbol
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid primitives
	 * expectAny('hello').toBePrimitive();
	 * expectAny(123).toBePrimitive();
	 * expectAny(true).toBePrimitive();
	 * expectAny(null).toBePrimitive();
	 * expectAny(undefined).toBePrimitive();
	 * expectAny(BigInt(9007199254740991)).toBePrimitive();
	 * expectAny(Symbol('key')).toBePrimitive();
	 *
	 * @example
	 * // Not primitives
	 * expectAny({}).not.toBePrimitive();
	 * expectAny([]).not.toBePrimitive();
	 * expectAny(new Date()).not.toBePrimitive();
	 *
	 * @example
	 * // Testing API responses
	 * const apiValue = response.data.value;
	 * expectAny(apiValue).toBePrimitive();
	 */
	toBePrimitive(received: any) {
		const assertionName = "toBePrimitive";
		const receivedType = typeof received;
		const pass =
			received === null ||
			receivedType === "undefined" ||
			receivedType === "boolean" ||
			receivedType === "number" ||
			receivedType === "string" ||
			receivedType === "bigint" ||
			receivedType === "symbol";

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to not be a primitive type\n\n` +
					`Received: ${this.utils.printReceived(received)} (${receivedType})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to be a primitive type (string, number, boolean, null, undefined, bigint, or symbol)\n\n` +
					`Received: ${this.utils.printReceived(received)} (${receivedType})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is an array.
	 *
	 * This uses Array.isArray() internally for accurate array detection,
	 * including arrays from different JavaScript contexts (e.g., iframes).
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid arrays
	 * expectAny([]).toBeArray();
	 * expectAny([1, 2, 3]).toBeArray();
	 * expectAny(['a', 'b', 'c']).toBeArray();
	 *
	 * @example
	 * // Testing API responses
	 * const users = await api.getUsers();
	 * expectAny(users).toBeArray();
	 *
	 * @example
	 * // Testing page data
	 * const items = await page.locator('.item').allTextContents();
	 * expectAny(items).toBeArray();
	 *
	 * @example
	 * // Not arrays
	 * expectAny('not array').not.toBeArray();
	 * expectAny({ length: 3 }).not.toBeArray();
	 */
	toBeArray(received: any) {
		const assertionName = "toBeArray";
		const pass = Array.isArray(received);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected value to not be an array\n\nReceived: ${this.utils.printReceived(received)}`;
			}

			if (!pass && !this.isNot) {
				const receivedType = typeof received;
				return (
					hint +
					"\n\n" +
					`Expected value to be an array\n\n` +
					`Received: ${this.utils.printReceived(received)} (${receivedType})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is a plain object.
	 *
	 * A plain object must be:
	 * - Of type 'object'
	 * - Not null
	 * - Not an array
	 *
	 * Note: This will match any object including instances of classes,
	 * Date objects, RegExp objects, etc.
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid objects
	 * expectAny({}).toBeObject();
	 * expectAny({ name: 'John', age: 30 }).toBeObject();
	 * expectAny(new Date()).toBeObject();
	 *
	 * @example
	 * // Testing API responses
	 * const user = await api.getUser(123);
	 * expectAny(user).toBeObject();
	 * expectAny(user.profile).toBeObject();
	 *
	 * @example
	 * // Testing configuration
	 * const config = JSON.parse(await fs.readFile('config.json'));
	 * expectAny(config).toBeObject();
	 *
	 * @example
	 * // Not objects
	 * expectAny([]).not.toBeObject(); // Arrays are excluded
	 * expectAny(null).not.toBeObject(); // Null is excluded
	 * expectAny('string').not.toBeObject();
	 */
	toBeObject(received: any) {
		const assertionName = "toBeObject";
		const pass = typeof received === "object" && received !== null && !Array.isArray(received);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected value to not be an object\n\nReceived: ${this.utils.printReceived(received)}`;
			}

			if (!pass && !this.isNot) {
				const receivedType = typeof received;
				let actualType: string = receivedType;
				if (received === null) {
					actualType = "null";
				} else if (Array.isArray(received)) {
					actualType = "array";
				}
				return (
					hint +
					"\n\n" +
					`Expected value to be an object (plain object, not array or null)\n\n` +
					`Received: ${this.utils.printReceived(received)} (${actualType})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that an object partially matches the expected structure.
	 *
	 * This matcher extracts only the fields specified in the expected structure
	 * from the actual value and compares them using toEqual:
	 * - Objects: only checks properties present in expected (extra properties ignored)
	 * - Arrays: finds matching items regardless of position or extra items
	 * - Nested structures: applies partial matching recursively
	 *
	 * @param actual - The object to check
	 * @param expected - The partial structure to match
	 *
	 * @example
	 * // Match object with extra properties
	 * const user = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' };
	 * expectAny(user).toEqualPartially({ name: 'Alice', role: 'admin' });
	 *
	 * @example
	 * // Match array with extra items and any order
	 * const items = [
	 *   { id: 1, name: 'Item 1' },
	 *   { id: 2, name: 'Item 2' },
	 *   { id: 3, name: 'Item 3' }
	 * ];
	 * expectAny(items).toEqualPartially([
	 *   { id: 2, name: 'Item 2' }
	 * ]); // Passes even though array has more items
	 *
	 * @example
	 * // Nested partial matching
	 * const data = {
	 *   user: { id: 1, name: 'Test', email: 'test@example.com' },
	 *   items: [{ id: 1 }, { id: 2 }, { id: 3 }],
	 *   metadata: { count: 10, page: 1 }
	 * };
	 * expectAny(data).toEqualPartially({
	 *   user: { name: 'Test' },
	 *   items: [{ id: 2 }]
	 * });
	 */
	toEqualPartially(actual: any, expected: any) {
		const assertionName = "toEqualPartially";
		let pass = false;
		let comparisonError = "";

		// Extract only the expected fields from actual for comparison
		const actualSubset = extractMatchingStructure(actual, expected);

		try {
			// Compare the subset directly - this gives us a clean diff
			baseExpect(actualSubset).toEqual(expected);
			pass = true;
		} catch (e: any) {
			pass = false;
			// Extract just the diff part from Playwright's error message
			comparisonError = e.message;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					"Expected value to not partially match:\n" +
					`${this.utils.printExpected(expected)}\n\n` +
					"Received:\n" +
					`${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				// Parse the error to extract just the diff portion
				const diffMatch = comparisonError.match(/(?:- Expected.*\n[\s\S]*)/);
				const diffOnly = diffMatch ? diffMatch[0] : comparisonError;

				return `${hint} // partial match\n\n${diffOnly}`;
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: actualSubset,
		};
	},
});

/**
 * Extracts a subset of the actual value that matches the structure of expected.
 * This allows us to compare only the relevant fields and get a clean diff.
 *
 * For objects: extracts only the properties present in expected
 * For arrays: returns the full array (partial matching is value-based, not index-based)
 * For primitives: returns as-is
 * For asymmetric matchers: returns actual as-is (let Playwright's toEqual handle the matching)
 */
function extractMatchingStructure(actual: any, expected: any): any {
	// Handle null/undefined
	if (actual === null || actual === undefined) {
		return actual;
	}

	// Handle Playwright's asymmetric matchers (expect.any, expect.objectContaining, etc.)
	// These have an $$typeof property that identifies them as asymmetric matchers
	if (expected && typeof expected === "object" && "$$typeof" in expected) {
		// Return actual as-is; let Playwright's toEqual handle the asymmetric matcher comparison
		return actual;
	}

	// For expected array, we need to check if actual array contains matching items
	if (Array.isArray(expected)) {
		if (!Array.isArray(actual)) {
			return actual; // Type mismatch will be caught by comparison
		}

		// For array partial matching, we find matching items
		const result: any[] = [];
		for (const expectedItem of expected) {
			// Find a matching item in actual
			const matchingItem = actual.find(actualItem => {
				try {
					const extractedItem = extractMatchingStructure(actualItem, expectedItem);
					baseExpect(extractedItem).toEqual(expectedItem);
					return true;
				} catch {
					return false;
				}
			});
			result.push(matchingItem !== undefined ? extractMatchingStructure(matchingItem, expectedItem) : undefined);
		}
		return result;
	}

	// For expected object, extract only matching properties
	if (typeof expected === "object" && expected !== null && expected.constructor === Object) {
		if (typeof actual !== "object" || actual === null || Array.isArray(actual)) {
			return actual; // Type mismatch will be caught by comparison
		}

		const result: any = {};
		for (const key of Object.keys(expected)) {
			if (key in actual) {
				result[key] = extractMatchingStructure(actual[key], expected[key]);
			} else {
				result[key] = undefined;
			}
		}
		return result;
	}

	// For primitives and special objects, return as-is
	return actual;
}
