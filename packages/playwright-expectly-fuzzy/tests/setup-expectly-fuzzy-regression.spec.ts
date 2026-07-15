// oxlint-disable typescript/no-deprecated
import { expect, test } from "@playwright/test";

import { setupExpectlyFuzzy } from "../src";

setupExpectlyFuzzy();
// Double to verify the idempotency of the setup function. It should not break the matcher availability.
setupExpectlyFuzzy();

class FuzzyAssertions {
	assertSummary(actual: string, expected: string): void {
		expect(actual).toMatchFuzzy(expected);
	}
}

test("setupExpectlyFuzzy enables the string matcher without importing expectlyFuzzy directly", () => {
	const fuzzyAssertions = new FuzzyAssertions();

	fuzzyAssertions.assertSummary("Hello Wrold", "Hello World");
});

test("setupExpectlyFuzzy can be called repeatedly without changing matcher availability", () => {
	setupExpectlyFuzzy();
	setupExpectlyFuzzy();

	expect("world hello").toMatchFuzzy("hello world");
});
