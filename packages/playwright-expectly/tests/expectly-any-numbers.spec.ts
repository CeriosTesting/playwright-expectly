import { expect, test } from "@playwright/test";

import { getRejectedErrorSync, stripAnsi } from "../../../tests/common/assertion-utils";
import { expectly } from "../src/expectly";
import type { NearOptions } from "../src/expectly-any";
import { expectlyAny } from "../src/expectly-any";

test.describe("toBeNear", () => {
	test("allows an absolute tolerance, inclusive", () => {
		expectlyAny(100.5).toBeNear(100, { tolerance: 0.5 });
		expectlyAny(99.5).toBeNear(100, { tolerance: 0.5 });
		expectlyAny(100.51).not.toBeNear(100, { tolerance: 0.5 });
		expectlyAny(0.1 + 0.2).toBeNear(0.3, { tolerance: 1e-9 });
		expectly(19.99).toBeNear(20, { tolerance: 0.01 });
	});

	test("absorbs binary rounding of decimal inputs but not real differences", () => {
		// 20 - 19.99 is 0.010000000000001563 in floating point.
		expectlyAny(19.99).toBeNear(20, { tolerance: 0.01 });
		expectlyAny(1.1).toBeNear(1, { percent: 10 });
		expectlyAny(19.989).not.toBeNear(20, { tolerance: 0.01 });
		expectlyAny(1e6 + 0.02).not.toBeNear(1e6, { tolerance: 0.01 });
	});

	test("allows a percentage of the expected value", () => {
		expectlyAny(1100).toBeNear(1000, { percent: 10 });
		expectlyAny(1101).not.toBeNear(1000, { percent: 10 });
		expectlyAny(-91).toBeNear(-100, { percent: 10 });
		expectlyAny(-111).not.toBeNear(-100, { percent: 10 });
		expectlyAny(0).toBeNear(0, { percent: 5 });
	});

	test("fails for values that are not finite numbers", () => {
		expectlyAny(Number.NaN).not.toBeNear(0, { tolerance: 1 });
		expectlyAny(Number.POSITIVE_INFINITY).not.toBeNear(0, { tolerance: 1 });
		expectlyAny("100").not.toBeNear(100, { tolerance: 1 });
	});

	test("rejects invalid arguments", () => {
		expect(() => expectlyAny(1).toBeNear(1, {} as NearOptions)).toThrow(/exactly one of/);
		expect(() => expectlyAny(1).toBeNear(1, { tolerance: 1, percent: 1 } as unknown as NearOptions)).toThrow(
			/exactly one of/,
		);
		expect(() => expectlyAny(1).toBeNear(1, { tolerance: -1 })).toThrow(/tolerance must be a non-negative/);
		expect(() => expectlyAny(1).toBeNear(1, { percent: Number.NaN })).toThrow(/percent must be a non-negative/);
		expect(() => expectlyAny(1).toBeNear(Number.NaN, { tolerance: 1 })).toThrow(/expected must be a finite number/);
	});

	test("shows the difference and the allowed deviation", () => {
		const error = getRejectedErrorSync(() => expectlyAny(1150).toBeNear(1000, { percent: 10 }));
		const message = stripAnsi(error.message);
		expect(message).toContain("Expected value to be within ±10% (±100) of 1000");
		expect(message).toMatch(/Difference: 150/);
		expect(message).toMatch(/Allowed:\s+±10% \(±100\)/);
	});
});

test.describe("toBeWithin", () => {
	test("includes both bounds", () => {
		expectlyAny(1).toBeWithin(1, 5);
		expectlyAny(5).toBeWithin(1, 5);
		expectlyAny(3.5).toBeWithin(1, 5);
		expectlyAny(-2).toBeWithin(-5, 0);
		expectlyAny(0.99).not.toBeWithin(1, 5);
		expectlyAny(5.01).not.toBeWithin(1, 5);
		expectly(4).toBeWithin(4, 4);
	});

	test("fails for values that are not numbers", () => {
		expectlyAny(Number.NaN).not.toBeWithin(0, 10);
		expectlyAny(Number.POSITIVE_INFINITY).not.toBeWithin(0, 10);
		expectlyAny("3").not.toBeWithin(0, 10);
	});

	test("rejects invalid bounds", () => {
		expect(() => expectlyAny(1).toBeWithin(5, 1)).toThrow(/min \(5\) must not be greater than max \(1\)/);
		expect(() => expectlyAny(1).toBeWithin(Number.NaN, 1)).toThrow(/min must be a finite number/);
		expect(() => expectlyAny(1).toBeWithin(0, Number.POSITIVE_INFINITY)).toThrow(/max must be a finite number/);
	});

	test("shows the range", () => {
		const error = getRejectedErrorSync(() => expectlyAny(7).toBeWithin(1, 5));
		expect(stripAnsi(error.message)).toContain("Expected value to be within 1 and 5 (inclusive)");
	});
});
