import { expect, type Page, test } from "@playwright/test";

import { getRejectedError, stripAnsi } from "../../../tests/common/assertion-utils";
import { expectlyPage } from "../src/expectly-page";

const ORIGIN = "https://app.expectly.test";

test.beforeEach(async ({ page }) => {
	// A fake origin, so cookies and web storage work without a server.
	await page.route(`${ORIGIN}/**`, (route) =>
		route.fulfill({
			contentType: "text/html",
			headers: { "set-cookie": "session=abc123; Path=/" },
			body: "<!doctype html><button>Accept</button>",
		}),
	);
	await page.goto(`${ORIGIN}/`);
});

test.describe("toHaveCookie", () => {
	test("finds a cookie by name and value on the page or its context", async ({ page, context }) => {
		await expectlyPage(page).toHaveCookie("session");
		await expectlyPage(page).toHaveCookie("session", "abc123");
		await expectlyPage(context).toHaveCookie("session", /^abc/);
		await expectlyPage(page).not.toHaveCookie("session", "other");
		await expectlyPage(page).not.toHaveCookie("missing");
	});

	test("filters by domain and path", async ({ page }) => {
		await expectlyPage(page).toHaveCookie("session", "abc123", { domain: "app.expectly.test", path: "/" });
		await expectlyPage(page).not.toHaveCookie("session", undefined, { path: "/admin" });
	});

	test("retries until a cookie is set", async ({ page }) => {
		await page.evaluate(() => setTimeout(() => (document.cookie = "consent=granted; path=/"), 300));
		await expectlyPage(page).toHaveCookie("consent", "granted", { timeout: 3000 });
	});

	test("reports the cookies found", async ({ page }) => {
		const error = await getRejectedError(expectlyPage(page).toHaveCookie("session", "nope", { timeout: 200 }));
		const message = stripAnsi(error.message);
		expect(message).toContain('Expected cookie "session" with value "nope"');
		expect(message).toContain('"abc123"');
	});

	test("rejects other receivers", async () => {
		const error = await getRejectedError(expectlyPage("page" as unknown as Page).toHaveCookie("session"));
		expect(error.message).toContain("must be a Page or BrowserContext");
	});
});

test.describe("web storage", () => {
	test("finds localStorage and sessionStorage items", async ({ page }) => {
		await page.evaluate(() => {
			localStorage.setItem("theme", "dark");
			sessionStorage.setItem("cart", "c-42");
		});
		await expectlyPage(page).toHaveLocalStorageItem("theme");
		await expectlyPage(page).toHaveLocalStorageItem("theme", "dark");
		await expectlyPage(page).toHaveSessionStorageItem("cart", /^c-\d+$/);
		await expectlyPage(page).not.toHaveLocalStorageItem("cart");
		await expectlyPage(page).not.toHaveSessionStorageItem("theme");
	});

	test("retries until an item is stored", async ({ page }) => {
		await page.evaluate(() => setTimeout(() => localStorage.setItem("token", "t"), 300));
		await expectlyPage(page).toHaveLocalStorageItem("token", "t", { timeout: 3000 });
	});

	test("reports a missing item", async ({ page }) => {
		const error = await getRejectedError(
			expectlyPage(page).toHaveLocalStorageItem("absent", undefined, { timeout: 200 }),
		);
		expect(error.message).toContain("(no such item)");
	});
});
