import { assertLocators, runPolledMatcher, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect, Locator } from "@playwright/test";

import type { StringOrderOptions } from "../matchers/common-utils";
import type { ExpectlyMatcherResult } from "../matchers/matcher-result";

export type TextOrderOptions = PollOptions &
	StringOrderOptions & {
		/** Reject equal neighbours (strictly ascending or descending). Default: `false`. */
		strict?: boolean;
		/** Ignore letter case when comparing strings. Default: `false`. */
		ignoreCase?: boolean;
		/**
		 * Converts each (trimmed) text before comparing, for example a price:
		 * `(text) => Number(text.replace(/[^\d.-]/g, ""))`. A `NaN` result counts as out of order.
		 */
		parse?: (text: string) => number | string;
		/** Read the rendered `innerText` instead of `textContent`. Default: `false`. */
		useInnerText?: boolean;
	};

type Order = "ascending" | "descending";

type OrderSnapshot = {
	texts: string[];
	values: (number | string)[];
	/** Index of the first pair (i, i + 1) out of order, or -1. */
	violation: number;
};

function stringCompare(options: TextOrderOptions | undefined): (left: string, right: string) => number {
	if (options?.numeric !== undefined || options?.locale !== undefined || options?.ignoreCase) {
		return new Intl.Collator(options.locale, {
			numeric: options.numeric ?? false,
			sensitivity: options.ignoreCase ? "accent" : "variant",
		}).compare;
	}
	return (left, right) => (left === right ? 0 : left < right ? -1 : 1);
}

function findViolation(
	values: readonly (number | string)[],
	order: Order,
	options: TextOrderOptions | undefined,
): number {
	const compareStrings = stringCompare(options);
	const compare = (left: number | string, right: number | string): number =>
		typeof left === "number" && typeof right === "number" ? left - right : compareStrings(String(left), String(right));
	for (let i = 0; i < values.length - 1; i++) {
		const [left, right] = [values[i], values[i + 1]];
		if (Number.isNaN(left) || Number.isNaN(right)) return i;
		const comparison = order === "ascending" ? compare(left, right) : compare(right, left);
		if (comparison > 0 || (options?.strict && comparison === 0)) return i;
	}
	return -1;
}

async function textOrderMatcher(
	state: ExpectMatcherState,
	assertionName: string,
	locator: Locator,
	order: Order,
	options: TextOrderOptions | undefined,
): Promise<ExpectlyMatcherResult> {
	assertLocators([locator]);
	let snapshot: OrderSnapshot | undefined;

	const pass = await runPolledMatcher(
		state,
		options && { timeout: options.timeout, intervals: options.intervals },
		async () => {
			const raw = options?.useInnerText ? await locator.allInnerTexts() : await locator.allTextContents();
			const texts = raw.map((text) => text.trim());
			// No elements yet: keep polling, and fail both forms if none ever appear, as for missing elements.
			if (texts.length === 0) {
				snapshot = undefined;
				return state.isNot;
			}
			const values = options?.parse ? texts.map((text) => options.parse!(text)) : texts;
			snapshot = { texts, values, violation: findViolation(values, order, options) };
			return snapshot.violation === -1;
		},
	);

	const strictness = options?.strict ? "strictly " : "";
	const message = (): string => {
		const hint = state.utils.matcherHint(assertionName, undefined, undefined, { isNot: state.isNot });
		if (!snapshot) return `${hint}\n\nError: element(s) not found`;
		const received = `Received texts (${snapshot.texts.length}): ${state.utils.printReceived(snapshot.texts)}`;
		if (state.isNot) {
			return `${hint}\n\nExpected texts to not be in ${strictness}${order} order\n${received}`;
		}
		const i = snapshot.violation;
		const pair = `${state.utils.printReceived(snapshot.values[i])} then ${state.utils.printReceived(snapshot.values[i + 1])}`;
		return (
			hint +
			"\n\n" +
			`Expected texts to be in ${strictness}${order} order\n` +
			`First violation at index ${i} → ${i + 1}: ${pair}\n` +
			received
		);
	};

	return {
		message,
		pass,
		name: assertionName,
		actual: snapshot?.texts,
	};
}

/**
 * Ordering matchers for the texts of all elements a locator matches, such as a sorted table column.
 * They retry until the texts are in order, so they can follow a click on a sort button directly.
 */
export const expectlyLocatorOrderMatchers = withMatcherState({
	async toHaveTextsInAscendingOrder(locator: Locator, options?: TextOrderOptions) {
		return textOrderMatcher(this, "toHaveTextsInAscendingOrder", locator, "ascending", options);
	},
	async toHaveTextsInDescendingOrder(locator: Locator, options?: TextOrderOptions) {
		return textOrderMatcher(this, "toHaveTextsInDescendingOrder", locator, "descending", options);
	},
});

export const expectlyLocatorOrder: Expect<typeof expectlyLocatorOrderMatchers> =
	baseExpect.extend(expectlyLocatorOrderMatchers);
