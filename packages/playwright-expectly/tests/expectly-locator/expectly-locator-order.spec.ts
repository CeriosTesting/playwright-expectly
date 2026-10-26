import { expect, test } from "@playwright/test";

import { getRejectedError, stripAnsi } from "../../../../tests/common/assertion-utils";
import { expectlyLocator } from "../../src/expectly-locator";

async function table(page: import("@playwright/test").Page, cells: string[]): Promise<void> {
	await page.setContent(`<table><tbody>${cells.map((cell) => `<tr><td> ${cell} </td></tr>`).join("")}</tbody></table>`);
}

test.describe("expectLocator - texts in order", () => {
	test("checks ascending and descending order of trimmed texts", async ({ page }) => {
		await table(page, ["Ann", "Bob", "Bob", "Cid"]);
		const cells = page.locator("td");
		await expectlyLocator(cells).toHaveTextsInAscendingOrder();
		await expectlyLocator(cells).not.toHaveTextsInAscendingOrder({ strict: true });
		await expectlyLocator(cells).not.toHaveTextsInDescendingOrder();
	});

	test("compares digit sequences numerically with { numeric: true }", async ({ page }) => {
		await table(page, ["Item 2", "Item 10", "Item 11"]);
		const cells = page.locator("td");
		await expectlyLocator(cells).not.toHaveTextsInAscendingOrder();
		await expectlyLocator(cells).toHaveTextsInAscendingOrder({ numeric: true });
	});

	test("parses values such as prices", async ({ page }) => {
		await table(page, ["$9.99", "$19.99", "$100.00"]);
		await expectlyLocator(page.locator("td")).toHaveTextsInAscendingOrder({
			parse: (text) => Number(text.replace(/[^\d.]/g, "")),
		});
	});

	test("ignores case when asked", async ({ page }) => {
		await table(page, ["apple", "Banana", "cherry"]);
		const cells = page.locator("td");
		await expectlyLocator(cells).not.toHaveTextsInAscendingOrder();
		await expectlyLocator(cells).toHaveTextsInAscendingOrder({ ignoreCase: true });
	});

	test("retries until a sort finishes", async ({ page }) => {
		await table(page, ["Cid", "Ann", "Bob"]);
		await page.evaluate(() => {
			setTimeout(() => {
				const body = document.querySelector("tbody")!;
				const rows = [...body.querySelectorAll("tr")].sort((a, b) => a.textContent.localeCompare(b.textContent));
				body.replaceChildren(...rows);
			}, 300);
		});
		await expectlyLocator(page.locator("td")).toHaveTextsInAscendingOrder({ timeout: 3000 });
	});

	test("reports the first violation", async ({ page }) => {
		await table(page, ["Ann", "Cid", "Bob"]);
		const error = await getRejectedError(
			expectlyLocator(page.locator("td")).toHaveTextsInAscendingOrder({ timeout: 200 }),
		);
		const message = stripAnsi(error.message);
		expect(message).toContain("First violation at index 1 → 2");
		expect(message).toContain('"Cid" then "Bob"');
	});

	test("fails both forms when no elements match", async ({ page }) => {
		await table(page, []);
		for (const assertion of [
			expectlyLocator(page.locator("td")).toHaveTextsInAscendingOrder({ timeout: 200 }),
			expectlyLocator(page.locator("td")).not.toHaveTextsInAscendingOrder({ timeout: 200 }),
		]) {
			expect((await getRejectedError(assertion)).message).toContain("element(s) not found");
		}
	});
});

test.describe("expectLocator - toHaveStyles", () => {
	test.beforeEach(async ({ page }) => {
		await page.setContent(`
			<style>
				:root { --brand: #ff0000; }
				.alert { color: rgb(255, 0, 0); font-weight: 700; --gap: 4px; }
				.alert::before { content: "!"; }
			</style>
			<div class="alert">Alert</div>
		`);
	});

	test("checks several computed properties at once", async ({ page }) => {
		const alert = page.locator(".alert");
		await expectlyLocator(alert).toHaveStyles({ color: "rgb(255, 0, 0)", "font-weight": "700" });
		await expectlyLocator(alert).toHaveStyles({ color: /^rgb\(255/ });
		await expectlyLocator(alert).not.toHaveStyles({ color: "rgb(255, 0, 0)", "font-weight": "400" });
	});

	test("reads custom properties and pseudo-elements", async ({ page }) => {
		const alert = page.locator(".alert");
		await expectlyLocator(alert).toHaveStyles({ "--gap": "4px", "--brand": "#ff0000" });
		await expectlyLocator(alert).toHaveStyles({ content: '"!"' }, { pseudo: "::before" });
	});

	test("lists every mismatching property", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator(".alert")).toHaveStyles(
				{ color: "rgb(0, 0, 0)", "font-weight": "400", display: "block" },
				{ timeout: 200 },
			),
		);
		expect(error.message).toContain("color: expected");
		expect(error.message).toContain("font-weight: expected");
		expect(error.message).not.toContain("display: expected");
	});

	test("rejects an empty style object", async ({ page }) => {
		const error = await getRejectedError(expectlyLocator(page.locator(".alert")).toHaveStyles({}));
		expect(error.message).toContain("non-empty object");
	});
});
