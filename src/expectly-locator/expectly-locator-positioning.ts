import { expect as baseExpect, Locator } from "@playwright/test";

/**
 * Element positioning matchers for Playwright locators.
 * These matchers validate spatial relationships between elements.
 */
export const expectlyLocatorPositioning = baseExpect.extend({
	/**
	 * Asserts that the locator's element is positioned above another element.
	 * Compares the bottom edge of the current element with the top edge of the other element.
	 *
	 * @param locator - The Playwright locator to check
	 * @param otherLocator - The locator to compare against
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check if header is above content
	 * await expectLocator(page.locator('header')).toBeAbove(page.locator('main'));
	 *
	 * @example
	 * // Validate navigation is above footer
	 * await expectLocator(page.locator('nav')).toBeAbove(page.locator('footer'));
	 */
	async toBeAbove(
		locator: Locator,
		otherLocator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeAbove";
		let pass: boolean;
		let errorMessage: string | undefined;
		let actualBottom: number | undefined;
		let otherTop: number | undefined;

		try {
			const [box, otherBox] = await Promise.all([
				locator.boundingBox({ timeout: options?.timeout ?? this.timeout }),
				otherLocator.boundingBox({ timeout: options?.timeout ?? this.timeout }),
			]);

			if (!box) {
				errorMessage = "First element not found or not visible";
				pass = false;
			} else if (!otherBox) {
				errorMessage = "Second element not found or not visible";
				pass = false;
			} else {
				actualBottom = box.y + box.height;
				otherTop = otherBox.y;
				pass = actualBottom <= otherTop;
			}
		} catch (e: any) {
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\n${errorMessage}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected first element to not be above second element\n` +
					`First element bottom: ${actualBottom}px\n` +
					`Second element top: ${otherTop}px`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected first element to be above second element\n` +
					`First element bottom: ${actualBottom}px\n` +
					`Second element top: ${otherTop}px\n` +
					`First element must end at or before second element starts`
				);
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
	 * Asserts that the locator's element is positioned below another element.
	 * Compares the top edge of the current element with the bottom edge of the other element.
	 *
	 * @param locator - The Playwright locator to check
	 * @param otherLocator - The locator to compare against
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check if footer is below content
	 * await expectLocator(page.locator('footer')).toBeBelow(page.locator('main'));
	 *
	 * @example
	 * // Validate content is below header
	 * await expectLocator(page.locator('main')).toBeBelow(page.locator('header'));
	 */
	async toBeBelow(
		locator: Locator,
		otherLocator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeBelow";
		let pass: boolean;
		let errorMessage: string | undefined;
		let actualTop: number | undefined;
		let otherBottom: number | undefined;

		try {
			const [box, otherBox] = await Promise.all([
				locator.boundingBox({ timeout: options?.timeout ?? this.timeout }),
				otherLocator.boundingBox({ timeout: options?.timeout ?? this.timeout }),
			]);

			if (!box) {
				errorMessage = "First element not found or not visible";
				pass = false;
			} else if (!otherBox) {
				errorMessage = "Second element not found or not visible";
				pass = false;
			} else {
				actualTop = box.y;
				otherBottom = otherBox.y + otherBox.height;
				pass = actualTop >= otherBottom;
			}
		} catch (e: any) {
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\n${errorMessage}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected first element to not be below second element\n` +
					`First element top: ${actualTop}px\n` +
					`Second element bottom: ${otherBottom}px`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected first element to be below second element\n` +
					`First element top: ${actualTop}px\n` +
					`Second element bottom: ${otherBottom}px\n` +
					`First element must start at or after second element ends`
				);
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
	 * Asserts that the locator's element is positioned to the left of another element.
	 * Compares the right edge of the current element with the left edge of the other element.
	 *
	 * @param locator - The Playwright locator to check
	 * @param otherLocator - The locator to compare against
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check if sidebar is left of content
	 * await expectLocator(page.locator('.sidebar')).toBeLeftOf(page.locator('.content'));
	 *
	 * @example
	 * // Validate icon is left of text
	 * await expectLocator(page.locator('.icon')).toBeLeftOf(page.locator('.label'));
	 */
	async toBeLeftOf(
		locator: Locator,
		otherLocator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeLeftOf";
		let pass: boolean;
		let errorMessage: string | undefined;
		let actualRight: number | undefined;
		let otherLeft: number | undefined;

		try {
			const [box, otherBox] = await Promise.all([
				locator.boundingBox({ timeout: options?.timeout ?? this.timeout }),
				otherLocator.boundingBox({ timeout: options?.timeout ?? this.timeout }),
			]);

			if (!box) {
				errorMessage = "First element not found or not visible";
				pass = false;
			} else if (!otherBox) {
				errorMessage = "Second element not found or not visible";
				pass = false;
			} else {
				actualRight = box.x + box.width;
				otherLeft = otherBox.x;
				pass = actualRight <= otherLeft;
			}
		} catch (e: any) {
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\n${errorMessage}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected first element to not be left of second element\n` +
					`First element right edge: ${actualRight}px\n` +
					`Second element left edge: ${otherLeft}px`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected first element to be left of second element\n` +
					`First element right edge: ${actualRight}px\n` +
					`Second element left edge: ${otherLeft}px\n` +
					`First element must end at or before second element starts`
				);
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
	 * Asserts that the locator's element is positioned to the right of another element.
	 * Compares the left edge of the current element with the right edge of the other element.
	 *
	 * @param locator - The Playwright locator to check
	 * @param otherLocator - The locator to compare against
	 * @param options - Optional configuration
	 *
	 * @example
	 * // Check if content is right of sidebar
	 * await expectLocator(page.locator('.content')).toBeRightOf(page.locator('.sidebar'));
	 *
	 * @example
	 * // Validate text is right of icon
	 * await expectLocator(page.locator('.label')).toBeRightOf(page.locator('.icon'));
	 */
	async toBeRightOf(
		locator: Locator,
		otherLocator: Locator,
		options?: {
			/**
			 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
			 */
			timeout?: number;
		}
	) {
		const assertionName = "toBeRightOf";
		let pass: boolean;
		let errorMessage: string | undefined;
		let actualLeft: number | undefined;
		let otherRight: number | undefined;

		try {
			const [box, otherBox] = await Promise.all([
				locator.boundingBox({ timeout: options?.timeout ?? this.timeout }),
				otherLocator.boundingBox({ timeout: options?.timeout ?? this.timeout }),
			]);

			if (!box) {
				errorMessage = "First element not found or not visible";
				pass = false;
			} else if (!otherBox) {
				errorMessage = "Second element not found or not visible";
				pass = false;
			} else {
				actualLeft = box.x;
				otherRight = otherBox.x + otherBox.width;
				pass = actualLeft >= otherRight;
			}
		} catch (e: any) {
			errorMessage = e.message;
			pass = false;
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (errorMessage) {
				return `${hint}\n\n${errorMessage}`;
			}

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected first element to not be right of second element\n` +
					`First element left edge: ${actualLeft}px\n` +
					`Second element right edge: ${otherRight}px`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected first element to be right of second element\n` +
					`First element left edge: ${actualLeft}px\n` +
					`Second element right edge: ${otherRight}px\n` +
					`First element must start at or after second element ends`
				);
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
