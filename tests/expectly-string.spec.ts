import { expect, test } from "@playwright/test";

import { expectlyString } from "../src/expectly-string";

import { getRejectedErrorSync } from "./helpers/assertion-utils";

test.describe("toStartWith", () => {
	test.describe("with string values", () => {
		test("should pass when string starts with expected value", () => {
			expectlyString("Hello World").toStartWith("Hello");
		});

		test("should pass when string starts with single character", () => {
			expectlyString("Testing").toStartWith("T");
		});

		test("should pass when entire string matches", () => {
			expectlyString("Hello").toStartWith("Hello");
		});

		test("should pass with empty string prefix", () => {
			expectlyString("Hello").toStartWith("");
		});

		test("should pass with multiline string", () => {
			const multiline = "Line 1\nLine 2\nLine 3";
			expectlyString(multiline).toStartWith("Line 1");
		});

		test("should pass with special characters", () => {
			expectlyString("@username: message").toStartWith("@username");
		});

		test("should pass with numbers in string", () => {
			expectlyString("123 Main Street").toStartWith("123");
		});

		test("should pass with whitespace at start", () => {
			expectlyString("  Hello").toStartWith("  ");
		});

		test("should pass with unicode characters", () => {
			expectlyString("🎉 Celebration!").toStartWith("🎉");
		});

		test("should pass with case-sensitive match", () => {
			expectlyString("Hello World").toStartWith("Hello");
		});

		test("should fail when string doesn't start with expected value", () => {
			const error = getRejectedErrorSync(() => {
				expectlyString("Hello World").toStartWith("World");
			});
			expect(error.message).toContain("toStartWith");
			expect(error.message).toContain("Expected string to start with");
			expect(error.message).toContain("World");
		});

		test("should fail when case doesn't match", () => {
			const error = getRejectedErrorSync(() => {
				expectlyString("hello world").toStartWith("Hello");
			});
			expect(error.message).toContain("Expected string to start with");
			expect(error.message).toContain("Hello");
		});

		test("should fail when expected is longer than actual", () => {
			expect(() => {
				expectlyString("Hi").toStartWith("Hello");
			}).toThrow(/Expected string to start with/);
		});

		test("should fail for empty string with non-empty expected", () => {
			expect(() => {
				expectlyString("").toStartWith("Hello");
			}).toThrow();
		});

		test("should fail when substring is in middle", () => {
			expect(() => {
				expectlyString("The Hello World").toStartWith("Hello");
			}).toThrow();
		});

		test("should work with .not when string doesn't start with value", () => {
			expectlyString("Hello World").not.toStartWith("World");
		});

		test("should work with .not for case mismatch", () => {
			expectlyString("hello world").not.toStartWith("Hello");
		});

		test("should work with .not for substring in middle", () => {
			expectlyString("The Hello World").not.toStartWith("Hello");
		});

		test("should fail with .not when string starts with expected", () => {
			const error = getRejectedErrorSync(() => {
				expectlyString("Hello World").not.toStartWith("Hello");
			});
			expect(error.message).toContain("not");
			expect(error.message).toContain("Expected string to not start with");
		});

		test("should fail with .not when entire string matches", () => {
			expect(() => {
				expectlyString("Hello").not.toStartWith("Hello");
			}).toThrow(/not/);
		});

		test("should handle very long strings", () => {
			const longString = "A".repeat(10000) + "B".repeat(1000);
			expectlyString(longString).toStartWith("A".repeat(100));
		});

		test("should handle strings with tabs and newlines", () => {
			expectlyString("\t\nHello").toStartWith("\t\n");
		});

		test("should handle strings with quotes", () => {
			expectlyString('"Hello World"').toStartWith('"Hello');
		});

		test("should handle strings with backslashes", () => {
			expectlyString("\\path\\to\\file").toStartWith("\\path");
		});

		test("should provide clear error with actual start", () => {
			const error = getRejectedErrorSync(() => {
				expectlyString("The quick brown fox").toStartWith("A quick");
			});
			expect(error.message).toContain("Start of string");
			expect(error.message).toContain("The quick");
		});
	});
});

test.describe("toEndWith", () => {
	test.describe("with string values", () => {
		test("should pass when string ends with expected value", () => {
			expectlyString("Hello World").toEndWith("World");
		});

		test("should pass when string ends with single character", () => {
			expectlyString("Testing").toEndWith("g");
		});

		test("should pass when entire string matches", () => {
			expectlyString("Hello").toEndWith("Hello");
		});

		test("should pass with empty string suffix", () => {
			expectlyString("Hello").toEndWith("");
		});

		test("should pass with multiline string", () => {
			const multiline = "Line 1\nLine 2\nLine 3";
			expectlyString(multiline).toEndWith("Line 3");
		});

		test("should pass with special characters", () => {
			expectlyString("message: @username").toEndWith("@username");
		});

		test("should pass with numbers in string", () => {
			expectlyString("Room 123").toEndWith("123");
		});

		test("should pass with whitespace at end", () => {
			expectlyString("Hello  ").toEndWith("  ");
		});

		test("should pass with unicode characters", () => {
			expectlyString("Celebration! 🎉").toEndWith("🎉");
		});

		test("should fail when string doesn't end with expected value", () => {
			const error = getRejectedErrorSync(() => {
				expectlyString("Hello World").toEndWith("Hello");
			});
			expect(error.message).toContain("toEndWith");
			expect(error.message).toContain("Expected string to end with");
		});

		test("should fail when case doesn't match", () => {
			expect(() => {
				expectlyString("hello world").toEndWith("WORLD");
			}).toThrow();
		});

		test("should work with .not when string doesn't end with value", () => {
			expectlyString("Hello World").not.toEndWith("Hello");
		});

		test("should fail with .not when string ends with expected", () => {
			expect(() => {
				expectlyString("Hello World").not.toEndWith("World");
			}).toThrow(/Expected string to not end with/);
		});
	});
});

test.describe("toMatchPattern", () => {
	test.describe("with string values", () => {
		test("should pass when string matches regex pattern", () => {
			expectlyString("test123").toMatchPattern(/test\d+/);
		});

		test("should pass with simple word pattern", () => {
			expectlyString("hello").toMatchPattern(/hello/);
		});

		test("should pass with email pattern", () => {
			expectlyString("user@example.com").toMatchPattern(/^[\w.]+@[\w.]+$/);
		});

		test("should pass with phone pattern", () => {
			expectlyString("123-456-7890").toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
		});

		test("should pass with case-insensitive flag", () => {
			expectlyString("Hello World").toMatchPattern(/hello world/i);
		});

		test("should pass with multiline flag", () => {
			expectlyString("Line 1\nLine 2").toMatchPattern(/^Line 1$/m);
		});

		test("should pass with unicode pattern", () => {
			expectlyString("🎉").toMatchPattern(/🎉/);
		});

		test("should fail when string doesn't match pattern", () => {
			expect(() => {
				expectlyString("abc").toMatchPattern(/\d+/);
			}).toThrow(/Expected string to match pattern/);
		});

		test("should work with .not when string doesn't match", () => {
			expectlyString("abc").not.toMatchPattern(/\d+/);
		});

		test("should fail with .not when string matches pattern", () => {
			expect(() => {
				expectlyString("test123").not.toMatchPattern(/test\d+/);
			}).toThrow(/Expected string to not match pattern/);
		});
	});
});

test.describe("toBeValidEmail", () => {
	test.describe("with string values", () => {
		test("should pass with valid email", () => {
			expectlyString("user@example.com").toBeValidEmail();
		});

		test("should pass with subdomain", () => {
			expectlyString("user@mail.example.com").toBeValidEmail();
		});

		test("should pass with plus sign", () => {
			expectlyString("user+tag@example.com").toBeValidEmail();
		});

		test("should pass with dots in local part", () => {
			expectlyString("first.last@example.com").toBeValidEmail();
		});

		test("should pass with numbers", () => {
			expectlyString("user123@example456.com").toBeValidEmail();
		});

		test("should pass with hyphens in domain", () => {
			expectlyString("user@my-domain.com").toBeValidEmail();
		});

		test("should fail with invalid email - no @", () => {
			expect(() => {
				expectlyString("userexample.com").toBeValidEmail();
			}).toThrow(/Expected string to be a valid email address/);
		});

		test("should fail with invalid email - no domain", () => {
			expect(() => {
				expectlyString("user@").toBeValidEmail();
			}).toThrow();
		});

		test("should fail with invalid email - no TLD", () => {
			expect(() => {
				expectlyString("user@example").toBeValidEmail();
			}).toThrow();
		});

		test("should fail with spaces", () => {
			expect(() => {
				expectlyString("user @example.com").toBeValidEmail();
			}).toThrow();
		});

		test("should work with .not for invalid email", () => {
			expectlyString("not-an-email").not.toBeValidEmail();
		});

		test("should fail with .not for valid email", () => {
			expect(() => {
				expectlyString("user@example.com").not.toBeValidEmail();
			}).toThrow(/Expected string to not be a valid email address/);
		});
	});
});

test.describe("toBeValidUrl", () => {
	test.describe("with string values", () => {
		test("should pass with valid http URL", () => {
			expectlyString("http://example.com").toBeValidUrl();
		});

		test("should pass with valid https URL", () => {
			expectlyString("https://example.com").toBeValidUrl();
		});

		test("should pass with path", () => {
			expectlyString("https://example.com/path/to/page").toBeValidUrl();
		});

		test("should pass with query parameters", () => {
			expectlyString("https://example.com?param=value&other=123").toBeValidUrl();
		});

		test("should pass with fragment", () => {
			expectlyString("https://example.com#section").toBeValidUrl();
		});

		test("should pass with port", () => {
			expectlyString("http://example.com:8080").toBeValidUrl();
		});

		test("should pass with subdomain", () => {
			expectlyString("https://www.example.com").toBeValidUrl();
		});

		test("should pass with localhost", () => {
			expectlyString("http://localhost:3000").toBeValidUrl();
		});

		test("should pass with IP address", () => {
			expectlyString("http://192.168.1.1").toBeValidUrl();
		});

		test("should fail with invalid URL - no protocol", () => {
			expect(() => {
				expectlyString("example.com").toBeValidUrl();
			}).toThrow(/Expected string to be a valid URL/);
		});

		test("should fail with invalid URL - malformed", () => {
			expect(() => {
				expectlyString("http://").toBeValidUrl();
			}).toThrow();
		});

		test("should fail with spaces", () => {
			expect(() => {
				expectlyString("http://example .com").toBeValidUrl();
			}).toThrow();
		});

		test("should work with .not for invalid URL", () => {
			expectlyString("not-a-url").not.toBeValidUrl();
		});

		test("should fail with .not for valid URL", () => {
			expect(() => {
				expectlyString("https://example.com").not.toBeValidUrl();
			}).toThrow(/Expected string to not be a valid URL/);
		});
	});
});

test.describe("toBeAlphanumeric", () => {
	test.describe("with string values", () => {
		test("should pass with only letters", () => {
			expectlyString("abcdef").toBeAlphanumeric();
		});

		test("should pass with only numbers", () => {
			expectlyString("123456").toBeAlphanumeric();
		});

		test("should pass with mixed letters and numbers", () => {
			expectlyString("abc123").toBeAlphanumeric();
		});

		test("should pass with uppercase letters", () => {
			expectlyString("ABC123").toBeAlphanumeric();
		});

		test("should pass with mixed case", () => {
			expectlyString("AbC123").toBeAlphanumeric();
		});

		test("should fail with spaces", () => {
			expect(() => {
				expectlyString("abc 123").toBeAlphanumeric();
			}).toThrow(/Expected string to be alphanumeric/);
		});

		test("should fail with special characters", () => {
			expect(() => {
				expectlyString("abc-123").toBeAlphanumeric();
			}).toThrow();
		});

		test("should fail with punctuation", () => {
			expect(() => {
				expectlyString("abc!").toBeAlphanumeric();
			}).toThrow();
		});

		test("should fail with empty string", () => {
			expect(() => {
				expectlyString("").toBeAlphanumeric();
			}).toThrow();
		});

		test("should work with .not for non-alphanumeric", () => {
			expectlyString("abc-123").not.toBeAlphanumeric();
		});

		test("should fail with .not for alphanumeric", () => {
			expect(() => {
				expectlyString("abc123").not.toBeAlphanumeric();
			}).toThrow(/Expected string to not be alphanumeric/);
		});
	});
});

test.describe("toBeNumericString", () => {
	test.describe("with string values", () => {
		test("should pass with only digits", () => {
			expectlyString("123456").toBeNumericString();
		});

		test("should pass with single digit", () => {
			expectlyString("5").toBeNumericString();
		});

		test("should pass with leading zeros", () => {
			expectlyString("00123").toBeNumericString();
		});

		test("should fail with letters", () => {
			expect(() => {
				expectlyString("abc").toBeNumericString();
			}).toThrow(/Expected string to be numeric/);
		});

		test("should fail with mixed letters and numbers", () => {
			expect(() => {
				expectlyString("123abc").toBeNumericString();
			}).toThrow();
		});

		test("should fail with decimal point", () => {
			expect(() => {
				expectlyString("123.456").toBeNumericString();
			}).toThrow();
		});

		test("should fail with negative sign", () => {
			expect(() => {
				expectlyString("-123").toBeNumericString();
			}).toThrow();
		});

		test("should fail with spaces", () => {
			expect(() => {
				expectlyString("123 456").toBeNumericString();
			}).toThrow();
		});

		test("should fail with empty string", () => {
			expect(() => {
				expectlyString("").toBeNumericString();
			}).toThrow();
		});

		test("should work with .not for non-numeric", () => {
			expectlyString("abc").not.toBeNumericString();
		});

		test("should fail with .not for numeric", () => {
			expect(() => {
				expectlyString("123456").not.toBeNumericString();
			}).toThrow(/Expected string to not be numeric/);
		});
	});

	test.describe("toBeUUID", () => {
		test("should pass for valid UUID v4", () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			expectlyString(uuid).toBeUUID();
		});

		test("should pass for valid UUID v4 with version specified", () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			expectlyString(uuid).toBeUUID(4);
		});

		test("should pass for valid UUID v1", () => {
			const uuid = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
			expectlyString(uuid).toBeUUID(1);
		});

		test("should pass for valid UUID v3", () => {
			const uuid = "6fa459ea-ee8a-3ca4-894e-db77e160355e";
			expectlyString(uuid).toBeUUID(3);
		});

		test("should pass for valid UUID v5", () => {
			const uuid = "886313e1-3b8a-5372-9b90-0c9aee199e5d";
			expectlyString(uuid).toBeUUID(5);
		});

		test("should pass for any valid UUID version when version not specified", () => {
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

		test("should fail for invalid UUID format", () => {
			const invalidUuids = [
				"not-a-uuid",
				"550e8400-e29b-41d4-a716", // too short
				"550e8400-e29b-41d4-a716-446655440000-extra", // too long
				"550e8400e29b41d4a716446655440000", // missing dashes
				"550e8400-e29b-41d4-g716-446655440000", // invalid character
				"",
			];

			for (const uuid of invalidUuids) {
				expect(() => {
					expectlyString(uuid).toBeUUID();
				}).toThrow();
			}
		});

		test("should fail when UUID version doesn't match", () => {
			const uuidV4 = "550e8400-e29b-41d4-a716-446655440000";
			expect(() => {
				expectlyString(uuidV4).toBeUUID(1);
			}).toThrow(); // Wrong version
		});

		test("should work with .not", () => {
			const notAUuid = "not-a-uuid";
			expectlyString(notAUuid).not.toBeUUID();
		});

		test("should fail with .not for valid UUID", () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			expect(() => {
				expectlyString(uuid).not.toBeUUID();
			}).toThrow(/Expected string to not be a valid UUID/);
		});

		test("should handle case insensitivity", () => {
			const upperCaseUuid = "550E8400-E29B-41D4-A716-446655440000";
			const lowerCaseUuid = "550e8400-e29b-41d4-a716-446655440000";

			expectlyString(upperCaseUuid).toBeUUID();
			expectlyString(lowerCaseUuid).toBeUUID();
		});
	});
});
