# String Matchers

String validation matchers for email, URL, UUID, and text format assertions.

## Available Matchers

- [toBeValidEmail()](#tobevalidemail)
- [toBeValidUrl()](#tobevalidurl)
- [toBeUUID()](#tobeuuid)
- [toBeAlphanumeric()](#tobealphanumeric)
- [toBeNumericString()](#tobenumericstring)
- [toStartWith()](#tostartwith)
- [toEndWith()](#toendwith)
- [toMatchPattern()](#tomatchpattern)
- [toMatchFuzzy()](#tomatchfuzzy)

## toBeValidEmail()

Validates that a string is a valid email address.

```typescript
import { expectly } from "@cerios/playwright-expectly";

// Basic usage
expectly("user@example.com").toBeValidEmail();

// With negation
expectly("not-an-email").not.toBeValidEmail();

// Test example
test("validate email input", async () => {
	const email = "john.doe@company.com";
	expectly(email).toBeValidEmail();
});
```

## toBeValidUrl()

Validates that a string is a valid URL.

```typescript
// HTTP/HTTPS URLs
expectly("https://example.com").toBeValidUrl();
expectly("http://example.com/path").toBeValidUrl();

// With query parameters
expectly("https://example.com?param=value").toBeValidUrl();

// Invalid URLs
expectly("not-a-url").not.toBeValidUrl();
```

## toBeUUID()

Validates that a string is a valid UUID, optionally of a specific version.

```typescript
// Any UUID version
expectly("550e8400-e29b-41d4-a716-446655440000").toBeUUID();

// Specific version
expectly("550e8400-e29b-41d4-a716-446655440000").toBeUUID(4);
expectly("6ba7b810-9dad-11d1-80b4-00c04fd430c8").toBeUUID(1);

// Invalid UUID
expectly("not-a-uuid").not.toBeUUID();
```

### Supported UUID Versions

- **Version 1**: Time-based
- **Version 3**: MD5 hash
- **Version 4**: Random
- **Version 5**: SHA-1 hash

## toBeAlphanumeric()

Validates that a string contains only letters and numbers.

```typescript
// Valid alphanumeric
expectly("User123").toBeAlphanumeric();
expectly("ABC123XYZ").toBeAlphanumeric();

// Invalid (contains special characters)
expectly("user-123").not.toBeAlphanumeric();
expectly("user@123").not.toBeAlphanumeric();
```

## toBeNumericString()

Validates that a string contains only numeric digits (0-9).

```typescript
// Valid numeric strings
expectly("1234").toBeNumericString();
expectly("0000").toBeNumericString();

// Invalid
expectly("12.34").not.toBeNumericString();
expectly("12a34").not.toBeNumericString();

// Use case: PIN validation
test("validate PIN code", async () => {
	const pin = "1234";
	expectly(pin).toBeNumericString();
});
```

## toStartWith()

Validates that a string starts with the expected prefix.

```typescript
// File extensions
expectly("document.pdf").toStartWith("document");

// URL paths
expectly("/api/users").toStartWith("/api");

// User IDs
expectly("user-12345").toStartWith("user-");
```

## toEndWith()

Validates that a string ends with the expected suffix.

```typescript
// File extensions
expectly("document.pdf").toEndWith(".pdf");
expectly("image.png").toEndWith(".png");

// Domain names
expectly("example.com").toEndWith(".com");

// Test example
test("validate file type", async () => {
	const filename = "report.pdf";
	expectly(filename).toEndWith(".pdf");
});
```

## toMatchFuzzy()

Asserts that a string fuzzy-matches the expected string using fuzzball's token-sort ratio algorithm. The comparison is word-order-insensitive and returns a similarity score from 0 to 100. The assertion passes when the score meets or exceeds the threshold.

Particularly useful for validating AI-generated text where wording, phrasing, or word order may vary but the content is semantically equivalent.

**Parameters:**

- `expected` — the string to compare against
- `threshold` _(optional)_ — minimum similarity score (0–100). Defaults to **80**.

```typescript
// Passes with default threshold (80) — minor typo tolerated
expectly("Hello World").toMatchFuzzy("Hello Wrold");

// Word-order-insensitive — both score 100
expectly("world hello").toMatchFuzzy("hello world");

// Custom threshold for more lenient matching
expectly("The cat sat on the mat").toMatchFuzzy("A cat sits on a mat", 70);

// With negation
expectly("completely different").not.toMatchFuzzy("hello world");

// AI-generated content validation
test("AI summary matches expected content", async ({ page }) => {
	const summary = await page.locator("[data-testid='ai-summary']").textContent();
	expectly(summary).toMatchFuzzy("The report shows an increase in quarterly revenue", 75);
});

// Validate chatbot response
test("chatbot response is on topic", async ({ page }) => {
	const response = await page.locator("[data-testid='bot-reply']").textContent();
	expectly(response).toMatchFuzzy("Your order has been shipped and will arrive in 3 to 5 business days", 70);
});
```

**Error messages** include the computed score and threshold for easy debugging:

```
Expected string to fuzzy match: "Hello World"
Received: "completely different text"
Similarity score: 14 (threshold: 80)
```

## toMatchPattern()

Validates that a string matches a regular expression pattern.

```typescript
// Phone number validation
expectly("555-123-4567").toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);

// Version string
expectly("v1.2.3").toMatchPattern(/^v\d+\.\d+\.\d+$/);

// Custom patterns
expectly("ABC-123").toMatchPattern(/^[A-Z]{3}-\d{3}$/);

// Test example
test("validate product code format", async () => {
	const productCode = "PROD-2024-001";
	expectly(productCode).toMatchPattern(/^PROD-\d{4}-\d{3}$/);
});
```

## Common Use Cases

### Form Validation

```typescript
test("validate registration form", async () => {
	const formData = {
		email: "user@example.com",
		username: "user123",
		zipCode: "12345",
	};

	expectly(formData.email).toBeValidEmail();
	expectly(formData.username).toBeAlphanumeric();
	expectly(formData.zipCode).toBeNumericString();
});
```

### API Response Validation

```typescript
test("validate API response", async () => {
	const response = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		website: "https://example.com",
		username: "john123",
	};

	expectly(response.id).toBeUUID(4);
	expectly(response.website).toBeValidUrl();
	expectly(response.username).toBeAlphanumeric();
});
```

### File Name Validation

```typescript
test("validate uploaded files", async () => {
	const files = ["document.pdf", "image.png", "data.csv"];

	expectly(files[0]).toEndWith(".pdf");
	expectly(files[1]).toEndWith(".png");
	expectly(files[2]).toEndWith(".csv");
});
```

## Error Messages

When assertions fail, clear error messages are provided:

```typescript
// Email validation failure
expectly("invalid-email").toBeValidEmail();
// Error: Expected string to be a valid email address
// Received: "invalid-email"

// UUID validation failure
expectly("not-a-uuid").toBeUUID();
// Error: Expected string to be a valid UUID
// Received: "not-a-uuid"

// Pattern matching failure
expectly("ABC-12").toMatchPattern(/^[A-Z]{3}-\d{3}$/);
// Error: Expected string to match pattern: /^[A-Z]{3}-\d{3}$/
// Received: "ABC-12"
```

## Related

- [Locator Matchers](./LOCATOR_MATCHERS.md) - For DOM element text validation
- [String Array Matchers](./STRING_ARRAY_MATCHERS.md) - For validating arrays of strings
- [Generic Matchers](./GENERIC_MATCHERS.md) - For type validation

[← Back to README](../README.md)
