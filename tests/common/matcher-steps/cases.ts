import "../../../packages/playwright-expectly-fuzzy/src/types/matcher-types";
import "../../../packages/playwright-expectly/src/types/matcher-types";

import { expect as baseExpect, test } from "@playwright/test";

import { expectlyFuzzy } from "../../../packages/playwright-expectly-fuzzy/src/expectly-fuzzy";
import { expectlyMatchers } from "../../../packages/playwright-expectly/src/expectly";

// Each test makes one passing and one failing (soft) assertion, so both paths are checked for nested steps.
const expect = baseExpect.extend(expectlyMatchers);

const users = [
	{ id: 1, name: "Alice", tags: ["a", "b"] },
	{ id: 2, name: "Bob", tags: ["c"] },
	{ id: 3, name: "Carol", tags: [] },
];

test("toEqualPartially", () => {
	expect(users).toEqualPartially([{ name: "Carol" }, { name: "Alice", tags: ["b"] }]);
	expect.soft(users).toEqualPartially([{ name: "Dave" }, { name: "Alice" }]);
	expect(users).toEqualPartially([{ id: 1 }, { id: 2 }, { id: 3 }], { arrayMode: "exactOrder" });
	expect.soft({ user: users[0] }).toEqualPartially({ user: { name: "Bob" } });
});

test("toBeAnyOf", () => {
	expect({ id: 1 }).toBeAnyOf({ id: 2 }, { id: 3 }, { id: 1 });
	expect.soft({ id: 1 }).toBeAnyOf({ id: 2 }, { id: 3 });
});

test("array order", () => {
	expect([1, 2, 3]).toHaveAscendingOrder();
	expect.soft([3, 1, 2]).toHaveAscendingOrder();
	expect(["c", "b", "a"]).toHaveDescendingOrder();
	expect.soft(["a", "c", "b"]).toHaveDescendingOrder();
});

test("collections", () => {
	expect(users).toIncludeSameMembers([users[2], users[0], users[1]]);
	expect.soft(users).toIncludeSameMembers([users[0]]);
	expect(users[0]).toContainEntries([
		["name", "Alice"],
		["tags", ["a", "b"]],
	]);
	expect.soft(users[0]).toContainEntries([["name", "Bob"]]);
});

test("locator", async ({ page }) => {
	await page.setContent("<div>loading</div>");
	await page.evaluate(() => setTimeout(() => (document.querySelector("div")!.textContent = "ready now"), 300));
	await expect(page.locator("div")).toStartWith("ready", { timeout: 2000 });
	await expect.soft(page.locator("div")).toStartWith("never", { timeout: 300 });
});

test("page", async ({ page }) => {
	// Web storage needs a real origin; about:blank denies access.
	await page.route("http://expectly.test/", (route) =>
		route.fulfill({ contentType: "text/html", body: "<div></div>" }),
	);
	await page.goto("http://expectly.test/");
	await page.evaluate(() => setTimeout(() => localStorage.setItem("theme", "dark"), 300));
	await expect(page).toHaveLocalStorageItem("theme", "dark", { timeout: 2000 });
	await expect.soft(page).toHaveLocalStorageItem("theme", "light", { timeout: 300 });
});

test("fuzzy locator", async ({ page }) => {
	await page.setContent("<div>loading</div>");
	await page.evaluate(() => setTimeout(() => (document.querySelector("div")!.textContent = "Hello World"), 300));
	await expectlyFuzzy(page.locator("div")).toMatchFuzzy("Hello Wrold", 80, { timeout: 2000 });
	await expectlyFuzzy.soft(page.locator("div")).toMatchFuzzy("Goodbye", 80, { timeout: 300 });
});
