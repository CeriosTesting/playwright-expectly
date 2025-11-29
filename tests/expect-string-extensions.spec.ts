import { expect, test } from "@playwright/test";
import { expectLocator } from "../src/expect-locator-extensions";
import { expectString } from "../src/expect-string-extensions";

test.describe("toStartWith", () => {
	test.describe("with string values", () => {
		test("should pass when string starts with expected value", async () => {
			await expectString("Hello World").toStartWith("Hello");
		});

		test("should pass when string starts with single character", async () => {
			await expectString("Testing").toStartWith("T");
		});

		test("should pass when entire string matches", async () => {
			await expectString("Hello").toStartWith("Hello");
		});

		test("should pass with empty string prefix", async () => {
			await expectString("Hello").toStartWith("");
		});

		test("should pass with multiline string", async () => {
			const multiline = "Line 1\nLine 2\nLine 3";
			await expectString(multiline).toStartWith("Line 1");
		});

		test("should pass with special characters", async () => {
			await expectString("@username: message").toStartWith("@username");
		});

		test("should pass with numbers in string", async () => {
			await expectString("123 Main Street").toStartWith("123");
		});

		test("should pass with whitespace at start", async () => {
			await expectString("  Hello").toStartWith("  ");
		});

		test("should pass with unicode characters", async () => {
			await expectString("🎉 Celebration!").toStartWith("🎉");
		});

		test("should pass with case-sensitive match", async () => {
			await expectString("Hello World").toStartWith("Hello");
		});

		test("should fail when string doesn't start with expected value", async () => {
			let error: Error | undefined;
			try {
				await expectString("Hello World").toStartWith("World");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("toStartWith");
			expect(error?.message).toContain("Expected string to start with");
			expect(error?.message).toContain("World");
		});

		test("should fail when case doesn't match", async () => {
			let error: Error | undefined;
			try {
				await expectString("hello world").toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to start with");
			expect(error?.message).toContain("Hello");
		});

		test("should fail when expected is longer than actual", async () => {
			let error: Error | undefined;
			try {
				await expectString("Hi").toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to start with");
		});

		test("should fail for empty string with non-empty expected", async () => {
			let error: Error | undefined;
			try {
				await expectString("").toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail when substring is in middle", async () => {
			let error: Error | undefined;
			try {
				await expectString("The Hello World").toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not when string doesn't start with value", async () => {
			await expectString("Hello World").not.toStartWith("World");
		});

		test("should work with .not for case mismatch", async () => {
			await expectString("hello world").not.toStartWith("Hello");
		});

		test("should work with .not for substring in middle", async () => {
			await expectString("The Hello World").not.toStartWith("Hello");
		});

		test("should fail with .not when string starts with expected", async () => {
			let error: Error | undefined;
			try {
				await expectString("Hello World").not.toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("not");
			expect(error?.message).toContain("Expected string to not start with");
		});

		test("should fail with .not when entire string matches", async () => {
			let error: Error | undefined;
			try {
				await expectString("Hello").not.toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("not");
		});

		test("should handle very long strings", async () => {
			const longString = "A".repeat(10000) + "B".repeat(1000);
			await expectString(longString).toStartWith("A".repeat(100));
		});

		test("should handle strings with tabs and newlines", async () => {
			await expectString("\t\nHello").toStartWith("\t\n");
		});

		test("should handle strings with quotes", async () => {
			await expectString('"Hello World"').toStartWith('"Hello');
		});

		test("should handle strings with backslashes", async () => {
			await expectString("\\path\\to\\file").toStartWith("\\path");
		});

		test("should provide clear error with actual start", async () => {
			let error: Error | undefined;
			try {
				await expectString("The quick brown fox").toStartWith("A quick");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Start of string");
			expect(error?.message).toContain("The quick");
		});
	});

	test.describe("with Locator (HTML page)", () => {
		test.beforeEach(async ({ page }) => {
			await page.setContent(`
				<div id="greeting">Hello World</div>
				<div id="empty"></div>
				<div id="multiline">Line 1
Line 2
Line 3</div>
				<div id="special">@username: Welcome!</div>
				<div id="unicode">🎉 Party Time!</div>
				<div id="whitespace">  Leading spaces</div>
			`);
		});

		test("should pass when locator text starts with expected value", async ({ page }) => {
			const locator = page.locator("#greeting");
			await expectLocator(locator).toStartWith("Hello");
		});

		test("should pass when locator text starts with single character", async ({ page }) => {
			const locator = page.locator("#greeting");
			await expectLocator(locator).toStartWith("H");
		});

		test("should pass when entire locator text matches", async ({ page }) => {
			const locator = page.locator("#greeting");
			await expectLocator(locator).toStartWith("Hello World");
		});

		test("should pass with empty string prefix for locator", async ({ page }) => {
			const locator = page.locator("#greeting");
			await expectLocator(locator).toStartWith("");
		});

		test("should pass with multiline locator text", async ({ page }) => {
			const locator = page.locator("#multiline");
			await expectLocator(locator).toStartWith("Line 1");
		});

		test("should pass with special characters in locator", async ({ page }) => {
			const locator = page.locator("#special");
			await expectLocator(locator).toStartWith("@username");
		});

		test("should pass with unicode in locator", async ({ page }) => {
			const locator = page.locator("#unicode");
			await expectLocator(locator).toStartWith("🎉");
		});

		test("should pass with whitespace in locator", async ({ page }) => {
			const locator = page.locator("#whitespace");
			await expectLocator(locator).toStartWith("Leading");
		});

		test("should fail when locator text doesn't start with expected", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#greeting");
			try {
				await expectLocator(locator).toStartWith("World");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("toStartWith");
			expect(error?.message).toContain("Expected locator text to start with");
		});

		test("should fail when locator case doesn't match", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#greeting");
			try {
				await expectLocator(locator).toStartWith("hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail for non-existent locator with default timeout", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#nonexistent");
			try {
				await expectLocator(locator).toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Failed to get text from locator");
		});

		test("should respect custom timeout option", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#nonexistent");
			const startTime = Date.now();
			try {
				await expectLocator(locator).toStartWith("Hello", { timeout: 1000 });
			} catch (e) {
				error = e as Error;
			}
			const duration = Date.now() - startTime;
			expect(error).toBeDefined();
			expect(duration).toBeLessThan(2000); // Should timeout around 1000ms
		});

		test("should work with .not for locator", async ({ page }) => {
			const locator = page.locator("#greeting");
			await expectLocator(locator).not.toStartWith("World");
		});

		test("should fail with .not when locator text starts with expected", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#greeting");
			try {
				await expectLocator(locator).not.toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("not");
		});

		test("should handle locator with dynamic content", async ({ page }) => {
			await page.setContent(`
				<div id="dynamic">Initial</div>
				<script>
					setTimeout(() => {
						document.getElementById('dynamic').textContent = 'Updated Content';
					}, 100);
				</script>
			`);
			const locator = page.locator("#dynamic");
			await page.waitForTimeout(200);
			await expectLocator(locator).toStartWith("Updated");
		});

		test("should handle empty locator", async ({ page }) => {
			const locator = page.locator("#empty");
			await expectLocator(locator).toStartWith("");
		});

		test("should fail when empty locator doesn't start with non-empty string", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#empty");
			try {
				await expectLocator(locator).toStartWith("Something");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should handle locator with nested elements", async ({ page }) => {
			await page.setContent(`<div id="nested"><span>Hello</span> <span>World</span></div>`);
			const locator = page.locator("#nested");
			await expectLocator(locator).toStartWith("Hello");
		});

		test("should use getByText locator", async ({ page }) => {
			await page.setContent(`<button>Click Me Now</button>`);
			const locator = page.getByText("Click Me Now");
			await expectLocator(locator).toStartWith("Click");
		});

		test("should use getByRole locator", async ({ page }) => {
			await page.setContent(`<button>Submit Form</button>`);
			const locator = page.getByRole("button", { name: "Submit Form" });
			await expectLocator(locator).toStartWith("Submit");
		});
	});
});

test.describe("toEndWith", () => {
	test.describe("with string values", () => {
		test("should pass when string ends with expected value", async () => {
			await expectString("Hello World").toEndWith("World");
		});

		test("should pass when string ends with single character", async () => {
			await expectString("Testing").toEndWith("g");
		});

		test("should pass when entire string matches", async () => {
			await expectString("Hello").toEndWith("Hello");
		});

		test("should pass with empty string suffix", async () => {
			await expectString("Hello").toEndWith("");
		});

		test("should pass with multiline string", async () => {
			const multiline = "Line 1\nLine 2\nLine 3";
			await expectString(multiline).toEndWith("Line 3");
		});

		test("should pass with special characters", async () => {
			await expectString("message: @username").toEndWith("@username");
		});

		test("should pass with numbers in string", async () => {
			await expectString("Room 123").toEndWith("123");
		});

		test("should pass with whitespace at end", async () => {
			await expectString("Hello  ").toEndWith("  ");
		});

		test("should pass with unicode characters", async () => {
			await expectString("Celebration! 🎉").toEndWith("🎉");
		});

		test("should fail when string doesn't end with expected value", async () => {
			let error: Error | undefined;
			try {
				await expectString("Hello World").toEndWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("toEndWith");
			expect(error?.message).toContain("Expected string to end with");
		});

		test("should fail when case doesn't match", async () => {
			let error: Error | undefined;
			try {
				await expectString("hello world").toEndWith("WORLD");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not when string doesn't end with value", async () => {
			await expectString("Hello World").not.toEndWith("Hello");
		});

		test("should fail with .not when string ends with expected", async () => {
			let error: Error | undefined;
			try {
				await expectString("Hello World").not.toEndWith("World");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not end with");
		});
	});

	test.describe("with Locator", () => {
		test.beforeEach(async ({ page }) => {
			await page.setContent(`
				<div id="greeting">Hello World</div>
				<div id="number">Room 123</div>
				<div id="unicode">Party Time! 🎉</div>
			`);
		});

		test("should pass when locator text ends with expected value", async ({ page }) => {
			const locator = page.locator("#greeting");
			await expectLocator(locator).toEndWith("World");
		});

		test("should pass with numbers", async ({ page }) => {
			const locator = page.locator("#number");
			await expectLocator(locator).toEndWith("123");
		});

		test("should pass with unicode", async ({ page }) => {
			const locator = page.locator("#unicode");
			await expectLocator(locator).toEndWith("🎉");
		});

		test("should fail when locator text doesn't end with expected", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#greeting");
			try {
				await expectLocator(locator).toEndWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for locator", async ({ page }) => {
			const locator = page.locator("#greeting");
			await expectLocator(locator).not.toEndWith("Hello");
		});
	});
});

test.describe("toMatchPattern", () => {
	test.describe("with string values", () => {
		test("should pass when string matches regex pattern", async () => {
			await expectString("test123").toMatchPattern(/test\d+/);
		});

		test("should pass with simple word pattern", async () => {
			await expectString("hello").toMatchPattern(/hello/);
		});

		test("should pass with email pattern", async () => {
			await expectString("user@example.com").toMatchPattern(/^[\w.]+@[\w.]+$/);
		});

		test("should pass with phone pattern", async () => {
			await expectString("123-456-7890").toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
		});

		test("should pass with case-insensitive flag", async () => {
			await expectString("Hello World").toMatchPattern(/hello world/i);
		});

		test("should pass with multiline flag", async () => {
			await expectString("Line 1\nLine 2").toMatchPattern(/^Line 1$/m);
		});

		test("should pass with unicode pattern", async () => {
			await expectString("🎉").toMatchPattern(/🎉/);
		});

		test("should fail when string doesn't match pattern", async () => {
			let error: Error | undefined;
			try {
				await expectString("abc").toMatchPattern(/\d+/);
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to match pattern");
		});

		test("should work with .not when string doesn't match", async () => {
			await expectString("abc").not.toMatchPattern(/\d+/);
		});

		test("should fail with .not when string matches pattern", async () => {
			let error: Error | undefined;
			try {
				await expectString("test123").not.toMatchPattern(/test\d+/);
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not match pattern");
		});
	});

	test.describe("with Locator", () => {
		test.beforeEach(async ({ page }) => {
			await page.setContent(`
				<div id="email">user@example.com</div>
				<div id="phone">123-456-7890</div>
				<div id="mixed">test123</div>
			`);
		});

		test("should pass when locator text matches pattern", async ({ page }) => {
			const locator = page.locator("#email");
			await expectLocator(locator).toMatchPattern(/^[\w.]+@[\w.]+$/);
		});

		test("should pass with phone pattern", async ({ page }) => {
			const locator = page.locator("#phone");
			await expectLocator(locator).toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
		});

		test("should fail when locator doesn't match", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#mixed");
			try {
				await expectLocator(locator).toMatchPattern(/^\d+$/);
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});
	});
});

test.describe("toBeValidEmail", () => {
	test.describe("with string values", () => {
		test("should pass with valid email", async () => {
			await expectString("user@example.com").toBeValidEmail();
		});

		test("should pass with subdomain", async () => {
			await expectString("user@mail.example.com").toBeValidEmail();
		});

		test("should pass with plus sign", async () => {
			await expectString("user+tag@example.com").toBeValidEmail();
		});

		test("should pass with dots in local part", async () => {
			await expectString("first.last@example.com").toBeValidEmail();
		});

		test("should pass with numbers", async () => {
			await expectString("user123@example456.com").toBeValidEmail();
		});

		test("should pass with hyphens in domain", async () => {
			await expectString("user@my-domain.com").toBeValidEmail();
		});

		test("should fail with invalid email - no @", async () => {
			let error: Error | undefined;
			try {
				await expectString("userexample.com").toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to be a valid email address");
		});

		test("should fail with invalid email - no domain", async () => {
			let error: Error | undefined;
			try {
				await expectString("user@").toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with invalid email - no TLD", async () => {
			let error: Error | undefined;
			try {
				await expectString("user@example").toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with spaces", async () => {
			let error: Error | undefined;
			try {
				await expectString("user @example.com").toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for invalid email", async () => {
			await expectString("not-an-email").not.toBeValidEmail();
		});

		test("should fail with .not for valid email", async () => {
			let error: Error | undefined;
			try {
				await expectString("user@example.com").not.toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be a valid email address");
		});
	});

	test.describe("with Locator", () => {
		test.beforeEach(async ({ page }) => {
			await page.setContent(`
				<div id="valid">user@example.com</div>
				<div id="invalid">not-an-email</div>
			`);
		});

		test("should pass when locator has valid email", async ({ page }) => {
			const locator = page.locator("#valid");
			await expectLocator(locator).toBeValidEmail();
		});

		test("should fail when locator has invalid email", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#invalid");
			try {
				await expectLocator(locator).toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});
	});
});

test.describe("toBeValidUrl", () => {
	test.describe("with string values", () => {
		test("should pass with valid http URL", async () => {
			await expectString("http://example.com").toBeValidUrl();
		});

		test("should pass with valid https URL", async () => {
			await expectString("https://example.com").toBeValidUrl();
		});

		test("should pass with path", async () => {
			await expectString("https://example.com/path/to/page").toBeValidUrl();
		});

		test("should pass with query parameters", async () => {
			await expectString("https://example.com?param=value&other=123").toBeValidUrl();
		});

		test("should pass with fragment", async () => {
			await expectString("https://example.com#section").toBeValidUrl();
		});

		test("should pass with port", async () => {
			await expectString("http://example.com:8080").toBeValidUrl();
		});

		test("should pass with subdomain", async () => {
			await expectString("https://www.example.com").toBeValidUrl();
		});

		test("should pass with localhost", async () => {
			await expectString("http://localhost:3000").toBeValidUrl();
		});

		test("should pass with IP address", async () => {
			await expectString("http://192.168.1.1").toBeValidUrl();
		});

		test("should fail with invalid URL - no protocol", async () => {
			let error: Error | undefined;
			try {
				await expectString("example.com").toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to be a valid URL");
		});

		test("should fail with invalid URL - malformed", async () => {
			let error: Error | undefined;
			try {
				await expectString("http://").toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with spaces", async () => {
			let error: Error | undefined;
			try {
				await expectString("http://example .com").toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for invalid URL", async () => {
			await expectString("not-a-url").not.toBeValidUrl();
		});

		test("should fail with .not for valid URL", async () => {
			let error: Error | undefined;
			try {
				await expectString("https://example.com").not.toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be a valid URL");
		});
	});

	test.describe("with Locator", () => {
		test.beforeEach(async ({ page }) => {
			await page.setContent(`
				<div id="valid">https://example.com</div>
				<div id="invalid">not-a-url</div>
			`);
		});

		test("should pass when locator has valid URL", async ({ page }) => {
			const locator = page.locator("#valid");
			await expectLocator(locator).toBeValidUrl();
		});

		test("should fail when locator has invalid URL", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#invalid");
			try {
				await expectLocator(locator).toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});
	});
});

test.describe("toBeAlphanumeric", () => {
	test.describe("with string values", () => {
		test("should pass with only letters", async () => {
			await expectString("abcdef").toBeAlphanumeric();
		});

		test("should pass with only numbers", async () => {
			await expectString("123456").toBeAlphanumeric();
		});

		test("should pass with mixed letters and numbers", async () => {
			await expectString("abc123").toBeAlphanumeric();
		});

		test("should pass with uppercase letters", async () => {
			await expectString("ABC123").toBeAlphanumeric();
		});

		test("should pass with mixed case", async () => {
			await expectString("AbC123").toBeAlphanumeric();
		});

		test("should fail with spaces", async () => {
			let error: Error | undefined;
			try {
				await expectString("abc 123").toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to be alphanumeric");
		});

		test("should fail with special characters", async () => {
			let error: Error | undefined;
			try {
				await expectString("abc-123").toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with punctuation", async () => {
			let error: Error | undefined;
			try {
				await expectString("abc!").toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with empty string", async () => {
			let error: Error | undefined;
			try {
				await expectString("").toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for non-alphanumeric", async () => {
			await expectString("abc-123").not.toBeAlphanumeric();
		});

		test("should fail with .not for alphanumeric", async () => {
			let error: Error | undefined;
			try {
				await expectString("abc123").not.toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be alphanumeric");
		});
	});

	test.describe("with Locator", () => {
		test.beforeEach(async ({ page }) => {
			await page.setContent(`
				<div id="valid">abc123</div>
				<div id="invalid">abc-123</div>
			`);
		});

		test("should pass when locator has alphanumeric text", async ({ page }) => {
			const locator = page.locator("#valid");
			await expectLocator(locator).toBeAlphanumeric();
		});

		test("should fail when locator has non-alphanumeric text", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#invalid");
			try {
				await expectLocator(locator).toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});
	});
});

test.describe("toBeNumericString", () => {
	test.describe("with string values", () => {
		test("should pass with only digits", async () => {
			await expectString("123456").toBeNumericString();
		});

		test("should pass with single digit", async () => {
			await expectString("5").toBeNumericString();
		});

		test("should pass with leading zeros", async () => {
			await expectString("00123").toBeNumericString();
		});

		test("should fail with letters", async () => {
			let error: Error | undefined;
			try {
				await expectString("abc").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to be numeric");
		});

		test("should fail with mixed letters and numbers", async () => {
			let error: Error | undefined;
			try {
				await expectString("123abc").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with decimal point", async () => {
			let error: Error | undefined;
			try {
				await expectString("123.456").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with negative sign", async () => {
			let error: Error | undefined;
			try {
				await expectString("-123").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with spaces", async () => {
			let error: Error | undefined;
			try {
				await expectString("123 456").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with empty string", async () => {
			let error: Error | undefined;
			try {
				await expectString("").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for non-numeric", async () => {
			await expectString("abc").not.toBeNumericString();
		});

		test("should fail with .not for numeric", async () => {
			let error: Error | undefined;
			try {
				await expectString("123456").not.toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be numeric");
		});
	});

	test.describe("with Locator", () => {
		test.beforeEach(async ({ page }) => {
			await page.setContent(`
				<div id="valid">123456</div>
				<div id="invalid">123abc</div>
			`);
		});

		test("should pass when locator has numeric text", async ({ page }) => {
			const locator = page.locator("#valid");
			await expectLocator(locator).toBeNumericString();
		});

		test("should fail when locator has non-numeric text", async ({ page }) => {
			let error: Error | undefined;
			const locator = page.locator("#invalid");
			try {
				await expectLocator(locator).toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});
	});

	test.describe("toBeUUID", () => {
		test("should pass for valid UUID v4", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			await expectString(uuid).toBeUUID();
		});

		test("should pass for valid UUID v4 with version specified", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			await expectString(uuid).toBeUUID(4);
		});

		test("should pass for valid UUID v1", async () => {
			const uuid = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
			await expectString(uuid).toBeUUID(1);
		});

		test("should pass for valid UUID v3", async () => {
			const uuid = "6fa459ea-ee8a-3ca4-894e-db77e160355e";
			await expectString(uuid).toBeUUID(3);
		});

		test("should pass for valid UUID v5", async () => {
			const uuid = "886313e1-3b8a-5372-9b90-0c9aee199e5d";
			await expectString(uuid).toBeUUID(5);
		});

		test("should pass for any valid UUID version when version not specified", async () => {
			const uuids = [
				"6ba7b810-9dad-11d1-80b4-00c04fd430c8", // v1
				"6fa459ea-ee8a-3ca4-894e-db77e160355e", // v3
				"550e8400-e29b-41d4-a716-446655440000", // v4
				"886313e1-3b8a-5372-9b90-0c9aee199e5d", // v5
			];

			for (const uuid of uuids) {
				await expectString(uuid).toBeUUID();
			}
		});

		test("should fail for invalid UUID format", async () => {
			const invalidUuids = [
				"not-a-uuid",
				"550e8400-e29b-41d4-a716", // too short
				"550e8400-e29b-41d4-a716-446655440000-extra", // too long
				"550e8400e29b41d4a716446655440000", // missing dashes
				"550e8400-e29b-41d4-g716-446655440000", // invalid character
				"",
			];

			for (const uuid of invalidUuids) {
				let error: Error | undefined;
				try {
					await expectString(uuid).toBeUUID();
				} catch (e) {
					error = e as Error;
				}
				expect(error).toBeDefined();
			}
		});

		test("should fail when UUID version doesn't match", async () => {
			const uuidV4 = "550e8400-e29b-41d4-a716-446655440000";

			let error: Error | undefined;
			try {
				await expectString(uuidV4).toBeUUID(1); // Wrong version
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not", async () => {
			const notAUuid = "not-a-uuid";
			await expectString(notAUuid).not.toBeUUID();
		});

		test("should fail with .not for valid UUID", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";

			let error: Error | undefined;
			try {
				await expectString(uuid).not.toBeUUID();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be a valid UUID");
		});

		test("should handle case insensitivity", async () => {
			const upperCaseUuid = "550E8400-E29B-41D4-A716-446655440000";
			const lowerCaseUuid = "550e8400-e29b-41d4-a716-446655440000";

			await expectString(upperCaseUuid).toBeUUID();
			await expectString(lowerCaseUuid).toBeUUID();
		});
	});
});
