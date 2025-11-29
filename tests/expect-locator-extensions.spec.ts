import { test } from "@playwright/test";
import { expectLocator } from "../src/expect-locator-extensions";

test.describe("expectLocator - toHavePlaceholder", () => {
	test("should pass when placeholder matches exactly", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your name" />');
		const input = page.locator('input[type="text"]');
		await expectLocator(input).toHavePlaceholder("Enter your name");
	});

	test("should pass when placeholder matches regex", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your email" />');
		const input = page.locator('input[type="text"]');
		await expectLocator(input).toHavePlaceholder(/email/i);
	});

	test("should fail when placeholder does not match", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your name" />');
		const input = page.locator('input[type="text"]');
		await expectLocator(input).not.toHavePlaceholder("Enter your email");
	});

	test("should handle missing placeholder attribute", async ({ page }) => {
		await page.setContent('<input type="text" />');
		const input = page.locator('input[type="text"]');
		await expectLocator(input).not.toHavePlaceholder("Enter your name");
	});

	test("should handle empty placeholder", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="" />');
		const input = page.locator('input[type="text"]');
		await expectLocator(input).toHavePlaceholder("");
	});
});

test.describe("expectLocator - toHaveHref", () => {
	test("should pass when href matches exactly", async ({ page }) => {
		await page.setContent('<a href="/about">About</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveHref("/about");
	});

	test("should pass when href matches regex", async ({ page }) => {
		await page.setContent('<a href="https://example.com/page">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveHref(/example\.com/);
	});

	test("should fail when href does not match", async ({ page }) => {
		await page.setContent('<a href="/about">About</a>');
		const link = page.locator("a");
		await expectLocator(link).not.toHaveHref("/contact");
	});

	test("should handle missing href attribute", async ({ page }) => {
		await page.setContent("<a>Link</a>");
		const link = page.locator("a");
		await expectLocator(link).not.toHaveHref("/about");
	});

	test("should handle empty href", async ({ page }) => {
		await page.setContent('<a href="">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveHref("");
	});

	test("should handle absolute URLs", async ({ page }) => {
		await page.setContent('<a href="https://example.com">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveHref("https://example.com");
	});
});

test.describe("expectLocator - toHaveSrc", () => {
	test("should pass when src matches exactly", async ({ page }) => {
		await page.setContent('<img src="/image.png" />');
		const img = page.locator("img");
		await expectLocator(img).toHaveSrc("/image.png");
	});

	test("should pass when src matches regex", async ({ page }) => {
		await page.setContent('<img src="https://cdn.example.com/logo.png" />');
		const img = page.locator("img");
		await expectLocator(img).toHaveSrc(/\.png$/);
	});

	test("should fail when src does not match", async ({ page }) => {
		await page.setContent('<img src="/image.png" />');
		const img = page.locator("img");
		await expectLocator(img).not.toHaveSrc("/other.png");
	});

	test("should handle missing src attribute", async ({ page }) => {
		await page.setContent("<img />");
		const img = page.locator("img");
		await expectLocator(img).not.toHaveSrc("/image.png");
	});

	test("should work with iframe src", async ({ page }) => {
		await page.setContent('<iframe src="/embed"></iframe>');
		const iframe = page.locator("iframe");
		await expectLocator(iframe).toHaveSrc("/embed");
	});
});

test.describe("expectLocator - toHaveAlt", () => {
	test("should pass when alt matches exactly", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectLocator(img).toHaveAlt("Company Logo");
	});

	test("should pass when alt matches regex", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectLocator(img).toHaveAlt(/Logo/i);
	});

	test("should fail when alt does not match", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectLocator(img).not.toHaveAlt("Site Logo");
	});

	test("should handle missing alt attribute", async ({ page }) => {
		await page.setContent('<img src="/logo.png" />');
		const img = page.locator("img");
		await expectLocator(img).not.toHaveAlt("Company Logo");
	});

	test("should handle empty alt", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="" />');
		const img = page.locator("img");
		await expectLocator(img).toHaveAlt("");
	});
});

test.describe("expectLocator - toHaveTitle", () => {
	test("should pass when title matches exactly", async ({ page }) => {
		await page.setContent('<button title="Click me">Button</button>');
		const button = page.locator("button");
		await expectLocator(button).toHaveTitle("Click me");
	});

	test("should pass when title matches regex", async ({ page }) => {
		await page.setContent('<a href="#" title="Open in new window">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveTitle(/new window/i);
	});

	test("should fail when title does not match", async ({ page }) => {
		await page.setContent('<button title="Click me">Button</button>');
		const button = page.locator("button");
		await expectLocator(button).not.toHaveTitle("Press me");
	});

	test("should handle missing title attribute", async ({ page }) => {
		await page.setContent("<button>Button</button>");
		const button = page.locator("button");
		await expectLocator(button).not.toHaveTitle("Click me");
	});

	test("should handle empty title", async ({ page }) => {
		await page.setContent('<button title="">Button</button>');
		const button = page.locator("button");
		await expectLocator(button).toHaveTitle("");
	});
});

test.describe("expectLocator - toHaveDataAttribute", () => {
	test("should pass when data attribute exists (no value check)", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectLocator(div).toHaveDataAttribute("test-id");
	});

	test("should accept data- prefix in attribute name", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectLocator(div).toHaveDataAttribute("data-test-id");
	});

	test("should pass when data attribute matches exact value", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectLocator(div).toHaveDataAttribute("test-id", "my-element");
	});

	test("should pass when data attribute matches regex", async ({ page }) => {
		await page.setContent('<div data-user-role="admin">Content</div>');
		const div = page.locator("div");
		await expectLocator(div).toHaveDataAttribute("user-role", /admin/);
	});

	test("should fail when data attribute does not match", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectLocator(div).not.toHaveDataAttribute("test-id", "other-element");
	});

	test("should handle missing data attribute", async ({ page }) => {
		await page.setContent("<div>Content</div>");
		const div = page.locator("div");
		await expectLocator(div).not.toHaveDataAttribute("test-id");
	});

	test("should handle empty data attribute value", async ({ page }) => {
		await page.setContent('<div data-empty="">Content</div>');
		const div = page.locator("div");
		await expectLocator(div).toHaveDataAttribute("empty", "");
	});

	test("should handle complex data attribute names", async ({ page }) => {
		await page.setContent('<div data-tracking-event-name="click-button">Content</div>');
		const div = page.locator("div");
		await expectLocator(div).toHaveDataAttribute("tracking-event-name", "click-button");
	});
});

test.describe("expectLocator - toHaveAriaLabel", () => {
	test("should pass when aria-label matches exactly", async ({ page }) => {
		await page.setContent('<button aria-label="Close dialog">X</button>');
		const button = page.locator("button");
		await expectLocator(button).toHaveAriaLabel("Close dialog");
	});

	test("should pass when aria-label matches regex", async ({ page }) => {
		await page.setContent('<button aria-label="Submit form">Submit</button>');
		const button = page.locator("button");
		await expectLocator(button).toHaveAriaLabel(/submit/i);
	});

	test("should fail when aria-label does not match", async ({ page }) => {
		await page.setContent('<button aria-label="Close dialog">X</button>');
		const button = page.locator("button");
		await expectLocator(button).not.toHaveAriaLabel("Open dialog");
	});

	test("should handle missing aria-label attribute", async ({ page }) => {
		await page.setContent("<button>Button</button>");
		const button = page.locator("button");
		await expectLocator(button).not.toHaveAriaLabel("Close dialog");
	});

	test("should handle empty aria-label", async ({ page }) => {
		await page.setContent('<button aria-label="">Button</button>');
		const button = page.locator("button");
		await expectLocator(button).toHaveAriaLabel("");
	});
});

test.describe("expectLocator - toHaveTarget", () => {
	test("should pass when target matches exactly", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveTarget("_blank");
	});

	test("should pass when target matches regex", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveTarget(/_blank/);
	});

	test("should fail when target does not match", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).not.toHaveTarget("_self");
	});

	test("should handle missing target attribute", async ({ page }) => {
		await page.setContent('<a href="/page">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).not.toHaveTarget("_blank");
	});

	test("should handle _self target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_self">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveTarget("_self");
	});

	test("should handle _parent target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_parent">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveTarget("_parent");
	});

	test("should handle _top target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_top">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveTarget("_top");
	});

	test("should handle custom frame name", async ({ page }) => {
		await page.setContent('<a href="/page" target="myFrame">Link</a>');
		const link = page.locator("a");
		await expectLocator(link).toHaveTarget("myFrame");
	});
});

test.describe("expectLocator - toBeUUID", () => {
	test("should pass for valid UUID v4 in element text", async ({ page }) => {
		await page.setContent('<div id="uuid">550e8400-e29b-41d4-a716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).toBeUUID();
	});

	test("should pass for valid UUID v4 with version specified", async ({ page }) => {
		await page.setContent('<div id="uuid">550e8400-e29b-41d4-a716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).toBeUUID(4);
	});

	test("should pass for valid UUID v1", async ({ page }) => {
		await page.setContent('<div id="uuid">6ba7b810-9dad-11d1-80b4-00c04fd430c8</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).toBeUUID(1);
	});

	test("should pass for valid UUID v3", async ({ page }) => {
		await page.setContent('<div id="uuid">6fa459ea-ee8a-3ca4-894e-db77e160355e</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).toBeUUID(3);
	});

	test("should pass for valid UUID v5", async ({ page }) => {
		await page.setContent('<div id="uuid">886313e1-3b8a-5372-9b90-0c9aee199e5d</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).toBeUUID(5);
	});

	test("should fail for invalid UUID format", async ({ page }) => {
		await page.setContent('<div id="uuid">not-a-uuid</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).not.toBeUUID();
	});

	test("should fail when UUID version doesn't match", async ({ page }) => {
		await page.setContent('<div id="uuid">550e8400-e29b-41d4-a716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).not.toBeUUID(1); // It's v4, not v1
	});

	test("should work with .not for valid UUID", async ({ page }) => {
		await page.setContent('<div id="uuid">not-a-uuid</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).not.toBeUUID();
	});

	test("should handle case insensitivity", async ({ page }) => {
		await page.setContent('<div id="uuid">550E8400-E29B-41D4-A716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).toBeUUID();
	});

	test("should handle UUID in span", async ({ page }) => {
		await page.setContent('<span id="order-id">6ba7b810-9dad-11d1-80b4-00c04fd430c8</span>');
		const span = page.locator("#order-id");
		await expectLocator(span).toBeUUID(1);
	});

	test("should work with timeout option", async ({ page }) => {
		await page.setContent('<div id="uuid">550e8400-e29b-41d4-a716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectLocator(element).toBeUUID(4, { timeout: 5000 });
	});
});
