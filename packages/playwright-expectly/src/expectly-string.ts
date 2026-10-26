import { withMatcherState } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { assertReceivedType } from "./matchers/common-utils";
import type { ExpectlyMatcherResult } from "./matchers/matcher-result";
import type { UrlValidationOptions, UUIDVersion } from "./matchers/text-validation-utils";
import { matchesPattern } from "./matchers/text-validation-utils";
import {
	getUUIDFormatDescription,
	isAlphanumeric,
	isNumericString,
	isValidEmail,
	isValidUrl,
	isValidUUID,
} from "./matchers/text-validation-utils";

/**
 * Expectly Custom matchers for string validations.
 */
export const expectlyStringMatchers = withMatcherState({
	toStartWith(matcher: string, expected: string) {
		const assertionName = "toStartWith";
		assertReceivedType(assertionName, matcher, "string");
		const actual = matcher;
		const pass = matcher.startsWith(expected);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not start with: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Start of string: ${this.utils.printReceived(actual.substring(0, Math.max(expected.length, 20)))}`
				);
			}

			if (!pass && !this.isNot) {
				const actualStart = actual.substring(0, Math.max(expected.length + 10, 20));
				return (
					hint +
					"\n\n" +
					`Expected string to start with: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Start of string: ${this.utils.printReceived(actualStart)}${actual.length > actualStart.length ? "..." : ""}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual,
		};
	},
	toEndWith(matcher: string, expected: string) {
		const assertionName = "toEndWith";
		assertReceivedType(assertionName, matcher, "string");
		const actual = matcher;
		const pass = matcher.endsWith(expected);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not end with: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`End of string: ${this.utils.printReceived(actual.substring(Math.max(0, actual.length - Math.max(expected.length, 20))))}`
				);
			}

			if (!pass && !this.isNot) {
				const actualEnd = actual.substring(Math.max(0, actual.length - Math.max(expected.length + 10, 20)));
				return (
					hint +
					"\n\n" +
					`Expected string to end with: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`End of string: ${actual.length > actualEnd.length ? "..." : ""}${this.utils.printReceived(actualEnd)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual,
		};
	},
	toMatchPattern(matcher: string, pattern: RegExp) {
		const assertionName = "toMatchPattern";
		assertReceivedType(assertionName, matcher, "string");
		const actual = matcher;
		const pass = matchesPattern(matcher, pattern);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not match pattern: ${this.utils.printExpected(pattern)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to match pattern: ${this.utils.printExpected(pattern)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: pattern,
			actual,
		};
	},
	toBeValidEmail(matcher: string) {
		const assertionName = "toBeValidEmail";
		assertReceivedType(assertionName, matcher, "string");
		const actual = matcher;
		const pass = isValidEmail(matcher);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not be a valid email address\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to be a valid email address\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual,
		};
	},
	toBeValidUrl(matcher: string, options?: UrlValidationOptions) {
		const assertionName = "toBeValidUrl";
		assertReceivedType(assertionName, matcher, "string");
		const actual = matcher;
		const pass = isValidUrl(matcher, options);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected string to not be a valid URL\nReceived: ${this.utils.printReceived(actual)}`;
			}

			if (!pass && !this.isNot) {
				return `${hint}\n\nExpected string to be a valid URL\nReceived: ${this.utils.printReceived(actual)}`;
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual,
		};
	},
	toBeAlphanumeric(matcher: string, options?: { unicode?: boolean }) {
		const assertionName = "toBeAlphanumeric";
		assertReceivedType(assertionName, matcher, "string");
		const actual = matcher;
		const pass = isAlphanumeric(matcher, options?.unicode ?? false);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not be alphanumeric (only letters and numbers)\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to be alphanumeric (only letters and numbers)\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual,
		};
	},
	toBeNumericString(matcher: string) {
		const assertionName = "toBeNumericString";
		assertReceivedType(assertionName, matcher, "string");
		const actual = matcher;
		const pass = isNumericString(matcher);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not be numeric (only digits)\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to be numeric (only digits)\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual,
		};
	},
	toBeUUID(matcher: string, version?: UUIDVersion) {
		const assertionName = "toBeUUID";
		assertReceivedType(assertionName, matcher, "string");
		const actual = matcher;
		const pass = isValidUUID(matcher, version);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, version ? String(version) : undefined, {
				isNot: this.isNot,
			});

			const versionText = version ? ` v${version}` : "";

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not be a valid UUID${versionText}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to be a valid UUID${versionText}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Expected format: ${getUUIDFormatDescription(version)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual,
		};
	},
	toEqualCaseInsensitive(matcher: string, expected: string) {
		const assertionName = "toEqualCaseInsensitive";
		assertReceivedType(assertionName, matcher, "string");
		// Locale-independent comparison of case-folded text ("Straße" equals "STRASSE").
		const fold = (text: string): string => text.normalize("NFC").toUpperCase().toLowerCase();
		const pass = fold(matcher) === fold(expected);
		return stringEqualityResult(this, assertionName, "equal (ignoring case)", pass, matcher, expected);
	},
	toEqualIgnoringWhitespace(matcher: string, expected: string) {
		const assertionName = "toEqualIgnoringWhitespace";
		assertReceivedType(assertionName, matcher, "string");
		const strip = (text: string): string => text.replace(/\s+/g, "");
		const pass = strip(matcher) === strip(expected);
		return stringEqualityResult(this, assertionName, "equal (ignoring all whitespace)", pass, matcher, expected);
	},
	toBeHexadecimal(matcher: string, options?: { prefix?: "allowed" | "required" | "forbidden" }) {
		const assertionName = "toBeHexadecimal";
		assertReceivedType(assertionName, matcher, "string");
		const prefix = options?.prefix ?? "allowed";
		const pattern =
			prefix === "required" ? /^0x[0-9a-f]+$/i : prefix === "forbidden" ? /^[0-9a-f]+$/i : /^(?:0x)?[0-9a-f]+$/i;
		const pass = pattern.test(matcher);
		return {
			message: (): string =>
				`${this.utils.matcherHint(assertionName, undefined, "", { isNot: this.isNot })}\n\n` +
				`Expected string to ${this.isNot ? "not " : ""}be hexadecimal${prefix === "allowed" ? "" : ` (0x prefix ${prefix})`}\n` +
				`Received: ${this.utils.printReceived(matcher)}`,
			pass,
			name: assertionName,
			actual: matcher,
		};
	},
});

function stringEqualityResult(
	state: ExpectMatcherState,
	assertionName: string,
	relation: string,
	pass: boolean,
	actual: string,
	expected: string,
): ExpectlyMatcherResult {
	if (typeof expected !== "string") throw new TypeError(`${assertionName}: expected value must be a string`);
	return {
		message: () =>
			`${state.utils.matcherHint(assertionName, undefined, undefined, { isNot: state.isNot })}\n\n` +
			`Expected string to ${state.isNot ? "not " : ""}${relation}: ${state.utils.printExpected(expected)}\n` +
			`Received: ${state.utils.printReceived(actual)}`,
		pass,
		name: assertionName,
		expected,
		actual,
	};
}

export const expectlyString: Expect<typeof expectlyStringMatchers> = baseExpect.extend(expectlyStringMatchers);
