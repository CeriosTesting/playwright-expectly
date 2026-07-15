import { getRejectedErrorSync } from "../../../tests/common/assertion-utils";

import { expect, test } from "./fixtures";

/**
 * Regression coverage for GitHub issue #41: `toBeCloseTo` collides with Playwright's own
 * built-in numeric matcher. `expect.extend()` only mutates the *original* `expect` object in
 * place for matcher names that don't collide with a built-in, so the override for `toBeCloseTo`
 * only exists on the value returned by `.extend()`. `./fixtures` captures that return value
 * correctly (unlike the deprecated `setupExpectly()`), so importing `expect` from here must
 * make the Date `toBeCloseTo` matcher work with zero manual setup.
 */
test.describe("expect from tests/fixtures.ts (issue #41 regression)", () => {
	test("Date toBeCloseTo works on the native expect with no manual setup call", () => {
		const now = new Date();
		expect(now).toBeCloseTo(new Date(now.getTime() + 1000), { seconds: 5 });
	});

	test("Date toBeCloseTo still fails correctly when dates are outside the allowed deviation", () => {
		const now = new Date();

		const error = getRejectedErrorSync(() => {
			expect(now).toBeCloseTo(new Date(now.getTime() + 60_000), { seconds: 5 });
		});
		expect(error.message).toContain("toBeCloseTo");
	});

	test("other expectly matchers keep working alongside the Date toBeCloseTo override", () => {
		expect(null).toBeNullish();
		expect("hello@example.com").toBeValidEmail();
		expect([1, 2, 3]).toHaveAscendingOrder();
	});
});
