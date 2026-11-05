import "../../../packages/playwright-expectly-fuzzy/src/types/matcher-types";
import "../../../packages/playwright-expectly/src/types/matcher-types";

import { test } from "@playwright/test";

import { expectlyFuzzy } from "../../../packages/playwright-expectly-fuzzy/src/expectly-fuzzy";
import { expectly } from "../../../packages/playwright-expectly/src/expectly";

// Every matcher gets more time than the test has, so the test timeout cuts it short.
const ORIGIN = "http://expectly.test";

test.beforeEach(async ({ page }) => {
	// A real origin, so web storage works.
	await page.route(`${ORIGIN}/`, (route) => route.fulfill({ contentType: "text/html", body: "<div>one</div>" }));
	await page.goto(`${ORIGIN}/`);
});

test("locator", async ({ page }) => {
	await expectly(page.locator("div")).toStartWith("never", { timeout: 10000 }); // call:locator
});

test("locator not", async ({ page }) => {
	await expectly(page.locator("div")).not.toStartWith("one", { timeout: 10000 }); // call:locator not
});

test("storage", async ({ page }) => {
	await expectly(page).toHaveLocalStorageItem("theme", "dark", { timeout: 10000 }); // call:storage
});

test("cookie", async ({ page }) => {
	await expectly(page).toHaveCookie("session", "abc", { timeout: 10000 }); // call:cookie
});

test("fuzzy locator", async ({ page }) => {
	await expectlyFuzzy(page.locator("div")).toMatchFuzzy("never", 80, { timeout: 10000 }); // call:fuzzy locator
});

test("stable", async ({ page }) => {
	await page.evaluate(() => setInterval(() => (document.querySelector("div")!.textContent = String(Date.now())), 50));
	await expectly(page.locator("div")).toBeStable({ timeout: 10000 }); // call:stable
});
