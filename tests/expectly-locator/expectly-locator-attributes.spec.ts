import { expect, test } from "@playwright/test";
import { expectlyLocatorAttributes } from "../../src/expectly-locator/expectly-locator-attributes";

test.describe("expectLocator - toHavePlaceholder", () => {
	test("should pass when placeholder matches exactly", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your name" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocatorAttributes(input).toHavePlaceholder("Enter your name");
	});

	test("should pass when placeholder matches regex", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your email" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocatorAttributes(input).toHavePlaceholder(/email/i);
	});

	test("should fail when placeholder does not match", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your name" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocatorAttributes(input).not.toHavePlaceholder("Enter your email");
	});

	test("should handle missing placeholder attribute", async ({ page }) => {
		await page.setContent('<input type="text" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocatorAttributes(input).not.toHavePlaceholder("Enter your name");
	});

	test("should handle empty placeholder", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocatorAttributes(input).toHavePlaceholder("");
	});
});

test.describe("expectLocator - toHaveHref", () => {
	test("should pass when href matches exactly", async ({ page }) => {
		await page.setContent('<a href="/about">About</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveHref("/about");
	});

	test("should pass when href matches regex", async ({ page }) => {
		await page.setContent('<a href="https://example.com/page">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveHref(/example\.com/);
	});

	test("should fail when href does not match", async ({ page }) => {
		await page.setContent('<a href="/about">About</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).not.toHaveHref("/contact");
	});

	test("should handle missing href attribute", async ({ page }) => {
		await page.setContent("<a>Link</a>");
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).not.toHaveHref("/about");
	});

	test("should handle empty href", async ({ page }) => {
		await page.setContent('<a href="">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveHref("");
	});

	test("should handle absolute URLs", async ({ page }) => {
		await page.setContent('<a href="https://example.com">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveHref("https://example.com");
	});
});

test.describe("expectLocator - toHaveSrc", () => {
	test("should pass when src matches exactly", async ({ page }) => {
		await page.setContent('<img src="/image.png" />');
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).toHaveSrc("/image.png");
	});

	test("should pass when src matches regex", async ({ page }) => {
		await page.setContent('<img src="https://cdn.example.com/logo.png" />');
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).toHaveSrc(/\.png$/);
	});

	test("should fail when src does not match", async ({ page }) => {
		await page.setContent('<img src="/image.png" />');
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).not.toHaveSrc("/other.png");
	});

	test("should handle missing src attribute", async ({ page }) => {
		await page.setContent("<img />");
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).not.toHaveSrc("/image.png");
	});

	test("should work with iframe src", async ({ page }) => {
		await page.setContent('<iframe src="/embed"></iframe>');
		const iframe = page.locator("iframe");
		await expectlyLocatorAttributes(iframe).toHaveSrc("/embed");
	});
});

test.describe("expectLocator - toHaveAlt", () => {
	test("should pass when alt matches exactly", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).toHaveAlt("Company Logo");
	});

	test("should pass when alt matches regex", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).toHaveAlt(/Logo/i);
	});

	test("should fail when alt does not match", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).not.toHaveAlt("Site Logo");
	});

	test("should handle missing alt attribute", async ({ page }) => {
		await page.setContent('<img src="/logo.png" />');
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).not.toHaveAlt("Company Logo");
	});

	test("should handle empty alt", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="" />');
		const img = page.locator("img");
		await expectlyLocatorAttributes(img).toHaveAlt("");
	});
});

test.describe("expectLocator - toHaveDataAttribute", () => {
	test("should pass when data attribute exists (no value check)", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectlyLocatorAttributes(div).toHaveDataAttribute("test-id");
	});

	test("should accept data- prefix in attribute name", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectlyLocatorAttributes(div).toHaveDataAttribute("data-test-id");
	});

	test("should pass when data attribute matches exact value", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectlyLocatorAttributes(div).toHaveDataAttribute("test-id", "my-element");
	});

	test("should pass when data attribute matches regex", async ({ page }) => {
		await page.setContent('<div data-user-role="admin">Content</div>');
		const div = page.locator("div");
		await expectlyLocatorAttributes(div).toHaveDataAttribute("user-role", /admin/);
	});

	test("should fail when data attribute does not match", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectlyLocatorAttributes(div).not.toHaveDataAttribute("test-id", "other-element");
	});

	test("should handle missing data attribute", async ({ page }) => {
		await page.setContent("<div>Content</div>");
		const div = page.locator("div");
		await expectlyLocatorAttributes(div).not.toHaveDataAttribute("test-id");
	});

	test("should handle empty data attribute value", async ({ page }) => {
		await page.setContent('<div data-empty="">Content</div>');
		const div = page.locator("div");
		await expectlyLocatorAttributes(div).toHaveDataAttribute("empty", "");
	});

	test("should handle complex data attribute names", async ({ page }) => {
		await page.setContent('<div data-tracking-event-name="click-button">Content</div>');
		const div = page.locator("div");
		await expectlyLocatorAttributes(div).toHaveDataAttribute("tracking-event-name", "click-button");
	});
});

test.describe("expectLocator - toHaveAriaLabel", () => {
	test("should pass when aria-label matches exactly", async ({ page }) => {
		await page.setContent('<button aria-label="Close dialog">X</button>');
		const button = page.locator("button");
		await expectlyLocatorAttributes(button).toHaveAriaLabel("Close dialog");
	});

	test("should pass when aria-label matches regex", async ({ page }) => {
		await page.setContent('<button aria-label="Submit form">Submit</button>');
		const button = page.locator("button");
		await expectlyLocatorAttributes(button).toHaveAriaLabel(/submit/i);
	});

	test("should fail when aria-label does not match", async ({ page }) => {
		await page.setContent('<button aria-label="Close dialog">X</button>');
		const button = page.locator("button");
		await expectlyLocatorAttributes(button).not.toHaveAriaLabel("Open dialog");
	});

	test("should handle missing aria-label attribute", async ({ page }) => {
		await page.setContent("<button>Button</button>");
		const button = page.locator("button");
		await expectlyLocatorAttributes(button).not.toHaveAriaLabel("Close dialog");
	});

	test("should handle empty aria-label", async ({ page }) => {
		await page.setContent('<button aria-label="">Button</button>');
		const button = page.locator("button");
		await expectlyLocatorAttributes(button).toHaveAriaLabel("");
	});
});

test.describe("expectLocator - toHaveTarget", () => {
	test("should pass when target matches exactly", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveTarget("_blank");
	});

	test("should pass when target matches regex", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveTarget(/_blank/);
	});

	test("should fail when target does not match", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).not.toHaveTarget("_self");
	});

	test("should handle missing target attribute", async ({ page }) => {
		await page.setContent('<a href="/page">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).not.toHaveTarget("_blank");
	});

	test("should handle _self target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_self">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveTarget("_self");
	});

	test("should handle _parent target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_parent">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveTarget("_parent");
	});

	test("should handle _top target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_top">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveTarget("_top");
	});

	test("should handle custom frame name", async ({ page }) => {
		await page.setContent('<a href="/page" target="myFrame">Link</a>');
		const link = page.locator("a");
		await expectlyLocatorAttributes(link).toHaveTarget("myFrame");
	});
});

test.describe("Locator Form Attribute Matchers", () => {
	test.beforeEach(async ({ page }) => {
		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Form Attributes Test</title>
        </head>
        <body>
          <form>
            <!-- Required inputs -->
            <input type="text" name="username" id="username" required />
            <input type="email" name="email" id="email" required />
            <select name="country" id="country" required>
              <option value="">Select country</option>
              <option value="us">USA</option>
            </select>
            <textarea name="bio" id="bio" required></textarea>

            <!-- Optional inputs -->
            <input type="text" name="nickname" id="nickname" />
            <input type="tel" name="phone" id="phone" />

            <!-- Readonly inputs -->
            <input type="text" name="userId" id="userId" value="12345" readonly />
            <input type="email" name="registeredEmail" id="registeredEmail" value="user@example.com" readonly />
            <textarea name="terms" id="terms" readonly>Terms and conditions...</textarea>

            <!-- Editable inputs (not readonly) -->
            <input type="text" name="firstName" id="firstName" />
            <input type="text" name="lastName" id="lastName" />

            <!-- Mixed attributes -->
            <input type="text" name="code" id="code" required readonly value="ABC123" />

            <!-- Hidden field (for testing error cases) -->
            <input type="hidden" name="hidden" id="hidden" required />
          </form>
        </body>
      </html>
    `;
		await page.setContent(html);
	});

	test.describe("toBeRequired", () => {
		test("should pass when input has required attribute", async ({ page }) => {
			const username = page.locator("#username");
			await expectlyLocatorAttributes(username).toBeRequired();
		});

		test("should pass when email input has required attribute", async ({ page }) => {
			const email = page.locator("#email");
			await expectlyLocatorAttributes(email).toBeRequired();
		});

		test("should pass when select has required attribute", async ({ page }) => {
			const country = page.locator("#country");
			await expectlyLocatorAttributes(country).toBeRequired();
		});

		test("should pass when textarea has required attribute", async ({ page }) => {
			const bio = page.locator("#bio");
			await expectlyLocatorAttributes(bio).toBeRequired();
		});

		test("should fail when input does not have required attribute", async ({ page }) => {
			const nickname = page.locator("#nickname");

			await expect(expectlyLocatorAttributes(nickname).toBeRequired()).rejects.toThrowError(
				/Expected element to be required/
			);
		});

		test("should fail when optional phone input is checked", async ({ page }) => {
			const phone = page.locator("#phone");

			await expect(expectlyLocatorAttributes(phone).toBeRequired()).rejects.toThrowError(
				/Expected element to be required/
			);
		});

		test("should work with .not modifier for optional fields", async ({ page }) => {
			const nickname = page.locator("#nickname");
			await expectlyLocatorAttributes(nickname).not.toBeRequired();
		});

		test("should work with .not modifier failing when field is required", async ({ page }) => {
			const username = page.locator("#username");

			await expect(expectlyLocatorAttributes(username).not.toBeRequired()).rejects.toThrowError(
				/Expected element to not be required/
			);
		});

		test("should pass for element with both required and readonly", async ({ page }) => {
			const code = page.locator("#code");
			await expectlyLocatorAttributes(code).toBeRequired();
		});

		test("should handle timeout option", async ({ page }) => {
			const username = page.locator("#username");
			await expectlyLocatorAttributes(username).toBeRequired({ timeout: 1000 });
		});

		test("should work with hidden required field", async ({ page }) => {
			const hidden = page.locator("#hidden");
			await expectlyLocatorAttributes(hidden).toBeRequired();
		});
	});

	test.describe("toBeReadOnly", () => {
		test("should pass when input has readonly attribute", async ({ page }) => {
			const userId = page.locator("#userId");
			await expectlyLocatorAttributes(userId).toBeReadOnly();
		});

		test("should pass when email input has readonly attribute", async ({ page }) => {
			const registeredEmail = page.locator("#registeredEmail");
			await expectlyLocatorAttributes(registeredEmail).toBeReadOnly();
		});

		test("should pass when textarea has readonly attribute", async ({ page }) => {
			const terms = page.locator("#terms");
			await expectlyLocatorAttributes(terms).toBeReadOnly();
		});

		test("should fail when input does not have readonly attribute", async ({ page }) => {
			const firstName = page.locator("#firstName");

			await expect(expectlyLocatorAttributes(firstName).toBeReadOnly()).rejects.toThrowError(
				/Expected element to be readonly/
			);
		});

		test("should fail when editable input is checked", async ({ page }) => {
			const lastName = page.locator("#lastName");

			await expect(expectlyLocatorAttributes(lastName).toBeReadOnly()).rejects.toThrowError(
				/Expected element to be readonly/
			);
		});

		test("should work with .not modifier for editable fields", async ({ page }) => {
			const firstName = page.locator("#firstName");
			await expectlyLocatorAttributes(firstName).not.toBeReadOnly();
		});

		test("should work with .not modifier failing when field is readonly", async ({ page }) => {
			const userId = page.locator("#userId");

			await expect(expectlyLocatorAttributes(userId).not.toBeReadOnly()).rejects.toThrowError(
				/Expected element to not be readonly/
			);
		});

		test("should pass for element with both required and readonly", async ({ page }) => {
			const code = page.locator("#code");
			await expectlyLocatorAttributes(code).toBeReadOnly();
		});

		test("should handle timeout option", async ({ page }) => {
			const userId = page.locator("#userId");
			await expectlyLocatorAttributes(userId).toBeReadOnly({ timeout: 1000 });
		});
	});

	test.describe("Combined form attribute scenarios", () => {
		test("should validate form with multiple required and readonly fields", async ({ page }) => {
			// Required fields
			await expectlyLocatorAttributes(page.locator("#username")).toBeRequired();
			await expectlyLocatorAttributes(page.locator("#email")).toBeRequired();
			await expectlyLocatorAttributes(page.locator("#country")).toBeRequired();
			await expectlyLocatorAttributes(page.locator("#bio")).toBeRequired();

			// Optional fields
			await expectlyLocatorAttributes(page.locator("#nickname")).not.toBeRequired();
			await expectlyLocatorAttributes(page.locator("#phone")).not.toBeRequired();

			// Readonly fields
			await expectlyLocatorAttributes(page.locator("#userId")).toBeReadOnly();
			await expectlyLocatorAttributes(page.locator("#registeredEmail")).toBeReadOnly();
			await expectlyLocatorAttributes(page.locator("#terms")).toBeReadOnly();

			// Editable fields
			await expectlyLocatorAttributes(page.locator("#firstName")).not.toBeReadOnly();
			await expectlyLocatorAttributes(page.locator("#lastName")).not.toBeReadOnly();
		});

		test("should handle field with both attributes", async ({ page }) => {
			const code = page.locator("#code");
			await expectlyLocatorAttributes(code).toBeRequired();
			await expectlyLocatorAttributes(code).toBeReadOnly();
		});

		test("should differentiate between required readonly and optional editable", async ({ page }) => {
			const code = page.locator("#code"); // required AND readonly
			const userId = page.locator("#userId"); // readonly but NOT required
			const firstName = page.locator("#firstName"); // editable and NOT required

			// code is readonly
			await expectlyLocatorAttributes(code).toBeReadOnly();
			await expectlyLocatorAttributes(firstName).not.toBeReadOnly();

			// code is required, userId and firstName are not
			await expectlyLocatorAttributes(code).toBeRequired();
			await expectlyLocatorAttributes(userId).not.toBeRequired();
			await expectlyLocatorAttributes(firstName).not.toBeRequired();
		});
	});

	test.describe("Dynamic attribute changes", () => {
		test("should detect when required attribute is added dynamically", async ({ page }) => {
			const firstName = page.locator("#firstName");

			// Initially not required
			await expectlyLocatorAttributes(firstName).not.toBeRequired();

			// Add required attribute
			await page.evaluate(() => {
				const input = document.querySelector("#firstName") as HTMLInputElement;
				input.setAttribute("required", "");
			});

			// Now should be required
			await expectlyLocatorAttributes(firstName).toBeRequired();
		});

		test("should detect when readonly attribute is removed dynamically", async ({ page }) => {
			const userId = page.locator("#userId");

			// Initially readonly
			await expectlyLocatorAttributes(userId).toBeReadOnly();

			// Remove readonly attribute
			await page.evaluate(() => {
				const input = document.querySelector("#userId") as HTMLInputElement;
				input.removeAttribute("readonly");
			});

			// Now should not be readonly
			await expectlyLocatorAttributes(userId).not.toBeReadOnly();
		});

		test("should detect when both attributes change", async ({ page }) => {
			const firstName = page.locator("#firstName");

			// Initially editable and optional
			await expectlyLocatorAttributes(firstName).not.toBeReadOnly();
			await expectlyLocatorAttributes(firstName).not.toBeRequired();

			// Make it readonly and required
			await page.evaluate(() => {
				const input = document.querySelector("#firstName") as HTMLInputElement;
				input.setAttribute("readonly", "");
				input.setAttribute("required", "");
			});

			// Now should be both
			await expectlyLocatorAttributes(firstName).toBeReadOnly();
			await expectlyLocatorAttributes(firstName).toBeRequired();
		});
	});

	test.describe("Different input types", () => {
		test("should work with various input types", async ({ page }) => {
			const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <input type="text" id="text-req" required />
            <input type="email" id="email-req" required />
            <input type="number" id="number-req" required />
            <input type="date" id="date-req" required />
            <input type="checkbox" id="checkbox-req" required />
            <input type="radio" id="radio-req" name="radio" required />

            <input type="text" id="text-ro" readonly />
            <input type="email" id="email-ro" readonly />
            <input type="number" id="number-ro" readonly />
            <input type="date" id="date-ro" readonly />
          </body>
        </html>
      `;
			await page.setContent(html);

			// Required tests
			await expectlyLocatorAttributes(page.locator("#text-req")).toBeRequired();
			await expectlyLocatorAttributes(page.locator("#email-req")).toBeRequired();
			await expectlyLocatorAttributes(page.locator("#number-req")).toBeRequired();
			await expectlyLocatorAttributes(page.locator("#date-req")).toBeRequired();
			await expectlyLocatorAttributes(page.locator("#checkbox-req")).toBeRequired();
			await expectlyLocatorAttributes(page.locator("#radio-req")).toBeRequired();

			// Readonly tests
			await expectlyLocatorAttributes(page.locator("#text-ro")).toBeReadOnly();
			await expectlyLocatorAttributes(page.locator("#email-ro")).toBeReadOnly();
			await expectlyLocatorAttributes(page.locator("#number-ro")).toBeReadOnly();
			await expectlyLocatorAttributes(page.locator("#date-ro")).toBeReadOnly();
		});
	});
});
