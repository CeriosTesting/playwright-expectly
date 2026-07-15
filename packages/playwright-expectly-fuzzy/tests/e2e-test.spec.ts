import { expect, test } from "./fixtures";

test.describe("Test matchers integration in Playwright", () => {
	test("Expect should support the expectly-fuzzy matchers (e.g., toMatchFuzzy) with no manual setup call", () => {
		expect("Hello Wrold").toMatchFuzzy("Hello World");
	});
});
