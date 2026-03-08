import { expect as baseExpect, Locator } from "@playwright/test";

import { withMatcherState } from "../matchers/matcher-state-utils";
import { PollOptions } from "../types/poll-options";

/**
 * Element positioning matchers for Playwright locators.
 * These matchers validate spatial relationships between elements.
 */
export const expectlyLocatorPositioningMatchers = withMatcherState({
	async toBeAbove(locator: Locator, otherLocator: Locator, options?: PollOptions) {
		const assertionName = "toBeAbove";
		let pass: boolean = false;
		let actualBottom: number | undefined;
		let otherTop: number | undefined;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							const [box, otherBox] = await Promise.all([locator.boundingBox(), otherLocator.boundingBox()]);

							if (!box || !otherBox) {
								return false;
							}

							actualBottom = box.y + box.height;
							otherTop = otherBox.y;
							return actualBottom <= otherTop;
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
	async toBeBelow(locator: Locator, otherLocator: Locator, options?: PollOptions) {
		const assertionName = "toBeBelow";
		let pass: boolean = false;
		let actualTop: number | undefined;
		let otherBottom: number | undefined;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							const [box, otherBox] = await Promise.all([locator.boundingBox(), otherLocator.boundingBox()]);

							if (!box || !otherBox) {
								return false;
							}

							actualTop = box.y;
							otherBottom = otherBox.y + otherBox.height;
							return actualTop >= otherBottom;
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
	async toBeLeftOf(locator: Locator, otherLocator: Locator, options?: PollOptions) {
		const assertionName = "toBeLeftOf";
		let pass: boolean = false;
		let actualRight: number | undefined;
		let otherLeft: number | undefined;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							const [box, otherBox] = await Promise.all([locator.boundingBox(), otherLocator.boundingBox()]);

							if (!box || !otherBox) {
								return false;
							}

							actualRight = box.x + box.width;
							otherLeft = otherBox.x;
							return actualRight <= otherLeft;
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
	async toBeRightOf(locator: Locator, otherLocator: Locator, options?: PollOptions) {
		const assertionName = "toBeRightOf";
		let pass: boolean = false;
		let actualLeft: number | undefined;
		let otherRight: number | undefined;
		let locatorError: Error | undefined;

		try {
			await baseExpect
				.poll(
					async () => {
						try {
							const [box, otherBox] = await Promise.all([locator.boundingBox(), otherLocator.boundingBox()]);

							if (!box || !otherBox) {
								return false;
							}

							actualLeft = box.x;
							otherRight = otherBox.x + otherBox.width;
							return actualLeft >= otherRight;
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

export const expectlyLocatorPositioning = baseExpect.extend(expectlyLocatorPositioningMatchers);
