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
} from "../matchers/text-validation-utils";

/**
 * Text content validation matchers for Playwright locators.
 * These matchers validate the text content of elements.
 */
export const expectlyLocatorText = baseExpect.extend({
	/**
	 * Asserts that the locator's text content starts with the expected string.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The string that should appear at the start
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check greeting message
	 * await expectLocator(page.locator('.welcome')).toStartWith('Hello, ');
	 *
	 * @example
	 * // Validate prefix in title
	 * await expectLocator(page.locator('h1')).toStartWith('Chapter 1:');
	 */
	async toStartWith(
		locator: Locator,
		expected: string,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toStartWith";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check file extension in filename
	 * await expectLocator(page.locator('.filename')).toEndWith('.pdf');
	 *
	 * @example
	 * // Validate suffix in text
	 * await expectLocator(page.locator('.price')).toEndWith(' USD');
	 */
	async toEndWith(
		locator: Locator,
		expected: string,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toEndWith";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate phone number format
	 * await expectLocator(page.locator('.phone')).toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
	 *
	 * @example
	 * // Check alphanumeric ID
	 * await expectLocator(page.locator('.order-id')).toMatchPattern(/^[A-Z0-9]{8}$/);
	 */
	async toMatchPattern(
		locator: Locator,
		pattern: RegExp,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toMatchPattern";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate email in profile
	 * await expectLocator(page.locator('.user-email')).toBeValidEmail();
	 *
	 * @example
	 * // Check contact info
	 * await expectLocator(page.locator('[data-testid="email"]')).toBeValidEmail();
	 */
	async toBeValidEmail(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeValidEmail";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate link text
	 * await expectLocator(page.locator('.website-url')).toBeValidUrl();
	 *
	 * @example
	 * // Check API endpoint display
	 * await expectLocator(page.locator('.api-url')).toBeValidUrl();
	 */
	async toBeValidUrl(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeValidUrl";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate username format
	 * await expectLocator(page.locator('.username')).toBeAlphanumeric();
	 *
	 * @example
	 * // Check product code
	 * await expectLocator(page.locator('.product-code')).toBeAlphanumeric();
	 */
	async toBeAlphanumeric(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeAlphanumeric";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate PIN code
	 * await expectLocator(page.locator('.pin-code')).toBeNumericString();
	 *
	 * @example
	 * // Check ZIP code
	 * await expectLocator(page.locator('.zip-code')).toBeNumericString();
	 */
	async toBeNumericString(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeNumericString";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate capitalized heading
	 * await expectLocator(page.locator('.heading')).toBeUpperCase();
	 *
	 * @example
	 * // Check state abbreviation
	 * await expectLocator(page.locator('.state-code')).toBeUpperCase();
	 */
	async toBeUpperCase(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeUpperCase";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate lowercase username
	 * await expectLocator(page.locator('.username')).toBeLowerCase();
	 *
	 * @example
	 * // Check email format
	 * await expectLocator(page.locator('.email')).toBeLowerCase();
	 */
	async toBeLowerCase(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeLowerCase";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate book title format
	 * await expectLocator(page.locator('.book-title')).toBeTitleCase();
	 *
	 * @example
	 * // Check proper name formatting
	 * await expectLocator(page.locator('.full-name')).toBeTitleCase();
	 */
	async toBeTitleCase(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeTitleCase";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Validate any UUID
	 * await expectLocator(page.locator('.transaction-id')).toBeUUID();
	 *
	 * @example
	 * // Validate specific UUID v4
	 * await expectLocator(page.locator('.user-id')).toBeUUID(4);
	 */
	async toBeUUID(
		locator: Locator,
		version?: 1 | 3 | 4 | 5,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeUUID";
		let pass: boolean;
		let actual: string;
		let errorMessage: string | undefined;

		try {
			actual = await locator.innerText({
				timeout: options?.timeout ?? this.timeout,
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
	 * Asserts that the locator has the expected text, ignoring the text from any child elements.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expectedText - The expected direct text (excluding nested elements)
	 * @param options - Optional configuration
	 *
	 * @example
	 * // HTML: <div>new value<span class="example-class">old value</span></div>
	 * // This will pass:
	 * await expectLocator(page.locator('div')).toHaveDirectText('new value');
	 *
	 * @example
	 * // This will fail (nested elements are ignored):
	 * await expectLocator(page.locator('div')).toHaveDirectText('new valueold value');
	 */
	async toHaveDirectText(
		locator: Locator,
		expectedText: string,
		options: { timeout?: number } = { timeout: 3000 }
	): Promise<{ pass: boolean; message: () => string }> {
		const pollInterval = 100;
		const timeout = options.timeout ?? 3000;
		const start = Date.now();
		let directText = "";
		while (Date.now() - start < timeout) {
			directText = await locator.evaluate(el =>
				Array.from(el.childNodes)
					.filter(n => n.nodeType === Node.TEXT_NODE)
					.map(n => n.textContent)
					.join("")
					.trim()
					.replace(/\s+/g, " ")
			);
			if (directText === expectedText) break;
			await new Promise(res => setTimeout(res, pollInterval));
		}
		const pass = directText === expectedText;
		return {
			pass,
			message: () =>
				pass
					? `Expected direct text NOT to be "${expectedText}", but it was.`
					: `Timed out: ${timeout}ms.\n\nLocator: ${locator}\nExpected string: "${expectedText}" \nReceived string: "${directText}"`,
		};
	},
});
