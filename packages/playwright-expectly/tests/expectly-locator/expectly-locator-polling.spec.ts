import { expect, type Locator, test } from "@playwright/test";

import { getRejectedError } from "../../../../tests/common/assertion-utils";
import { expectlyLocator } from "../../src/expectly-locator";

// Regression tests for how polled locator matchers resolve elements: missing elements, `actionTimeout`,
// strict mode and hidden elements.

test.describe("locator polling - missing elements", () => {
	// Playwright's own locator assertions fail both forms with "element(s) not found", e.g.
	// `expect(absent).not.toHaveAttribute("href", "/x")`.
	const missingElementCases: Array<[string, (absent: Locator) => Promise<unknown>]> = [
		["not.toHaveHref", (absent) => expectlyLocator(absent).not.toHaveHref("/x")],
		["not.toHaveDataAttribute", (absent) => expectlyLocator(absent).not.toHaveDataAttribute("role")],
		["not.toBeRequired", (absent) => expectlyLocator(absent).not.toBeRequired()],
		["not.toStartWith", (absent) => expectlyLocator(absent).not.toStartWith("a")],
		["not.toBeUUID", (absent) => expectlyLocator(absent).not.toBeUUID()],
		["not.toHaveDirectText", (absent) => expectlyLocator(absent).not.toHaveDirectText("a")],
		["toHaveHref", (absent) => expectlyLocator(absent).toHaveHref("/x")],
		["toBeValidEmail", (absent) => expectlyLocator(absent).toBeValidEmail()],
	];

	for (const [name, assertion] of missingElementCases) {
		test(`${name} should fail with "element(s) not found", like Playwright`, async ({ page }) => {
			await page.setContent("<div></div>");
			const error = await getRejectedError(assertion(page.locator("#absent")));
			expect(error.message).toContain("element(s) not found");
			expect(error.message).not.toContain("attribute");
		});
	}

	test("should fail .not.toBeStable on a missing element", async ({ page }) => {
		await page.setContent("<div></div>");
		const error = await getRejectedError(
			expectlyLocator(page.locator("#absent")).not.toBeStable({ timeout: 400, stabilityDuration: 100 }),
		);
		expect(error.message).toContain("Locator was not found");
	});

	test("should keep polling until a missing element appears", async ({ page }) => {
		await page.setContent(`
			<div id="host"></div>
			<script>
				setTimeout(() => {
					document.getElementById('host').innerHTML = '<a id="late" href="/late">Late</a>';
				}, 300);
			</script>
		`);
		await expectlyLocator(page.locator("#late")).toHaveHref("/late", { timeout: 3000 });
	});
});

test.describe("locator polling - actionTimeout", () => {
	test.use({ actionTimeout: 100 });

	test("should honour the assertion timeout when actionTimeout is shorter", async ({ page }) => {
		await page.setContent(`
			<div id="host"></div>
			<script>
				setTimeout(() => {
					document.getElementById('host').innerHTML = '<input id="late" placeholder="Name" />';
				}, 500);
			</script>
		`);
		await expectlyLocator(page.locator("#late")).toHavePlaceholder("Name", { timeout: 3000 });
	});

	test("should honour the assertion timeout for text matchers when actionTimeout is shorter", async ({ page }) => {
		await page.setContent(`
			<div id="host"></div>
			<script>
				setTimeout(() => {
					document.getElementById('host').innerHTML = '<span id="late">HELLO</span>';
				}, 500);
			</script>
		`);
		await expectlyLocator(page.locator("#late")).toBeUpperCase({ timeout: 3000 });
	});
});

test.describe("locator polling - strict mode", () => {
	test("should throw a strict mode violation instead of retrying", async ({ page }) => {
		await page.setContent('<a href="/a">A</a><a href="/b">B</a>');
		const error = await getRejectedError(expectlyLocator(page.locator("a")).not.toHaveHref("/c", { timeout: 2000 }));
		expect(error.message).toMatch(/strict mode violation/);
	});
});

test.describe("locator polling - positioning", () => {
	test.beforeEach(async ({ page }) => {
		await page.setContent(`
			<div id="top" style="height: 50px">Top</div>
			<div id="bottom" style="height: 50px">Bottom</div>
			<div id="hidden" style="display: none">Hidden</div>
		`);
	});

	test("should explain that the other element is hidden", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("#top")).toBeAbove(page.locator("#hidden"), { timeout: 300 }),
		);
		expect(error.message).toContain("Second element is not visible");
		expect(error.message).not.toContain("undefined");
	});

	test("should not pass .not when an element is hidden, as nothing was compared", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("#top")).not.toBeAbove(page.locator("#hidden"), { timeout: 300 }),
		);
		expect(error.message).toContain("Second element is not visible");
	});

	test("should explain which element is missing", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("#absent")).toBeAbove(page.locator("#bottom"), { timeout: 300 }),
		);
		expect(error.message).toContain("element(s) not found (first locator)");
	});

	test("should treat touching edges within half a pixel as positioned", async ({ page }) => {
		await page.setContent(`
			<div id="a" style="position: absolute; top: 0; height: 10.3px; width: 10px"></div>
			<div id="b" style="position: absolute; top: 10px; height: 10px; width: 10px"></div>
		`);
		await expectlyLocator(page.locator("#a")).toBeAbove(page.locator("#b"));
	});

	test("should print real edge values for below", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("#top")).toBeBelow(page.locator("#bottom"), { timeout: 300 }),
		);
		expect(error.message).toMatch(/First element top: \d/);
		expect(error.message).not.toMatch(/: -\d/);
	});
});

test.describe("locator polling - receivers", () => {
	test("locator-only matchers explain a non-locator receiver", async () => {
		const error = await getRejectedError(expectlyLocator("HELLO" as unknown as Locator).toBeUpperCase());
		expect(error.message).toContain("needs a Playwright Locator, got: string");
	});
});

test.describe("locator polling - small fixes", () => {
	test("toHaveDirectText should normalize the expected text like the received text", async ({ page }) => {
		await page.setContent("<div id='t'>  a   b  </div>");
		await expectlyLocator(page.locator("#t")).toHaveDirectText(" a  b ");
	});

	test("toHaveDataAttribute should print regex expectations", async ({ page }) => {
		await page.setContent("<div id='t' data-role='user'></div>");
		const error = await getRejectedError(
			expectlyLocator(page.locator("#t")).toHaveDataAttribute("role", /admin/, { timeout: 200 }),
		);
		expect(error.message).toContain("/admin/");
		expect(error.message).not.toContain("{}");
	});

	test("toHaveCountVisible should reject an impossible count", async ({ page }) => {
		await page.setContent("<p>One</p>");
		const error = await getRejectedError(expectlyLocator(page.locator("p")).not.toHaveCountVisible(-1));
		expect(error.message).toContain("count must be a non-negative integer");
	});
});
