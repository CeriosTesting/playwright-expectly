import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { expectly } from "../src/expectly";
import { expectlyDate } from "../src/expectly-date";
import { expectlyNumberArray } from "../src/expectly-number-array";
import { expectlyObjectArray } from "../src/expectly-object-array";

test("uniqueness reflects mutations between assertions", () => {
	const first = { nested: { id: 1 } };
	const second = { nested: { id: 2 } };
	expectlyObjectArray([first, second]).toHaveOnlyUniqueObjects();
	second.nested.id = 1;
	expectlyObjectArray([first, second]).not.toHaveOnlyUniqueObjects();
	second.nested.id = 3;
	expectlyObjectArray([first, second]).toHaveOnlyUniqueObjects();
});

test("uniqueness compares rich values without serialization collisions", () => {
	for (const values of [
		[new Date(0), new Date(1)],
		[new Map([["id", 1]]), new Map([["id", 2]])],
		[new Set([1]), new Set([2])],
		[{ id: BigInt(1) }, { id: BigInt(2) }],
		[{ value: undefined }, {}],
	])
		expectlyObjectArray(values).toHaveOnlyUniqueObjects();
	expectlyObjectArray([new Map([["id", 1]]), new Map([["id", 1]])]).not.toHaveOnlyUniqueObjects();
	const first: { self?: unknown } = {};
	first.self = first;
	const second: { self?: unknown } = {};
	second.self = second;
	expectlyObjectArray([first, second]).not.toHaveOnlyUniqueObjects();
});

for (const flags of ["g", "y"]) {
	test(`pattern matching preserves ${flags} regex state`, () => {
		const pattern = new RegExp("abc", flags);
		pattern.lastIndex = 2;
		expectly("abc").toMatchPattern(pattern);
		expectly("abc").toMatchPattern(pattern);
		expect(pattern.lastIndex).toBe(2);
	});
	test(`negated locator matching does not falsely pass with ${flags}`, async ({ page }) => {
		await page.setContent('<div data-value="abc">abc</div>');
		const pattern = new RegExp("abc", flags);
		pattern.lastIndex = 2;
		await expect(
			expectly(page.locator("div")).not.toMatchPattern(pattern, { timeout: 50, intervals: [1] }),
		).rejects.toThrow();
		await expect(
			expectly(page.locator("div")).not.toHaveDataAttribute("value", pattern, { timeout: 50, intervals: [1] }),
		).rejects.toThrow();
		expect(pattern.lastIndex).toBe(2);
	});
}

test("concurrent and reused poll assertions return their own matching values", async () => {
	let attempts = 0;
	const poll = expectly.pollAndReturn(() => ++attempts, { timeout: 500, intervals: [1] });
	const first = poll.toBe;
	expect(await Promise.all([first(1), poll.toBe(2)])).toEqual([1, 2]);
	expect(await Promise.all([poll.not.toBe(0), poll.not.toBe(0)])).toEqual([3, 4]);
	expect(await first(5)).toBe(5);
});

test("consecutive calendar months handle month ends and year transitions", () => {
	expectlyDate([new Date(2025, 0, 31), new Date(2025, 1, 28)]).toHaveConsecutiveDates("month");
	expectlyDate([new Date(2024, 0, 31), new Date(2024, 1, 29)]).toHaveConsecutiveDates("month");
	expectlyDate([new Date(2024, 11, 31), new Date(2025, 0, 1)]).toHaveConsecutiveDates("month");
	expectlyDate([new Date(2025, 0, 31), new Date(2025, 2, 1)]).not.toHaveConsecutiveDates("month");
});

test("ISO validation rejects normalization of invalid dates", () => {
	for (const invalid of [
		"2025-02-30T00:00:00Z",
		"2025-02-29T00:00:00Z",
		"1900-02-29T00:00:00Z",
		"2025-04-31T00:00:00",
		"2025-01-01T24:00:00Z",
		"2025-01-01T12:60:00Z",
	]) {
		expectlyDate(invalid).not.toBeValidISODateTime();
	}
	for (const valid of ["2024-02-29T23:59:59.999Z", "2000-02-29T00:00:00", "0000-02-29T00:00:00Z"])
		expectlyDate(valid).toBeValidISODateTime();
});

test("partial matching rejects cycles explicitly but allows shared references", () => {
	const cycle: { self?: unknown } = {};
	cycle.self = cycle;
	expect(() => expectly(cycle).toEqualPartially(cycle)).toThrow("does not support circular");
	expect(() => expectly(cycle).not.toEqualPartially({})).toThrow("does not support circular");
	const array: unknown[] = [];
	array.push(array);
	expect(() => expectly([]).toEqualPartially(array)).toThrow("does not support circular");
	const shared = { id: 1 };
	expectly({ a: shared, b: shared, extra: true }).toEqualPartially({ a: shared, b: shared });
	expectly([1, 1, 2]).toEqualPartially([1, 2]);
	expectly([1]).not.toEqualPartially([1, 1]);
});

test("numeric comparisons reject non-finite values in combined and standalone APIs", () => {
	for (const invalid of [NaN, Infinity, -Infinity]) {
		expect(() => expectly([1, invalid, 2]).toHaveStrictlyAscendingOrder()).toThrow("finite numbers");
		expect(() => expectly([invalid]).toHaveStrictlyDescendingOrder()).toThrow("finite numbers");
		expect(() => expectly([invalid]).toBeMonotonic()).toThrow("finite numbers");
		expect(() => expectlyNumberArray([1]).toBeAllLessThan(invalid)).toThrow("finite numbers");
		expect(() => expectlyNumberArray([invalid]).toHaveSum(0)).toThrow("finite numbers");
		expect(() => expectlyNumberArray([1]).toHaveAverage(invalid)).toThrow("finite numbers");
	}
});

test("sum, average and median use a magnitude-aware rounding tolerance", () => {
	expectlyNumberArray([1000000000000.1, 0.2]).toHaveSum(1000000000000.3);
	expectlyNumberArray([0.1, 0.2]).toHaveAverage(0.15);
	expectlyNumberArray([0.1, 0.2]).toHaveMedian(0.15);
	expectlyNumberArray([1000000000000.1, 0.2]).not.toHaveSum(1000000000001);
});

for (const fails of [false, true]) {
	test(`visible-count handles are disposed on ${fails ? "failure" : "success"}`, async () => {
		let disposals = 0;
		const locator = {
			elementHandles: () =>
				Promise.resolve([
					{
						isVisible: (): Promise<boolean> =>
							fails ? Promise.reject(new Error("visibility failed")) : Promise.resolve(true),
						dispose: (): Promise<void> => {
							disposals++;
							return Promise.resolve();
						},
					},
				]),
		} as unknown as Locator;
		const assertion = expectly(locator).toHaveCountVisible(1, { timeout: 100, intervals: [1] });
		if (fails) await expect(assertion).rejects.toThrow("visibility failed");
		else await assertion;
		expect(disposals).toBe(1);
	});
}
