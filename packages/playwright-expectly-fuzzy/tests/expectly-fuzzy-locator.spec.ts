import { expect, test } from "@playwright/test";

import { getRejectedError } from "../../../tests/common/assertion-utils";
import { expectlyFuzzyLocator } from "../src/expectly-fuzzy-locator";

test.describe("expectlyFuzzyLocator - toMatchFuzzy", () => {
	test("should pass for nearly identical locator text (default threshold 80)", async ({ page }) => {
		await page.setContent('<div id="text">Hello Wrold</div>');
		await expectlyFuzzyLocator(page.locator("#text")).toMatchFuzzy("Hello World");
	});

	test("should pass for exact match", async ({ page }) => {
		await page.setContent('<div id="text">playwright testing</div>');
		await expectlyFuzzyLocator(page.locator("#text")).toMatchFuzzy("playwright testing");
	});

	test("should pass for word-order-insensitive match", async ({ page }) => {
		await page.setContent('<div id="text">world hello</div>');
		await expectlyFuzzyLocator(page.locator("#text")).toMatchFuzzy("hello world");
	});

	test("should pass with a custom lower threshold", async ({ page }) => {
		await page.setContent('<div id="text">Hello Warld</div>');
		await expectlyFuzzyLocator(page.locator("#text")).toMatchFuzzy("Hello World", 60);
	});

	test("should fail when similarity is below threshold", async ({ page }) => {
		await page.setContent('<div id="text">completely different text</div>');
		await expectlyFuzzyLocator(page.locator("#text")).not.toMatchFuzzy("hello world");
	});

	test("should work with .not for dissimilar strings", async ({ page }) => {
		await page.setContent('<div id="text">completely different text</div>');
		await expectlyFuzzyLocator(page.locator("#text")).not.toMatchFuzzy("hello world");
	});

	test("should pass with .not for strings that will never match above threshold", async ({ page }) => {
		await page.setContent('<div id="text">foo bar baz</div>');
		await expectlyFuzzyLocator(page.locator("#text")).not.toMatchFuzzy("completely unrelated content");
	});

	test("should fail quickly for .not when strings are already below threshold", async ({ page }) => {
		await page.setContent('<div id="text">foo bar baz</div>');
		const locator = page.locator("#text");

		const startTime = Date.now();
		await expectlyFuzzyLocator(locator).not.toMatchFuzzy("completely unrelated content");
		const elapsedTime = Date.now() - startTime;

		expect(elapsedTime).toBeLessThan(200);
	});

	test("should respect configured expect timeout when failing .not keeps matching", async ({ page }) => {
		await page.setContent('<div id="text">Hello World</div>');
		const locator = page.locator("#text");

		const startTime = Date.now();
		await getRejectedError(expectlyFuzzyLocator(locator).not.toMatchFuzzy("Hello World"));
		const elapsedTime = Date.now() - startTime;

		expect(elapsedTime).toBeGreaterThanOrEqual(100);
		expect(elapsedTime).toBeLessThan(1_000);
	});

	test("should support custom timeout option", async ({ page }) => {
		await page.setContent('<div id="text">Hello World</div>');
		await expectlyFuzzyLocator(page.locator("#text")).toMatchFuzzy("Hello World", 80, { timeout: 5000 });
	});

	test("should throw when threshold is out of range", async ({ page }) => {
		await page.setContent('<div id="text">Hello World</div>');
		let caught: Error | undefined;
		try {
			await expectlyFuzzyLocator(page.locator("#text")).toMatchFuzzy("Hello World", 150);
		} catch (e: unknown) {
			caught = e instanceof Error ? e : new Error(String(e));
		}
		if (!caught) throw new Error("Expected an error to be thrown for out-of-range threshold");
	});
});
