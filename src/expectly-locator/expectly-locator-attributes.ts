import { expect as baseExpect, Locator } from "@playwright/test";

/**
 * Element attribute matchers for Playwright locators.
 * These matchers validate HTML attributes on elements.
 */
export const expectlyLocatorAttributes = baseExpect.extend({
	/**
	 * Asserts that the locator's element has the specified placeholder attribute.
	 *
	 * @param locator - The Playwright locator to check
	 * @param expected - The expected placeholder text or regex pattern
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check input placeholder
	 * await expectLocator(page.locator('input[name="email"]')).toHavePlaceholder('Enter your email');
	 *
	 * @example
	 * // Validate placeholder with regex
	 * await expectLocator(page.locator('.search-input')).toHavePlaceholder(/search/i);
	 */
	async toHavePlaceholder(
		locator: Locator,
		expected: string | RegExp,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check link destination
	 * await expectLocator(page.locator('a.home-link')).toHaveHref('/');
	 *
	 * @example
	 * // Validate external link with regex
	 * await expectLocator(page.locator('.external-link')).toHaveHref(/^https:\/\//);
	 */
	async toHaveHref(
		locator: Locator,
		expected: string | RegExp,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check image source
	 * await expectLocator(page.locator('img.logo')).toHaveSrc('/images/logo.png');
	 *
	 * @example
	 * // Validate CDN source with regex
	 * await expectLocator(page.locator('.product-image')).toHaveSrc(/cdn\.example\.com/);
	 */
	async toHaveSrc(
		locator: Locator,
		expected: string | RegExp,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check alt text for accessibility
	 * await expectLocator(page.locator('img.avatar')).toHaveAlt('User profile picture');
	 *
	 * @example
	 * // Validate alt text pattern
	 * await expectLocator(page.locator('.thumbnail')).toHaveAlt(/product image/i);
	 */
	async toHaveAlt(
		locator: Locator,
		expected: string | RegExp,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
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
	 * Asserts that the locator's element has a data attribute with an optional expected value.
	 *
	 * @param locator - The Playwright locator to check
	 * @param name - The data attribute name (with or without 'data-' prefix)
	 * @param expected - Optional: expected attribute value or regex pattern
	 * @param options - Optional configuration
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
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check accessibility label
	 * await expectLocator(page.locator('button.close')).toHaveAriaLabel('Close dialog');
	 *
	 * @example
	 * // Validate aria-label for screen readers
	 * await expectLocator(page.locator('.menu-btn')).toHaveAriaLabel(/menu/i);
	 */
	async toHaveAriaLabel(
		locator: Locator,
		expected: string | RegExp,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
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
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check if link opens in new tab
	 * await expectLocator(page.locator('a.external')).toHaveTarget('_blank');
	 *
	 * @example
	 * // Validate target attribute
	 * await expectLocator(page.locator('.help-link')).toHaveTarget(/_blank|_top/);
	 */
	async toHaveTarget(
		locator: Locator,
		expected: string | RegExp,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
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
	/**
	 * Asserts that the locator's element is required (has the required attribute).
	 * Applies to form input elements.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check if input is required
	 * await expectLocator(page.locator('input[name="email"]')).toBeRequired();
	 *
	 * @example
	 * // Validate select is required
	 * await expectLocator(page.locator('select[name="country"]')).toBeRequired();
	 */
	async toBeRequired(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
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
	/**
	 * Asserts that the locator's element is readonly (has the readonly attribute).
	 * Applies to input and textarea elements.
	 *
	 * @param locator - The Playwright locator to check
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check if input is readonly
	 * await expectLocator(page.locator('input[name="username"]')).toBeReadOnly();
	 *
	 * @example
	 * // Validate textarea is readonly
	 * await expectLocator(page.locator('textarea.readonly-field')).toBeReadOnly();
	 */
	async toBeReadOnly(
		locator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
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
						} catch (e: any) {
							locatorError = e;
							throw e;
						}
					},
					{ timeout: options?.timeout ?? this.timeout, intervals: [0, 20, 50, 100, 100, 250, 250] }
				)
				.toBe(true);
			pass = true;
		} catch {
			if (locatorError) {
				throw locatorError;
			}
		}

		const message = () => {
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
