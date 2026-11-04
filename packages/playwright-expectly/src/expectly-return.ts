import { fileURLToPath } from "node:url";

import type { MatcherReturnType } from "@cerios/playwright-expectly-core";
import { expect as baseExpect, test } from "@playwright/test";
import type { Expect, ExpectMatcherState } from "@playwright/test";

/** Exactly the options accepted by Playwright's expect.poll(). */
export type PollAndReturnOptions = Parameters<typeof baseExpect.poll>[1];

/** Exactly the options accepted by Playwright's toPass(). */
export type ToPassAndReturnOptions = Parameters<ReturnType<typeof baseExpect<() => void>>["toPass"]>[0];

/** Soft assertions resolve after a failure, so they may not have a passing value to return. */
export type ReturnResult<T, TSoft extends boolean = false> = TSoft extends true ? T | undefined : T;

/** Derives the soft flag that configure() produces from its configuration argument. */
type ConfiguredSoft<TConfig, TSoft extends boolean> = TConfig extends { soft: true }
	? true
	: TConfig extends { soft: false }
		? false
		: TConfig extends { soft: boolean }
			? boolean
			: TSoft;

/** Replace each poll matcher's void result with the last successfully polled value. */
type ReturnValueMatchers<TMatchers, TValue, TRegisteredMatchers = {}, TResult = TValue> = {
	[K in keyof TMatchers]: K extends "not"
		? ReturnValueMatchers<TMatchers[K], TValue, TRegisteredMatchers, TResult>
		: TMatchers[K] extends (...args: infer TArgs) => unknown
			? (...args: TArgs) => Promise<TResult>
			: never;
} & CustomPollMatchers<TRegisteredMatchers, TValue, TResult>;

type CustomPollMatchers<TMatchers, TValue, TResult = TValue> = {
	[
		K in keyof TMatchers as TMatchers[K] extends (
			this: ExpectMatcherState,
			received: TValue,
			...args: infer _TArgs
		) => unknown
			? K
			: never
	]: TMatchers[K] extends (this: ExpectMatcherState, received: TValue, ...args: infer TArgs) => unknown
		? (...args: TArgs) => Promise<TResult>
		: never;
};

/**
 * Preserves native and registered matcher arguments, return values, and `.not` chaining.
 * Soft matchers resolve with the last polled value, or `undefined` if none was produced.
 */
export type PollAndReturnMatchers<T, TMatchers = {}, TSoft extends boolean = false> = ReturnValueMatchers<
	ReturnType<typeof baseExpect.poll<T>>,
	Awaited<T>,
	TMatchers,
	ReturnResult<Awaited<T>, TSoft>
>;

/**
 * Keeps existing function assertions, but adds a return-aware variant of toPass().
 * A soft toPassAndReturn() resolves with `undefined` when no attempt succeeded.
 */
export type ToPassAndReturnMatchers<
	T,
	TMatchers = {},
	TCallback extends () => unknown = () => T | Promise<T>,
	TSoft extends boolean = false,
> = ReturnType<typeof baseExpect<TCallback>> &
	RegisteredMatcherChain<TCallback, TMatchers> & {
		toPassAndReturn(options?: ToPassAndReturnOptions): Promise<ReturnResult<Awaited<T>, TSoft>>;
	};

/** Keep this structural: inferred Playwright internals cannot be emitted in our declarations. */
type RegisteredMatcherChain<TActual, TMatchers, TResult = void> = {
	not: RegisteredMatcherChain<TActual, TMatchers, TResult>;
	resolves: RegisteredMatcherChain<Awaited<TActual>, TMatchers, Promise<void>>;
	// Playwright permits every registered matcher on a rejection reason.
	// oxlint-disable-next-line typescript/no-explicit-any
	rejects: RegisteredMatcherChain<any, TMatchers, Promise<void>>;
} & {
	[
		K in keyof TMatchers as TMatchers[K] extends (received: TActual, ...args: infer _TArgs) => unknown ? K : never
	]: TMatchers[K] extends (received: TActual, ...args: infer TArgs) => infer TReturn
		? (...args: TArgs) => TReturn extends PromiseLike<unknown> ? Promise<void> : TResult
		: never;
};

/**
 * Extended expect interface that retains Playwright's call signatures.
 * It can wrap expectly, baseExpect, or an expect created with extend().
 */
export type ExpectWithReturn<TMatchers = {}, TSoft extends boolean = false> = {
	<TCallback extends () => unknown>(
		callback: TCallback,
		messageOrOptions?: string | { message?: string },
	): ToPassAndReturnMatchers<ReturnType<TCallback>, TMatchers, TCallback, TSoft>;

	pollAndReturn<T>(
		callback: () => T | Promise<T>,
		messageOrOptions?: PollAndReturnOptions,
	): PollAndReturnMatchers<T, TMatchers, TSoft>;

	/**
	 * Soft expect instances retain the two return-aware methods. Their failures are
	 * recorded without stopping the test, so they may resolve with `undefined`.
	 */
	soft: ExpectWithReturn<TMatchers, true>;

	/** Configured expect instances retain the two return-aware methods. */
	configure<TConfig extends Parameters<Expect<TMatchers>["configure"]>[0]>(
		configuration: TConfig,
	): ExpectWithReturn<TMatchers, ConfiguredSoft<TConfig, TSoft>>;

	/** Matcher extensions retain the two return-aware methods. */
	extend<
		TMore extends Record<
			string,
			(
				this: ExpectMatcherState,
				// Match Playwright's extension constraint: matchers may accept narrower types.
				// oxlint-disable-next-line typescript/no-explicit-any
				received: any,
				// oxlint-disable-next-line typescript/no-explicit-any
				...args: any[]
			) => MatcherReturnType | Promise<MatcherReturnType>
		>,
	>(
		matchers: TMore,
	): ExpectWithReturn<TMatchers & TMore, TSoft>;
} & Expect<TMatchers>;

/** Capture at invocation (not property access), including source-mapped caller locations. */
function assertionCallSite(boundary: (...args: never[]) => unknown): {
	stack: string;
	location?: { file: string; line: number; column: number };
} {
	const error = new Error();
	Error.captureStackTrace(error, boundary);
	const stack = error.stack?.split("\n").slice(1).join("\n") ?? "";
	const frame = stack.split("\n")[0];
	const match = frame?.match(/^\s*at (?:.* \()?(.+):(\d+):(\d+)\)?$/);
	if (!match) return { stack };
	const file = match[1].startsWith("file://") ? fileURLToPath(match[1]) : match[1];
	return { stack, location: { file, line: Number(match[2]), column: Number(match[3]) } };
}

function isRunningTest(): boolean {
	try {
		test.info();
		return true;
	} catch {
		return false;
	}
}

async function atCallSite<T>(body: () => Promise<T>, stack: string): Promise<T> {
	try {
		return await body();
	} catch (error) {
		// Keep the original error, message, matcher result and cause intact.
		if (error instanceof Error && stack) error.stack = `${error.name}: ${error.message}\n${stack}`;
		throw error;
	}
}

function proxyPollMatchers<T>(
	matchers: object,
	createAttempt: () => { poll: object; value: () => T },
	negated = false,
): object {
	return new Proxy(matchers, {
		get(target, key, receiver) {
			const matcher = Reflect.get(target, key, receiver) as unknown;
			if (key === "not") {
				return proxyPollMatchers(matcher as object, createAttempt, !negated);
			}
			// Leave internal/prototype methods alone. Native Playwright matchers
			// are own function properties on the matcher object.
			if (
				typeof key === "string" &&
				Object.prototype.hasOwnProperty.call(target, key) &&
				typeof matcher === "function"
			) {
				return async function returnPolledValue(...args: unknown[]): Promise<T> {
					const caller = assertionCallSite(returnPolledValue);
					const body = (): Promise<T> =>
						atCallSite(async () => {
							const attempt = createAttempt();
							const assertion = negated ? (Reflect.get(attempt.poll, "not") as object) : attempt.poll;
							const invoke = Reflect.get(assertion, key) as (...args: unknown[]) => unknown;
							await Reflect.apply(invoke, assertion, args);
							return attempt.value();
						}, caller.stack);
					if (!isRunningTest()) return await body();
					// Keep this call in the public boundary: boxing skips this frame.
					return await test.step(`expect.pollAndReturn.${key}`, body, { box: true, location: caller.location });
				};
			}
			return matcher;
		},
	});
}

/**
 * Adds pollAndReturn() and toPassAndReturn() without changing regular matchers.
 * Always delegates retries, timeout behavior and reporting to native Playwright.
 * Returns the successful callback value, so callers no longer need to capture it
 * in a `let` declared outside the poll or `toPass` callback.
 * Soft return-aware assertions (`.soft` or `configure({ soft: true })`) record a
 * failure and resolve, like native soft assertions: `toPassAndReturn()` with
 * `undefined` and `pollAndReturn()` with the last polled value.
 *
 * @example
 * const expect = withReturn(baseExpect.extend(expectlyMatchers));
 */
export function withReturn<TMatchers>(nativeExpect: Expect<TMatchers>): ExpectWithReturn<TMatchers> {
	return new Proxy(nativeExpect, {
		apply(target, thisArg, args: unknown[]) {
			const nativeMatchers = Reflect.apply(target, thisArg, args) as object;
			const callback: unknown = args[0];

			// Do not eagerly wrap callbacks. That would change native semantics
			// of expect(fn).toThrow(), expect(fn).toPass(), etc.
			if (typeof callback !== "function") {
				return nativeMatchers;
			}

			return new Proxy(nativeMatchers, {
				get(matchers, key, receiver) {
					if (key !== "toPassAndReturn") {
						return Reflect.get(matchers, key, receiver);
					}
					return async function returnPassedValue(options?: ToPassAndReturnOptions): Promise<unknown> {
						const caller = assertionCallSite(returnPassedValue);
						const body = (): Promise<unknown> =>
							atCallSite(async () => {
								let lastSuccessfulValue: unknown;
								const capturedCallback = async (): Promise<void> => {
									lastSuccessfulValue = await callback();
								};
								// Preserve configuration (including soft) and extensions. A soft
								// failure resolves without a successful value, like native toPass().
								const assertion = Reflect.apply(target, thisArg, [capturedCallback, ...args.slice(1)]) as {
									toPass: (options?: ToPassAndReturnOptions) => Promise<void>;
								};
								await assertion.toPass(options);
								return lastSuccessfulValue;
							}, caller.stack);
						if (!isRunningTest()) return await body();
						return await test.step("expect.toPassAndReturn", body, { box: true, location: caller.location });
					};
				},
			});
		},
		get(target, key, receiver) {
			if (key === "pollAndReturn") {
				return <T>(
					callback: () => T | Promise<T>,
					options?: PollAndReturnOptions,
				): PollAndReturnMatchers<T, TMatchers> => {
					// Preserve configuration (including soft). A soft failure resolves
					// with the last polled value, or undefined if none was produced.
					const createAttempt = (): { poll: object; value: () => Awaited<T> } => {
						let lastValue!: Awaited<T>;
						const poll = target.poll(async () => {
							lastValue = await callback();
							return lastValue;
						}, options);
						return { poll, value: () => lastValue };
					};
					return proxyPollMatchers(target.poll(callback, options), createAttempt) as PollAndReturnMatchers<
						T,
						TMatchers
					>;
				};
			}
			if (key === "soft") {
				// In older Playwright (e.g. 1.40), `expect.soft` is only callable (no poll/configure/extend),
				// so build the soft instance through configure(), as the current getter does.
				return withReturn(target.configure({ soft: true }));
			}
			if (key === "configure" || key === "extend") {
				const method = Reflect.get(target, key, receiver) as (...args: unknown[]) => Expect<TMatchers>;
				return (...args: unknown[]): ExpectWithReturn<TMatchers> => withReturn(method(...args));
			}
			return Reflect.get(target, key, receiver);
		},
	}) as ExpectWithReturn<TMatchers>;
}
