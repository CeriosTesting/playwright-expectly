import { getRejectedErrorSync } from "../../../tests/common/assertion-utils";
import { expectly } from "../src/expectly";

import { expect, test } from "./fixtures";

/**
 * Regression coverage for the Date/numeric `toBeCloseTo` collision: the Date matcher used to be
 * registered as `toBeCloseTo`, which replaced Playwright's built-in numeric `toBeCloseTo` on every
 * `expect` extended with `expectlyMatchers`. The Date matcher is now `toBeDateCloseTo`, so both
 * must work side by side on the extended `expect` from `./fixtures` and on the standalone `expectly`.
 */
test.describe("expect from tests/fixtures.ts (toBeCloseTo collision regression)", () => {
	test("Date toBeDateCloseTo works on the extended expect", () => {
		const now = new Date();
		expect(now).toBeDateCloseTo(new Date(now.getTime() + 1000), { seconds: 5 });
	});

	test("Date toBeDateCloseTo fails when dates are outside the allowed deviation", () => {
		const now = new Date();

		const error = getRejectedErrorSync(() => {
			expect(now).toBeDateCloseTo(new Date(now.getTime() + 60_000), { seconds: 5 });
		});
		expect(error.message).toContain("toBeDateCloseTo");
	});

	test("numeric toBeCloseTo keeps Playwright's built-in behavior on the extended expect", async () => {
		expect(0.1 + 0.2).toBeCloseTo(0.3);
		expect(0.1 + 0.2).toBeCloseTo(0.3, 5);
		expect(0.1).not.toBeCloseTo(0.2);
		await expect.poll(() => 0.1 + 0.2).toBeCloseTo(0.3, 5);
	});

	test("numeric toBeCloseTo keeps Playwright's built-in behavior on the standalone expectly", () => {
		expectly(0.1 + 0.2).toBeCloseTo(0.3, 5);
		expectly(0.1).not.toBeCloseTo(0.2);
	});

	test("numeric toBeCloseTo still fails with Playwright's own message", () => {
		const error = getRejectedErrorSync(() => {
			expect(0.1).toBeCloseTo(0.2, 5);
		});
		expect(error.message).toContain("toBeCloseTo");
		expect(error.message).not.toContain("Invalid actual date");
	});

	test("other expectly matchers keep working on the extended expect", () => {
		expect(null).toBeNullish();
		expect("hello@example.com").toBeValidEmail();
		expect([1, 2, 3]).toHaveAscendingOrder();
	});
});
