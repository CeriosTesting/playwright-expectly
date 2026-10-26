import { expect as baseExpect, errors, type ExpectMatcherState, type Locator } from "@playwright/test";

import type { PollOptions } from "../types/poll-options";

/**
 * Polls until `poll` returns the desired condition (`true`, or `false` under `.not`).
 * A timeout yields the undesired condition; an error thrown by `poll` is rethrown unchanged.
 */
export async function runPolledMatcher(
	state: ExpectMatcherState,
	options: PollOptions | undefined,
	poll: () => Promise<boolean>,
): Promise<boolean> {
	const desiredCondition = !state.isNot;
	let pollError: { error: unknown } | undefined;

	try {
		await baseExpect
			.poll(
				async () => {
					try {
						return await poll();
					} catch (error) {
						pollError = { error };
						throw error;
					}
				},
				{
					timeout: options?.timeout ?? state.timeout,
					intervals: options?.intervals,
				},
			)
			.toBe(desiredCondition);
		return desiredCondition;
	} catch {
		if (pollError) throw pollError.error;
		return !desiredCondition;
	}
}

/** The last state seen while polling locators: either all elements were found, or one was missing. */
export type LocatorSnapshot<T> = { found: true; value: T } | { found: false; missingIndex: number };

export type LocatorPollResult<T> = {
	/** Already accounts for missing elements: a missing element fails both the assertion and its `.not` form. */
	pass: boolean;
	/** Undefined only when polling ended before the first read completed. */
	snapshot: LocatorSnapshot<T> | undefined;
};

function isTimeoutError(error: unknown): boolean {
	return error instanceof errors.TimeoutError || (error instanceof Error && error.name === "TimeoutError");
}

/** Throws a clear TypeError when a locator-only matcher receives something other than a Locator. */
export function assertLocators(locators: readonly unknown[]): asserts locators is readonly Locator[] {
	for (const locator of locators) {
		if (typeof locator !== "object" || locator === null || typeof (locator as Partial<Locator>).count !== "function") {
			throw new TypeError(
				`This matcher needs a Playwright Locator, got: ${locator === null ? "null" : typeof locator}`,
			);
		}
	}
}

/**
 * Polls a read of one or more locators, with Playwright's semantics for missing elements: polling
 * continues until the element appears, and if it never does, both the assertion and its `.not` form fail
 * with "element(s) not found". Elements are counted first, so a missing element never blocks inside an
 * action. Actions get the remaining assertion time, so `actionTimeout` cannot cut the assertion short.
 * Strict mode violations and other errors are rethrown.
 */
export async function pollLocators<T>(
	state: ExpectMatcherState,
	options: PollOptions | undefined,
	locators: readonly Locator[],
	read: (actionOptions: { timeout: number }) => Promise<T>,
	check: (value: T) => boolean,
): Promise<LocatorPollResult<T>> {
	assertLocators(locators);
	const timeout = options?.timeout ?? state.timeout;
	const deadline = timeout ? Date.now() + timeout : 0;
	// Returning the undesired condition keeps polling, for the assertion and for its `.not` form.
	const keepPolling = state.isNot;
	let snapshot: LocatorSnapshot<T> | undefined;

	const pass = await runPolledMatcher(state, options, async () => {
		for (const [index, locator] of locators.entries()) {
			if ((await locator.count()) === 0) {
				snapshot = { found: false, missingIndex: index };
				return keepPolling;
			}
		}
		try {
			// Zero means "no timeout" for Playwright actions, matching a disabled assertion timeout.
			const value = await read({ timeout: deadline ? Math.max(1, deadline - Date.now()) : 0 });
			snapshot = { found: true, value };
			return check(value);
		} catch (error) {
			// The element detached between counting and reading.
			if (isTimeoutError(error)) {
				snapshot = { found: false, missingIndex: 0 };
				return keepPolling;
			}
			throw error;
		}
	});

	return { pass, snapshot };
}

/**
 * The failure message for a locator that never resolved, or undefined when every element was found.
 * `labels` names the locators when a matcher takes more than one.
 */
export function locatorNotFoundMessage(
	state: ExpectMatcherState,
	assertionName: string,
	snapshot: LocatorSnapshot<unknown> | undefined,
	labels?: readonly string[],
): string | undefined {
	if (snapshot?.found !== false) return undefined;
	const hint = state.utils.matcherHint(assertionName, undefined, undefined, { isNot: state.isNot });
	const which = labels?.[snapshot.missingIndex];
	return `${hint}\n\nError: element(s) not found${which ? ` (${which})` : ""}`;
}
