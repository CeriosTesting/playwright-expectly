import { withMatcherState } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import type { ExpectlyMatcherResult } from "./matchers/matcher-result";
import { matchesPattern } from "./matchers/text-validation-utils";

type Settled = { status: "fulfilled"; value: unknown } | { status: "rejected"; reason: unknown };

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
	return (
		(typeof value === "object" || typeof value === "function") &&
		value !== null &&
		typeof (value as PromiseLike<unknown>).then === "function"
	);
}

/** Accepts a promise or a function returning one, so `expect(() => api.call())` defers the call. */
async function settle(assertionName: string, received: unknown): Promise<Settled> {
	let promise: unknown = received;
	if (typeof received === "function") {
		try {
			promise = (received as () => unknown)();
		} catch (reason) {
			return { status: "rejected", reason };
		}
	}
	if (!isPromiseLike(promise)) {
		throw new TypeError(`${assertionName}: received value must be a promise or a function returning one`);
	}
	try {
		return { status: "fulfilled", value: await promise };
	} catch (reason) {
		return { status: "rejected", reason };
	}
}

function describeReason(state: ExpectMatcherState, reason: unknown): string {
	return reason instanceof Error ? `${reason.name}: ${reason.message}` : state.utils.printReceived(reason);
}

type ErrorType = abstract new (...args: never[]) => Error;

function thrownResult(
	state: ExpectMatcherState,
	thrown: { error: unknown } | undefined,
	type: ErrorType,
	expected: string | RegExp,
): ExpectlyMatcherResult {
	const assertionName = "toThrowWithMessage";
	const error = thrown?.error;
	const message = error instanceof Error ? error.message : undefined;
	const typeMatches = error instanceof type;
	const messageMatches =
		message !== undefined && (typeof expected === "string" ? message === expected : matchesPattern(message, expected));
	const pass = typeMatches && messageMatches;

	return {
		message: () => {
			const hint = state.utils.matcherHint(
				assertionName,
				undefined,
				`${type.name}, ${state.utils.printExpected(expected)}`,
				{
					isNot: state.isNot,
				},
			);
			const received = thrown === undefined ? "nothing was thrown" : describeReason(state, error);
			return (
				hint +
				"\n\n" +
				`Expected to ${state.isNot ? "not " : ""}throw ${type.name} with message ${state.utils.printExpected(expected)}\n` +
				`Received: ${received}`
			);
		},
		pass,
		name: assertionName,
		expected: { type: type.name, message: expected },
		actual: error,
	};
}

/**
 * Promise and function matchers: whether a promise settles a given way, and what a function throws.
 */
export const expectlyFunctionMatchers = withMatcherState({
	async toResolve(received: unknown) {
		const assertionName = "toResolve";
		const settled = await settle(assertionName, received);
		const pass = settled.status === "fulfilled";
		return {
			message: (): string => {
				const hint = this.utils.matcherHint(assertionName, undefined, "", { isNot: this.isNot });
				return settled.status === "fulfilled"
					? `${hint}\n\nExpected promise to reject\nResolved with: ${this.utils.printReceived(settled.value)}`
					: `${hint}\n\nExpected promise to resolve\nRejected with: ${describeReason(this, settled.reason)}`;
			},
			pass,
			name: assertionName,
			actual: settled.status === "fulfilled" ? settled.value : settled.reason,
		};
	},
	async toReject(received: unknown) {
		const assertionName = "toReject";
		const settled = await settle(assertionName, received);
		const pass = settled.status === "rejected";
		return {
			message: (): string => {
				const hint = this.utils.matcherHint(assertionName, undefined, "", { isNot: this.isNot });
				return settled.status === "rejected"
					? `${hint}\n\nExpected promise to resolve\nRejected with: ${describeReason(this, settled.reason)}`
					: `${hint}\n\nExpected promise to reject\nResolved with: ${this.utils.printReceived(settled.value)}`;
			},
			pass,
			name: assertionName,
			actual: settled.status === "fulfilled" ? settled.value : settled.reason,
		};
	},
	/**
	 * Calls the function and checks the thrown error's type and message (exact string or RegExp). A function
	 * that returns a promise is awaited, so async functions work too.
	 */
	toThrowWithMessage(received: unknown, type: ErrorType, expected: string | RegExp) {
		const assertionName = "toThrowWithMessage";
		if (typeof received !== "function") {
			throw new TypeError(`${assertionName}: received value must be a function`);
		}
		if (typeof type !== "function") {
			throw new TypeError(`${assertionName}: type must be an error class such as TypeError`);
		}
		if (typeof expected !== "string" && !(expected instanceof RegExp)) {
			throw new TypeError(`${assertionName}: message must be a string or RegExp`);
		}
		let returned: unknown;
		try {
			returned = (received as () => unknown)();
		} catch (error) {
			return thrownResult(this, { error }, type, expected);
		}
		if (isPromiseLike(returned)) {
			return Promise.resolve(returned).then(
				() => thrownResult(this, undefined, type, expected),
				(error: unknown) => thrownResult(this, { error }, type, expected),
			);
		}
		return thrownResult(this, undefined, type, expected);
	},
});

export const expectlyFunction: Expect<typeof expectlyFunctionMatchers> = baseExpect.extend(expectlyFunctionMatchers);
