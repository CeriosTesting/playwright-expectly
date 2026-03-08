import { expect as baseExpect, Locator } from "@playwright/test";

import { withMatcherState } from "../matchers/matcher-state-utils";
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
import { PollOptions } from "../types/poll-options";

/**
 * Text content validation matchers for Playwright locators.
 * These matchers validate the text content of elements.
 */
export const expectlyLocatorTextMatchers = withMatcherState({
	async toStartWith(locator: Locator, expected: string, options?: PollOptions) {
		const assertionName = "toStartWith";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return actual.startsWith(expected);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toEndWith(locator: Locator, expected: string, options?: PollOptions) {
		const assertionName = "toEndWith";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return actual.endsWith(expected);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toMatchPattern(locator: Locator, pattern: RegExp, options?: PollOptions) {
		const assertionName = "toMatchPattern";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return pattern.test(actual);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toBeValidEmail(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeValidEmail";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return isValidEmail(actual);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toBeValidUrl(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeValidUrl";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return isValidUrl(actual);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toBeAlphanumeric(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeAlphanumeric";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return isAlphanumeric(actual);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toBeNumericString(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeNumericString";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return isNumericString(actual);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toBeUpperCase(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeUpperCase";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return isUpperCase(actual);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toBeLowerCase(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeLowerCase";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return isLowerCase(actual);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toBeTitleCase(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeTitleCase";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return isTitleCase(actual);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

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
	async toBeUUID(locator: Locator, version?: 1 | 3 | 4 | 5, options?: PollOptions) {
		const assertionName = "toBeUUID";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.innerText();
							return isValidUUID(actual, version);
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, version ? String(version) : undefined, {
				isNot: this.isNot,
			});

			const versionText = version ? ` v${version}` : "";

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

	async toHaveDirectText(locator: Locator, expectedText: string, options?: PollOptions) {
		const assertionName = "toHaveDirectText";
		let pass: boolean = false;
		let actual: string = "";
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.evaluate((el) =>
								Array.from(el.childNodes)
									.filter((n) => n.nodeType === Node.TEXT_NODE)
									.map((n) => n.textContent)
									.join("")
									.trim()
									.replace(/\s+/g, " "),
							);
							return actual === expectedText;
						} catch (e: unknown) {
							locatorError = e instanceof Error ? e : new Error(String(e));
							throw e;
						}
					},
					{
						timeout: options?.timeout ?? this.timeout,
						intervals: options?.intervals,
					},
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected direct text to not be: ${this.utils.printExpected(expectedText)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected direct text to be: ${this.utils.printExpected(expectedText)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedText,
			actual,
		};
	},
});

export const expectlyLocatorText = baseExpect.extend(expectlyLocatorTextMatchers);
