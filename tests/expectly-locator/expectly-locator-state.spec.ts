import { expect, test } from "@playwright/test";
import { expectlyLocator } from "../../src/expectly-locator";

// For granular imports, you can also use:
// import { expectlyLocatorState } from "../../src/expectly-locator/state";

test.describe("expectLocator - toBeStable", () => {
	test("should pass when content is stable from the start", async ({ page }) => {
		await page.setContent('<div id="stable">Static Content</div>');
		const element = page.locator("#stable");
		await expectlyLocator(element).toBeStable({
			stabilityDuration: 300,
			checkInterval: 50,
			timeout: 2000,
		});
	});

	test("should pass when content becomes stable after changes", async ({ page }) => {
		await page.setContent(`
			<div id="dynamic">Initial</div>
			<script>
				let count = 0;
				const interval = setInterval(() => {
					count++;
					if (count <= 3) {
						document.getElementById('dynamic').innerHTML = 'Changed ' + count;
					} else {
						clearInterval(interval);
					}
				}, 100);
			</script>
		`);
		const element = page.locator("#dynamic");
		await expectlyLocator(element).toBeStable({
			stabilityDuration: 400,
			checkInterval: 100,
			timeout: 3000,
		});
	});

	test("should pass with default options", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");
		await expectlyLocator(element).toBeStable();
	});

	test("should fail when content keeps changing", async ({ page }) => {
		await page.setContent(`
			<div id="changing">Initial</div>
			<script>
				let count = 0;
				setInterval(() => {
					count++;
					document.getElementById('changing').innerHTML = 'Update ' + count;
				}, 100);
			</script>
		`);
		const element = page.locator("#changing");

		await expect(
			expectlyLocator(element).toBeStable({
				stabilityDuration: 500,
				checkInterval: 100,
				timeout: 1500,
			})
		).rejects.toThrowError(/content did not stabilize/);
	});

	test("should fail when locator is not found", async ({ page }) => {
		await page.setContent('<div id="present">Content</div>');
		const element = page.locator("#not-present");

		await expect(
			expectlyLocator(element).toBeStable({
				stabilityDuration: 300,
				timeout: 1500,
			})
		).rejects.toThrowError();
	});

	test("should work with .not when content is unstable", async ({ page }) => {
		await page.setContent(`
			<div id="changing">Initial</div>
			<script>
				let count = 0;
				setInterval(() => {
					count++;
					document.getElementById('changing').innerHTML = 'Update ' + count;
				}, 100);
			</script>
		`);
		const element = page.locator("#changing");

		await expectlyLocator(element).not.toBeStable({
			stabilityDuration: 500,
			checkInterval: 100,
			timeout: 1500,
		});
	});

	test("should handle content that stabilizes after initial delay", async ({ page }) => {
		await page.setContent(`
			<div id="delayed-stable">Initial</div>
			<script>
				setTimeout(() => {
					document.getElementById('delayed-stable').innerHTML = 'Final';
				}, 300);
			</script>
		`);
		const element = page.locator("#delayed-stable");

		await expectlyLocator(element).toBeStable({
			stabilityDuration: 400,
			checkInterval: 100,
			timeout: 3000,
		});
	});

	test("should validate checkInterval is positive", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");

		await expect(
			expectlyLocator(element).toBeStable({
				checkInterval: 0,
			})
		).rejects.toThrowError(/checkInterval must be positive/);
	});

	test("should validate stabilityDuration is positive", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");

		await expect(
			expectlyLocator(element).toBeStable({
				stabilityDuration: -100,
			})
		).rejects.toThrowError(/stabilityDuration must be positive/);
	});

	test("should validate timeout is positive", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");

		await expect(
			expectlyLocator(element).toBeStable({
				timeout: 0,
			})
		).rejects.toThrowError(/timeout must be positive/);
	});

	test("should validate checkInterval is not too large", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");

		await expect(
			expectlyLocator(element).toBeStable({
				stabilityDuration: 500,
				checkInterval: 600,
			})
		).rejects.toThrowError(/checkInterval.*cannot be greater than half of stabilityDuration/);
	});

	test("should validate stabilityDuration is less than timeout", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");

		await expect(
			expectlyLocator(element).toBeStable({
				stabilityDuration: 3000,
				timeout: 2000,
			})
		).rejects.toThrowError(/stabilityDuration.*must be less than timeout/);
	});

	test("should validate timeout allows for stabilization", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");

		// This will timeout because stabilityDuration is too close to timeout
		await expect(
			expectlyLocator(element).toBeStable({
				stabilityDuration: 1500,
				timeout: 2000,
			})
		).rejects.toThrowError(/content did not stabilize/);
	});

	test("should handle rapidly changing content", async ({ page }) => {
		await page.setContent(`
			<div id="rapid">Initial</div>
			<script>
				let count = 0;
				const interval = setInterval(() => {
					count++;
					if (count <= 10) {
						document.getElementById('rapid').innerHTML = 'Change ' + count;
					} else {
						clearInterval(interval);
					}
				}, 50);
			</script>
		`);
		const element = page.locator("#rapid");

		await expectlyLocator(element).toBeStable({
			stabilityDuration: 500,
			checkInterval: 100,
			timeout: 3000,
		});
	});

	test("should work with content that has nested elements", async ({ page }) => {
		await page.setContent('<div id="nested"><span>Nested Content</span></div>');
		const element = page.locator("#nested");

		await expectlyLocator(element).toBeStable({
			stabilityDuration: 300,
			checkInterval: 50,
			timeout: 2000,
		});
	});

	test("should detect when nested content changes", async ({ page }) => {
		await page.setContent(`
			<div id="nested-changing"><span>Initial</span></div>
			<script>
				let count = 0;
				const interval = setInterval(() => {
					count++;
					if (count <= 3) {
						const span = document.querySelector('#nested-changing span');
						span.innerHTML = 'Update ' + count;
					} else {
						clearInterval(interval);
					}
				}, 100);
			</script>
		`);
		const element = page.locator("#nested-changing");

		await expectlyLocator(element).toBeStable({
			stabilityDuration: 400,
			checkInterval: 100,
			timeout: 3000,
		});
	});

	test("should handle element appearing after delay", async ({ page }) => {
		await page.setContent(`
			<div id="container"></div>
			<script>
				setTimeout(() => {
					const div = document.createElement('div');
					div.id = 'delayed';
					div.innerHTML = 'Appeared!';
					document.getElementById('container').appendChild(div);
				}, 200);
			</script>
		`);
		const element = page.locator("#delayed");

		await expectlyLocator(element).toBeStable({
			stabilityDuration: 300,
			checkInterval: 100,
			timeout: 3000,
		});
	});

	test("should work with short stability duration", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");

		await expectlyLocator(element).toBeStable({
			stabilityDuration: 100,
			checkInterval: 20,
			timeout: 1500,
		});
	});

	test("should work with longer stability duration", async ({ page }) => {
		await page.setContent('<div id="stable">Content</div>');
		const element = page.locator("#stable");

		await expectlyLocator(element).toBeStable({
			stabilityDuration: 1000,
			checkInterval: 100,
			timeout: 3000,
		});
	});
});
