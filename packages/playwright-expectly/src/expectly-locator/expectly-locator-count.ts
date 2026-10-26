import { runPolledMatcher, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect, Locator } from "@playwright/test";

import type { ExpectlyMatcherResult } from "../matchers/matcher-result";

import { countVisibleElements } from "./expectly-locator-visibility";

export type CountOptions = PollOptions & {
	/** Count only visible elements. Default: `false` (all matching elements, like `toHaveCount`). */
	visible?: boolean;
};

function validateCount(assertionName: string, label: string, value: unknown): asserts value is number {
	if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
		throw new TypeError(`${assertionName}: ${label} must be a non-negative integer, got: ${String(value)}`);
	}
}

/** Counts matching elements without waiting for any of them, optionally only the visible ones. */
async function countElements(locator: Locator, visible: boolean): Promise<number> {
	return visible ? countVisibleElements(locator) : locator.count();
}

type CountRule = {
	assertionName: string;
	/** "more than 3", "between 2 and 5", … */
	description: string;
	/** Printed in the matcher hint, e.g. "3" or "2, 5". */
	hintArgs: string;
	holds: (count: number) => boolean;
	expected: unknown;
};

async function countMatcher(
	state: ExpectMatcherState,
	locator: Locator,
	rule: CountRule,
	options: CountOptions | undefined,
): Promise<ExpectlyMatcherResult> {
	const visible = options?.visible ?? false;
	let actualCount = 0;

	const pass = await runPolledMatcher(
		state,
		options && { timeout: options.timeout, intervals: options.intervals },
		async () => {
			actualCount = await countElements(locator, visible);
			return rule.holds(actualCount);
		},
	);

	const elements = visible ? "visible elements" : "elements";
	const message = (): string => {
		const hint = state.utils.matcherHint(rule.assertionName, undefined, rule.hintArgs, {
			isNot: state.isNot,
		});
		return (
			hint +
			"\n\n" +
			`Expected number of ${elements} to ${state.isNot ? "not " : ""}be ${rule.description}\n` +
			`Received: ${state.utils.printReceived(actualCount)}`
		);
	};

	return {
		message,
		pass,
		name: rule.assertionName,
		expected: rule.expected,
		actual: actualCount,
	};
}

/**
 * Element count range matchers for Playwright locators: retrying alternatives to
 * `expect.poll(() => locator.count()).toBeGreaterThan(n)`.
 */
export const expectlyLocatorCountMatchers = withMatcherState({
	async toHaveCountGreaterThan(locator: Locator, count: number, options?: CountOptions) {
		const assertionName = "toHaveCountGreaterThan";
		validateCount(assertionName, "count", count);
		return countMatcher(
			this,
			locator,
			{
				assertionName,
				description: `more than ${count}`,
				hintArgs: String(count),
				holds: (n) => n > count,
				expected: count,
			},
			options,
		);
	},
	async toHaveCountGreaterThanOrEqual(locator: Locator, count: number, options?: CountOptions) {
		const assertionName = "toHaveCountGreaterThanOrEqual";
		validateCount(assertionName, "count", count);
		return countMatcher(
			this,
			locator,
			{
				assertionName,
				description: `at least ${count}`,
				hintArgs: String(count),
				holds: (n) => n >= count,
				expected: count,
			},
			options,
		);
	},
	async toHaveCountLessThan(locator: Locator, count: number, options?: CountOptions) {
		const assertionName = "toHaveCountLessThan";
		validateCount(assertionName, "count", count);
		return countMatcher(
			this,
			locator,
			{
				assertionName,
				description: `fewer than ${count}`,
				hintArgs: String(count),
				holds: (n) => n < count,
				expected: count,
			},
			options,
		);
	},
	async toHaveCountLessThanOrEqual(locator: Locator, count: number, options?: CountOptions) {
		const assertionName = "toHaveCountLessThanOrEqual";
		validateCount(assertionName, "count", count);
		return countMatcher(
			this,
			locator,
			{
				assertionName,
				description: `at most ${count}`,
				hintArgs: String(count),
				holds: (n) => n <= count,
				expected: count,
			},
			options,
		);
	},
	async toHaveCountBetween(locator: Locator, min: number, max: number, options?: CountOptions) {
		const assertionName = "toHaveCountBetween";
		validateCount(assertionName, "min", min);
		validateCount(assertionName, "max", max);
		if (min > max) {
			throw new RangeError(`${assertionName}: min (${min}) must not be greater than max (${max})`);
		}
		return countMatcher(
			this,
			locator,
			{
				assertionName,
				description: `between ${min} and ${max} (inclusive)`,
				hintArgs: `${min}, ${max}`,
				holds: (n) => n >= min && n <= max,
				expected: { min, max },
			},
			options,
		);
	},
});

export const expectlyLocatorCount: Expect<typeof expectlyLocatorCountMatchers> =
	baseExpect.extend(expectlyLocatorCountMatchers);
