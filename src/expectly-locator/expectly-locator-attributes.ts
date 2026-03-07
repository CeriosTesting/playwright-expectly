import { expect as baseExpect, Locator } from "@playwright/test";

import { withMatcherState } from "../matchers/matcher-state-utils";
import { PollOptions } from "../types/poll-options";

/**
 * Element attribute matchers for Playwright locators.
 * These matchers validate HTML attributes on elements.
 */
export const expectlyLocatorAttributesMatchers = withMatcherState({
	async toHavePlaceholder(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		const assertionName = "toHavePlaceholder";
		let pass: boolean = false;
		let actual: string | null = null;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.getAttribute("placeholder");
							if (typeof expected === "string") {
								return actual === expected;
							}
							return actual !== null && expected.test(actual);
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
					`Expected element to not have placeholder: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have placeholder: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual ?? "(no placeholder attribute)")}`
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
	async toHaveHref(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		const assertionName = "toHaveHref";
		let pass: boolean = false;
		let actual: string | null = null;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.getAttribute("href");
							if (typeof expected === "string") {
								return actual === expected;
							}
							return actual !== null && expected.test(actual);
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
					`Expected element to not have href: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have href: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual ?? "(no href attribute)")}`
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
	async toHaveSrc(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		const assertionName = "toHaveSrc";
		let pass: boolean = false;
		let actual: string | null = null;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.getAttribute("src");
							if (typeof expected === "string") {
								return actual === expected;
							}
							return actual !== null && expected.test(actual);
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
					`Expected element to not have src: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have src: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual ?? "(no src attribute)")}`
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
	async toHaveAlt(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		const assertionName = "toHaveAlt";
		let pass: boolean = false;
		let actual: string | null = null;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.getAttribute("alt");
							if (typeof expected === "string") {
								return actual === expected;
							}
							return actual !== null && expected.test(actual);
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
					`Expected element to not have alt: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have alt: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual ?? "(no alt attribute)")}`
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
	async toHaveDataAttribute(locator: Locator, name: string, expected?: string | RegExp, options?: PollOptions) {
		const assertionName = "toHaveDataAttribute";
		let pass: boolean = false;
		let actual: string | null = null;
		let locatorError: Error | undefined;
		const attrName = name.startsWith("data-") ? name : `data-${name}`;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.getAttribute(attrName);
							if (expected === undefined) {
								return actual !== null;
							}
							if (typeof expected === "string") {
								return actual === expected;
							}
							return actual !== null && expected.test(actual);
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
			const hint = this.utils.matcherHint(
				assertionName,
				undefined,
				expected === undefined ? `"${name}"` : `"${name}", ${JSON.stringify(expected)}`,
				{
					isNot: this.isNot,
				},
			);

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
					`Received: ${this.utils.printReceived(actual ?? "(attribute not found)")}`
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
	async toHaveAriaLabel(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		const assertionName = "toHaveAriaLabel";
		let pass: boolean = false;
		let actual: string | null = null;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.getAttribute("aria-label");
							if (typeof expected === "string") {
								return actual === expected;
							}
							return actual !== null && expected.test(actual);
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
					`Expected element to not have aria-label: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have aria-label: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual ?? "(no aria-label attribute)")}`
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
	async toHaveTarget(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		const assertionName = "toHaveTarget";
		let pass: boolean = false;
		let actual: string | null = null;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							actual = await locator.getAttribute("target");
							if (typeof expected === "string") {
								return actual === expected;
							}
							return actual !== null && expected.test(actual);
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
					`Expected element to not have target: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected element to have target: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual ?? "(no target attribute)")}`
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
	async toBeRequired(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeRequired";
		let pass: boolean = false;
		let hasAttribute: boolean = false;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							const requiredAttr = await locator.getAttribute("required");
							hasAttribute = requiredAttr !== null;
							return hasAttribute;
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
				return `${hint}\n\nExpected element to not be required\nBut it has the required attribute`;
			}

			if (!pass && !this.isNot) {
				return `${hint}\n\nExpected element to be required\nBut it does not have the required attribute`;
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
		};
	},
	async toBeReadOnly(locator: Locator, options?: PollOptions) {
		const assertionName = "toBeReadOnly";
		let pass: boolean = false;
		let hasAttribute: boolean = false;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							const readonlyAttr = await locator.getAttribute("readonly");
							hasAttribute = readonlyAttr !== null;
							return hasAttribute;
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
				return `${hint}\n\nExpected element to not be readonly\nBut it has the readonly attribute`;
			}

			if (!pass && !this.isNot) {
				return `${hint}\n\nExpected element to be readonly\nBut it does not have the readonly attribute`;
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
		};
	},
});

export const expectlyLocatorAttributes = baseExpect.extend(expectlyLocatorAttributesMatchers);
