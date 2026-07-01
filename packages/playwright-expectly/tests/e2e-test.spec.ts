import { expect, test } from "./fixtures";

test.describe("Test matchers integration in Playwright", () => {
	test("Expect should support the expectly matchers (e.g., toBeNullish matcher)", () => {
		expect(null).toBeNullish();
		expect(undefined).toBeNullish();
	});
});
