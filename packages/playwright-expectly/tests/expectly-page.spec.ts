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

test.describe("toHaveURLSearchParams", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${ORIGIN}/search?q=red%20shoes&page=2&tag=red&tag=sale`);
	});

	test("matches listed parameters and ignores others", async ({ page }) => {
		await expectlyPage(page).toHaveURLSearchParams({ q: "red shoes" });
		await expectlyPage(page).toHaveURLSearchParams({ q: "red shoes", page: /^\d+$/ });
		await expectlyPage(page).not.toHaveURLSearchParams({ q: "boots" });
	});

	test("matches repeated parameters in order", async ({ page }) => {
		await expectlyPage(page).toHaveURLSearchParams({ tag: ["red", "sale"] });
		await expectlyPage(page).not.toHaveURLSearchParams({ tag: ["sale", "red"] });
		await expectlyPage(page).not.toHaveURLSearchParams({ tag: ["red"] });
	});

	test("reads a single value like URLSearchParams.get(): the first occurrence", async ({ page }) => {
		await expectlyPage(page).toHaveURLSearchParams({ tag: "red" });
		await expectlyPage(page).not.toHaveURLSearchParams({ tag: "sale" });
	});

	test("accepts asymmetric matchers", async ({ page }) => {
		await expectlyPage(page).toHaveURLSearchParams({ q: expect.stringContaining("shoes"), page: expect.anything() });
		await expectlyPage(page).not.toHaveURLSearchParams({ q: expect.stringContaining("boots") });
	});

	test("asserts an absent parameter with .not and expect.anything()", async ({ page }) => {
		await expectlyPage(page).not.toHaveURLSearchParams({ debug: expect.anything() });
		await expectlyPage(page).toHaveURLSearchParams({ q: expect.anything() });
		// A repeated parameter is present too.
		await expectlyPage(page).toHaveURLSearchParams({ tag: expect.anything() });
	});

	test("does not treat an empty array as an absent parameter", async ({ page }) => {
		await expectlyPage(page).not.toHaveURLSearchParams({ debug: [] });
	});

	test("treats a parameter without a value as an empty string", async ({ page }) => {
		await page.goto(`${ORIGIN}/search?debug`);
		await expectlyPage(page).toHaveURLSearchParams({ debug: "" });
		await expectlyPage(page).toHaveURLSearchParams({ debug: expect.anything() });
	});

	test("retries until a parameter is removed", async ({ page }) => {
		await page.evaluate(() => setTimeout(() => history.pushState({}, "", "?step=2"), 300));
		await expectlyPage(page).not.toHaveURLSearchParams({ q: expect.anything() }, { timeout: 3000 });
	});

	test("rejects unlisted parameters with exact", async ({ page }) => {
		await expectlyPage(page).toHaveURLSearchParams(
			{ q: "red shoes", page: "2", tag: ["red", "sale"] },
			{ exact: true },
		);
		await expectlyPage(page).not.toHaveURLSearchParams({ q: "red shoes" }, { exact: true });
	});

	test("exact rejects parameters named like inherited object properties", async ({ page }) => {
		for (const name of ["constructor", "toString", "__proto__"]) {
			await page.goto(`${ORIGIN}/search?q=shoes&${name}=unexpected`);
			await expectlyPage(page).not.toHaveURLSearchParams({ q: "shoes" }, { exact: true });
		}
	});

	test("retries until the URL changes", async ({ page }) => {
		await page.evaluate(() => setTimeout(() => history.pushState({}, "", "?step=2"), 300));
		await expectlyPage(page).toHaveURLSearchParams({ step: "2" }, { timeout: 3000 });
	});

	test("reports the received parameters and the URL", async ({ page }) => {
		const error = await getRejectedError(
			expectlyPage(page).toHaveURLSearchParams({ q: "boots", page: "2" }, { exact: true, timeout: 200 }),
		);
		const message = stripAnsi(error.message);
		expect(message).toContain("Expected URL to have search params (and no others)");
		expect(message).toContain('Received: {"page": "2", "q": "red shoes", "tag": ["red", "sale"]}');
		expect(message).toContain('Mismatched: ["q"]');
		expect(message).toContain('Unexpected: ["tag"]');
		expect(message).toContain(`URL:      ${ORIGIN}/search?q=red%20shoes`);
	});

	test("rejects invalid expectations", async ({ page }) => {
		await expect(expectlyPage(page).toHaveURLSearchParams({})).rejects.toThrow(/at least one parameter/);
		await expect(expectlyPage(page).toHaveURLSearchParams({ q: 1 as unknown as string })).rejects.toThrow(
			/must be a string, RegExp, string array or asymmetric matcher$/,
		);
		// A parameter value is never null; point to .not for absence.
		await expect(expectlyPage(page).toHaveURLSearchParams({ q: null as unknown as string })).rejects.toThrow(
			/to assert absence use \.not with expect\.anything\(\)/,
		);
		await expect(expectlyPage(page).toHaveURLSearchParams({ q: { value: "x" } })).rejects.toThrow(/asymmetric matcher/);
		await expect(expectlyPage(page).toHaveURLSearchParams("q=1" as never)).rejects.toThrow(/object of query/);
	});
});
