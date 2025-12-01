import { expect, test } from "@playwright/test";
import { expectlyString } from "../src/expectly-string";

test.describe("toStartWith", () => {
	test.describe("with string values", () => {
		test("should pass when string starts with expected value", async () => {
			expectlyString("Hello World").toStartWith("Hello");
		});

		test("should pass when string starts with single character", async () => {
			expectlyString("Testing").toStartWith("T");
		});

		test("should pass when entire string matches", async () => {
			expectlyString("Hello").toStartWith("Hello");
		});

		test("should pass with empty string prefix", async () => {
			expectlyString("Hello").toStartWith("");
		});

		test("should pass with multiline string", async () => {
			const multiline = "Line 1\nLine 2\nLine 3";
			expectlyString(multiline).toStartWith("Line 1");
		});

		test("should pass with special characters", async () => {
			expectlyString("@username: message").toStartWith("@username");
		});

		test("should pass with numbers in string", async () => {
			expectlyString("123 Main Street").toStartWith("123");
		});

		test("should pass with whitespace at start", async () => {
			expectlyString("  Hello").toStartWith("  ");
		});

		test("should pass with unicode characters", async () => {
			expectlyString("🎉 Celebration!").toStartWith("🎉");
		});

		test("should pass with case-sensitive match", async () => {
			expectlyString("Hello World").toStartWith("Hello");
		});

		test("should fail when string doesn't start with expected value", async () => {
			let error: Error | undefined;
			try {
				expectlyString("Hello World").toStartWith("World");
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
				expectlyString("hello world").toStartWith("Hello");
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
				expectlyString("Hi").toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to start with");
		});

		test("should fail for empty string with non-empty expected", async () => {
			let error: Error | undefined;
			try {
				expectlyString("").toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail when substring is in middle", async () => {
			let error: Error | undefined;
			try {
				expectlyString("The Hello World").toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not when string doesn't start with value", async () => {
			expectlyString("Hello World").not.toStartWith("World");
		});

		test("should work with .not for case mismatch", async () => {
			expectlyString("hello world").not.toStartWith("Hello");
		});

		test("should work with .not for substring in middle", async () => {
			expectlyString("The Hello World").not.toStartWith("Hello");
		});

		test("should fail with .not when string starts with expected", async () => {
			let error: Error | undefined;
			try {
				expectlyString("Hello World").not.toStartWith("Hello");
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
				expectlyString("Hello").not.toStartWith("Hello");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("not");
		});

		test("should handle very long strings", async () => {
			const longString = "A".repeat(10000) + "B".repeat(1000);
			expectlyString(longString).toStartWith("A".repeat(100));
		});

		test("should handle strings with tabs and newlines", async () => {
			expectlyString("\t\nHello").toStartWith("\t\n");
		});

		test("should handle strings with quotes", async () => {
			expectlyString('"Hello World"').toStartWith('"Hello');
		});

		test("should handle strings with backslashes", async () => {
			expectlyString("\\path\\to\\file").toStartWith("\\path");
		});

		test("should provide clear error with actual start", async () => {
			let error: Error | undefined;
			try {
				expectlyString("The quick brown fox").toStartWith("A quick");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Start of string");
			expect(error?.message).toContain("The quick");
		});
	});
});

test.describe("toEndWith", () => {
	test.describe("with string values", () => {
		test("should pass when string ends with expected value", async () => {
			expectlyString("Hello World").toEndWith("World");
		});

		test("should pass when string ends with single character", async () => {
			expectlyString("Testing").toEndWith("g");
		});

		test("should pass when entire string matches", async () => {
			expectlyString("Hello").toEndWith("Hello");
		});

		test("should pass with empty string suffix", async () => {
			expectlyString("Hello").toEndWith("");
		});

		test("should pass with multiline string", async () => {
			const multiline = "Line 1\nLine 2\nLine 3";
			expectlyString(multiline).toEndWith("Line 3");
		});

		test("should pass with special characters", async () => {
			expectlyString("message: @username").toEndWith("@username");
		});

		test("should pass with numbers in string", async () => {
			expectlyString("Room 123").toEndWith("123");
		});

		test("should pass with whitespace at end", async () => {
			expectlyString("Hello  ").toEndWith("  ");
		});

		test("should pass with unicode characters", async () => {
			expectlyString("Celebration! 🎉").toEndWith("🎉");
		});

		test("should fail when string doesn't end with expected value", async () => {
			let error: Error | undefined;
			try {
				expectlyString("Hello World").toEndWith("Hello");
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
				expectlyString("hello world").toEndWith("WORLD");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not when string doesn't end with value", async () => {
			expectlyString("Hello World").not.toEndWith("Hello");
		});

		test("should fail with .not when string ends with expected", async () => {
			let error: Error | undefined;
			try {
				expectlyString("Hello World").not.toEndWith("World");
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not end with");
		});
	});
});

test.describe("toMatchPattern", () => {
	test.describe("with string values", () => {
		test("should pass when string matches regex pattern", async () => {
			expectlyString("test123").toMatchPattern(/test\d+/);
		});

		test("should pass with simple word pattern", async () => {
			expectlyString("hello").toMatchPattern(/hello/);
		});

		test("should pass with email pattern", async () => {
			expectlyString("user@example.com").toMatchPattern(/^[\w.]+@[\w.]+$/);
		});

		test("should pass with phone pattern", async () => {
			expectlyString("123-456-7890").toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
		});

		test("should pass with case-insensitive flag", async () => {
			expectlyString("Hello World").toMatchPattern(/hello world/i);
		});

		test("should pass with multiline flag", async () => {
			expectlyString("Line 1\nLine 2").toMatchPattern(/^Line 1$/m);
		});

		test("should pass with unicode pattern", async () => {
			expectlyString("🎉").toMatchPattern(/🎉/);
		});

		test("should fail when string doesn't match pattern", async () => {
			let error: Error | undefined;
			try {
				expectlyString("abc").toMatchPattern(/\d+/);
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to match pattern");
		});

		test("should work with .not when string doesn't match", async () => {
			expectlyString("abc").not.toMatchPattern(/\d+/);
		});

		test("should fail with .not when string matches pattern", async () => {
			let error: Error | undefined;
			try {
				expectlyString("test123").not.toMatchPattern(/test\d+/);
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not match pattern");
		});
	});
});

test.describe("toBeValidEmail", () => {
	test.describe("with string values", () => {
		test("should pass with valid email", async () => {
			expectlyString("user@example.com").toBeValidEmail();
		});

		test("should pass with subdomain", async () => {
			expectlyString("user@mail.example.com").toBeValidEmail();
		});

		test("should pass with plus sign", async () => {
			expectlyString("user+tag@example.com").toBeValidEmail();
		});

		test("should pass with dots in local part", async () => {
			expectlyString("first.last@example.com").toBeValidEmail();
		});

		test("should pass with numbers", async () => {
			expectlyString("user123@example456.com").toBeValidEmail();
		});

		test("should pass with hyphens in domain", async () => {
			expectlyString("user@my-domain.com").toBeValidEmail();
		});

		test("should fail with invalid email - no @", async () => {
			let error: Error | undefined;
			try {
				expectlyString("userexample.com").toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to be a valid email address");
		});

		test("should fail with invalid email - no domain", async () => {
			let error: Error | undefined;
			try {
				expectlyString("user@").toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with invalid email - no TLD", async () => {
			let error: Error | undefined;
			try {
				expectlyString("user@example").toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with spaces", async () => {
			let error: Error | undefined;
			try {
				expectlyString("user @example.com").toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for invalid email", async () => {
			expectlyString("not-an-email").not.toBeValidEmail();
		});

		test("should fail with .not for valid email", async () => {
			let error: Error | undefined;
			try {
				expectlyString("user@example.com").not.toBeValidEmail();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be a valid email address");
		});
	});
});

test.describe("toBeValidUrl", () => {
	test.describe("with string values", () => {
		test("should pass with valid http URL", async () => {
			expectlyString("http://example.com").toBeValidUrl();
		});

		test("should pass with valid https URL", async () => {
			expectlyString("https://example.com").toBeValidUrl();
		});

		test("should pass with path", async () => {
			expectlyString("https://example.com/path/to/page").toBeValidUrl();
		});

		test("should pass with query parameters", async () => {
			expectlyString("https://example.com?param=value&other=123").toBeValidUrl();
		});

		test("should pass with fragment", async () => {
			expectlyString("https://example.com#section").toBeValidUrl();
		});

		test("should pass with port", async () => {
			expectlyString("http://example.com:8080").toBeValidUrl();
		});

		test("should pass with subdomain", async () => {
			expectlyString("https://www.example.com").toBeValidUrl();
		});

		test("should pass with localhost", async () => {
			expectlyString("http://localhost:3000").toBeValidUrl();
		});

		test("should pass with IP address", async () => {
			expectlyString("http://192.168.1.1").toBeValidUrl();
		});

		test("should fail with invalid URL - no protocol", async () => {
			let error: Error | undefined;
			try {
				expectlyString("example.com").toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to be a valid URL");
		});

		test("should fail with invalid URL - malformed", async () => {
			let error: Error | undefined;
			try {
				expectlyString("http://").toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with spaces", async () => {
			let error: Error | undefined;
			try {
				expectlyString("http://example .com").toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for invalid URL", async () => {
			expectlyString("not-a-url").not.toBeValidUrl();
		});

		test("should fail with .not for valid URL", async () => {
			let error: Error | undefined;
			try {
				expectlyString("https://example.com").not.toBeValidUrl();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be a valid URL");
		});
	});
});

test.describe("toBeAlphanumeric", () => {
	test.describe("with string values", () => {
		test("should pass with only letters", async () => {
			expectlyString("abcdef").toBeAlphanumeric();
		});

		test("should pass with only numbers", async () => {
			expectlyString("123456").toBeAlphanumeric();
		});

		test("should pass with mixed letters and numbers", async () => {
			expectlyString("abc123").toBeAlphanumeric();
		});

		test("should pass with uppercase letters", async () => {
			expectlyString("ABC123").toBeAlphanumeric();
		});

		test("should pass with mixed case", async () => {
			expectlyString("AbC123").toBeAlphanumeric();
		});

		test("should fail with spaces", async () => {
			let error: Error | undefined;
			try {
				expectlyString("abc 123").toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to be alphanumeric");
		});

		test("should fail with special characters", async () => {
			let error: Error | undefined;
			try {
				expectlyString("abc-123").toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with punctuation", async () => {
			let error: Error | undefined;
			try {
				expectlyString("abc!").toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with empty string", async () => {
			let error: Error | undefined;
			try {
				expectlyString("").toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for non-alphanumeric", async () => {
			expectlyString("abc-123").not.toBeAlphanumeric();
		});

		test("should fail with .not for alphanumeric", async () => {
			let error: Error | undefined;
			try {
				expectlyString("abc123").not.toBeAlphanumeric();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be alphanumeric");
		});
	});
});

test.describe("toBeNumericString", () => {
	test.describe("with string values", () => {
		test("should pass with only digits", async () => {
			expectlyString("123456").toBeNumericString();
		});

		test("should pass with single digit", async () => {
			expectlyString("5").toBeNumericString();
		});

		test("should pass with leading zeros", async () => {
			expectlyString("00123").toBeNumericString();
		});

		test("should fail with letters", async () => {
			let error: Error | undefined;
			try {
				expectlyString("abc").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to be numeric");
		});

		test("should fail with mixed letters and numbers", async () => {
			let error: Error | undefined;
			try {
				expectlyString("123abc").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with decimal point", async () => {
			let error: Error | undefined;
			try {
				expectlyString("123.456").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with negative sign", async () => {
			let error: Error | undefined;
			try {
				expectlyString("-123").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with spaces", async () => {
			let error: Error | undefined;
			try {
				expectlyString("123 456").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should fail with empty string", async () => {
			let error: Error | undefined;
			try {
				expectlyString("").toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not for non-numeric", async () => {
			expectlyString("abc").not.toBeNumericString();
		});

		test("should fail with .not for numeric", async () => {
			let error: Error | undefined;
			try {
				expectlyString("123456").not.toBeNumericString();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be numeric");
		});
	});

	test.describe("toBeUUID", () => {
		test("should pass for valid UUID v4", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			expectlyString(uuid).toBeUUID();
		});

		test("should pass for valid UUID v4 with version specified", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			expectlyString(uuid).toBeUUID(4);
		});

		test("should pass for valid UUID v1", async () => {
			const uuid = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
			expectlyString(uuid).toBeUUID(1);
		});

		test("should pass for valid UUID v3", async () => {
			const uuid = "6fa459ea-ee8a-3ca4-894e-db77e160355e";
			expectlyString(uuid).toBeUUID(3);
		});

		test("should pass for valid UUID v5", async () => {
			const uuid = "886313e1-3b8a-5372-9b90-0c9aee199e5d";
			expectlyString(uuid).toBeUUID(5);
		});

		test("should pass for any valid UUID version when version not specified", async () => {
			const uuids = [
				"6ba7b810-9dad-11d1-80b4-00c04fd430c8", // v1
				"6fa459ea-ee8a-3ca4-894e-db77e160355e", // v3
				"550e8400-e29b-41d4-a716-446655440000", // v4
				"886313e1-3b8a-5372-9b90-0c9aee199e5d", // v5
			];

			for (const uuid of uuids) {
				expectlyString(uuid).toBeUUID();
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
					expectlyString(uuid).toBeUUID();
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
				expectlyString(uuidV4).toBeUUID(1); // Wrong version
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
		});

		test("should work with .not", async () => {
			const notAUuid = "not-a-uuid";
			expectlyString(notAUuid).not.toBeUUID();
		});

		test("should fail with .not for valid UUID", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";

			let error: Error | undefined;
			try {
				expectlyString(uuid).not.toBeUUID();
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error?.message).toContain("Expected string to not be a valid UUID");
		});

		test("should handle case insensitivity", async () => {
			const upperCaseUuid = "550E8400-E29B-41D4-A716-446655440000";
			const lowerCaseUuid = "550e8400-e29b-41d4-a716-446655440000";

			expectlyString(upperCaseUuid).toBeUUID();
			expectlyString(lowerCaseUuid).toBeUUID();
		});
	});
});
