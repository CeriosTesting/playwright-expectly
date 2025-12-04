import { test } from "@playwright/test";
import { expectlyLocator } from "../../src/expectly-locator";

// For granular imports, you can also use:
// import { expectlyLocatorText } from "../../src/expectly-locator/text";

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

test.describe("expectLocator - toHaveDirectText", () => {
	test("should pass when element has only direct text", async ({ page }) => {
		await page.setContent('<div id="text">Direct text only</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toHaveDirectText("Direct text only");
	});

	test("should pass when ignoring nested element text", async ({ page }) => {
		await page.setContent('<div id="parent">Direct text<span>Nested text</span></div>');
		const element = page.locator("#parent");
		await expectlyLocator(element).toHaveDirectText("Direct text");
	});

	test("should pass with multiple text nodes", async ({ page }) => {
		await page.setContent('<div id="text">First<span>Middle</span>Last</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toHaveDirectText("FirstLast");
	});

	test("should pass with whitespace trimming", async ({ page }) => {
		await page.setContent('<div id="text">  Trimmed text  </div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toHaveDirectText("Trimmed text");
	});

	test("should pass with empty direct text when only nested elements have text", async ({ page }) => {
		await page.setContent('<div id="parent"><span>Only nested</span></div>');
		const element = page.locator("#parent");
		await expectlyLocator(element).toHaveDirectText("");
	});

	test("should pass with complex nested structure", async ({ page }) => {
		await page.setContent(`
			<div id="complex">
				Before
				<span>Span text</span>
				Middle
				<strong>Strong text</strong>
				After
			</div>
		`);
		const element = page.locator("#complex");
		await expectlyLocator(element).toHaveDirectText("Before Middle After");
	});

	test("should work with dynamically changing text", async ({ page }) => {
		await page.setContent(`
			<div id="dynamic">Initial<span>Nested</span></div>
			<script>
				setTimeout(() => {
					const div = document.getElementById('dynamic');
					div.childNodes[0].textContent = 'Updated';
				}, 300);
			</script>
		`);
		const element = page.locator("#dynamic");
		await expectlyLocator(element).toHaveDirectText("Updated", { timeout: 1000 });
	});

	test("should work with custom timeout", async ({ page }) => {
		await page.setContent('<div id="text">Direct text</div>');
		const element = page.locator("#text");
		await expectlyLocator(element).toHaveDirectText("Direct text", { timeout: 5000 });
	});

	test("should handle text with line breaks", async ({ page }) => {
		await page.setContent(`
			<div id="text">
				Line 1
				<span>Nested</span>
				Line 2
			</div>
		`);
		const element = page.locator("#text");
		await expectlyLocator(element).toHaveDirectText("Line 1 Line 2");
	});

	test("should distinguish between direct and nested text", async ({ page }) => {
		await page.setContent(`
			<div id="container">
				outer text
				<div>inner text</div>
			</div>
		`);
		const element = page.locator("#container");
		await expectlyLocator(element).toHaveDirectText("outer text");
	});

	test("should work with deeply nested structure", async ({ page }) => {
		await page.setContent(`
			<div id="deep">
				Top level
				<div>
					<span>
						<strong>Deep nested</strong>
					</span>
				</div>
				Back to top
			</div>
		`);
		const element = page.locator("#deep");
		await expectlyLocator(element).toHaveDirectText("Top level Back to top");
	});

	test("should handle special characters in direct text", async ({ page }) => {
		await page.setContent('<div id="special">Text with & < > " \' symbols<span>nested</span></div>');
		const element = page.locator("#special");
		await expectlyLocator(element).toHaveDirectText("Text with & < > \" ' symbols");
	});

	test("should work with unicode characters", async ({ page }) => {
		await page.setContent('<div id="unicode">Hello 世界<span>nested</span></div>');
		const element = page.locator("#unicode");
		await expectlyLocator(element).toHaveDirectText("Hello 世界");
	});

	test("should work with numbers", async ({ page }) => {
		await page.setContent('<div id="numbers">123<span>456</span>789</div>');
		const element = page.locator("#numbers");
		await expectlyLocator(element).toHaveDirectText("123789");
	});

	test("should handle elements with only whitespace as direct text", async ({ page }) => {
		await page.setContent('<div id="whitespace">   <span>Nested text</span>   </div>');
		const element = page.locator("#whitespace");
		await expectlyLocator(element).toHaveDirectText("");
	});

	test("should work with text content appearing after delay", async ({ page }) => {
		await page.setContent(`
			<div id="delayed"><span>Nested</span></div>
			<script>
				setTimeout(() => {
					const div = document.getElementById('delayed');
					const textNode = document.createTextNode('Delayed text');
					div.appendChild(textNode);
				}, 400);
			</script>
		`);
		const element = page.locator("#delayed");
		await expectlyLocator(element).toHaveDirectText("Delayed text", { timeout: 1000 });
	});
});
