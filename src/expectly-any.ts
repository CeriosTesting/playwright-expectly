import type { ExpectMatcherState, MatcherReturnType } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import type { PartialMatchOptions } from "./types/matcher-types";

/**
 * Expectly Custom matchers for any type validations.
 */
export const expectlyAnyMatchers = {
	toBeAnyOf(this: ExpectMatcherState, received: unknown, ...possibilities: unknown[]): MatcherReturnType {
		const assertionName = "toBeAnyOf";
		const pass = possibilities.some((possibility) => {
			const possibilityIsStructured = isStructuredValue(possibility);
			const receivedIsStructured = isStructuredValue(received);

			if (possibilityIsStructured || receivedIsStructured) {
				try {
					baseExpect(received).toStrictEqual(possibility);
					return true;
				} catch {
					return false;
				}
			}

			return Object.is(received, possibility);
		});

		const message = (): string => {
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
	toBeNullish(this: ExpectMatcherState, received: unknown): MatcherReturnType {
		const assertionName = "toBeNullish";
		const pass = received === null || received === undefined;

		const message = (): string => {
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
	toBeInteger(this: ExpectMatcherState, received: unknown): MatcherReturnType {
		const assertionName = "toBeInteger";
		const pass = Number.isInteger(received);

		const message = (): string => {
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
	toBeFloat(this: ExpectMatcherState, received: unknown): MatcherReturnType {
		const assertionName = "toBeFloat";
		const pass =
			typeof received === "number" &&
			!Number.isNaN(received) &&
			!Number.isInteger(received) &&
			Number.isFinite(received);

		const message = (): string => {
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
	toBePrimitive(this: ExpectMatcherState, received: unknown): MatcherReturnType {
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

		const message = (): string => {
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
	toBeArray(this: ExpectMatcherState, received: unknown): MatcherReturnType {
		const assertionName = "toBeArray";
		const pass = Array.isArray(received);

		const message = (): string => {
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
	toBeObject(this: ExpectMatcherState, received: unknown): MatcherReturnType {
		const assertionName = "toBeObject";
		const pass = typeof received === "object" && received !== null && !Array.isArray(received);

		const message = (): string => {
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
	toEqualPartially(
		this: ExpectMatcherState,
		actual: unknown,
		expected: unknown,
		options?: PartialMatchOptions,
	): MatcherReturnType {
		const assertionName = "toEqualPartially";
		const { validatedOptions, optionsValidationError } = getValidatedPartialMatchOptions(options);
		const extractionState: ExtractionState = {
			allArrayItemsMatchedOneToOne: true,
			allExplicitUndefinedKeysExist: true,
			requireExplicitUndefinedKeyPresence: validatedOptions.requireExplicitUndefinedKeyPresence ?? false,
			arrayMode: validatedOptions.arrayMode ?? "subset",
			arrayMismatchDetails: [],
		};

		if (optionsValidationError) {
			return {
				message: () => {
					const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
						isNot: this.isNot,
					});
					return `${hint}\n\n${optionsValidationError}`;
				},
				pass: this.isNot,
				name: assertionName,
				expected,
				actual,
			};
		}

		// Extract only the expected fields from actual for comparison
		const actualSubset = extractMatchingStructure(actual, expected, extractionState, "$");
		const comparison = compareExtractedSubset(actualSubset, expected);
		const finalComparison = applyExtractionStateConstraints(comparison, extractionState);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (finalComparison.pass && this.isNot) {
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

			if (!finalComparison.pass && !this.isNot) {
				// Parse the error to extract just the diff portion
				const diffMatch = finalComparison.comparisonError.match(/(?:- Expected.*\n[\s\S]*)/);
				const diffOnly = diffMatch ? diffMatch[0] : finalComparison.comparisonError;

				return `${hint} // partial match (${extractionState.arrayMode})\n\n${diffOnly}`;
			}

			return hint;
		};

		return {
			message,
			pass: finalComparison.pass,
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

function isStructuredValue(value: unknown): boolean {
	return (typeof value === "object" && value !== null) || typeof value === "function";
}

type ExtractionState = {
	allArrayItemsMatchedOneToOne: boolean;
	allExplicitUndefinedKeysExist: boolean;
	requireExplicitUndefinedKeyPresence: boolean;
	arrayMode: ArrayMatchMode;
	arrayMismatchDetails: string[];
};

type ArrayMatchMode = "subset" | "exactLength" | "exactOrder";

function validatePartialMatchOptions(options: PartialMatchOptions | undefined): PartialMatchOptions {
	if (options === undefined) {
		return {};
	}

	if (typeof options !== "object" || options === null || Array.isArray(options)) {
		throw new Error("toEqualPartially: options must be an object.");
	}

	const candidate = options as Record<string, unknown>;
	const allowedKeys = new Set(["requireExplicitUndefinedKeyPresence", "arrayMode"]);

	for (const key of Object.keys(candidate)) {
		if (!allowedKeys.has(key)) {
			throw new Error(
				`toEqualPartially: unknown option "${key}". Allowed options: requireExplicitUndefinedKeyPresence, arrayMode.`,
			);
		}
	}

	if (
		candidate.requireExplicitUndefinedKeyPresence !== undefined &&
		typeof candidate.requireExplicitUndefinedKeyPresence !== "boolean"
	) {
		throw new Error('toEqualPartially: option "requireExplicitUndefinedKeyPresence" must be a boolean when provided.');
	}

	if (
		candidate.arrayMode !== undefined &&
		candidate.arrayMode !== "subset" &&
		candidate.arrayMode !== "exactLength" &&
		candidate.arrayMode !== "exactOrder"
	) {
		throw new Error('toEqualPartially: option "arrayMode" must be one of: subset, exactLength, exactOrder.');
	}

	return options;
}

function formatExpectedValue(value: unknown): string {
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

function pushArrayMismatchDetail(state: ExtractionState, detail: string): void {
	if (!state.arrayMismatchDetails.includes(detail)) {
		state.arrayMismatchDetails.push(detail);
	}
}

function getValidatedPartialMatchOptions(options: PartialMatchOptions | undefined): {
	validatedOptions: PartialMatchOptions;
	optionsValidationError: string | undefined;
} {
	try {
		return {
			validatedOptions: validatePartialMatchOptions(options),
			optionsValidationError: undefined,
		};
	} catch (error: unknown) {
		return {
			validatedOptions: {},
			optionsValidationError: error instanceof Error ? error.message : String(error),
		};
	}
}

function compareExtractedSubset(actualSubset: unknown, expected: unknown): { pass: boolean; comparisonError: string } {
	try {
		baseExpect(actualSubset).toEqual(expected);
		return { pass: true, comparisonError: "" };
	} catch (error: unknown) {
		return {
			pass: false,
			comparisonError: error instanceof Error ? error.message : String(error),
		};
	}
}

function applyExtractionStateConstraints(
	comparison: { pass: boolean; comparisonError: string },
	state: ExtractionState,
): { pass: boolean; comparisonError: string } {
	let { pass, comparisonError } = comparison;

	if (pass && !state.allArrayItemsMatchedOneToOne) {
		pass = false;
		comparisonError =
			"Unable to satisfy expected array matches one-to-one: one or more expected array items did not have a unique matching actual item.";
		if (state.arrayMismatchDetails.length > 0) {
			comparisonError += `\n${state.arrayMismatchDetails.join("\n")}`;
		}
	}

	if (!state.allArrayItemsMatchedOneToOne && state.arrayMismatchDetails.length > 0) {
		const diagnosticsText = state.arrayMismatchDetails.join("\n");
		if (!comparisonError.includes(diagnosticsText)) {
			comparisonError = comparisonError ? `${comparisonError}\n${diagnosticsText}` : diagnosticsText;
		}
	}

	if (pass && !state.allExplicitUndefinedKeysExist) {
		pass = false;
		comparisonError =
			"Expected key explicitly set to undefined is missing in actual value. In toEqualPartially, explicit undefined requires key presence.";
	}

	return { pass, comparisonError };
}

function createIsolatedExtractionState(state: ExtractionState): ExtractionState {
	return {
		allArrayItemsMatchedOneToOne: true,
		allExplicitUndefinedKeysExist: true,
		requireExplicitUndefinedKeyPresence: state.requireExplicitUndefinedKeyPresence,
		arrayMode: state.arrayMode,
		arrayMismatchDetails: [],
	};
}

function registerUnmatchedExpectedIndex(
	state: ExtractionState,
	path: string,
	index: number,
	expectedItem: unknown,
): void {
	state.allArrayItemsMatchedOneToOne = false;
	pushArrayMismatchDetail(
		state,
		`Unmatched expected index ${index} at ${path}[${index}]: ${formatExpectedValue(expectedItem)}.`,
	);
}

function checkArrayLengthForMode(
	actualArray: unknown[],
	expectedArray: unknown[],
	state: ExtractionState,
	path: string,
): void {
	if (
		(state.arrayMode === "exactLength" || state.arrayMode === "exactOrder") &&
		actualArray.length !== expectedArray.length
	) {
		state.allArrayItemsMatchedOneToOne = false;
		pushArrayMismatchDetail(
			state,
			`Array length mismatch at ${path}: expected ${expectedArray.length}, received ${actualArray.length}.`,
		);
	}
}

function buildExactOrderArraySubset(
	actualArray: unknown[],
	expectedArray: unknown[],
	state: ExtractionState,
	path: string,
): unknown[] {
	const result: unknown[] = [];

	for (let index = 0; index < expectedArray.length; index++) {
		const expectedItem = expectedArray[index];
		const actualItem = actualArray[index];
		const indexedPath = `${path}[${index}]`;

		if (index >= actualArray.length) {
			registerUnmatchedExpectedIndex(state, path, index, expectedItem);
			result.push(undefined);
			continue;
		}

		try {
			const pairState = createIsolatedExtractionState(state);
			const extractedItem = extractMatchingStructure(actualItem, expectedItem, pairState, indexedPath);
			baseExpect(extractedItem).toEqual(expectedItem);
			if (!pairState.allArrayItemsMatchedOneToOne || !pairState.allExplicitUndefinedKeysExist) {
				registerUnmatchedExpectedIndex(state, path, index, expectedItem);
				for (const detail of pairState.arrayMismatchDetails) {
					pushArrayMismatchDetail(state, detail);
				}
			}
			result.push(extractedItem);
		} catch {
			registerUnmatchedExpectedIndex(state, path, index, expectedItem);
			result.push(extractMatchingStructure(actualItem, expectedItem, state, indexedPath));
		}
	}

	return result;
}

function buildPairCandidates(
	actualArray: unknown[],
	expectedArray: unknown[],
	state: ExtractionState,
	path: string,
): {
	candidateActualIndexesByExpected: number[][];
	extractedByPair: unknown[][];
} {
	const candidateActualIndexesByExpected: number[][] = expectedArray.map(() => []);
	const extractedByPair: unknown[][] = expectedArray.map(() => []);

	for (let expectedIndex = 0; expectedIndex < expectedArray.length; expectedIndex++) {
		const expectedItem = expectedArray[expectedIndex];
		for (let actualIndex = 0; actualIndex < actualArray.length; actualIndex++) {
			const actualItem = actualArray[actualIndex];
			try {
				const pairState = createIsolatedExtractionState(state);
				const extractedItem = extractMatchingStructure(
					actualItem,
					expectedItem,
					pairState,
					`${path}[${expectedIndex}]`,
				);
				baseExpect(extractedItem).toEqual(expectedItem);
				if (!pairState.allArrayItemsMatchedOneToOne || !pairState.allExplicitUndefinedKeysExist) {
					continue;
				}
				candidateActualIndexesByExpected[expectedIndex].push(actualIndex);
				extractedByPair[expectedIndex][actualIndex] = extractedItem;
			} catch {
				// This pair does not match; keep searching.
			}
		}
	}

	return { candidateActualIndexesByExpected, extractedByPair };
}

function assignExpectedToActual(candidateActualIndexesByExpected: number[][], actualLength: number): number[] {
	const expectedOrder = candidateActualIndexesByExpected
		.map((_, index) => index)
		.sort((a, b) => candidateActualIndexesByExpected[a].length - candidateActualIndexesByExpected[b].length);

	const assignedExpectedByActual = Array<number>(actualLength).fill(-1);
	const assignedActualByExpected = Array<number>(candidateActualIndexesByExpected.length).fill(-1);

	const tryAssign = (expectedIndex: number, seenActualIndexes: boolean[]): boolean => {
		for (const actualIndex of candidateActualIndexesByExpected[expectedIndex]) {
			if (seenActualIndexes[actualIndex]) {
				continue;
			}
			seenActualIndexes[actualIndex] = true;

			const previousExpectedIndex = assignedExpectedByActual[actualIndex];
			if (previousExpectedIndex === -1 || tryAssign(previousExpectedIndex, seenActualIndexes)) {
				assignedExpectedByActual[actualIndex] = expectedIndex;
				assignedActualByExpected[expectedIndex] = actualIndex;
				return true;
			}
		}

		return false;
	};

	for (const expectedIndex of expectedOrder) {
		tryAssign(expectedIndex, Array<boolean>(actualLength).fill(false));
	}

	return assignedActualByExpected;
}

function buildSubsetModeArraySubset(
	actualArray: unknown[],
	expectedArray: unknown[],
	state: ExtractionState,
	path: string,
): unknown[] {
	const { candidateActualIndexesByExpected, extractedByPair } = buildPairCandidates(
		actualArray,
		expectedArray,
		state,
		path,
	);
	const assignedActualByExpected = assignExpectedToActual(candidateActualIndexesByExpected, actualArray.length);
	const usedActualIndexes = new Set<number>();

	return expectedArray.map((expectedItem, expectedIndex) => {
		const assignedActualIndex = assignedActualByExpected[expectedIndex];
		if (assignedActualIndex !== -1) {
			usedActualIndexes.add(assignedActualIndex);
			return extractedByPair[expectedIndex][assignedActualIndex];
		}

		registerUnmatchedExpectedIndex(state, path, expectedIndex, expectedItem);
		const firstUnusedIndex = actualArray.findIndex((_, index) => !usedActualIndexes.has(index));
		const fallbackIndex = firstUnusedIndex !== -1 ? firstUnusedIndex : 0;
		if (fallbackIndex >= 0) {
			usedActualIndexes.add(fallbackIndex);
		}

		const fallbackItem = actualArray[fallbackIndex];
		return fallbackItem !== undefined
			? extractMatchingStructure(fallbackItem, expectedItem, state, `${path}[${expectedIndex}]`)
			: undefined;
	});
}

function buildBestArraySubsetForExpected(
	actualArray: unknown[],
	expectedArray: unknown[],
	state: ExtractionState,
	path: string,
): unknown[] {
	checkArrayLengthForMode(actualArray, expectedArray, state, path);

	if (state.arrayMode === "exactOrder") {
		return buildExactOrderArraySubset(actualArray, expectedArray, state, path);
	}

	return buildSubsetModeArraySubset(actualArray, expectedArray, state, path);
}

function extractMatchingStructure(actual: unknown, expected: unknown, state: ExtractionState, path: string): unknown {
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

		return buildBestArraySubsetForExpected(actual, expected, state, path);
	}

	// For expected object, extract only matching properties
	if (isPlainObject(expected)) {
		if (!isPlainObject(actual)) {
			return actual; // Type mismatch will be caught by comparison
		}

		const result: Record<string, unknown> = {};
		for (const key of Object.keys(expected)) {
			const keyPath = path === "$" ? `${path}.${key}` : `${path}.${key}`;
			if (key in actual) {
				result[key] = extractMatchingStructure(actual[key], expected[key], state, keyPath);
			} else {
				if (state.requireExplicitUndefinedKeyPresence && expected[key] === undefined) {
					state.allExplicitUndefinedKeysExist = false;
				}
				result[key] = undefined;
			}
		}
		return result;
	}

	// For primitives and special objects, return as-is
	return actual;
}
