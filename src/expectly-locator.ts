import { expect as baseExpect, Locator } from "@playwright/test";
import {
	getUUIDFormatDescription,
	isAlphanumeric,
	isLowerCase,
	isNumericString,
	isTitleCase,
	isUpperCase,
	isValidEmail,
	isValidUrl,
	isValidUUID,
	toTitleCase,
} from "./matchers/text-validation-utils";

/**
 * Expextly Custom matchers for locator validations.
 */
export const expectlyLocator = baseExpect.extend({
	/**
	 * Asserts that the locator's text content starts with the expected string.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The string that should appear at the start
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check greeting message
	 * await expectLocator(page.locator('.welcome')).toStartWith('Hello, ');
	 *
	 * @example
	 * // Validate prefix in title
	 * await expectLocator(page.locator('h1')).toStartWith('Chapter 1:');
	 */
	async toStartWith(locator: Locator, expected: string, options?: { timeout?: number }) {
		const assertionName = "toStartWith";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = actual.startsWith(expected);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not start with: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Start of text: ${this.utils.printReceived(actual.substring(0, Math.max(expected.length, 20)))}`
				);
			}

			if (!pass && !this.isNot) {
				const actualStart = actual.substring(0, Math.max(expected.length + 10, 20));
				return (
					hint +
					"\n\n" +
					`Expected locator text to start with: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Start of text: ${this.utils.printReceived(actualStart)}${actual.length > actualStart.length ? "..." : ""}`
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
	 * Asserts that the locator's text content ends with the expected string.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The string that should appear at the end
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check file extension in filename
	 * await expectLocator(page.locator('.filename')).toEndWith('.pdf');
	 *
	 * @example
	 * // Validate suffix in text
	 * await expectLocator(page.locator('.price')).toEndWith(' USD');
	 */
	async toEndWith(locator: Locator, expected: string, options?: { timeout?: number }) {
		const assertionName = "toEndWith";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = actual.endsWith(expected);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not end with: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`End of text: ${this.utils.printReceived(actual.substring(Math.max(0, actual.length - Math.max(expected.length, 20))))}`
				);
			}

			if (!pass && !this.isNot) {
				const actualEnd = actual.substring(Math.max(0, actual.length - Math.max(expected.length + 10, 20)));
				return (
					hint +
					"\n\n" +
					`Expected locator text to end with: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`End of text: ${actual.length > actualEnd.length ? "..." : ""}${this.utils.printReceived(actualEnd)}`
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
	 * Asserts that the locator's text content matches a regular expression pattern.
	 *
	 * @param locator - The Playwright locator to check
	 * @param pattern - The regular expression to match against
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate phone number format
	 * await expectLocator(page.locator('.phone')).toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
	 *
	 * @example
	 * // Check alphanumeric ID
	 * await expectLocator(page.locator('.order-id')).toMatchPattern(/^[A-Z0-9]{8}$/);
	 */
	async toMatchPattern(locator: Locator, pattern: RegExp, options?: { timeout?: number }) {
		const assertionName = "toMatchPattern";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = pattern.test(actual);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not match pattern: ${this.utils.printExpected(pattern)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to match pattern: ${this.utils.printExpected(pattern)}\n` +
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
	 * Asserts that the locator's text content is a valid email address.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate email in profile
	 * await expectLocator(page.locator('.user-email')).toBeValidEmail();
	 *
	 * @example
	 * // Check contact info
	 * await expectLocator(page.locator('[data-testid="email"]')).toBeValidEmail();
	 */
	async toBeValidEmail(locator: Locator, options?: { timeout?: number }) {
		const assertionName = "toBeValidEmail";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = isValidEmail(actual);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not be a valid email address\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to be a valid email address\n` +
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
	 * Asserts that the locator's text content is a valid URL.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate link text
	 * await expectLocator(page.locator('.website-url')).toBeValidUrl();
	 *
	 * @example
	 * // Check API endpoint display
	 * await expectLocator(page.locator('.api-url')).toBeValidUrl();
	 */
	async toBeValidUrl(locator: Locator, options?: { timeout?: number }) {
		const assertionName = "toBeValidUrl";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = isValidUrl(actual);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not be a valid URL\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return `${hint}\n\nExpected locator text to be a valid URL\nReceived: ${this.utils.printReceived(actual)}`;
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
	 * Asserts that the locator's text contains only letters and numbers.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate username format
	 * await expectLocator(page.locator('.username')).toBeAlphanumeric();
	 *
	 * @example
	 * // Check product code
	 * await expectLocator(page.locator('.product-code')).toBeAlphanumeric();
	 */
	async toBeAlphanumeric(locator: Locator, options?: { timeout?: number }) {
		const assertionName = "toBeAlphanumeric";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = isAlphanumeric(actual);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not be alphanumeric (only letters and numbers)\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to be alphanumeric (only letters and numbers)\n` +
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
	 * Asserts that the locator's text contains only numeric digits.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate PIN code
	 * await expectLocator(page.locator('.pin-code')).toBeNumericString();
	 *
	 * @example
	 * // Check ZIP code
	 * await expectLocator(page.locator('.zip-code')).toBeNumericString();
	 */
	async toBeNumericString(locator: Locator, options?: { timeout?: number }) {
		const assertionName = "toBeNumericString";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = isNumericString(actual);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not be numeric (only digits)\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to be numeric (only digits)\n` +
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
	 * Asserts that the locator's text is all uppercase letters.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate capitalized heading
	 * await expectLocator(page.locator('.heading')).toBeUpperCase();
	 *
	 * @example
	 * // Check state abbreviation
	 * await expectLocator(page.locator('.state-code')).toBeUpperCase();
	 */
	async toBeUpperCase(locator: Locator, options?: { timeout?: number }) {
		const assertionName = "toBeUpperCase";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = isUpperCase(actual);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not be all uppercase\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to be all uppercase\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Uppercase: ${this.utils.printExpected(actual.toUpperCase())}`
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
	 * Asserts that the locator's text is all lowercase letters.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate lowercase username
	 * await expectLocator(page.locator('.username')).toBeLowerCase();
	 *
	 * @example
	 * // Check email format
	 * await expectLocator(page.locator('.email')).toBeLowerCase();
	 */
	async toBeLowerCase(locator: Locator, options?: { timeout?: number }) {
		const assertionName = "toBeLowerCase";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = isLowerCase(actual);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not be all lowercase\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to be all lowercase\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Lowercase: ${this.utils.printExpected(actual.toLowerCase())}`
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
	 * Asserts that the locator's text is in title case (first letter of each word capitalized).
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate book title format
	 * await expectLocator(page.locator('.book-title')).toBeTitleCase();
	 *
	 * @example
	 * // Check proper name formatting
	 * await expectLocator(page.locator('.full-name')).toBeTitleCase();
	 */
	async toBeTitleCase(locator: Locator, options?: { timeout?: number }) {
		const assertionName = "toBeTitleCase";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = isTitleCase(actual);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not be in title case (first letter of each word capitalized)\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to be in title case (first letter of each word capitalized)\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Title case: ${this.utils.printExpected(toTitleCase(actual))}`
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
	 * Asserts that the locator's text is a valid UUID.
	 *
	 * @param locator - The Playwright locator to check
	 * @param version - Optional: specific UUID version to validate (1, 3, 4, or 5)
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Validate any UUID
	 * await expectLocator(page.locator('.transaction-id')).toBeUUID();
	 *
	 * @example
	 * // Validate specific UUID v4
	 * await expectLocator(page.locator('.user-id')).toBeUUID(4);
	 */
	async toBeUUID(locator: Locator, version?: 1 | 3 | 4 | 5, options?: { timeout?: number }) {
		const assertionName = "toBeUUID";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? 10_000,
			});
			pass = isValidUUID(actual, version);
		} catch (e: any) {
			actual = "";
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, version ? String(version) : undefined, {
				isNot: this.isNot,
			});

			const versionText = version ? ` v${version}` : "";

			if (errorMessage) {
				return `${hint}\n\nFailed to get text from locator:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to not be a valid UUID${versionText}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected locator text to be a valid UUID${versionText}\n` +
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

	/**
	 * Asserts that the locator's element has the specified placeholder attribute.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The expected placeholder text or regex pattern
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check input placeholder
	 * await expectLocator(page.locator('input[name="email"]')).toHavePlaceholder('Enter your email');
	 *
	 * @example
	 * // Validate placeholder with regex
	 * await expectLocator(page.locator('.search-input')).toHavePlaceholder(/search/i);
	 */
	async toHavePlaceholder(locator: Locator, expected: string | RegExp, options?: { timeout?: number }) {
		const assertionName = "toHavePlaceholder";
		let pass: boolean;
		let actual: string | null;
		let errorMessage: string | undefined;

		try {
			actual = await locator.getAttribute("placeholder", {
				timeout: options?.timeout ?? 10_000,
			});

			if (typeof expected === "string") {
				pass = actual === expected;
			} else {
				pass = actual !== null && expected.test(actual);
			}
		} catch (e: any) {
			actual = null;
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get placeholder attribute:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to not have placeholder: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have placeholder: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual === null ? "(no placeholder attribute)" : actual)}`
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
	 * Asserts that the locator's element has the specified href attribute.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The expected href value or regex pattern
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check link destination
	 * await expectLocator(page.locator('a.home-link')).toHaveHref('/');
	 *
	 * @example
	 * // Validate external link with regex
	 * await expectLocator(page.locator('.external-link')).toHaveHref(/^https:\/\//);
	 */
	async toHaveHref(locator: Locator, expected: string | RegExp, options?: { timeout?: number }) {
		const assertionName = "toHaveHref";
		let pass: boolean;
		let actual: string | null;
		let errorMessage: string | undefined;

		try {
			actual = await locator.getAttribute("href", {
				timeout: options?.timeout ?? 10_000,
			});

			if (typeof expected === "string") {
				pass = actual === expected;
			} else {
				pass = actual !== null && expected.test(actual);
			}
		} catch (e: any) {
			actual = null;
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get href attribute:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to not have href: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have href: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual === null ? "(no href attribute)" : actual)}`
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
	 * Asserts that the locator's element has the specified src attribute.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The expected src value or regex pattern
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check image source
	 * await expectLocator(page.locator('img.logo')).toHaveSrc('/images/logo.png');
	 *
	 * @example
	 * // Validate CDN source with regex
	 * await expectLocator(page.locator('.product-image')).toHaveSrc(/cdn\.example\.com/);
	 */
	async toHaveSrc(locator: Locator, expected: string | RegExp, options?: { timeout?: number }) {
		const assertionName = "toHaveSrc";
		let pass: boolean;
		let actual: string | null;
		let errorMessage: string | undefined;

		try {
			actual = await locator.getAttribute("src", {
				timeout: options?.timeout ?? 10_000,
			});

			if (typeof expected === "string") {
				pass = actual === expected;
			} else {
				pass = actual !== null && expected.test(actual);
			}
		} catch (e: any) {
			actual = null;
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get src attribute:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to not have src: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have src: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual === null ? "(no src attribute)" : actual)}`
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
	 * Asserts that the locator's element has the specified alt attribute.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The expected alt text or regex pattern
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check alt text for accessibility
	 * await expectLocator(page.locator('img.avatar')).toHaveAlt('User profile picture');
	 *
	 * @example
	 * // Validate alt text pattern
	 * await expectLocator(page.locator('.thumbnail')).toHaveAlt(/product image/i);
	 */
	async toHaveAlt(locator: Locator, expected: string | RegExp, options?: { timeout?: number }) {
		const assertionName = "toHaveAlt";
		let pass: boolean;
		let actual: string | null;
		let errorMessage: string | undefined;

		try {
			actual = await locator.getAttribute("alt", {
				timeout: options?.timeout ?? 10_000,
			});

			if (typeof expected === "string") {
				pass = actual === expected;
			} else {
				pass = actual !== null && expected.test(actual);
			}
		} catch (e: any) {
			actual = null;
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get alt attribute:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to not have alt: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have alt: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual === null ? "(no alt attribute)" : actual)}`
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
	 * Asserts that the locator's element has the specified title attribute.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The expected title text or regex pattern
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check tooltip text
	 * await expectLocator(page.locator('.help-icon')).toHaveTitle('Click for help');
	 *
	 * @example
	 * // Validate title attribute
	 * await expectLocator(page.locator('abbr')).toHaveTitle(/definition/i);
	 */
	async toHaveTitle(locator: Locator, expected: string | RegExp, options?: { timeout?: number }) {
		const assertionName = "toHaveTitle";
		let pass: boolean;
		let actual: string | null;
		let errorMessage: string | undefined;

		try {
			actual = await locator.getAttribute("title", {
				timeout: options?.timeout ?? 10_000,
			});

			if (typeof expected === "string") {
				pass = actual === expected;
			} else {
				pass = actual !== null && expected.test(actual);
			}
		} catch (e: any) {
			actual = null;
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get title attribute:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to not have title: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have title attribute: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual === null ? "(no title attribute)" : actual)}`
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
	 * Asserts that the locator's element has a data attribute with an optional expected value.
	 *
	 * @param locator - The Playwright locator to check
	 * @param name - The data attribute name (with or without 'data-' prefix)
	 * @param expected - Optional: expected attribute value or regex pattern
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check if data attribute exists
	 * await expectLocator(page.locator('.item')).toHaveDataAttribute('id');
	 *
	 * @example
	 * // Check data attribute value
	 * await expectLocator(page.locator('.item')).toHaveDataAttribute('status', 'active');
	 *
	 * @example
	 * // Validate with regex
	 * await expectLocator(page.locator('.item')).toHaveDataAttribute('price', /^\d+\.\d{2}$/);
	 */
	async toHaveDataAttribute(
		locator: Locator,
		name: string,
		expected?: string | RegExp,
		options?: { timeout?: number }
	) {
		const assertionName = "toHaveDataAttribute";
		let pass: boolean;
		let actual: string | null;
		let errorMessage: string | undefined;
		const attrName = name.startsWith("data-") ? name : `data-${name}`;

		try {
			actual = await locator.getAttribute(attrName, {
				timeout: options?.timeout ?? 10_000,
			});

			if (expected === undefined) {
				// Just check if attribute exists
				pass = actual !== null;
			} else if (typeof expected === "string") {
				pass = actual === expected;
			} else {
				pass = actual !== null && expected.test(actual);
			}
		} catch (e: any) {
			actual = null;
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(
				assertionName,
				undefined,
				expected === undefined ? `"${name}"` : `"${name}", ${JSON.stringify(expected)}`,
				{
					isNot: this.isNot,
				}
			);

			if (errorMessage) {
				return `${hint}\n\nFailed to get ${attrName} attribute:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				if (expected === undefined) {
					return (
						hint +
						"\n\n" +
						`Expected element to not have ${attrName} attribute\n` +
						`Received: ${this.utils.printReceived(actual)}`
					);
				}
				return (
					hint +
					"\n\n" +
					`Expected element to not have ${attrName}: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				if (expected === undefined) {
					return `${hint}\n\nExpected element to have ${attrName} attribute\nReceived: null`;
				}
				return (
					hint +
					"\n\n" +
					`Expected element to have ${attrName}: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual === null ? "(attribute not found)" : actual)}`
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
	 * Asserts that the locator's element has the specified aria-label attribute.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The expected aria-label text or regex pattern
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check accessibility label
	 * await expectLocator(page.locator('button.close')).toHaveAriaLabel('Close dialog');
	 *
	 * @example
	 * // Validate aria-label for screen readers
	 * await expectLocator(page.locator('.menu-btn')).toHaveAriaLabel(/menu/i);
	 */
	async toHaveAriaLabel(locator: Locator, expected: string | RegExp, options?: { timeout?: number }) {
		const assertionName = "toHaveAriaLabel";
		let pass: boolean;
		let actual: string | null;
		let errorMessage: string | undefined;

		try {
			actual = await locator.getAttribute("aria-label", {
				timeout: options?.timeout ?? 10_000,
			});

			if (typeof expected === "string") {
				pass = actual === expected;
			} else {
				pass = actual !== null && expected.test(actual);
			}
		} catch (e: any) {
			actual = null;
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get aria-label attribute:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to not have aria-label: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have aria-label: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual === null ? "(no aria-label attribute)" : actual)}`
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
	 * Asserts that the locator's element has the specified target attribute.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The expected target value or regex pattern
	 * @param options - Optional configuration (timeout)
	 *
	 * @example
	 * // Check if link opens in new tab
	 * await expectLocator(page.locator('a.external')).toHaveTarget('_blank');
	 *
	 * @example
	 * // Validate target attribute
	 * await expectLocator(page.locator('.help-link')).toHaveTarget(/_blank|_top/);
	 */
	async toHaveTarget(locator: Locator, expected: string | RegExp, options?: { timeout?: number }) {
		const assertionName = "toHaveTarget";
		let pass: boolean;
		let actual: string | null;
		let errorMessage: string | undefined;

		try {
			actual = await locator.getAttribute("target", {
				timeout: options?.timeout ?? 10_000,
			});

			if (typeof expected === "string") {
				pass = actual === expected;
			} else {
				pass = actual !== null && expected.test(actual);
			}
		} catch (e: any) {
			actual = null;
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\nFailed to get target attribute:\n${this.utils.printReceived(errorMessage)}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to not have target: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have target: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual === null ? "(no target attribute)" : actual)}`
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
});
