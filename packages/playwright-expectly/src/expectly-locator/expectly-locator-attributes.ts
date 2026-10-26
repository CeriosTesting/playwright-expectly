import type { LocatorSnapshot, MatcherReturnType } from "@cerios/playwright-expectly-core";
import { locatorNotFoundMessage, pollLocators, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect, Locator } from "@playwright/test";

import { matchesPattern } from "../matchers/text-validation-utils";

function attributeMatches(actual: string | null, expected: string | RegExp): boolean {
	if (typeof expected === "string") {
		return actual === expected;
	}
	return actual !== null && matchesPattern(actual, expected);
}

/** The attribute value, or `null` when the attribute (or the element) is missing. */
function attributeValue(snapshot: LocatorSnapshot<string | null> | undefined): string | null {
	return snapshot?.found ? snapshot.value : null;
}

/** Shared implementation for matchers that compare one attribute with a string or pattern. */
async function attributeMatcher(
	state: ExpectMatcherState,
	assertionName: string,
	attribute: string,
	locator: Locator,
	expected: string | RegExp,
	options: PollOptions | undefined,
): Promise<MatcherReturnType> {
	const { pass, snapshot } = await pollLocators(
		state,
		options,
		[locator],
		(actionOptions) => locator.getAttribute(attribute, actionOptions),
		(actual) => attributeMatches(actual, expected),
	);
	const actual = attributeValue(snapshot);

	const message = (): string => {
		const notFound = locatorNotFoundMessage(state, assertionName, snapshot);
		if (notFound) return notFound;
		const hint = state.utils.matcherHint(assertionName, undefined, undefined, {
			isNot: state.isNot,
		});

		if (pass && state.isNot) {
			return (
				hint +
				"\n\n" +
				`Expected element to not have ${attribute}: ${state.utils.printExpected(expected)}\n` +
				`Received: ${state.utils.printReceived(actual)}`
			);
		}

		if (!pass && !state.isNot) {
			return (
				hint +
				"\n\n" +
				`Expected element to have ${attribute}: ${state.utils.printExpected(expected)}\n` +
				`Received: ${state.utils.printReceived(actual ?? `(no ${attribute} attribute)`)}`
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
}

/** Shared implementation for matchers that check a boolean attribute is present. */
async function booleanAttributeMatcher(
	state: ExpectMatcherState,
	assertionName: string,
	attribute: string,
	locator: Locator,
	options: PollOptions | undefined,
): Promise<MatcherReturnType> {
	const { pass, snapshot } = await pollLocators(
		state,
		options,
		[locator],
		(actionOptions) => locator.getAttribute(attribute, actionOptions),
		(actual) => actual !== null,
	);

	const message = (): string => {
		const notFound = locatorNotFoundMessage(state, assertionName, snapshot);
		if (notFound) return notFound;
		const hint = state.utils.matcherHint(assertionName, undefined, undefined, {
			isNot: state.isNot,
		});

		if (pass && state.isNot) {
			return `${hint}\n\nExpected element to not be ${attribute}\nBut it has the ${attribute} attribute`;
		}

		if (!pass && !state.isNot) {
			return `${hint}\n\nExpected element to be ${attribute}\nBut it does not have the ${attribute} attribute`;
		}

		return hint;
	};

	return {
		message,
		pass,
		name: assertionName,
	};
}

/**
 * Element attribute matchers for Playwright locators.
 * These matchers validate HTML attributes on elements.
 */
export const expectlyLocatorAttributesMatchers = withMatcherState({
	async toHavePlaceholder(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		return attributeMatcher(this, "toHavePlaceholder", "placeholder", locator, expected, options);
	},
	async toHaveHref(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		return attributeMatcher(this, "toHaveHref", "href", locator, expected, options);
	},
	async toHaveSrc(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		return attributeMatcher(this, "toHaveSrc", "src", locator, expected, options);
	},
	async toHaveAlt(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		return attributeMatcher(this, "toHaveAlt", "alt", locator, expected, options);
	},
	async toHaveDataAttribute(locator: Locator, name: string, expected?: string | RegExp, options?: PollOptions) {
		const assertionName = "toHaveDataAttribute";
		const attrName = name.startsWith("data-") ? name : `data-${name}`;

		const { pass, snapshot } = await pollLocators(
			this,
			options,
			[locator],
			(actionOptions) => locator.getAttribute(attrName, actionOptions),
			(actual) => (expected === undefined ? actual !== null : attributeMatches(actual, expected)),
		);
		const actual = attributeValue(snapshot);

		const message = (): string => {
			const notFound = locatorNotFoundMessage(this, assertionName, snapshot);
			if (notFound) return notFound;
			const hint = this.utils.matcherHint(
				assertionName,
				undefined,
				expected === undefined ? `"${name}"` : `"${name}", ${this.utils.printExpected(expected)}`,
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
		return attributeMatcher(this, "toHaveAriaLabel", "aria-label", locator, expected, options);
	},
	async toHaveTarget(locator: Locator, expected: string | RegExp, options?: PollOptions) {
		return attributeMatcher(this, "toHaveTarget", "target", locator, expected, options);
	},
	async toBeRequired(locator: Locator, options?: PollOptions) {
		return booleanAttributeMatcher(this, "toBeRequired", "required", locator, options);
	},
	async toBeReadOnly(locator: Locator, options?: PollOptions) {
		return booleanAttributeMatcher(this, "toBeReadOnly", "readonly", locator, options);
	},
});

export const expectlyLocatorAttributes: Expect<typeof expectlyLocatorAttributesMatchers> = baseExpect.extend(
	expectlyLocatorAttributesMatchers,
);
