import { expect, test } from "@playwright/test";

import { getRejectedErrorSync } from "../../../tests/common/assertion-utils";
import { expectlyFuzzyString } from "../src/expectly-fuzzy-string";

test.describe("toMatchFuzzy", () => {
	test("should pass for nearly identical strings (default threshold 80)", () => {
		expectlyFuzzyString("Hello World").toMatchFuzzy("Hello Wrold");
	});

	test("should pass for word-order-insensitive match", () => {
		expectlyFuzzyString("world hello").toMatchFuzzy("hello world");
	});

	test("should pass for exact match", () => {
		expectlyFuzzyString("playwright testing").toMatchFuzzy("playwright testing");
	});

	test("should pass with a custom lower threshold", () => {
		expectlyFuzzyString("Hello World").toMatchFuzzy("Hello Warld", 60);
	});

	test("should fail when similarity is below default threshold", () => {
		const error = getRejectedErrorSync(() => {
			expectlyFuzzyString("completely different text").toMatchFuzzy("hello world");
		});
		expect(error.message).toContain("toMatchFuzzy");
		expect(error.message).toContain("Expected string to fuzzy match");
		expect(error.message).toContain("threshold: 80");
		expect(error.message).toContain("Similarity score:");
	});

	test("should fail when similarity is below custom threshold", () => {
		const error = getRejectedErrorSync(() => {
			expectlyFuzzyString("hello world").toMatchFuzzy("completely different text", 90);
		});
		expect(error.message).toContain("threshold: 90");
	});

	test("should work with .not for dissimilar strings", () => {
		expectlyFuzzyString("completely different text").not.toMatchFuzzy("hello world");
	});

	test("should fail with .not for similar strings", () => {
		const error = getRejectedErrorSync(() => {
			expectlyFuzzyString("Hello World").not.toMatchFuzzy("Hello Wrold");
		});
		expect(error.message).toContain("Expected string to not fuzzy match");
		expect(error.message).toContain("Similarity score:");
	});

	test.describe("boundary thresholds", () => {
		test.describe("default threshold (80)", () => {
			test("should pass when score is exactly at default threshold (score=80, threshold=80)", () => {
				// fuzz.token_sort_ratio("abcdefghijkl", "abcdefgh") === 80
				expectlyFuzzyString("abcdefghijkl").toMatchFuzzy("abcdefgh");
			});

			test("should fail when score is below default threshold (score=76, threshold=80)", () => {
				// fuzz.token_sort_ratio("abcdefghijklm", "abcdefgh") === 76
				const error = getRejectedErrorSync(() => {
					expectlyFuzzyString("abcdefghijklm").toMatchFuzzy("abcdefgh");
				});
				expect(error.message).toContain("threshold: 80");
				expect(error.message).toContain("Similarity score: 76");
			});
		});

		test.describe("custom threshold", () => {
			test("should pass when score is exactly at custom threshold (score=71, threshold=71)", () => {
				// fuzz.token_sort_ratio("hello world foo", "hello world bar baz") === 71
				expectlyFuzzyString("hello world foo").toMatchFuzzy("hello world bar baz", 71);
			});

			test("should fail when score is one below custom threshold (score=71, threshold=72)", () => {
				// fuzz.token_sort_ratio("hello world foo", "hello world bar baz") === 71
				const error = getRejectedErrorSync(() => {
					expectlyFuzzyString("hello world foo").toMatchFuzzy("hello world bar baz", 72);
				});
				expect(error.message).toContain("threshold: 72");
				expect(error.message).toContain("Similarity score: 71");
			});
		});

		test.describe("absolute boundaries (0 and 100)", () => {
			test("should pass with threshold=0 (minimum — always passes)", () => {
				expectlyFuzzyString("abc").toMatchFuzzy("xyz", 0);
			});

			test("should pass with threshold=100 for identical strings (score=100)", () => {
				expectlyFuzzyString("exact match").toMatchFuzzy("exact match", 100);
			});

			test("should fail with threshold=100 for non-identical strings (score<100)", () => {
				// score=91, threshold=100
				const error = getRejectedErrorSync(() => {
					expectlyFuzzyString("Hello World").toMatchFuzzy("Hello Wrold", 100);
				});
				expect(error.message).toContain("threshold: 100");
				expect(error.message).toContain("Similarity score: 91");
			});
		});
	});
});
