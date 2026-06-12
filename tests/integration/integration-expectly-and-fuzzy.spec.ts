import { expectlyAny, expectlyString } from "@cerios/playwright-expectly";
import { expect, test } from "@playwright/test";

/**
 * Integration tests combining @cerios/playwright-expectly and @cerios/playwright-expectly-fuzzy.
 *
 * These tests show a real-world pattern: validate the structure/format of a string
 * with exact matchers from expectly, then validate its content similarity with
 * fuzzy matchers from expectly-fuzzy — useful for AI-generated or dynamic text.
 */
test.describe("Integration: expectly + expectly-fuzzy", () => {
	test.describe("setup verification", () => {
		test("setupExpectly registers expectly matchers on the native expect", () => {
			// These matchers are only available after setupExpectly() is called in playwright.config.ts.
			// If setup was skipped, this test throws: "expect(...).toBeNullish is not a function".
			expect(null).toBeNullish();
			expect(undefined).toBeNullish();
			expect("hello@example.com").toBeValidEmail();
			expect("https://playwright.dev").toBeValidUrl();
			expect("abc123").toBeAlphanumeric();
		});

		test("setupExpectlyFuzzy registers toMatchFuzzy on the native expect", () => {
			// These matchers are only available after setupExpectlyFuzzy() is called in playwright.config.ts.
			// If setup was skipped, this test throws: "expect(...).toMatchFuzzy is not a function".
			expect("Hello World").toMatchFuzzy("Hello Wrold");
			expect("playwright testing").toMatchFuzzy("playwright testing");
			expect("completely different text").not.toMatchFuzzy("hello world");
		});

		test("both setups are independent — matchers from each are available on native expect", () => {
			// expectly matcher registered by setupExpectly
			expect("playwright").toStartWith("play");
			// fuzzy matcher registered by setupExpectlyFuzzy
			expect("playwright").toMatchFuzzy("playwrihgt");
		});
	});

	test.describe("exact structural validation followed by fuzzy content matching", () => {
		test("should validate a URL then fuzzy match its label", () => {
			const url = "https://playwright.dev/docs/test-assertions";
			const label = "Playwright test assertions documentation";

			// Exact structural validation via expectly
			expectlyString(url).toBeValidUrl();

			// Fuzzy content match via expectly-fuzzy
			expect(label).toMatchFuzzy("Playwright test assertions docs");
		});

		test("should validate an email format then fuzzy match the username part", () => {
			const email = "john.doe@example.com";
			const username = "john.doe";

			// Exact format check
			expectlyString(email).toBeValidEmail();

			// Fuzzy match on the username
			expect(username).toMatchFuzzy("john doe");
		});

		test("should confirm a string starts with a known prefix and fuzzy matches expected content", () => {
			const actual = "playwright is a great testing framework";

			// Exact prefix check
			expectlyString(actual).toStartWith("playwright");

			// Fuzzy content match — tolerates minor wording differences
			expect(actual).toMatchFuzzy("playwright is a great test framework");
		});

		test("should confirm a string ends with a known suffix and fuzzy matches expected content", () => {
			const actual = "The quick brown fox jumps over the lazy dog";

			// Exact suffix check
			expectlyString(actual).toEndWith("lazy dog");

			// Fuzzy match on the full sentence
			expect(actual).toMatchFuzzy("The quick brown fox jumps over the laazy dog");
		});

		test("should validate an alphanumeric string and fuzzy match it", () => {
			const value = "playwright42";

			// Exact alphanumeric check
			expectlyString(value).toBeAlphanumeric();

			// Fuzzy match
			expect(value).toMatchFuzzy("playwright42");
		});
	});

	test.describe("using native expect alongside both libraries", () => {
		test("should combine native expect, expectly, and expectly-fuzzy", () => {
			const text = "Hello World";

			// Native Playwright expect
			expect(text).toBeTruthy();

			// Exact expectly matcher
			expectlyString(text).toStartWith("Hello");
			expectlyString(text).toEndWith("World");

			// Fuzzy matcher
			expect(text).toMatchFuzzy("Hello Wrold"); // typo intentional
		});

		test("should validate type and content together", () => {
			const value = "test-run-result";

			// Type check via expectlyAny
			expectlyAny(value).toBePrimitive();

			// Format check via expectlyString
			expectlyString(value).toStartWith("test");
			expectlyString(value).toEndWith("result");

			// Fuzzy similarity
			expect(value).toMatchFuzzy("test-run-result");
			expect(value).not.toMatchFuzzy("completely different text");
		});
	});
});
