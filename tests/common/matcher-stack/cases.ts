import "../../../packages/playwright-expectly-fuzzy/src/types/matcher-types";
import "../../../packages/playwright-expectly/src/types/matcher-types";

import { expect as baseExpect, test } from "@playwright/test";

import { expectlyFuzzy } from "../../../packages/playwright-expectly-fuzzy/src/expectly-fuzzy";
import { expectly, expectlyMatchers } from "../../../packages/playwright-expectly/src/expectly";

const extended = baseExpect.extend(expectlyMatchers);

test("date", () => {
	expectly(new Date("invalid")).toBeDateCloseTo(new Date(), { days: 1 }); // call:date
});

test("fuzzy", () => {
	expectlyFuzzy("abc").toMatchFuzzy("abc", 101); // call:fuzzy
});

test("stability", async ({ page }) => {
	await extended(page.locator("div")).toBeStable({ checkInterval: 0 }); // call:stability
});

test("strict", async ({ page }) => {
	await page.setContent("<div>one</div><div>two</div>");
	await extended(page.locator("div")).toStartWith("one", { timeout: 100 }); // call:strict
});

test("missing", async ({ page }) => {
	await expectly(page.locator("#missing")).toStartWith("one", { timeout: 500 }); // call:missing
});

test("closed", async ({ page }) => {
	const locator = page.locator("div");
	await page.close();
	await expectly(locator).toStartWith("one", { timeout: 500 }); // call:closed
});

test("fuzzy-locator", async ({ page }) => {
	await page.setContent("<div>one</div><div>two</div>");
	await expectlyFuzzy(page.locator("div")).toMatchFuzzy("one", 80, { timeout: 100 }); // call:fuzzy-locator
});

test("mismatch", async ({ page }) => {
	await page.setContent("<div>one</div>");
	await expectly(page.locator("div")).toStartWith("two", { timeout: 100, intervals: [1] }); // call:mismatch
});

test("array", () => {
	extended([3, 1]).toHaveAscendingOrder(); // call:array
});
