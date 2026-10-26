import { expect, test } from "@playwright/test";

import { getRejectedError, stripAnsi } from "../../../../tests/common/assertion-utils";
import { expectlyLocator } from "../../src/expectly-locator";

test.describe("expectLocator - count ranges", () => {
	test.beforeEach(async ({ page }) => {
		await page.setContent(`
			<ul>
				<li>One</li>
				<li>Two</li>
				<li style="display: none">Hidden</li>
			</ul>
		`);
	});

	test("compares the number of matching elements", async ({ page }) => {
		const items = page.locator("li");
		await expectlyLocator(items).toHaveCountGreaterThan(2);
		await expectlyLocator(items).toHaveCountGreaterThanOrEqual(3);
		await expectlyLocator(items).toHaveCountLessThan(4);
		await expectlyLocator(items).toHaveCountLessThanOrEqual(3);
		await expectlyLocator(items).toHaveCountBetween(1, 3);
		await expectlyLocator(items).not.toHaveCountGreaterThan(3);
		await expectlyLocator(items).not.toHaveCountBetween(4, 10);
	});

	test("counts only visible elements with { visible: true }", async ({ page }) => {
		const items = page.locator("li");
		await expectlyLocator(items).toHaveCountLessThan(3, { visible: true });
		await expectlyLocator(items).toHaveCountBetween(2, 2, { visible: true });
	});

	test("zero elements is a valid count", async ({ page }) => {
		await expectlyLocator(page.locator(".missing")).toHaveCountLessThan(1);
		await expectlyLocator(page.locator(".missing")).not.toHaveCountGreaterThan(0);
	});

	test("retries until the count is in range", async ({ page }) => {
		await page.evaluate(() => {
			setTimeout(() => {
				for (let i = 0; i < 5; i++) document.querySelector("ul")!.append(document.createElement("li"));
			}, 300);
		});
		await expectlyLocator(page.locator("li")).toHaveCountGreaterThanOrEqual(8, { timeout: 3000 });
	});

	test("reports the received count", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("li")).toHaveCountGreaterThan(5, { timeout: 200 }),
		);
		expect(error.message).toContain("Expected number of elements to be more than 5");
		expect(stripAnsi(error.message)).toContain("Received: 3");
	});

	test("rejects invalid counts and ranges", async ({ page }) => {
		const items = page.locator("li");
		expect((await getRejectedError(expectlyLocator(items).toHaveCountGreaterThan(-1))).message).toContain(
			"non-negative integer",
		);
		expect((await getRejectedError(expectlyLocator(items).toHaveCountBetween(5, 1))).message).toContain(
			"must not be greater than max",
		);
	});
});
