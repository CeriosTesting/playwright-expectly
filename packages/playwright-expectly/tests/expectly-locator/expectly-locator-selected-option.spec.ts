import { expect, test } from "@playwright/test";

import { getRejectedError, stripAnsi } from "../../../../tests/common/assertion-utils";
import { expectly } from "../../src/expectly";
import { expectlyLocatorAttributes } from "../../src/expectly-locator/expectly-locator-attributes";

test.beforeEach(async ({ page }) => {
	await page.setContent(`
		<select id="country">
			<option value="nl">Netherlands</option>
			<option value="be" selected>Belgium</option>
		</select>
		<select id="toppings" multiple>
			<option selected>Cheese</option>
			<option>Olives</option>
			<option selected>Ham &amp; pineapple</option>
		</select>
		<select id="labelled"><option value="x" label="Short" selected>Long visible text</option></select>
		<select id="spaced"><option selected>  Spaced
			text  </option></select>
		<select id="none" multiple><option>A</option></select>
		<div id="not-select">Belgium</div>
	`);
});

test.describe("toHaveSelectedOption", () => {
	test("matches the label of the selected option", async ({ page }) => {
		const country = page.locator("#country");
		await expectlyLocatorAttributes(country).toHaveSelectedOption("Belgium");
		await expectlyLocatorAttributes(country).toHaveSelectedOption(/^Bel/);
		await expectlyLocatorAttributes(country).toHaveSelectedOption(["Belgium"]);
		await expectlyLocatorAttributes(country).not.toHaveSelectedOption("Netherlands");
		// The value attribute is not the label.
		await expectlyLocatorAttributes(country).not.toHaveSelectedOption("be");
	});

	test("matches all selected options of a multi-select in order", async ({ page }) => {
		const toppings = page.locator("#toppings");
		await expectlyLocatorAttributes(toppings).toHaveSelectedOption(["Cheese", "Ham & pineapple"]);
		await expectlyLocatorAttributes(toppings).toHaveSelectedOption(["Cheese", /^Ham/]);
		await expectlyLocatorAttributes(toppings).not.toHaveSelectedOption(["Ham & pineapple", "Cheese"]);
		await expectlyLocatorAttributes(toppings).not.toHaveSelectedOption(["Cheese"]);
		// One expected label means exactly one selected option.
		await expectlyLocatorAttributes(toppings).not.toHaveSelectedOption("Cheese");
	});

	test("uses the label attribute and collapses whitespace", async ({ page }) => {
		await expectlyLocatorAttributes(page.locator("#labelled")).toHaveSelectedOption("Short");
		await expectlyLocatorAttributes(page.locator("#spaced")).toHaveSelectedOption("Spaced text");
	});

	test("matches no selection with an empty array", async ({ page }) => {
		await expectlyLocatorAttributes(page.locator("#none")).toHaveSelectedOption([]);
		await expectlyLocatorAttributes(page.locator("#none")).not.toHaveSelectedOption("A");
	});

	test("retries until the selection changes", async ({ page }) => {
		await page.evaluate(() =>
			setTimeout(() => {
				(document.querySelector("#country") as HTMLSelectElement).value = "nl";
			}, 300),
		);
		await expectlyLocatorAttributes(page.locator("#country")).toHaveSelectedOption("Netherlands", { timeout: 3000 });
	});

	test("follows selectOption and is available on the unified expectly", async ({ page }) => {
		await page.locator("#country").selectOption("nl");
		await expectly(page.locator("#country")).toHaveSelectedOption("Netherlands");
	});

	test("reports the selected labels", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocatorAttributes(page.locator("#toppings")).toHaveSelectedOption(["Olives"], { timeout: 200 }),
		);
		const message = stripAnsi(error.message);
		expect(message).toContain('Expected element to have selected options: ["Olives"]');
		expect(message).toContain('Received: ["Cheese", "Ham & pineapple"]');
	});

	test("reports when nothing is selected", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocatorAttributes(page.locator("#none")).toHaveSelectedOption("A", { timeout: 200 }),
		);
		expect(stripAnsi(error.message)).toContain("(no option selected)");
	});

	test("fails for an element that is not a select", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocatorAttributes(page.locator("#not-select")).toHaveSelectedOption("Belgium", { timeout: 200 }),
		);
		expect(stripAnsi(error.message)).toContain("(element is not a <select>)");
	});

	test("fails for a missing element", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocatorAttributes(page.locator("#missing")).toHaveSelectedOption("Belgium", { timeout: 200 }),
		);
		expect(stripAnsi(error.message)).toContain("element(s) not found");
	});

	test("rejects invalid expected labels", async ({ page }) => {
		await expect(
			expectlyLocatorAttributes(page.locator("#country")).toHaveSelectedOption(42 as unknown as string),
		).rejects.toThrow(/must be a string, RegExp or an array of them/);
	});
});
