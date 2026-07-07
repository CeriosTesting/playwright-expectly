import { expect, test } from "./support/expect";

/**
 * Integration tests combining @cerios/playwright-expectly and @cerios/playwright-expectly-fuzzy.
 *
 * These tests show a real-world pattern: validate the structure/format of a string
 * with exact matchers from expectly, then validate its content similarity with
 * fuzzy matchers from expectly-fuzzy — useful for AI-generated or dynamic text.
 *
 * `test`/`expect` come from `./support/expect`, a single canonical module that merges both
 * packages' matchers via `mergeExpects()` — see that file for the recommended pattern. This
 * works reliably regardless of process/worker boundaries, unlike the deprecated
 * `setupExpectly()`/`setupExpectlyFuzzy()` functions.
 */
test.describe("Integration: expectly + expectly-fuzzy", () => {
	test.describe("setup verification", () => {
		test("mergeExpects registers expectly matchers on the merged expect", () => {
			expect(null).toBeNullish();
			expect(undefined).toBeNullish();
			expect("hello@example.com").toBeValidEmail();
			expect("https://playwright.dev").toBeValidUrl();
			expect("abc123").toBeAlphanumeric();
		});

		test("mergeExpects registers toMatchFuzzy on the merged expect", () => {
			expect("Hello World").toMatchFuzzy("Hello Wrold");
			expect("playwright testing").toMatchFuzzy("playwright testing");
			expect("completely different text").not.toMatchFuzzy("hello world");
		});

		test("both matcher sets are available together on the merged expect", () => {
			// expectly matcher
			expect("playwright").toStartWith("play");
			// fuzzy matcher
			expect("playwright").toMatchFuzzy("playwrihgt");
		});
	});

	test.describe("exact structural validation followed by fuzzy content matching", () => {
		test("should validate a URL then fuzzy match its label", () => {
			const url = "https://playwright.dev/docs/test-assertions";
			const label = "Playwright test assertions documentation";

			// Exact structural validation via expectly
			expect(url).toBeValidUrl();

			// Fuzzy content match via expectly-fuzzy
			expect(label).toMatchFuzzy("Playwright test assertions docs");
		});

		test("should validate an email format then fuzzy match the username part", () => {
			const email = "john.doe@example.com";
			const username = "john.doe";

			// Exact format check
			expect(email).toBeValidEmail();

			// Fuzzy match on the username
			expect(username).toMatchFuzzy("john doe");
		});

		test("should confirm a string starts with a known prefix and fuzzy matches expected content", () => {
			const actual = "playwright is a great testing framework";

			// Exact prefix check
			expect(actual).toStartWith("playwright");

			// Fuzzy content match — tolerates minor wording differences
			expect(actual).toMatchFuzzy("playwright is a great test framework");
		});

		test("should confirm a string ends with a known suffix and fuzzy matches expected content", () => {
			const actual = "The quick brown fox jumps over the lazy dog";

			// Exact suffix check
			expect(actual).toEndWith("lazy dog");

			// Fuzzy match on the full sentence
			expect(actual).toMatchFuzzy("The quick brown fox jumps over the laazy dog");
		});

		test("should validate an alphanumeric string and fuzzy match it", () => {
			const value = "playwright42";

			// Exact alphanumeric check
			expect(value).toBeAlphanumeric();

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
			expect(text).toStartWith("Hello");
			expect(text).toEndWith("World");

			// Fuzzy matcher
			expect(text).toMatchFuzzy("Hello Wrold"); // typo intentional
		});

		test("should validate type and content together", () => {
			const value = "test-run-result";

			// Type check via expectlyAny
			expect(value).toBePrimitive();

			// Format check via expectlyString
			expect(value).toStartWith("test");
			expect(value).toEndWith("result");

			// Fuzzy similarity
			expect(value).toMatchFuzzy("test-run-result");
			expect(value).not.toMatchFuzzy("completely different text");
		});
	});
});
