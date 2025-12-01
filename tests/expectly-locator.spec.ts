import { test } from "@playwright/test";
import { expectlyLocator } from "../src/expectly-locator";

test.describe("expectLocator - toHavePlaceholder", () => {
	test("should pass when placeholder matches exactly", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your name" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocator(input).toHavePlaceholder("Enter your name");
	});

	test("should pass when placeholder matches regex", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your email" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocator(input).toHavePlaceholder(/email/i);
	});

	test("should fail when placeholder does not match", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="Enter your name" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocator(input).not.toHavePlaceholder("Enter your email");
	});

	test("should handle missing placeholder attribute", async ({ page }) => {
		await page.setContent('<input type="text" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocator(input).not.toHavePlaceholder("Enter your name");
	});

	test("should handle empty placeholder", async ({ page }) => {
		await page.setContent('<input type="text" placeholder="" />');
		const input = page.locator('input[type="text"]');
		await expectlyLocator(input).toHavePlaceholder("");
	});
});

test.describe("expectLocator - toHaveHref", () => {
	test("should pass when href matches exactly", async ({ page }) => {
		await page.setContent('<a href="/about">About</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveHref("/about");
	});

	test("should pass when href matches regex", async ({ page }) => {
		await page.setContent('<a href="https://example.com/page">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveHref(/example\.com/);
	});

	test("should fail when href does not match", async ({ page }) => {
		await page.setContent('<a href="/about">About</a>');
		const link = page.locator("a");
		await expectlyLocator(link).not.toHaveHref("/contact");
	});

	test("should handle missing href attribute", async ({ page }) => {
		await page.setContent("<a>Link</a>");
		const link = page.locator("a");
		await expectlyLocator(link).not.toHaveHref("/about");
	});

	test("should handle empty href", async ({ page }) => {
		await page.setContent('<a href="">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveHref("");
	});

	test("should handle absolute URLs", async ({ page }) => {
		await page.setContent('<a href="https://example.com">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveHref("https://example.com");
	});
});

test.describe("expectLocator - toHaveSrc", () => {
	test("should pass when src matches exactly", async ({ page }) => {
		await page.setContent('<img src="/image.png" />');
		const img = page.locator("img");
		await expectlyLocator(img).toHaveSrc("/image.png");
	});

	test("should pass when src matches regex", async ({ page }) => {
		await page.setContent('<img src="https://cdn.example.com/logo.png" />');
		const img = page.locator("img");
		await expectlyLocator(img).toHaveSrc(/\.png$/);
	});

	test("should fail when src does not match", async ({ page }) => {
		await page.setContent('<img src="/image.png" />');
		const img = page.locator("img");
		await expectlyLocator(img).not.toHaveSrc("/other.png");
	});

	test("should handle missing src attribute", async ({ page }) => {
		await page.setContent("<img />");
		const img = page.locator("img");
		await expectlyLocator(img).not.toHaveSrc("/image.png");
	});

	test("should work with iframe src", async ({ page }) => {
		await page.setContent('<iframe src="/embed"></iframe>');
		const iframe = page.locator("iframe");
		await expectlyLocator(iframe).toHaveSrc("/embed");
	});
});

test.describe("expectLocator - toHaveAlt", () => {
	test("should pass when alt matches exactly", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectlyLocator(img).toHaveAlt("Company Logo");
	});

	test("should pass when alt matches regex", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectlyLocator(img).toHaveAlt(/Logo/i);
	});

	test("should fail when alt does not match", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="Company Logo" />');
		const img = page.locator("img");
		await expectlyLocator(img).not.toHaveAlt("Site Logo");
	});

	test("should handle missing alt attribute", async ({ page }) => {
		await page.setContent('<img src="/logo.png" />');
		const img = page.locator("img");
		await expectlyLocator(img).not.toHaveAlt("Company Logo");
	});

	test("should handle empty alt", async ({ page }) => {
		await page.setContent('<img src="/logo.png" alt="" />');
		const img = page.locator("img");
		await expectlyLocator(img).toHaveAlt("");
	});
});

test.describe("expectLocator - toHaveTitle", () => {
	test("should pass when title matches exactly", async ({ page }) => {
		await page.setContent('<button title="Click me">Button</button>');
		const button = page.locator("button");
		await expectlyLocator(button).toHaveTitle("Click me");
	});

	test("should pass when title matches regex", async ({ page }) => {
		await page.setContent('<a href="#" title="Open in new window">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveTitle(/new window/i);
	});

	test("should fail when title does not match", async ({ page }) => {
		await page.setContent('<button title="Click me">Button</button>');
		const button = page.locator("button");
		await expectlyLocator(button).not.toHaveTitle("Press me");
	});

	test("should handle missing title attribute", async ({ page }) => {
		await page.setContent("<button>Button</button>");
		const button = page.locator("button");
		await expectlyLocator(button).not.toHaveTitle("Click me");
	});

	test("should handle empty title", async ({ page }) => {
		await page.setContent('<button title="">Button</button>');
		const button = page.locator("button");
		await expectlyLocator(button).toHaveTitle("");
	});
});

test.describe("expectLocator - toHaveDataAttribute", () => {
	test("should pass when data attribute exists (no value check)", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectlyLocator(div).toHaveDataAttribute("test-id");
	});

	test("should accept data- prefix in attribute name", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectlyLocator(div).toHaveDataAttribute("data-test-id");
	});

	test("should pass when data attribute matches exact value", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectlyLocator(div).toHaveDataAttribute("test-id", "my-element");
	});

	test("should pass when data attribute matches regex", async ({ page }) => {
		await page.setContent('<div data-user-role="admin">Content</div>');
		const div = page.locator("div");
		await expectlyLocator(div).toHaveDataAttribute("user-role", /admin/);
	});

	test("should fail when data attribute does not match", async ({ page }) => {
		await page.setContent('<div data-test-id="my-element">Content</div>');
		const div = page.locator("div");
		await expectlyLocator(div).not.toHaveDataAttribute("test-id", "other-element");
	});

	test("should handle missing data attribute", async ({ page }) => {
		await page.setContent("<div>Content</div>");
		const div = page.locator("div");
		await expectlyLocator(div).not.toHaveDataAttribute("test-id");
	});

	test("should handle empty data attribute value", async ({ page }) => {
		await page.setContent('<div data-empty="">Content</div>');
		const div = page.locator("div");
		await expectlyLocator(div).toHaveDataAttribute("empty", "");
	});

	test("should handle complex data attribute names", async ({ page }) => {
		await page.setContent('<div data-tracking-event-name="click-button">Content</div>');
		const div = page.locator("div");
		await expectlyLocator(div).toHaveDataAttribute("tracking-event-name", "click-button");
	});
});

test.describe("expectLocator - toHaveAriaLabel", () => {
	test("should pass when aria-label matches exactly", async ({ page }) => {
		await page.setContent('<button aria-label="Close dialog">X</button>');
		const button = page.locator("button");
		await expectlyLocator(button).toHaveAriaLabel("Close dialog");
	});

	test("should pass when aria-label matches regex", async ({ page }) => {
		await page.setContent('<button aria-label="Submit form">Submit</button>');
		const button = page.locator("button");
		await expectlyLocator(button).toHaveAriaLabel(/submit/i);
	});

	test("should fail when aria-label does not match", async ({ page }) => {
		await page.setContent('<button aria-label="Close dialog">X</button>');
		const button = page.locator("button");
		await expectlyLocator(button).not.toHaveAriaLabel("Open dialog");
	});

	test("should handle missing aria-label attribute", async ({ page }) => {
		await page.setContent("<button>Button</button>");
		const button = page.locator("button");
		await expectlyLocator(button).not.toHaveAriaLabel("Close dialog");
	});

	test("should handle empty aria-label", async ({ page }) => {
		await page.setContent('<button aria-label="">Button</button>');
		const button = page.locator("button");
		await expectlyLocator(button).toHaveAriaLabel("");
	});
});

test.describe("expectLocator - toHaveTarget", () => {
	test("should pass when target matches exactly", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveTarget("_blank");
	});

	test("should pass when target matches regex", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveTarget(/_blank/);
	});

	test("should fail when target does not match", async ({ page }) => {
		await page.setContent('<a href="/page" target="_blank">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).not.toHaveTarget("_self");
	});

	test("should handle missing target attribute", async ({ page }) => {
		await page.setContent('<a href="/page">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).not.toHaveTarget("_blank");
	});

	test("should handle _self target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_self">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveTarget("_self");
	});

	test("should handle _parent target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_parent">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveTarget("_parent");
	});

	test("should handle _top target", async ({ page }) => {
		await page.setContent('<a href="/page" target="_top">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveTarget("_top");
	});

	test("should handle custom frame name", async ({ page }) => {
		await page.setContent('<a href="/page" target="myFrame">Link</a>');
		const link = page.locator("a");
		await expectlyLocator(link).toHaveTarget("myFrame");
	});
});

test.describe("expectLocator - toBeUUID", () => {
	test("should pass for valid UUID v4 in element text", async ({ page }) => {
		await page.setContent('<div id="uuid">550e8400-e29b-41d4-a716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).toBeUUID();
	});

	test("should pass for valid UUID v4 with version specified", async ({ page }) => {
		await page.setContent('<div id="uuid">550e8400-e29b-41d4-a716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).toBeUUID(4);
	});

	test("should pass for valid UUID v1", async ({ page }) => {
		await page.setContent('<div id="uuid">6ba7b810-9dad-11d1-80b4-00c04fd430c8</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).toBeUUID(1);
	});

	test("should pass for valid UUID v3", async ({ page }) => {
		await page.setContent('<div id="uuid">6fa459ea-ee8a-3ca4-894e-db77e160355e</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).toBeUUID(3);
	});

	test("should pass for valid UUID v5", async ({ page }) => {
		await page.setContent('<div id="uuid">886313e1-3b8a-5372-9b90-0c9aee199e5d</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).toBeUUID(5);
	});

	test("should fail for invalid UUID format", async ({ page }) => {
		await page.setContent('<div id="uuid">not-a-uuid</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).not.toBeUUID();
	});

	test("should fail when UUID version doesn't match", async ({ page }) => {
		await page.setContent('<div id="uuid">550e8400-e29b-41d4-a716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).not.toBeUUID(1); // It's v4, not v1
	});

	test("should work with .not for valid UUID", async ({ page }) => {
		await page.setContent('<div id="uuid">not-a-uuid</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).not.toBeUUID();
	});

	test("should handle case insensitivity", async ({ page }) => {
		await page.setContent('<div id="uuid">550E8400-E29B-41D4-A716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).toBeUUID();
	});

	test("should handle UUID in span", async ({ page }) => {
		await page.setContent('<span id="order-id">6ba7b810-9dad-11d1-80b4-00c04fd430c8</span>');
		const span = page.locator("#order-id");
		await expectlyLocator(span).toBeUUID(1);
	});

	test("should work with timeout option", async ({ page }) => {
		await page.setContent('<div id="uuid">550e8400-e29b-41d4-a716-446655440000</div>');
		const element = page.locator("#uuid");
		await expectlyLocator(element).toBeUUID(4, { timeout: 5000 });
	});
});

test.describe("expectLocator - toStartWith", () => {
	test("should pass when locator text starts with expected value", async ({ page }) => {
		await page.setContent('<div id="greeting">Hello World</div>');
		const element = page.locator("#greeting");
		await expectlyLocator(element).toStartWith("Hello");
	});

	test("should pass when locator text starts with single character", async ({ page }) => {
		await page.setContent('<div id="text">Testing</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toStartWith("T");
	});

	test("should pass when entire text matches", async ({ page }) => {
		await page.setContent('<div id="text">Hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toStartWith("Hello");
	});

	test("should pass with empty string prefix", async ({ page }) => {
		await page.setContent('<div id="text">Hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toStartWith("");
	});

	test("should fail when text doesn't start with expected", async ({ page }) => {
		await page.setContent('<div id="greeting">Hello World</div>');
		const element = page.locator("#greeting");
		await expectlyLocator(element).not.toStartWith("World");
	});

	test("should work with .not when text doesn't start with value", async ({ page }) => {
		await page.setContent('<div id="greeting">Hello World</div>');
		const element = page.locator("#greeting");
		await expectlyLocator(element).not.toStartWith("World");
	});

	test("should work with custom timeout", async ({ page }) => {
		await page.setContent('<div id="text">Hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toStartWith("Hello", { timeout: 5000 });
	});
});

test.describe("expectLocator - toEndWith", () => {
	test("should pass when locator text ends with expected value", async ({ page }) => {
		await page.setContent('<div id="greeting">Hello World</div>');
		const element = page.locator("#greeting");
		await expectlyLocator(element).toEndWith("World");
	});

	test("should pass when locator text ends with single character", async ({ page }) => {
		await page.setContent('<div id="text">Testing</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toEndWith("g");
	});

	test("should pass when entire text matches", async ({ page }) => {
		await page.setContent('<div id="text">Hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toEndWith("Hello");
	});

	test("should pass with empty string suffix", async ({ page }) => {
		await page.setContent('<div id="text">Hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toEndWith("");
	});

	test("should fail when text doesn't end with expected", async ({ page }) => {
		await page.setContent('<div id="greeting">Hello World</div>');
		const element = page.locator("#greeting");
		await expectlyLocator(element).not.toEndWith("Hello");
	});

	test("should work with .not when text doesn't end with value", async ({ page }) => {
		await page.setContent('<div id="greeting">Hello World</div>');
		const element = page.locator("#greeting");
		await expectlyLocator(element).not.toEndWith("Hello");
	});

	test("should work with numbers", async ({ page }) => {
		await page.setContent('<div id="room">Room 123</div>');
		const element = page.locator("#room");
		await expectlyLocator(element).toEndWith("123");
	});
});

test.describe("expectLocator - toMatchPattern", () => {
	test("should pass when text matches regex pattern", async ({ page }) => {
		await page.setContent('<div id="code">test123</div>');
		const element = page.locator("#code");
		await expectlyLocator(element).toMatchPattern(/test\d+/);
	});

	test("should pass with email pattern", async ({ page }) => {
		await page.setContent('<div id="email">user@example.com</div>');
		const element = page.locator("#email");
		await expectlyLocator(element).toMatchPattern(/^[\w.]+@[\w.]+$/);
	});

	test("should pass with phone pattern", async ({ page }) => {
		await page.setContent('<div id="phone">123-456-7890</div>');
		const element = page.locator("#phone");
		await expectlyLocator(element).toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
	});

	test("should pass with case-insensitive flag", async ({ page }) => {
		await page.setContent('<div id="text">Hello World</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toMatchPattern(/hello world/i);
	});

	test("should fail when text doesn't match pattern", async ({ page }) => {
		await page.setContent('<div id="text">abc</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toMatchPattern(/\d+/);
	});

	test("should work with .not when text doesn't match", async ({ page }) => {
		await page.setContent('<div id="text">abc</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toMatchPattern(/\d+/);
	});
});

test.describe("expectLocator - toBeValidEmail", () => {
	test("should pass with valid email", async ({ page }) => {
		await page.setContent('<div id="email">user@example.com</div>');
		const element = page.locator("#email");
		await expectlyLocator(element).toBeValidEmail();
	});

	test("should pass with subdomain", async ({ page }) => {
		await page.setContent('<div id="email">user@mail.example.com</div>');
		const element = page.locator("#email");
		await expectlyLocator(element).toBeValidEmail();
	});

	test("should pass with plus sign", async ({ page }) => {
		await page.setContent('<div id="email">user+tag@example.com</div>');
		const element = page.locator("#email");
		await expectlyLocator(element).toBeValidEmail();
	});

	test("should fail with invalid email", async ({ page }) => {
		await page.setContent('<div id="invalid">not-an-email</div>');
		const element = page.locator("#invalid");
		await expectlyLocator(element).not.toBeValidEmail();
	});

	test("should work with .not for invalid email", async ({ page }) => {
		await page.setContent('<div id="invalid">not-an-email</div>');
		const element = page.locator("#invalid");
		await expectlyLocator(element).not.toBeValidEmail();
	});
});

test.describe("expectLocator - toBeValidUrl", () => {
	test("should pass with valid http URL", async ({ page }) => {
		await page.setContent('<div id="url">http://example.com</div>');
		const element = page.locator("#url");
		await expectlyLocator(element).toBeValidUrl();
	});

	test("should pass with valid https URL", async ({ page }) => {
		await page.setContent('<div id="url">https://example.com</div>');
		const element = page.locator("#url");
		await expectlyLocator(element).toBeValidUrl();
	});

	test("should pass with path", async ({ page }) => {
		await page.setContent('<div id="url">https://example.com/path/to/page</div>');
		const element = page.locator("#url");
		await expectlyLocator(element).toBeValidUrl();
	});

	test("should pass with localhost", async ({ page }) => {
		await page.setContent('<div id="url">http://localhost:3000</div>');
		const element = page.locator("#url");
		await expectlyLocator(element).toBeValidUrl();
	});

	test("should fail with invalid URL", async ({ page }) => {
		await page.setContent('<div id="invalid">not-a-url</div>');
		const element = page.locator("#invalid");
		await expectlyLocator(element).not.toBeValidUrl();
	});

	test("should work with .not for invalid URL", async ({ page }) => {
		await page.setContent('<div id="invalid">not-a-url</div>');
		const element = page.locator("#invalid");
		await expectlyLocator(element).not.toBeValidUrl();
	});
});

test.describe("expectLocator - toBeAlphanumeric", () => {
	test("should pass with only letters", async ({ page }) => {
		await page.setContent('<div id="text">abcdef</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeAlphanumeric();
	});

	test("should pass with only numbers", async ({ page }) => {
		await page.setContent('<div id="text">123456</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeAlphanumeric();
	});

	test("should pass with mixed letters and numbers", async ({ page }) => {
		await page.setContent('<div id="text">abc123</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeAlphanumeric();
	});

	test("should pass with uppercase letters", async ({ page }) => {
		await page.setContent('<div id="text">ABC123</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeAlphanumeric();
	});

	test("should fail with spaces", async ({ page }) => {
		await page.setContent('<div id="text">abc 123</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeAlphanumeric();
	});

	test("should fail with special characters", async ({ page }) => {
		await page.setContent('<div id="text">abc-123</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeAlphanumeric();
	});

	test("should work with .not for non-alphanumeric", async ({ page }) => {
		await page.setContent('<div id="text">abc-123</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeAlphanumeric();
	});
});

test.describe("expectLocator - toBeNumericString", () => {
	test("should pass with only digits", async ({ page }) => {
		await page.setContent('<div id="text">123456</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeNumericString();
	});

	test("should pass with single digit", async ({ page }) => {
		await page.setContent('<div id="text">5</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeNumericString();
	});

	test("should pass with leading zeros", async ({ page }) => {
		await page.setContent('<div id="text">00123</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeNumericString();
	});

	test("should fail with letters", async ({ page }) => {
		await page.setContent('<div id="text">abc</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeNumericString();
	});

	test("should fail with mixed letters and numbers", async ({ page }) => {
		await page.setContent('<div id="text">123abc</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeNumericString();
	});

	test("should fail with decimal point", async ({ page }) => {
		await page.setContent('<div id="text">123.456</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeNumericString();
	});

	test("should work with .not for non-numeric", async ({ page }) => {
		await page.setContent('<div id="text">abc</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeNumericString();
	});
});

test.describe("expectLocator - toBeUpperCase", () => {
	test("should pass with all uppercase letters", async ({ page }) => {
		await page.setContent('<div id="text">HELLO</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeUpperCase();
	});

	test("should pass with uppercase and numbers", async ({ page }) => {
		await page.setContent('<div id="text">ABC123</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeUpperCase();
	});

	test("should pass with uppercase and spaces", async ({ page }) => {
		await page.setContent('<div id="text">HELLO WORLD</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeUpperCase();
	});

	test("should fail with lowercase letters", async ({ page }) => {
		await page.setContent('<div id="text">hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeUpperCase();
	});

	test("should fail with mixed case", async ({ page }) => {
		await page.setContent('<div id="text">Hello World</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeUpperCase();
	});

	test("should work with .not for non-uppercase", async ({ page }) => {
		await page.setContent('<div id="text">hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeUpperCase();
	});
});

test.describe("expectLocator - toBeLowerCase", () => {
	test("should pass with all lowercase letters", async ({ page }) => {
		await page.setContent('<div id="text">hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeLowerCase();
	});

	test("should pass with lowercase and numbers", async ({ page }) => {
		await page.setContent('<div id="text">abc123</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeLowerCase();
	});

	test("should pass with lowercase and spaces", async ({ page }) => {
		await page.setContent('<div id="text">hello world</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeLowerCase();
	});

	test("should fail with uppercase letters", async ({ page }) => {
		await page.setContent('<div id="text">HELLO</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeLowerCase();
	});

	test("should fail with mixed case", async ({ page }) => {
		await page.setContent('<div id="text">Hello World</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeLowerCase();
	});

	test("should work with .not for non-lowercase", async ({ page }) => {
		await page.setContent('<div id="text">HELLO</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeLowerCase();
	});
});

test.describe("expectLocator - toBeTitleCase", () => {
	test("should pass with title case text", async ({ page }) => {
		await page.setContent('<div id="text">Hello World</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeTitleCase();
	});

	test("should pass with single word title case", async ({ page }) => {
		await page.setContent('<div id="text">Hello</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeTitleCase();
	});

	test("should pass with multiple words", async ({ page }) => {
		await page.setContent('<div id="text">The Quick Brown Fox</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toBeTitleCase();
	});

	test("should fail with all lowercase", async ({ page }) => {
		await page.setContent('<div id="text">hello world</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeTitleCase();
	});

	test("should fail with all uppercase", async ({ page }) => {
		await page.setContent('<div id="text">HELLO WORLD</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeTitleCase();
	});

	test("should work with .not for non-title case", async ({ page }) => {
		await page.setContent('<div id="text">hello world</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).not.toBeTitleCase();
	});
});
