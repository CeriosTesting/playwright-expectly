import { expect as baseExpect } from "@playwright/test";
import {
	getUUIDFormatDescription,
	isAlphanumeric,
	isNumericString,
	isValidEmail,
	isValidUrl,
	isValidUUID,
} from "./matchers/text-validation-utils";

/**
 * Expextly Custom matchers for string validations.
 */
export const expectlyString = baseExpect.extend({
	/**
	 * Asserts that a string starts with the expected substring.
	 *
	 * @param matcher - The string to check
	 * @param expected - The substring that should appear at the start
	 *
	 * @example
	 * // Check URL protocol
	 * expectString('https://example.com').toStartWith('https://');
	 *
	 * @example
	 * // Validate file path prefix
	 * expectString('/home/user/documents').toStartWith('/home/');
	 */
	toStartWith(matcher: string, expected: string) {
		const assertionName = "toStartWith";
		const actual = matcher;
		const pass = matcher.startsWith(expected);

		const message = () => {
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
	/**
	 * Asserts that a string ends with the expected substring.
	 *
	 * @param matcher - The string to check
	 * @param expected - The substring that should appear at the end
	 *
	 * @example
	 * // Check file extension
	 * expectString('document.pdf').toEndWith('.pdf');
	 *
	 * @example
	 * // Validate domain suffix
	 * expectString('example.com').toEndWith('.com');
	 */
	toEndWith(matcher: string, expected: string) {
		const assertionName = "toEndWith";
		const actual = matcher;
		const pass = matcher.endsWith(expected);

		const message = () => {
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
	/**
	 * Asserts that a string matches a regular expression pattern.
	 *
	 * @param matcher - The string to check
	 * @param pattern - The regular expression to match against
	 *
	 * @example
	 * // Validate phone number format
	 * expectString('555-123-4567').toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
	 *
	 * @example
	 * // Check version string
	 * expectString('v1.2.3').toMatchPattern(/^v\d+\.\d+\.\d+$/);
	 */
	toMatchPattern(matcher: string, pattern: RegExp) {
		const assertionName = "toMatchPattern";
		const actual = matcher;
		const pass = pattern.test(matcher);

		const message = () => {
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
	/**
	 * Asserts that a string is a valid email address format.
	 *
	 * @param matcher - The string to check
	 *
	 * @example
	 * // Validate email
	 * expectString('user@example.com').toBeValidEmail();
	 *
	 * @example
	 * // Check various formats
	 * expectString('john.doe+tag@company.co.uk').toBeValidEmail();
	 *
	 * @example
	 * // Invalid email
	 * expectString('not-an-email').not.toBeValidEmail();
	 */
	toBeValidEmail(matcher: string) {
		const assertionName = "toBeValidEmail";
		const actual = matcher;
		const pass = isValidEmail(matcher);

		const message = () => {
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
	/**
	 * Asserts that a string is a valid URL format.
	 *
	 * @param matcher - The string to check
	 *
	 * @example
	 * // Validate URL
	 * expectString('https://example.com').toBeValidUrl();
	 *
	 * @example
	 * // Check various protocols
	 * expectString('ftp://files.example.com').toBeValidUrl();
	 * expectString('ws://socket.example.com').toBeValidUrl();
	 *
	 * @example
	 * // Invalid URL
	 * expectString('not a url').not.toBeValidUrl();
	 */
	toBeValidUrl(matcher: string) {
		const assertionName = "toBeValidUrl";
		const actual = matcher;
		const pass = isValidUrl(matcher);

		const message = () => {
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
	/**
	 * Asserts that a string contains only letters and numbers (no spaces or special characters).
	 *
	 * @param matcher - The string to check
	 *
	 * @example
	 * // Validate username
	 * expectString('user123').toBeAlphanumeric();
	 *
	 * @example
	 * // Check product code
	 * expectString('ABC123XYZ').toBeAlphanumeric();
	 *
	 * @example
	 * // Not alphanumeric (has space)
	 * expectString('user 123').not.toBeAlphanumeric();
	 */
	toBeAlphanumeric(matcher: string) {
		const assertionName = "toBeAlphanumeric";
		const actual = matcher;
		const pass = isAlphanumeric(matcher);

		const message = () => {
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
	/**
	 * Asserts that a string contains only numeric digits (0-9).
	 *
	 * @param matcher - The string to check
	 *
	 * @example
	 * // Validate PIN
	 * expectString('1234').toBeNumericString();
	 *
	 * @example
	 * // Check phone number digits
	 * expectString('5551234567').toBeNumericString();
	 *
	 * @example
	 * // Not numeric (has letters)
	 * expectString('12a34').not.toBeNumericString();
	 */
	toBeNumericString(matcher: string) {
		const assertionName = "toBeNumericString";
		const actual = matcher;
		const pass = isNumericString(matcher);

		const message = () => {
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
	/**
	 * Asserts that a string is a valid UUID.
	 *
	 * @param matcher - The string to check
	 * @param version - Optional: specific UUID version (1, 3, 4, or 5)
	 *
	 * @example
	 * // Validate any UUID
	 * expectString('550e8400-e29b-41d4-a716-446655440000').toBeUUID();
	 *
	 * @example
	 * // Validate specific UUID v4
	 * expectString('f47ac10b-58cc-4372-a567-0e02b2c3d479').toBeUUID(4);
	 *
	 * @example
	 * // Invalid UUID
	 * expectString('not-a-uuid').not.toBeUUID();
	 */
	toBeUUID(matcher: string, version?: 1 | 3 | 4 | 5) {
		const assertionName = "toBeUUID";
		const actual = matcher;
		const pass = isValidUUID(matcher, version);

		const message = () => {
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
});
