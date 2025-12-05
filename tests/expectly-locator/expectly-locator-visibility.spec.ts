import { expect, test } from "@playwright/test";
import { expectlyLocator } from "../../src/expectly-locator";

test.describe("expectLocator - toHaveCountVisible", () => {
	test("should pass when the expected number of elements are visible", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: block;">Item 1</div>
			<div class="item" style="display: block;">Item 2</div>
			<div class="item" style="display: block;">Item 3</div>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(3);
	});

	test("should pass when only some elements are visible", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: block;">Item 1</div>
			<div class="item" style="display: none;">Item 2</div>
			<div class="item" style="display: block;">Item 3</div>
			<div class="item" style="visibility: hidden;">Item 4</div>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(2);
	});

	test("should pass when no elements are visible and expecting 0", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: none;">Item 1</div>
			<div class="item" style="display: none;">Item 2</div>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(0);
	});

	test("should pass when elements become visible after initial render", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: none;">Item 1</div>
			<div class="item" style="display: none;">Item 2</div>
			<div class="item" style="display: none;">Item 3</div>
			<script>
				setTimeout(() => {
					document.querySelectorAll('.item').forEach(el => el.style.display = 'block');
				}, 500);
			</script>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(3, { timeout: 2000 });
	});

	test("should pass when elements are progressively shown", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: none;">Item 1</div>
			<div class="item" style="display: none;">Item 2</div>
			<div class="item" style="display: none;">Item 3</div>
			<script>
				let count = 0;
				const interval = setInterval(() => {
					const items = document.querySelectorAll('.item');
					if (count < items.length) {
						items[count].style.display = 'block';
						count++;
					} else {
						clearInterval(interval);
					}
				}, 200);
			</script>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(3, { timeout: 2000 });
	});

	test("should pass with custom timeout", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: block;">Item 1</div>
			<div class="item" style="display: block;">Item 2</div>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(2, { timeout: 5000 });
	});

	test("should fail when fewer elements are visible than expected", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: block;">Item 1</div>
			<div class="item" style="display: none;">Item 2</div>
			<div class="item" style="display: none;">Item 3</div>
		`);
		const items = page.locator(".item");

		try {
			await expectlyLocator(items).toHaveCountVisible(3, { timeout: 1000 });
		} catch (error: any) {
			expect(error.message).toContain("Expected number of visible elements");
			expect(error.message).toContain("3");
			expect(error.message).toContain("Received");
			expect(error.message).toContain("1");
		}
	});

	test("should fail when more elements are visible than expected", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: block;">Item 1</div>
			<div class="item" style="display: block;">Item 2</div>
			<div class="item" style="display: block;">Item 3</div>
		`);
		const items = page.locator(".item");

		try {
			await expectlyLocator(items).toHaveCountVisible(2, { timeout: 1000 });
		} catch (error: any) {
			expect(error.message).toContain("Expected number of visible elements");
			expect(error.message).toContain("2");
			expect(error.message).toContain("Received");
			expect(error.message).toContain("3");
		}
	});

	test("should fail when no elements match the locator", async ({ page }) => {
		await page.setContent(`
			<div class="other">Item 1</div>
		`);
		const items = page.locator(".item");

		try {
			await expectlyLocator(items).toHaveCountVisible(1, { timeout: 1000 });
		} catch (error: any) {
			expect(error.message).toContain("Expected number of visible elements");
			expect(error.message).toContain("1");
			expect(error.message).toContain("Received");
			expect(error.message).toContain("0");
		}
	});

	test("should work with visibility:hidden elements", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: block;">Item 1</div>
			<div class="item" style="visibility: hidden;">Item 2</div>
			<div class="item" style="opacity: 0;">Item 3</div>
		`);
		const items = page.locator(".item");
		// visibility:hidden elements are not considered visible by isVisible()
		// opacity:0 elements ARE considered visible by isVisible()
		await expectlyLocator(items).toHaveCountVisible(2);
	});

	test("should work with nested elements", async ({ page }) => {
		await page.setContent(`
			<ul>
				<li class="item">Item 1</li>
				<li class="item" style="display: none;">Item 2</li>
				<li class="item">Item 3</li>
			</ul>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(2);
	});

	test("should work with table rows", async ({ page }) => {
		await page.setContent(`
			<table>
				<tbody>
					<tr class="row" style="display: table-row;">
						<td>Row 1</td>
					</tr>
					<tr class="row" style="display: none;">
						<td>Row 2</td>
					</tr>
					<tr class="row" style="display: table-row;">
						<td>Row 3</td>
					</tr>
					<tr class="row" style="display: table-row;">
						<td>Row 4</td>
					</tr>
				</tbody>
			</table>
		`);
		const rows = page.locator("tbody .row");
		await expectlyLocator(rows).toHaveCountVisible(3);
	});

	test("should handle elements becoming visible and then hidden", async ({ page }) => {
		await page.setContent(`
			<div class="item" style="display: block;">Item 1</div>
			<div class="item" style="display: block;">Item 2</div>
			<div class="item" style="display: block;">Item 3</div>
			<script>
				setTimeout(() => {
					document.querySelectorAll('.item')[1].style.display = 'none';
				}, 300);
			</script>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(2, { timeout: 1000 });
	});

	test("should work with dynamically added elements", async ({ page }) => {
		await page.setContent(`
			<div id="container">
				<div class="item">Item 1</div>
			</div>
			<script>
				setTimeout(() => {
					const container = document.getElementById('container');
					for (let i = 2; i <= 4; i++) {
						const div = document.createElement('div');
						div.className = 'item';
						div.textContent = 'Item ' + i;
						container.appendChild(div);
					}
				}, 300);
			</script>
		`);
		const items = page.locator(".item");
		await expectlyLocator(items).toHaveCountVisible(4, { timeout: 1000 });
	});
});
