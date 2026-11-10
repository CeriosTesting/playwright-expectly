import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileFunction } from "node:vm";

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
		: "soft" extends keyof TConfig
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

/** The message argument accepted by `expect(value, messageOrOptions)`. */
export type TypedAssertionMessage = string | { message?: string };

/** Values that fail Playwright's `toBeTruthy()`. */
type Falsy = false | 0 | 0n | "" | null | undefined;

/**
 * The part of `T` that can be falsy, like TypeScript's own `if (!value)` narrowing:
 * `boolean` becomes `false`, while `string`, `number` and `bigint` stay as they are,
 * because `""`, `0`, `NaN` and `0n` cannot be singled out. Always-truthy types are dropped.
 */
export type FalsyPart<T> = unknown extends T ? T : FalsyMember<T>;

type FalsyMember<T> = T extends null | undefined | false
	? T
	: T extends string
		? "" extends T
			? T
			: never
		: T extends number
			? 0 extends T
				? T
				: never
			: T extends bigint
				? 0n extends T
					? T
					: never
				: never;

/**
 * Type-narrowing copies of Playwright's matchers, called on the expect object itself:
 * `expect.toBeDefined(value)` runs `expect(value).toBeDefined()` and then tells the
 * compiler that `value` is defined.
 *
 * TypeScript only narrows through an expect with an explicit type annotation (TS2775).
 * `expectly` has one. When re-exporting it, write `export const expect: typeof expectly = expectly;`.
 */
export interface NarrowingAssertions {
	/**
	 * Runs `expect(value).toBeDefined()` and narrows `value` to exclude `undefined`.
	 * Like Playwright, `null` passes; use `expect.not.toBeNull()` for that.
	 *
	 * @example
	 * let name: string | undefined = getName();
	 * expectly.toBeDefined(name);
	 * name.toUpperCase(); // name: string
	 */
	toBeDefined<T>(value: T, message?: TypedAssertionMessage): asserts value is Exclude<T, undefined>;

	/**
	 * Runs `expect(value).toBeUndefined()` and narrows `value` to `undefined`.
	 *
	 * @example
	 * expectly.toBeUndefined(user.deletedAt);
	 */
	toBeUndefined<T>(value: T, message?: TypedAssertionMessage): asserts value is T & undefined;

	/**
	 * Runs `expect(value).toBeNull()` and narrows `value` to `null`.
	 *
	 * @example
	 * expectly.toBeNull(response.error);
	 */
	toBeNull<T>(value: T, message?: TypedAssertionMessage): asserts value is T & null;

	/**
	 * Runs `expect(value).toBeTruthy()` and narrows `value` like `if (value)` does:
	 * `null`, `undefined`, `false`, `0`, `0n` and `""` are removed from its type.
	 *
	 * @example
	 * const token: string | null = await getToken();
	 * expectly.toBeTruthy(token);
	 * token.length; // token: string
	 */
	toBeTruthy<T>(value: T, message?: TypedAssertionMessage): asserts value is Exclude<T, Falsy>;

	/**
	 * Runs `expect(value).toBeFalsy()` and narrows `value` like `if (!value)` does.
	 *
	 * @example
	 * expectly.toBeFalsy(flags.enabled); // flags.enabled: false | undefined
	 */
	toBeFalsy<T>(value: T, message?: TypedAssertionMessage): asserts value is FalsyPart<T>;
}

/** Negated type-narrowing assertions: `expect.not.toBeNull(value)` runs `expect(value).not.toBeNull()`. */
export interface NegatedNarrowingAssertions {
	/** Runs `expect(value).not.toBeDefined()` and narrows `value` to `undefined`. */
	toBeDefined<T>(value: T, message?: TypedAssertionMessage): asserts value is T & undefined;

	/** Runs `expect(value).not.toBeUndefined()` and narrows `value` to exclude `undefined`. */
	toBeUndefined<T>(value: T, message?: TypedAssertionMessage): asserts value is Exclude<T, undefined>;

	/**
	 * Runs `expect(value).not.toBeNull()` and narrows `value` to exclude `null`.
	 *
	 * @example
	 * const user: User | null = await findUser(id);
	 * expectly.not.toBeNull(user);
	 * user.name; // user: User
	 */
	toBeNull<T>(value: T, message?: TypedAssertionMessage): asserts value is Exclude<T, null>;

	/** Runs `expect(value).not.toBeTruthy()` and narrows `value` like `if (!value)` does. */
	toBeTruthy<T>(value: T, message?: TypedAssertionMessage): asserts value is FalsyPart<T>;

	/** Runs `expect(value).not.toBeFalsy()` and narrows `value` like `if (value)` does. */
	toBeFalsy<T>(value: T, message?: TypedAssertionMessage): asserts value is Exclude<T, Falsy>;
}

/**
 * Soft versions record a failure and let the test continue, so the value may still be
 * anything afterwards: they run the same matcher but do not narrow.
 */
export type SoftNarrowingAssertions = {
	[K in keyof NarrowingAssertions]: (value: unknown, message?: TypedAssertionMessage) => void;
};

/** Only an expect that is certainly not soft may narrow, since only it is certain to throw. */
export type TypedAssertions<TSoft extends boolean = false> = [TSoft] extends [false]
	? NarrowingAssertions
	: SoftNarrowingAssertions;

/** The negated counterpart of {@link TypedAssertions}, available on `expect.not`. */
export type NegatedTypedAssertions<TSoft extends boolean = false> = [TSoft] extends [false]
	? NegatedNarrowingAssertions
	: SoftNarrowingAssertions;

const TYPED_ASSERTIONS: ReadonlySet<PropertyKey> = new Set<keyof NarrowingAssertions>([
	"toBeDefined",
	"toBeUndefined",
	"toBeNull",
	"toBeTruthy",
	"toBeFalsy",
]);

/**
 * Extended expect interface that retains Playwright's call signatures.
 * It can wrap expectly, baseExpect, or an expect created with extend().
 */
export type ExpectWithReturn<TMatchers = {}, TSoft extends boolean = false> = ExpectWithReturnMembers<
	TMatchers,
	TSoft
> &
	TypedAssertions<TSoft>;

/**
 * The type `withReturn()` gives a particular expect, for annotating your own exported expect.
 * Type-narrowing assertions need that explicit annotation (TS2775), and this way it never
 * has to list the matcher types, whatever you merged or extended.
 *
 * @example
 * const merged = mergeExpects(expectly, expectlyFuzzy, myExpect);
 * export const expect: WithReturn<typeof merged> = withReturn(merged);
 */
export type WithReturn<TExpect, TSoft extends boolean = false> =
	TExpect extends Expect<infer TMatchers> ? ExpectWithReturn<TMatchers, TSoft> : never;

/**
 * An interface (not an intersection) so that `not` has a single declaration:
 * TypeScript only narrows through `expect.not.toBeNull(value)` when every name in the
 * call target is declared with an explicit type (TS2775).
 */
interface ExpectWithReturnMembers<TMatchers, TSoft extends boolean> extends Expect<TMatchers> {
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

	/** Playwright's asymmetric `expect.not` matchers, plus the negated type-narrowing assertions. */
	not: NegatedTypedAssertions<TSoft> & Expect<TMatchers>["not"];
}

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

/** Keep the original error, message, matcher result and cause intact; only move its stack. */
function rewriteStack(error: unknown, stack: string): void {
	if (error instanceof Error && stack) error.stack = `${error.name}: ${error.message}\n${stack}`;
}

async function atCallSite<T>(body: () => Promise<T>, stack: string): Promise<T> {
	try {
		return await body();
	} catch (error) {
		rewriteStack(error, stack);
		throw error;
	}
}

type TypedAssertionCall = (value: unknown, message?: TypedAssertionMessage) => void;
type MatcherForwarder = (
	expect: unknown,
	name: string,
	negated: boolean,
	value: unknown,
	message?: TypedAssertionMessage,
) => void;

/** Root of the `playwright` package that `@playwright/test` uses, resolved from this module's own file. */
function playwrightPackageRoot(): string | undefined {
	try {
		// Read from a stack trace, so it works from the CJS and ESM builds and from TS sources.
		const ownFile = assertionCallSite(playwrightPackageRoot).location?.file;
		if (!ownFile) return undefined;
		const testPackage = createRequire(ownFile).resolve("@playwright/test/package.json");
		return path.dirname(createRequire(testPackage).resolve("playwright/package.json"));
	} catch {
		return undefined;
	}
}

let matcherForwarder: MatcherForwarder | null | undefined;

/**
 * Playwright reports a matcher at the first stack frame outside its own package, which
 * is the user's line when a test calls a matcher directly. A forwarding function of ours
 * would be that frame instead. So the forwarder is compiled with a file name inside the
 * Playwright package, and Playwright skips its frame like its own: steps, errors and soft
 * errors point at the test's line, exactly as for a native matcher.
 */
function getMatcherForwarder(): MatcherForwarder | null {
	if (matcherForwarder !== undefined) return matcherForwarder;
	const root = playwrightPackageRoot();
	matcherForwarder = root
		? (compileFunction(
				"const matchers = expect(value, message);\n(negated ? matchers.not : matchers)[name]();",
				["expect", "name", "negated", "value", "message"],
				{ filename: path.join(root, "lib", "expectly-typed-assertion.js") },
			) as MatcherForwarder)
		: null;
	return matcherForwarder;
}

/**
 * Runs the native matcher named `name` on `expect(value, message)`. It must stay
 * synchronous: an assertion function has to throw before the next statement runs.
 */
function typedAssertion<TMatchers>(target: Expect<TMatchers>, name: string, negated: boolean): TypedAssertionCall {
	// A bound function adds no stack frame of its own.
	const forwarder = getMatcherForwarder();
	if (forwarder) return forwarder.bind(undefined, target, name, negated);
	// Fallback when Playwright cannot be resolved: the thrown error still points at the call.
	return function assertTyped(value: unknown, message?: TypedAssertionMessage): void {
		const caller = assertionCallSite(assertTyped);
		const matchers: object = target(value, message);
		const assertion = negated ? (Reflect.get(matchers, "not") as object) : matchers;
		try {
			(Reflect.get(assertion, name) as () => void).call(assertion);
		} catch (error) {
			rewriteStack(error, caller.stack);
			throw error;
		}
	};
}

/** Adds the negated type-narrowing assertions next to Playwright's asymmetric `expect.not`. */
function proxyNot<TMatchers>(target: Expect<TMatchers>, nativeNot: unknown): object {
	return new Proxy(typeof nativeNot === "object" && nativeNot !== null ? nativeNot : {}, {
		get(not, key, receiver) {
			if (typeof key === "string" && TYPED_ASSERTIONS.has(key)) return typedAssertion(target, key, true);
			return Reflect.get(not, key, receiver);
		},
	});
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
 * Also adds type-narrowing assertions on the expect object (`expect.toBeDefined(value)`,
 * `expect.not.toBeNull(value)`, ...; see {@link NarrowingAssertions}). They run the
 * native matcher and tell the compiler what the value is afterwards. Soft ones do not narrow.
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
			if (typeof key === "string" && TYPED_ASSERTIONS.has(key)) {
				return typedAssertion(target, key, false);
			}
			if (key === "not") {
				return proxyNot(target, Reflect.get(target, key, receiver));
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
