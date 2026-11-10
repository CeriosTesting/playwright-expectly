import { expect, test } from "@playwright/test";
import type { MatcherReturnType } from "@playwright/test";

import { getRejectedErrorSync, stripAnsi } from "../../../tests/common/assertion-utils";
import { expectly, expectlyMatchers } from "../src/expectly";
import { withReturn } from "../src/expectly-return";
import type { ExpectWithReturn } from "../src/expectly-return";

function checkPollAndReturnMatcherTypes(matchers: ReturnType<typeof expectly.pollAndReturn<string>>): Promise<string> {
	const value: Promise<string> = matchers.toBeUUID(4);
	const negatedValue: Promise<string> = matchers.not.toBeUUID(4);
	// @ts-expect-error UUID versions outside the supported set must be rejected.
	void matchers.toBeUUID(9);
	// @ts-expect-error UUID versions outside the supported set must be rejected for `.not`.
	void matchers.not.toBeUUID(9);
	void negatedValue;
	return value;
}

void checkPollAndReturnMatcherTypes;

test.describe("pollAndReturn", () => {
	test("supports expectly custom matchers", async () => {
		const uuid = "550e8400-e29b-41d4-a716-446655440000";
		const result = await expectly.pollAndReturn(() => uuid).toBeUUID(4);
		expect(result).toBe(uuid);
	});

	test("returns the value that passed, without calling again", async () => {
		let attempts = 0;
		const order = await expectly
			.pollAndReturn(() => ({ id: "123", status: ++attempts < 3 ? "PENDING" : "COMPLETED" }), {
				timeout: 1_000,
				intervals: [10],
			})
			.toMatchObject({ status: "COMPLETED" });

		expect(order).toEqual({ id: "123", status: "COMPLETED" });
		expect(attempts).toBe(3);
	});

	test("supports .not and synchronous callbacks", async () => {
		const result = await expectly.pollAndReturn(() => "READY").not.toBe("PENDING");
		expect(result).toBe("READY");
	});

	test("propagates native timeout errors", async () => {
		await expect(
			expectly.pollAndReturn(() => "PENDING", { timeout: 100, intervals: [10] }).toBe("COMPLETED"),
		).rejects.toThrow();
	});
});

test.describe("toPassAndReturn", () => {
	test("returns the result from the successful attempt", async () => {
		let attempts = 0;
		const order = await expectly(() => {
			const current = { id: 42, status: ++attempts < 3 ? "PENDING" : "COMPLETED" };
			expect(current.status).toBe("COMPLETED");
			return current;
		}).toPassAndReturn({ timeout: 1_000, intervals: [10] });

		expect(order.id).toBe(42);
		expect(order.status).toBe("COMPLETED");
		expect(attempts).toBe(3);
	});

	test("supports Promise<void> and undefined returns", async () => {
		const value = await expectly(() => {
			expect(true).toBe(true);
			return Promise.resolve();
		}).toPassAndReturn({ timeout: 100 });
		expect(value).toBeUndefined();
	});

	test("preserves the native synchronous toThrow matcher", () => {
		expectly(() => {
			throw new Error("boom");
		}).toThrow("boom");
	});

	test("propagates native toPass timeout errors", async () => {
		await expect(
			expectly(async () => {
				await Promise.resolve();
				expect(false).toBe(true);
				return "never";
			}).toPassAndReturn({ timeout: 100, intervals: [10] }),
		).rejects.toThrow();
	});
});

test("withReturn works on configured expect instances", async () => {
	const custom = withReturn(expect.configure({ timeout: 100 }));
	const value = await custom.pollAndReturn(() => 42).toBe(42);
	expect(value).toBe(42);
	const configured = custom.configure({ timeout: 150 });
	expect(await configured(() => "ok").toPassAndReturn({ timeout: 100 })).toBe("ok");
});

test("preserves typed extensions through configure and extend chains", async () => {
	const custom = withReturn(expect)
		.extend({
			toExceed(received: number, minimum: number): MatcherReturnType {
				return { pass: received > minimum, message: () => "expected a larger number" };
			},
		})
		.configure({ timeout: 100 })
		.extend({
			toReturn(received: () => number, expected: number): MatcherReturnType {
				return { pass: received() === expected, message: () => "unexpected return value" };
			},
		});
	const value: number = await custom.pollAndReturn(() => 42).toExceed(10);
	expect(value).toBe(42);
	expect(await custom.pollAndReturn(() => 42).not.toExceed(50)).toBe(42);
	custom(() => 42).toReturn(42);
	custom(() => 42).not.toReturn(43);
	const returned: number = await custom(() => 42).toPassAndReturn({ timeout: 100 });
	expect(returned).toBe(42);
});

test("returns data from successful asynchronous callbacks without repeating them", async () => {
	let pollCalls = 0;
	const polled = await expectly
		.pollAndReturn(
			async () => {
				await Promise.resolve();
				return { attempt: ++pollCalls };
			},
			{ timeout: 1_000, intervals: [1] },
		)
		.toEqual({ attempt: 2 });
	expect(polled).toEqual({ attempt: 2 });
	expect(pollCalls).toBe(2);
	let passCalls = 0;
	const passed = await expectly(async () => {
		await Promise.resolve();
		const value = { attempt: ++passCalls };
		expect(value.attempt).toBe(2);
		return value;
	}).toPassAndReturn({ timeout: 1_000, intervals: [1] });
	expect(passed).toEqual({ attempt: 2 });
	expect(passCalls).toBe(2);
});

function checkSoftReturnTypes(): void {
	const softPoll: Promise<string | undefined> = expectly.soft.pollAndReturn(() => "x").toBe("x");
	const softNotPoll: Promise<string | undefined> = expectly.soft.pollAndReturn(() => "x").not.toBeUUID(4);
	const softPass: Promise<number | undefined> = expectly.soft(() => 1).toPassAndReturn();
	const configuredSoft: Promise<number | undefined> = expectly
		.configure({ soft: true })(() => 1)
		.toPassAndReturn();
	const hardAgain: Promise<number> = expectly.soft
		.configure({ soft: false })
		.pollAndReturn(() => 1)
		.toBe(1);
	const keepsSoft: Promise<number | undefined> = expectly.soft
		.configure({ timeout: 1 })
		.pollAndReturn(() => 1)
		.toBe(1);
	// @ts-expect-error Soft assertions may resolve without a passing value.
	const notNarrowed: Promise<number> = expectly.soft(() => 1).toPassAndReturn();
	const hard: Promise<number> = expectly(() => 1).toPassAndReturn();
	void [softPoll, softNotPoll, softPass, configuredSoft, hardAgain, keepsSoft, notNarrowed, hard];
}

void checkSoftReturnTypes;

test("soft return-aware assertions are available and return passing values", async () => {
	expect(await expectly.soft.pollAndReturn(() => 42).toBe(42)).toBe(42);
	expect(await expectly.soft(() => 42).toPassAndReturn({ timeout: 100 })).toBe(42);
	const configured = withReturn(expect).configure({ soft: true, message: "configured" });
	expect(await configured.pollAndReturn(() => "READY").not.toBe("PENDING")).toBe("READY");
	expect(await configured(() => "ok").toPassAndReturn({ timeout: 100 })).toBe("ok");
	const softExtended = expectly.soft.extend({
		toExceed(received: number, minimum: number): MatcherReturnType {
			return { pass: received > minimum, message: () => "expected a larger number" };
		},
	});
	expect(await softExtended.pollAndReturn(() => 2).toExceed(1)).toBe(2);
	expect(test.info().errors).toHaveLength(0);
});

test("non-soft return-aware assertions reject failures and preserve custom messages", async () => {
	// Soft failures would fail this test; the reporter fixture in expectly-return-stack.spec.ts covers them.
	await expect(
		expectly
			.configure({ soft: false })
			.pollAndReturn(() => "PENDING", { timeout: 30, intervals: [1], message: "order was not ready" })
			.toBe("READY"),
	).rejects.toThrow("order was not ready");
	await expect(
		expectly((): number => {
			throw new Error("not yet");
		}, "callback never succeeded").toPassAndReturn({ timeout: 30, intervals: [1] }),
	).rejects.toThrow("callback never succeeded");
});

/** Type-checked by `npm run lint`; `@ts-expect-error` lines must keep failing. */
function checkNarrowingAssertionTypes(): void {
	const maybe = (): string | null | undefined => "x";
	const flag = (): boolean | undefined => true;

	const defined = maybe();
	expectly.toBeDefined(defined);
	const definedValue: string | null = defined;

	const notUndefined = maybe();
	expectly.not.toBeUndefined(notUndefined);
	const notUndefinedValue: string | null = notUndefined;

	const notNull = maybe();
	expectly.not.toBeNull(notNull);
	const notNullValue: string | undefined = notNull;

	const truthy = maybe();
	expectly.toBeTruthy(truthy);
	const truthyValue: string = truthy;

	const notFalsy = flag();
	expectly.not.toBeFalsy(notFalsy);
	const notFalsyValue: true = notFalsy;

	const isNull = maybe();
	expectly.toBeNull(isNull);
	const nullValue: null = isNull;

	const isUndefined = maybe();
	expectly.toBeUndefined(isUndefined);
	const undefinedValue: undefined = isUndefined;

	const notDefined = maybe();
	expectly.not.toBeDefined(notDefined);
	const notDefinedValue: undefined = notDefined;

	// `if (!value)` keeps `string`, since "" cannot be singled out, but turns `true` into nothing.
	const falsy = flag();
	expectly.toBeFalsy(falsy);
	const falsyValue: false | undefined = falsy;
	const falsyString = maybe();
	expectly.not.toBeTruthy(falsyString);
	const falsyStringValue: string | null | undefined = falsyString;
	const falsyObject = ((): { id: number } | null => null)();
	expectly.toBeFalsy(falsyObject);
	const falsyObjectValue: null = falsyObject;

	// Works on any wrapped expect, also after configure() and extend().
	const native: ExpectWithReturn = withReturn(expect);
	const fromNative = maybe();
	native.toBeTruthy(fromNative);
	const fromNativeValue: string = fromNative;
	const configured: ExpectWithReturn<typeof expectlyMatchers> = expectly.configure({ timeout: 10 });
	const fromConfigured = maybe();
	configured.not.toBeNull(fromConfigured);
	const fromConfiguredValue: string | undefined = fromConfigured;
	// The documented `tests/support` module pattern.
	const support: ExpectWithReturn<typeof expectlyMatchers> = withReturn(expect.extend(expectlyMatchers));
	const fromSupport = maybe();
	support.not.toBeUndefined(fromSupport);
	const fromSupportValue: string | null = fromSupport;
	support("x").toBeValidEmail();

	// Soft assertions continue after a failure, so they must not narrow.
	const soft = maybe();
	expectly.soft.toBeDefined(soft);
	// @ts-expect-error A soft assertion does not narrow.
	const softValue: string | null = soft;
	const softNot = maybe();
	expectly.soft.not.toBeNull(softNot);
	// @ts-expect-error A soft negated assertion does not narrow.
	const softNotValue: string | undefined = softNot;
	const configuredSoft: ExpectWithReturn<typeof expectlyMatchers, true> = expectly.configure({ soft: true });
	const fromConfiguredSoft = maybe();
	configuredSoft.toBeTruthy(fromConfiguredSoft);
	// @ts-expect-error A soft assertion from configure() does not narrow.
	const configuredSoftValue: string = fromConfiguredSoft;

	// Playwright's asymmetric `expect.not` matchers stay available.
	const asymmetric: unknown = expectly.not.stringContaining("x");
	void [
		definedValue,
		notUndefinedValue,
		notNullValue,
		truthyValue,
		notFalsyValue,
		nullValue,
		undefinedValue,
		notDefinedValue,
		falsyValue,
		falsyStringValue,
		falsyObjectValue,
		fromNativeValue,
		fromConfiguredValue,
		fromSupportValue,
		softValue,
		softNotValue,
		configuredSoftValue,
		asymmetric,
	];
}

void checkNarrowingAssertionTypes;

test.describe("type-narrowing assertions", () => {
	type Assertion = (value: unknown) => void;
	const names = ["toBeDefined", "toBeUndefined", "toBeNull", "toBeTruthy", "toBeFalsy"] as const;
	const samples: unknown[] = [undefined, null, false, 0, "", "x", 1, {}, []];

	/** Runs an assertion and returns its error message, or `undefined` when it passes. */
	function failure(assertion: () => void): string | undefined {
		try {
			assertion();
			return undefined;
		} catch (error) {
			return (error as Error).message;
		}
	}

	for (const name of names) {
		test(`${name} and not.${name} behave exactly like the native matcher`, () => {
			for (const value of samples) {
				const typed: Assertion = expectly[name];
				const typedNot: Assertion = expectly.not[name];
				const native = (): void => expect(value)[name]();
				const nativeNot = (): void => expect(value).not[name]();
				expect(
					failure(() => typed(value)),
					`${name}(${String(value)})`,
				).toBe(failure(native));
				expect(
					failure(() => typedNot(value)),
					`not.${name}(${String(value)})`,
				).toBe(failure(nativeNot));
			}
		});
	}

	test("narrows after a passing check and throws Playwright's error otherwise", () => {
		const name = ((): string | undefined => "Ada")();
		expectly.toBeDefined(name);
		expect(name.toUpperCase()).toBe("ADA");

		const error = getRejectedErrorSync(() => expectly.toBeDefined(undefined));
		expect(stripAnsi(error.message)).toContain("expect(received).toBeDefined()");
		expect(error.stack).toContain("expectly-return.spec.ts");
		expect(error.stack).not.toContain("expectly-return.ts");
		expect((error as Error & { matcherResult?: unknown }).matcherResult).toBeDefined();
	});

	test("accepts a custom message like expect() does", () => {
		expect(getRejectedErrorSync(() => expectly.not.toBeNull(null, "user was not found")).message).toContain(
			"user was not found",
		);
		expect(getRejectedErrorSync(() => expectly.toBeTruthy("", { message: "token was empty" })).message).toContain(
			"token was empty",
		);
	});

	test("is available on every wrapped expect", () => {
		const extended = expectly.extend({
			toExceed(received: number, minimum: number): MatcherReturnType {
				return { pass: received > minimum, message: () => "expected a larger number" };
			},
		});
		for (const wrapped of [withReturn(expect), expectly.configure({ timeout: 10 }), extended]) {
			expect(() => wrapped.toBeDefined(1)).not.toThrow();
			expect(() => wrapped.not.toBeNull(null)).toThrow();
			expect(() => wrapped.toBeFalsy(1)).toThrow();
		}
		expect(extended(2).toExceed).toBeInstanceOf(Function);
	});

	test("keeps Playwright's asymmetric expect.not matchers", () => {
		expect({ name: "Ada" }).toEqual({ name: expectly.not.stringContaining("Bob") });
		expect(["a"]).toEqual(expectly.not.arrayContaining(["b"]));
	});

	test("soft assertions record the failure and let the test continue", () => {
		// Soft failures would fail this test; the reporter fixture in expectly-return-stack.spec.ts covers them.
		expect(() => expectly.soft.toBeDefined("x")).not.toThrow();
		expect(() => expectly.soft.not.toBeNull("x")).not.toThrow();
		expect(test.info().errors).toHaveLength(0);
	});
});
