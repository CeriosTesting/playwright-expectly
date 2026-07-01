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
			arrayReports: [],
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
				if (extractionState.arrayReports.length > 0) {
					return buildArrayFailureMessage(this, hint, expected, actualSubset, extractionState);
				}

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
	arrayReports: ArrayMatchReport[];
};

type ArrayMatchMode = "subset" | "exactLength" | "exactOrder";

type ArrayMatchReport = {
	path: string;
	mode: ArrayMatchMode;
	expected: unknown[];
	matchedPairs: Array<{
		expectedIndex: number;
		actualIndex: number;
		expectedItem: unknown;
		actualItem: unknown;
		extractedActual: unknown;
	}>;
	unmatchedExpectedItems: Array<{
		expectedIndex: number;
		expectedItem: unknown;
		diagnosticActualIndex?: number;
		diagnosticExtractedActual?: unknown;
		diagnosticMatchPercentage?: number;
		nestedMismatchPath?: string;
	}>;
};

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
		arrayReports: [],
	};
}

function registerUnmatchedExpectedIndex(
	state: ExtractionState,
	report: ArrayMatchReport,
	path: string,
	index: number,
	expectedItem: unknown,
	diagnosticActualIndex?: number,
	diagnosticExtractedActual?: unknown,
	diagnosticMatchPercentage?: number,
	nestedMismatchPath?: string,
): void {
	state.allArrayItemsMatchedOneToOne = false;
	report.unmatchedExpectedItems.push({
		expectedIndex: index,
		expectedItem,
		diagnosticActualIndex,
		diagnosticExtractedActual,
		diagnosticMatchPercentage,
		nestedMismatchPath,
	});
	pushArrayMismatchDetail(
		state,
		`Unmatched expected index ${index} at ${path}[${index}]: ${formatExpectedValue(expectedItem)}.`,
	);
}

function mergeExtractionState(targetState: ExtractionState, sourceState: ExtractionState): void {
	for (const detail of sourceState.arrayMismatchDetails) {
		pushArrayMismatchDetail(targetState, detail);
	}

	targetState.arrayReports.push(...sourceState.arrayReports);
}

function createArrayMatchReport(path: string, mode: ArrayMatchMode, expected: unknown[]): ArrayMatchReport {
	return {
		path,
		mode,
		expected,
		matchedPairs: [],
		unmatchedExpectedItems: [],
	};
}

function getDeepestNestedMismatchPath(state: ExtractionState): string | undefined {
	let deepestPath: string | undefined;

	for (const report of state.arrayReports) {
		if (deepestPath === undefined || report.path.length > deepestPath.length) {
			deepestPath = report.path;
		}
	}

	return deepestPath;
}

function isAsymmetricMatcher(value: unknown): boolean {
	return !!value && typeof value === "object" && "$$typeof" in value;
}

function scoreExactMatch(actual: unknown, expected: unknown): number {
	try {
		baseExpect(actual).toEqual(expected);
		return 1;
	} catch {
		return 0;
	}
}

function getMatchPercentageFromUnits(expected: unknown, matchedUnits: number): number {
	const totalUnits = countExpectedMatchUnits(expected);
	return Math.round((matchedUnits / totalUnits) * 100);
}

function findBestArrayMatch(
	actual: unknown[],
	expectedItem: unknown,
	usedActualIndexes: Set<number>,
): { bestActualIndex: number; bestScore: number } {
	let bestActualIndex = -1;
	let bestScore = -1;

	for (let actualIndex = 0; actualIndex < actual.length; actualIndex++) {
		if (usedActualIndexes.has(actualIndex)) {
			continue;
		}

		const candidateScore = countDeepMatches(actual[actualIndex], expectedItem);
		if (candidateScore > bestScore) {
			bestScore = candidateScore;
			bestActualIndex = actualIndex;
		}
	}

	return { bestActualIndex, bestScore };
}

function scoreArrayMatch(actual: unknown[], expected: unknown[]): number {
	const usedActualIndexes = new Set<number>();
	let score = 0;

	for (const expectedItem of expected) {
		const { bestActualIndex, bestScore } = findBestArrayMatch(actual, expectedItem, usedActualIndexes);
		if (bestActualIndex !== -1 && bestScore > 0) {
			usedActualIndexes.add(bestActualIndex);
			score += bestScore;
		}
	}

	return score;
}

function scoreObjectMatch(actual: Record<string, unknown>, expected: Record<string, unknown>): number {
	let score = 0;

	for (const key of Object.keys(expected)) {
		if (key in actual) {
			score += countDeepMatches(actual[key], expected[key]);
		}
	}

	return score;
}

function countDeepMatches(actual: unknown, expected: unknown): number {
	if (isAsymmetricMatcher(expected)) {
		return scoreExactMatch(actual, expected);
	}

	if (Array.isArray(expected)) {
		return Array.isArray(actual) ? scoreArrayMatch(actual, expected) : 0;
	}

	if (isPlainObject(expected)) {
		return isPlainObject(actual) ? scoreObjectMatch(actual, expected) : 0;
	}

	return scoreExactMatch(actual, expected);
}

function findBestDiagnosticActualIndex(
	actualArray: unknown[],
	expectedItem: unknown,
	matchedActualIndexes: Set<number>,
): number | undefined {
	const candidateGroups = [
		actualArray.map((_, index) => index).filter((index) => !matchedActualIndexes.has(index)),
		actualArray.map((_, index) => index),
	];

	for (const candidateIndexes of candidateGroups) {
		let bestIndex: number | undefined;
		let bestScore = -1;

		for (const actualIndex of candidateIndexes) {
			const score = countDeepMatches(actualArray[actualIndex], expectedItem);
			if (score > bestScore) {
				bestScore = score;
				bestIndex = actualIndex;
			}
		}

		if (bestIndex !== undefined && bestScore > 0) {
			return bestIndex;
		}
	}

	return undefined;
}

function countExpectedMatchUnits(expected: unknown): number {
	if (isAsymmetricMatcher(expected)) {
		return 1;
	}

	if (Array.isArray(expected)) {
		const total = expected.reduce((sum, item) => sum + countExpectedMatchUnits(item), 0);
		return Math.max(1, total);
	}

	if (isPlainObject(expected)) {
		const total = Object.keys(expected).reduce((sum, key) => sum + countExpectedMatchUnits(expected[key]), 0);
		return Math.max(1, total);
	}

	return 1;
}

function getMatchPercentage(actual: unknown, expected: unknown): number {
	const matchedUnits = countDeepMatches(actual, expected);
	return getMatchPercentageFromUnits(expected, matchedUnits);
}

function findBestDiagnosticActualIndexByScore(
	scoresByActualIndex: Array<number | undefined>,
	matchedActualIndexes: Set<number>,
	preferUnmatchedOnly: boolean,
): number | undefined {
	let bestIndex: number | undefined;
	let bestScore = -1;

	for (let actualIndex = 0; actualIndex < scoresByActualIndex.length; actualIndex++) {
		const score = scoresByActualIndex[actualIndex] ?? 0;
		if (preferUnmatchedOnly && matchedActualIndexes.has(actualIndex)) {
			continue;
		}

		if (score > bestScore) {
			bestScore = score;
			bestIndex = actualIndex;
		}
	}

	return bestScore > 0 ? bestIndex : undefined;
}

function findFirstMismatchPath(actual: unknown, expected: unknown, path: string): string | undefined {
	if (isAsymmetricMatcher(expected)) {
		return scoreExactMatch(actual, expected) === 1 ? undefined : path;
	}

	if (Array.isArray(expected)) {
		if (!Array.isArray(actual)) {
			return path;
		}

		for (let index = 0; index < expected.length; index++) {
			const mismatchPath = findFirstMismatchPath(actual[index], expected[index], `${path}[${index}]`);
			if (mismatchPath) {
				return mismatchPath;
			}
		}

		return undefined;
	}

	if (isPlainObject(expected)) {
		if (!isPlainObject(actual)) {
			return path;
		}

		for (const key of Object.keys(expected)) {
			const mismatchPath = findFirstMismatchPath(actual[key], expected[key], `${path}.${key}`);
			if (mismatchPath) {
				return mismatchPath;
			}
		}

		return undefined;
	}

	return scoreExactMatch(actual, expected) === 1 ? undefined : path;
}

function indentBlock(text: string, prefix = "  "): string {
	return text
		.split("\n")
		.map((line) => `${prefix}${line}`)
		.join("\n");
}

function formatArraySectionItem(label: string, value: string): string {
	return `${label}:\n${indentBlock(value)}`;
}

function formatClosestCandidateDiff(
	matcherState: ExpectMatcherState,
	expectedItem: unknown,
	diagnosticExtractedActual: unknown,
): string {
	return matcherState.utils.printDiffOrStringify(
		expectedItem,
		diagnosticExtractedActual,
		"Expected partial",
		"Closest candidate",
		false,
	);
}

function isArrayPathAncestor(ancestorPath: string, descendantPath: string): boolean {
	return descendantPath === ancestorPath || descendantPath.startsWith(`${ancestorPath}[`);
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pathOwnsMismatch(ownerPath: string, mismatchPath: string): boolean {
	return (
		mismatchPath === ownerPath || mismatchPath.startsWith(`${ownerPath}.`) || mismatchPath.startsWith(`${ownerPath}[`)
	);
}

function getExpectedIndexForChildPath(parentPath: string, childPath: string): number | undefined {
	if (!childPath.startsWith(parentPath)) {
		return undefined;
	}

	const suffix = childPath.slice(parentPath.length);
	const match = suffix.match(/^\[(\d+)\](?:\.|$)/);
	return match ? Number(match[1]) : undefined;
}

function findPrimaryFailure(
	state: ExtractionState,
	actualSubset: unknown,
	expected: unknown,
):
	| {
			report: ArrayMatchReport;
			item: ArrayMatchReport["unmatchedExpectedItems"][number];
			mismatchPath: string;
	  }
	| undefined {
	const mismatchPath = findFirstMismatchPath(actualSubset, expected, "$");
	if (!mismatchPath) {
		return undefined;
	}

	let selected:
		| {
				report: ArrayMatchReport;
				item: ArrayMatchReport["unmatchedExpectedItems"][number];
				mismatchPath: string;
				itemPathLength: number;
		  }
		| undefined;

	for (const report of state.arrayReports) {
		for (const item of report.unmatchedExpectedItems) {
			const itemPath = `${report.path}[${item.expectedIndex}]`;
			if (!pathOwnsMismatch(itemPath, mismatchPath)) {
				continue;
			}

			if (!selected || itemPath.length > selected.itemPathLength) {
				selected = {
					report,
					item,
					mismatchPath,
					itemPathLength: itemPath.length,
				};
			}
		}
	}

	if (selected) {
		return {
			report: selected.report,
			item: selected.item,
			mismatchPath: selected.mismatchPath,
		};
	}

	const fallbackReports = state.arrayReports.filter((report) => report.unmatchedExpectedItems.length > 0);
	const fallbackReport = fallbackReports.sort((left, right) => right.path.length - left.path.length)[0];
	const fallbackItem = fallbackReport?.unmatchedExpectedItems[0];
	if (!fallbackReport || !fallbackItem) {
		return undefined;
	}

	return {
		report: fallbackReport,
		item: fallbackItem,
		mismatchPath,
	};
}

function buildFailureRoute(state: ExtractionState, failurePath: string): Array<ArrayMatchReport> {
	return state.arrayReports
		.filter((report) => isArrayPathAncestor(report.path, failurePath))
		.sort((left, right) => left.path.length - right.path.length);
}

function getRelevantMismatchDetails(state: ExtractionState, failurePath: string): string[] {
	const escapedFailurePath = escapeRegExp(failurePath);
	const relevantPathPattern = new RegExp(` at ${escapedFailurePath}(?:\\[|\\.|:|$)`);

	return state.arrayMismatchDetails.filter((detail) => relevantPathPattern.test(detail));
}

function getArrayLabel(path: string): string {
	if (path === "$") {
		return "root array";
	}

	const lastDotIndex = path.lastIndexOf(".");
	return lastDotIndex === -1 ? path : path.slice(lastDotIndex + 1);
}

function formatIdentityValue(value: unknown): string | undefined {
	if (typeof value === "string") {
		return value;
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	return undefined;
}

function getActualIdentitySnippet(actualItem: unknown): string | undefined {
	if (!isPlainObject(actualItem)) {
		return formatIdentityValue(actualItem);
	}

	const preferredKeys = ["id", "name", "title", "type", "author"] as const;
	for (const key of preferredKeys) {
		const formattedValue = formatIdentityValue(actualItem[key]);
		if (formattedValue !== undefined) {
			return `${key}: ${formattedValue}`;
		}
	}

	return undefined;
}

function formatRouteLine(
	report: ArrayMatchReport,
	expectedIndex: number,
	actualIndex: number,
	actualItem: unknown,
): string {
	const arrayLabel = getArrayLabel(report.path);
	const identitySnippet = getActualIdentitySnippet(actualItem);
	return identitySnippet
		? `${arrayLabel} expected[${expectedIndex}] matched actual[${actualIndex}] (${identitySnippet})`
		: `${arrayLabel} expected[${expectedIndex}] matched actual[${actualIndex}]`;
}

function formatCallLogEntry(
	report: ArrayMatchReport,
	item: ArrayMatchReport["unmatchedExpectedItems"][number],
): string {
	const arrayLabel = getArrayLabel(report.path);
	const baseMessage = `${arrayLabel} expected[${item.expectedIndex}] did not fully match`;

	if (item.nestedMismatchPath) {
		return `${baseMessage}; failure continues at ${item.nestedMismatchPath}.`;
	}

	if (item.diagnosticActualIndex !== undefined) {
		return `${baseMessage}; closest candidate was actual[${item.diagnosticActualIndex}].`;
	}

	return `${baseMessage}; no close match was found.`;
}

function formatFailureRoute(route: Array<ArrayMatchReport>): string | undefined {
	if (route.length <= 1) {
		return undefined;
	}

	const lines: string[] = [];

	for (let index = 0; index < route.length - 1; index++) {
		const report = route[index];
		const nextReport = route[index + 1];
		const expectedIndex = getExpectedIndexForChildPath(report.path, nextReport.path);
		if (expectedIndex === undefined) {
			continue;
		}

		const matchedPair = report.matchedPairs.find((pair) => pair.expectedIndex === expectedIndex);
		if (!matchedPair) {
			continue;
		}

		lines.push(formatRouteLine(report, expectedIndex, matchedPair.actualIndex, matchedPair.actualItem));
	}

	return lines.length > 0 ? lines.join("\n") : undefined;
}

function formatPrimaryArrayFailure(
	matcherState: ExpectMatcherState,
	report: ArrayMatchReport,
	item: ArrayMatchReport["unmatchedExpectedItems"][number],
	mismatchPath: string,
	state: ExtractionState,
): string {
	const failingItemPath = mismatchPath;
	const route = buildFailureRoute(state, report.path);
	const sections = [`First failing path: ${failingItemPath}`, `Failing array: ${report.path} (${report.mode})`];

	const routeText = formatFailureRoute(route);
	if (routeText) {
		sections.push(`Match route:\n${indentBlock(routeText)}`);
	}

	if (item.diagnosticActualIndex !== undefined && item.diagnosticExtractedActual !== undefined) {
		const matchPercentage =
			item.diagnosticMatchPercentage ?? getMatchPercentage(item.diagnosticExtractedActual, item.expectedItem);
		sections.push(
			formatArraySectionItem(
				`Closest actual[${item.diagnosticActualIndex}] (${matchPercentage}% match)`,
				formatClosestCandidateDiff(matcherState, item.expectedItem, item.diagnosticExtractedActual),
			),
		);
	} else if (item.nestedMismatchPath) {
		sections.push(`Failure continues at: ${item.nestedMismatchPath}`);
	} else {
		sections.push("No close match found.");
	}

	return sections.join("\n\n");
}

function buildArrayFailureMessage(
	matcherState: ExpectMatcherState,
	hint: string,
	expected: unknown,
	actualSubset: unknown,
	state: ExtractionState,
): string {
	const sections = [`${hint} // partial match (${state.arrayMode})`];
	const primaryFailure = findPrimaryFailure(state, actualSubset, expected);

	if (primaryFailure) {
		sections.push(
			formatPrimaryArrayFailure(
				matcherState,
				primaryFailure.report,
				primaryFailure.item,
				primaryFailure.mismatchPath,
				state,
			),
		);

		const primaryCallLogEntries = primaryFailure.report.unmatchedExpectedItems.map((item) =>
			formatCallLogEntry(primaryFailure.report, item),
		);
		const relevantDetails = getRelevantMismatchDetails(state, primaryFailure.report.path).filter(
			(detail) => !detail.startsWith("Unmatched expected index "),
		);
		const callLogEntries = [...primaryCallLogEntries, ...relevantDetails];
		if (callLogEntries.length > 0) {
			sections.push(`Call log:\n${indentBlock(callLogEntries.map((detail) => `- ${detail}`).join("\n"))}`);
		}
	} else {
		sections.push(formatArraySectionItem("Expected", matcherState.utils.printExpected(expected)));
		sections.push(formatArraySectionItem("Received partial", matcherState.utils.printReceived(actualSubset)));

		if (state.arrayMismatchDetails.length > 0) {
			sections.push(`Call log:\n${indentBlock(state.arrayMismatchDetails.map((detail) => `- ${detail}`).join("\n"))}`);
		}
	}

	return sections.join("\n\n");
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
	const report = createArrayMatchReport(path, state.arrayMode, expectedArray);
	state.arrayReports.push(report);

	for (let index = 0; index < expectedArray.length; index++) {
		const expectedItem = expectedArray[index];
		const actualItem = actualArray[index];
		const indexedPath = `${path}[${index}]`;

		if (index >= actualArray.length) {
			registerUnmatchedExpectedIndex(state, report, path, index, expectedItem);
			result.push(undefined);
			continue;
		}

		try {
			const pairState = createIsolatedExtractionState(state);
			const extractedItem = extractMatchingStructure(actualItem, expectedItem, pairState, indexedPath);
			baseExpect(extractedItem).toEqual(expectedItem);
			if (!pairState.allArrayItemsMatchedOneToOne || !pairState.allExplicitUndefinedKeysExist) {
				mergeExtractionState(state, pairState);
				registerUnmatchedExpectedIndex(
					state,
					report,
					path,
					index,
					expectedItem,
					undefined,
					undefined,
					undefined,
					getDeepestNestedMismatchPath(pairState),
				);
				result.push(extractedItem);
				continue;
			}

			mergeExtractionState(state, pairState);
			report.matchedPairs.push({
				expectedIndex: index,
				actualIndex: index,
				expectedItem,
				actualItem,
				extractedActual: extractedItem,
			});
			result.push(extractedItem);
		} catch {
			const diagnosticState = createIsolatedExtractionState(state);
			const diagnosticItem = extractMatchingStructure(actualItem, expectedItem, diagnosticState, indexedPath);
			mergeExtractionState(state, diagnosticState);
			registerUnmatchedExpectedIndex(
				state,
				report,
				path,
				index,
				expectedItem,
				index,
				diagnosticItem,
				undefined,
				getDeepestNestedMismatchPath(diagnosticState),
			);
			result.push(diagnosticItem);
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
	pairStateByExpectedAndActual: Array<Array<ExtractionState | undefined>>;
	scoreByExpectedAndActual: Array<Array<number | undefined>>;
} {
	const candidateActualIndexesByExpected: number[][] = expectedArray.map(() => []);
	const extractedByPair: unknown[][] = expectedArray.map(() => []);
	const pairStateByExpectedAndActual: Array<Array<ExtractionState | undefined>> = expectedArray.map(() => []);
	const scoreByExpectedAndActual: Array<Array<number | undefined>> = expectedArray.map(() => []);

	for (let expectedIndex = 0; expectedIndex < expectedArray.length; expectedIndex++) {
		const expectedItem = expectedArray[expectedIndex];
		for (let actualIndex = 0; actualIndex < actualArray.length; actualIndex++) {
			const actualItem = actualArray[actualIndex];
			scoreByExpectedAndActual[expectedIndex][actualIndex] = countDeepMatches(actualItem, expectedItem);
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
				pairStateByExpectedAndActual[expectedIndex][actualIndex] = pairState;
			} catch {
				// This pair does not match; keep searching.
			}
		}
	}

	return { candidateActualIndexesByExpected, extractedByPair, pairStateByExpectedAndActual, scoreByExpectedAndActual };
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
	const report = createArrayMatchReport(path, state.arrayMode, expectedArray);
	state.arrayReports.push(report);
	const { candidateActualIndexesByExpected, extractedByPair, pairStateByExpectedAndActual, scoreByExpectedAndActual } =
		buildPairCandidates(actualArray, expectedArray, state, path);
	const assignedActualByExpected = assignExpectedToActual(candidateActualIndexesByExpected, actualArray.length);
	const usedActualIndexes = new Set<number>();

	const extractedArray = expectedArray.map((expectedItem, expectedIndex) => {
		const assignedActualIndex = assignedActualByExpected[expectedIndex];
		if (assignedActualIndex !== -1) {
			usedActualIndexes.add(assignedActualIndex);
			const pairState = pairStateByExpectedAndActual[expectedIndex][assignedActualIndex];
			if (pairState) {
				mergeExtractionState(state, pairState);
			}

			report.matchedPairs.push({
				expectedIndex,
				actualIndex: assignedActualIndex,
				expectedItem,
				actualItem: actualArray[assignedActualIndex],
				extractedActual: extractedByPair[expectedIndex][assignedActualIndex],
			});

			return extractedByPair[expectedIndex][assignedActualIndex];
		}

		const fallbackScores = scoreByExpectedAndActual[expectedIndex];
		const fallbackIndex =
			findBestDiagnosticActualIndexByScore(fallbackScores, usedActualIndexes, true) ??
			findBestDiagnosticActualIndexByScore(fallbackScores, usedActualIndexes, false) ??
			findBestDiagnosticActualIndex(actualArray, expectedItem, usedActualIndexes);
		const fallbackItem = fallbackIndex === undefined ? undefined : actualArray[fallbackIndex];
		const fallbackMatchPercentage =
			fallbackIndex === undefined
				? undefined
				: getMatchPercentageFromUnits(expectedItem, fallbackScores[fallbackIndex] ?? 0);
		const diagnosticState = createIsolatedExtractionState(state);
		const diagnosticItem =
			fallbackItem !== undefined
				? extractMatchingStructure(fallbackItem, expectedItem, diagnosticState, `${path}[${expectedIndex}]`)
				: undefined;

		mergeExtractionState(state, diagnosticState);

		registerUnmatchedExpectedIndex(
			state,
			report,
			path,
			expectedIndex,
			expectedItem,
			fallbackIndex,
			diagnosticItem,
			fallbackMatchPercentage,
			getDeepestNestedMismatchPath(diagnosticState),
		);

		return diagnosticItem;
	});

	return extractedArray;
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
