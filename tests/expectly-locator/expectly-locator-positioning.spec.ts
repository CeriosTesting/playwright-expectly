import { expect, test } from "@playwright/test";
import { expectlyLocator } from "../../src/expectly-locator";

// For granular imports, you can also use:
// import { expectlyLocatorPositioning } from "../src/expectly-locator/positioning";

test.describe("Locator Positioning Matchers", () => {
	test.beforeEach(async ({ page }) => {
		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 20px; }
            .container { position: relative; width: 800px; height: 600px; }

            /* Vertical positioning elements */
            .header {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 50px;
              background: lightblue;
            }
            .content {
              position: absolute;
              top: 60px;
              left: 0;
              width: 100%;
              height: 100px;
              background: lightgreen;
            }
            .footer {
              position: absolute;
              top: 170px;
              left: 0;
              width: 100%;
              height: 50px;
              background: lightcoral;
            }

            /* Horizontal positioning elements */
            .sidebar {
              position: absolute;
              top: 250px;
              left: 0;
              width: 200px;
              height: 100px;
              background: lightyellow;
            }
            .main {
              position: absolute;
              top: 250px;
              left: 210px;
              width: 400px;
              height: 100px;
              background: lightpink;
            }
            .aside {
              position: absolute;
              top: 250px;
              left: 620px;
              width: 180px;
              height: 100px;
              background: lavender;
            }

            /* Overlapping elements for edge cases */
            .overlap1 {
              position: absolute;
              top: 400px;
              left: 0;
              width: 200px;
              height: 100px;
              background: lightgray;
            }
            .overlap2 {
              position: absolute;
              top: 450px;
              left: 100px;
              width: 200px;
              height: 100px;
              background: lightsteelblue;
            }

            /* Hidden element */
            .hidden { display: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Header</div>
            <div class="content">Content</div>
            <div class="footer">Footer</div>

            <div class="sidebar">Sidebar</div>
            <div class="main">Main</div>
            <div class="aside">Aside</div>

            <div class="overlap1">Overlap 1</div>
            <div class="overlap2">Overlap 2</div>

            <div class="hidden">Hidden</div>
          </div>
        </body>
      </html>
    `;
		await page.setContent(html);
	});

	test.describe("toBeAbove", () => {
		test("should pass when element is above another", async ({ page }) => {
			const header = page.locator(".header");
			const content = page.locator(".content");

			await expectlyLocator(header).toBeAbove(content);
		});

		test("should pass when element is directly above (touching)", async ({ page }) => {
			const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div style="height: 50px; background: red;" class="top">Top</div>
            <div style="height: 50px; background: blue;" class="bottom">Bottom</div>
          </body>
        </html>
      `;
			await page.setContent(html);

			const top = page.locator(".top");
			const bottom = page.locator(".bottom");

			await expectlyLocator(top).toBeAbove(bottom);
		});

		test("should fail when element is below another", async ({ page }) => {
			const footer = page.locator(".footer");
			const header = page.locator(".header");

			await expect(expectlyLocator(footer).toBeAbove(header)).rejects.toThrowError(
				/Expected first element to be above second element/
			);
		});

		test("should fail when element is at the same vertical position", async ({ page }) => {
			const sidebar = page.locator(".sidebar");
			const main = page.locator(".main");

			await expect(expectlyLocator(sidebar).toBeAbove(main)).rejects.toThrowError(
				/Expected first element to be above second element/
			);
		});

		test("should work with .not modifier", async ({ page }) => {
			const footer = page.locator(".footer");
			const header = page.locator(".header");

			await expectlyLocator(footer).not.toBeAbove(header);
		});
	});

	test.describe("toBeBelow", () => {
		test("should pass when element is below another", async ({ page }) => {
			const footer = page.locator(".footer");
			const content = page.locator(".content");

			await expectlyLocator(footer).toBeBelow(content);
		});

		test("should pass when element is directly below (touching)", async ({ page }) => {
			const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div style="height: 50px; background: red;" class="top">Top</div>
            <div style="height: 50px; background: blue;" class="bottom">Bottom</div>
          </body>
        </html>
      `;
			await page.setContent(html);

			const bottom = page.locator(".bottom");
			const top = page.locator(".top");

			await expectlyLocator(bottom).toBeBelow(top);
		});

		test("should fail when element is above another", async ({ page }) => {
			const header = page.locator(".header");
			const footer = page.locator(".footer");

			await expect(expectlyLocator(header).toBeBelow(footer)).rejects.toThrowError(
				/Expected first element to be below second element/
			);
		});

		test("should work with .not modifier", async ({ page }) => {
			const header = page.locator(".header");
			const content = page.locator(".content");

			await expectlyLocator(header).not.toBeBelow(content);
		});

		test("should fail for overlapping elements", async ({ page }) => {
			const overlap1 = page.locator(".overlap1");
			const overlap2 = page.locator(".overlap2");

			// overlap2 overlaps with overlap1, so it's not strictly below
			// (overlap2 top is 450px, overlap1 bottom is 500px, so overlap2 starts before overlap1 ends)
			await expect(expectlyLocator(overlap2).toBeBelow(overlap1)).rejects.toThrowError(
				/Expected first element to be below second element/
			);
		});
	});

	test.describe("toBeLeftOf", () => {
		test("should pass when element is left of another", async ({ page }) => {
			const sidebar = page.locator(".sidebar");
			const main = page.locator(".main");

			await expectlyLocator(sidebar).toBeLeftOf(main);
		});

		test("should pass when element is directly left (touching)", async ({ page }) => {
			const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0;">
            <div style="display: inline-block; width: 100px; background: red;" class="left">Left</div><div style="display: inline-block; width: 100px; background: blue;" class="right">Right</div>
          </body>
        </html>
      `;
			await page.setContent(html);

			const left = page.locator(".left");
			const right = page.locator(".right");

			await expectlyLocator(left).toBeLeftOf(right);
		});

		test("should fail when element is right of another", async ({ page }) => {
			const main = page.locator(".main");
			const sidebar = page.locator(".sidebar");

			await expect(expectlyLocator(main).toBeLeftOf(sidebar)).rejects.toThrowError(
				/Expected first element to be left of second element/
			);
		});

		test("should work with .not modifier", async ({ page }) => {
			const main = page.locator(".main");
			const sidebar = page.locator(".sidebar");

			await expectlyLocator(main).not.toBeLeftOf(sidebar);
		});

		test("should fail when elements are vertically aligned", async ({ page }) => {
			const header = page.locator(".header");
			const content = page.locator(".content");

			await expect(expectlyLocator(header).toBeLeftOf(content)).rejects.toThrowError(
				/Expected first element to be left of second element/
			);
		});

		test("should handle three elements in a row", async ({ page }) => {
			const sidebar = page.locator(".sidebar");
			const main = page.locator(".main");
			const aside = page.locator(".aside");

			await expectlyLocator(sidebar).toBeLeftOf(main);
			await expectlyLocator(main).toBeLeftOf(aside);
			await expectlyLocator(sidebar).toBeLeftOf(aside);
		});
	});

	test.describe("toBeRightOf", () => {
		test("should pass when element is right of another", async ({ page }) => {
			const main = page.locator(".main");
			const sidebar = page.locator(".sidebar");

			await expectlyLocator(main).toBeRightOf(sidebar);
		});

		test("should pass when element is directly right (touching)", async ({ page }) => {
			const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0;">
            <div style="display: inline-block; width: 100px; background: red;" class="left">Left</div><div style="display: inline-block; width: 100px; background: blue;" class="right">Right</div>
          </body>
        </html>
      `;
			await page.setContent(html);

			const right = page.locator(".right");
			const left = page.locator(".left");

			await expectlyLocator(right).toBeRightOf(left);
		});

		test("should fail when element is left of another", async ({ page }) => {
			const sidebar = page.locator(".sidebar");
			const aside = page.locator(".aside");

			await expect(expectlyLocator(sidebar).toBeRightOf(aside)).rejects.toThrowError(
				/Expected first element to be right of second element/
			);
		});

		test("should work with .not modifier", async ({ page }) => {
			const sidebar = page.locator(".sidebar");
			const main = page.locator(".main");

			await expectlyLocator(sidebar).not.toBeRightOf(main);
		});

		test("should fail for overlapping elements horizontally", async ({ page }) => {
			const overlap1 = page.locator(".overlap1");
			const overlap2 = page.locator(".overlap2");

			// overlap2 overlaps with overlap1 horizontally, so it's not strictly to the right
			// (overlap2 left is 100px, overlap1 right is 200px, so overlap2 starts before overlap1 ends)
			await expect(expectlyLocator(overlap2).toBeRightOf(overlap1)).rejects.toThrowError(
				/Expected first element to be right of second element/
			);
		});
	});

	test.describe("Combined positioning scenarios", () => {
		test("should handle complex layout assertions", async ({ page }) => {
			const header = page.locator(".header");
			const content = page.locator(".content");
			const footer = page.locator(".footer");
			const sidebar = page.locator(".sidebar");
			const main = page.locator(".main");

			// Vertical assertions
			await expectlyLocator(header).toBeAbove(content);
			await expectlyLocator(content).toBeAbove(footer);
			await expectlyLocator(header).toBeAbove(footer);

			await expectlyLocator(footer).toBeBelow(header);
			await expectlyLocator(content).toBeBelow(header);

			// Horizontal assertions
			await expectlyLocator(sidebar).toBeLeftOf(main);
			await expectlyLocator(main).toBeRightOf(sidebar);
		});

		test("should handle timeout option", async ({ page }) => {
			const header = page.locator(".header");
			const content = page.locator(".content");

			await expectlyLocator(header).toBeAbove(content, { timeout: 1000 });
		});
	});
});
