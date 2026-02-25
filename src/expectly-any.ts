import type { ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

/**
 * Expextly Custom matchers for any type validations.
 */
export const expectlyAnyMatchers = {
	toBeAnyOf(this: ExpectMatcherState, received: any, ...possibilities: any[]) {
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
	toBeNullish(this: ExpectMatcherState, received: any) {
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
	toBeInteger(this: ExpectMatcherState, received: any) {
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
	toBeFloat(this: ExpectMatcherState, received: any) {
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
	toBePrimitive(this: ExpectMatcherState, received: any) {
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
	toBeArray(this: ExpectMatcherState, received: any) {
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
	toBeObject(this: ExpectMatcherState, received: any) {
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
	toEqualPartially(this: ExpectMatcherState, actual: any, expected: any) {
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
					this.utils.printExpected(expected) +
					"\n\n" +
					"Received:\n" +
					this.utils.printReceived(actual)
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
};

export const expectlyAny = baseExpect.extend(expectlyAnyMatchers);

/**
 * Extracts a subset of the actual value that matches the structure of expected.
 * This allows us to compare only the relevant fields and get a clean diff.
 *
 * For objects: extracts only the properties present in expected
 * For arrays: returns the full array (partial matching is value-based, not index-based)
 * For primitives: returns as-is
 * For asymmetric matchers: returns actual as-is (let Playwright's toEqual handle the matching)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value) && value.constructor === Object;
}

function extractMatchingStructure(actual: unknown, expected: unknown): unknown {
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
			if (matchingItem !== undefined) {
				result.push(extractMatchingStructure(matchingItem, expectedItem));
			} else {
				const fallbackItem = actual[0];
				result.push(fallbackItem !== undefined ? extractMatchingStructure(fallbackItem, expectedItem) : undefined);
			}
		}
		return result;
	}

	// For expected object, extract only matching properties
	if (isPlainObject(expected)) {
		if (!isPlainObject(actual)) {
			return actual; // Type mismatch will be caught by comparison
		}

		const result: Record<string, unknown> = {};
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
