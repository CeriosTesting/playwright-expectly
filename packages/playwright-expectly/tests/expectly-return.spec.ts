import { expect, test } from "@playwright/test";
import type { MatcherReturnType } from "@playwright/test";

import { expectly } from "../src/expectly";
import { withReturn } from "../src/expectly-return";

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

test("return-aware assertions reject soft failures and preserve custom messages", async () => {
	const soft = withReturn(expect.configure({ soft: true, message: "configured failure" }));
	await expect(
		soft
			.pollAndReturn(() => "PENDING", {
				timeout: 30,
				intervals: [1],
				message: "order was not ready",
			})
			.toBe("READY"),
	).rejects.toThrow("order was not ready");
	await expect(
		soft((): number => {
			throw new Error("not yet");
		}, "callback never succeeded").toPassAndReturn({ timeout: 30, intervals: [1] }),
	).rejects.toThrow("callback never succeeded");
	await expect(soft.pollAndReturn(() => 0, { timeout: 30, intervals: [1] }).toBe(1)).rejects.toThrow(
		"configured failure",
	);
	expect(test.info().errors).toHaveLength(0);
	expect(await soft.pollAndReturn(() => 42).toBe(42)).toBe(42);
	expect(await soft(() => 42).toPassAndReturn({ timeout: 100 })).toBe(42);
});
