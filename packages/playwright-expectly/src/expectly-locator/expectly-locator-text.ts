import type { LocatorPollResult, LocatorSnapshot } from "@cerios/playwright-expectly-core";
import { locatorNotFoundMessage, pollLocators, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect, Locator } from "@playwright/test";

import type { UrlValidationOptions, UUIDVersion } from "../matchers/text-validation-utils";
import { matchesPattern } from "../matchers/text-validation-utils";
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

type TextPollResult = { pass: boolean; actual: string; snapshot: LocatorSnapshot<string> | undefined };

function textResult({ pass, snapshot }: LocatorPollResult<string>): TextPollResult {
	return { pass, actual: snapshot?.found ? snapshot.value : "", snapshot };
}

/** Polls the element's `innerText` until `check` gives the desired result. */
async function pollInnerText(
	state: ExpectMatcherState,
	locator: Locator,
	options: PollOptions | undefined,
	check: (text: string) => boolean,
): Promise<TextPollResult> {
	return textResult(
		await pollLocators(state, options, [locator], (actionOptions) => locator.innerText(actionOptions), check),
	);
}

/** Splits matcher options from polling options. */
function pollOptions(options: (PollOptions & object) | undefined): PollOptions | undefined {
	if (!options) return undefined;
	return { timeout: options.timeout, intervals: options.intervals };
}

/** Whitespace normalization used for direct text, applied to both sides. */
function normalizeWhitespace(text: string): string {
	return text.trim().replace(/\s+/g, " ");
}

/**
 * Text content validation matchers for Playwright locators.
 * These matchers validate the text content of elements.
 */
export const expectlyLocatorTextMatchers = withMatcherState({
	async toStartWith(locator: Locator, expected: string, options?: PollOptions) {
		const assertionName = "toStartWith";
		const result = await pollInnerText(this, locator, options, (text) => text.startsWith(expected));
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
		const result = await pollInnerText(this, locator, options, (text) => text.endsWith(expected));
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
		// Validate before polling so a wrong argument fails immediately.
		matchesPattern("", pattern);
		const result = await pollInnerText(this, locator, options, (text) => matchesPattern(text, pattern));
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
		const result = await pollInnerText(this, locator, options, isValidEmail);
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
	async toBeValidUrl(locator: Locator, options?: PollOptions & UrlValidationOptions) {
		const assertionName = "toBeValidUrl";
		const result = await pollInnerText(this, locator, pollOptions(options), (text) => isValidUrl(text, options));
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
	async toBeAlphanumeric(locator: Locator, options?: PollOptions & { unicode?: boolean }) {
		const assertionName = "toBeAlphanumeric";
		const unicode = options?.unicode ?? false;
		const result = await pollInnerText(this, locator, pollOptions(options), (text) => isAlphanumeric(text, unicode));
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
		const result = await pollInnerText(this, locator, options, isNumericString);
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
		const result = await pollInnerText(this, locator, options, isUpperCase);
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
		const result = await pollInnerText(this, locator, options, isLowerCase);
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
		const result = await pollInnerText(this, locator, options, isTitleCase);
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
	async toBeUUID(locator: Locator, version?: UUIDVersion, options?: PollOptions) {
		const assertionName = "toBeUUID";
		const result = await pollInnerText(this, locator, options, (text) => isValidUUID(text, version));
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
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
		// The element's text is whitespace-normalized, so the expected text must be too.
		const expected = normalizeWhitespace(expectedText);
		const result = textResult(
			await pollLocators(
				this,
				options,
				[locator],
				async (actionOptions) =>
					normalizeWhitespace(
						await locator.evaluate(
							(el) =>
								Array.from(el.childNodes)
									.filter((n) => n.nodeType === Node.TEXT_NODE)
									.map((n) => n.textContent)
									.join(""),
							undefined,
							actionOptions,
						),
					),
				(text) => text === expected,
			),
		);
		const { pass, actual } = result;

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, result.snapshot);
			if (notFound) return notFound;
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected direct text to not be: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected direct text to be: ${this.utils.printExpected(expected)}\n` +
					`Received: ${this.utils.printReceived(actual)}`
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

export const expectlyLocatorText: Expect<typeof expectlyLocatorTextMatchers> =
	baseExpect.extend(expectlyLocatorTextMatchers);
