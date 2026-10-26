# String Matchers

String validation matchers for email, URL, UUID, and text format assertions.

String matchers require a string receiver. Any other value throws a `TypeError` that names the received type, such as `toBeValidEmail: received value must be a string, got: number`. The matchers shared with locators (`toBeValidEmail()`, `toBeValidUrl()`, `toBeUUID()`, `toBeAlphanumeric()`, `toBeNumericString()`, `toStartWith()`, `toEndWith()`, `toMatchPattern()`) also accept a Playwright `Locator` through `expectly`; see [Locator Matchers](./LOCATOR_MATCHERS.md).

## Available Matchers

- [toBeValidEmail()](#tobevalidemail)
- [toBeValidUrl()](#tobevalidurl)
- [toBeUUID()](#tobeuuid)
- [toBeAlphanumeric()](#tobealphanumeric)
- [toBeNumericString()](#tobenumericstring)
- [toBeHexadecimal()](#tobehexadecimal)
- [toStartWith()](#tostartwith)
- [toEndWith()](#toendwith)
- [toMatchPattern()](#tomatchpattern)
- [toEqualCaseInsensitive()](#toequalcaseinsensitive)
- [toEqualIgnoringWhitespace()](#toequalignoringwhitespace)

## toBeValidEmail()

Validates that a string is a valid email address.

- No whitespace, and an `@` between the local part and the domain
- The local part has no leading, trailing or consecutive dots
- The domain has at least two dot-separated labels, and no label starts or ends with a hyphen

```typescript
import { expectly } from "@cerios/playwright-expectly";

// Basic usage
expectly("user@example.com").toBeValidEmail();

// With negation
expectly("not-an-email").not.toBeValidEmail();

// Dots and hyphens in the wrong place
expectly("john..doe@example.com").not.toBeValidEmail();
expectly(".john@example.com").not.toBeValidEmail();
expectly("user@-example.com").not.toBeValidEmail();
expectly("user@localhost").not.toBeValidEmail(); // Single domain label

// Test example
test("validate email input", async () => {
	const email = "john.doe@company.com";
	expectly(email).toBeValidEmail();
});
```

## toBeValidUrl()

Validates that a string is an absolute URL with an accepted scheme.

- The scheme must be in `protocols`, which defaults to `["http", "https"]` (with or without the trailing colon)
- Web schemes (`http`, `https`, `ftp`, `ws`, `wss`) must be written with `//` and a valid host: a domain name, an IPv4 address or an IPv6 address
- Whitespace is never allowed

```typescript
// HTTP/HTTPS URLs
expectly("https://example.com").toBeValidUrl();
expectly("http://example.com/path").toBeValidUrl();
expectly("http://localhost:3000").toBeValidUrl();

// With query parameters
expectly("https://example.com?param=value").toBeValidUrl();

// Invalid URLs
expectly("not-a-url").not.toBeValidUrl();
expectly("localhost:3000").not.toBeValidUrl(); // "localhost:" would be the scheme
expectly("C:\\Windows").not.toBeValidUrl();
expectly("javascript:alert(1)").not.toBeValidUrl();
expectly("http:/example.com").not.toBeValidUrl(); // Missing "//"

// Other schemes must be listed explicitly
expectly("wss://chat.example.com/socket").toBeValidUrl({ protocols: ["wss"] });
expectly("mailto:user@example.com").toBeValidUrl({ protocols: ["mailto"] });
expectly("ftp://files.example.com").not.toBeValidUrl(); // Not in the default protocols
```

## toBeUUID()

Validates that a string is a valid [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562) UUID (case-insensitive), optionally of a specific version.

```typescript
// Any UUID version
expectly("550e8400-e29b-41d4-a716-446655440000").toBeUUID();

// Specific version
expectly("550e8400-e29b-41d4-a716-446655440000").toBeUUID(4);
expectly("6ba7b810-9dad-11d1-80b4-00c04fd430c8").toBeUUID(1);
expectly("01890a5d-ac96-774b-bcce-b302099a8057").toBeUUID(7);

// Nil and max UUIDs (only without a version)
expectly("00000000-0000-0000-0000-000000000000").toBeUUID();
expectly("ffffffff-ffff-ffff-ffff-ffffffffffff").toBeUUID();

// Invalid UUID
expectly("not-a-uuid").not.toBeUUID();
```

### Supported UUID Versions

Without a version, versions 1-8 and the nil and max UUIDs are accepted. The variant digit (the first digit of the fourth group) must be `8`, `9`, `a` or `b`.

- **Version 1**: Time-based
- **Version 2**: DCE Security
- **Version 3**: MD5 hash
- **Version 4**: Random
- **Version 5**: SHA-1 hash
- **Version 6**: Reordered time-based
- **Version 7**: Unix time-ordered
- **Version 8**: Custom

## toBeAlphanumeric()

Validates that a string contains only letters and numbers.

By default only ASCII letters and digits count. Pass `{ unicode: true }` to accept any Unicode letter, combining mark or number.

```typescript
// Valid alphanumeric
expectly("User123").toBeAlphanumeric();
expectly("ABC123XYZ").toBeAlphanumeric();

// Invalid (contains special characters)
expectly("user-123").not.toBeAlphanumeric();
expectly("user@123").not.toBeAlphanumeric();

// Non-ASCII letters
expectly("café").not.toBeAlphanumeric();
expectly("café").toBeAlphanumeric({ unicode: true });
expectly("Zürich2026").toBeAlphanumeric({ unicode: true });
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

## toBeHexadecimal()

Validates that a string is hexadecimal (case-insensitive). The `0x` prefix is allowed by default; `prefix` can be `"allowed"`, `"required"` or `"forbidden"`.

```typescript
// Prefix optional (default)
expectly("0x1f").toBeHexadecimal();
expectly("deadBEEF").toBeHexadecimal();

// Prefix required
expectly("0xFF").toBeHexadecimal({ prefix: "required" });
expectly("FF").not.toBeHexadecimal({ prefix: "required" });

// Prefix forbidden, e.g. a commit hash
expectly("3b2efc9").toBeHexadecimal({ prefix: "forbidden" });

// Invalid
expectly("0xZZ").not.toBeHexadecimal();
expectly("").not.toBeHexadecimal();
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

## toMatchPattern()

Validates that a string matches a regular expression pattern.

The pattern must be a `RegExp`. A string or any other value throws a `TypeError` instead of matching everything. Matching always starts at the beginning of the string and leaves the pattern's `lastIndex` untouched, so global (`/g`) and sticky (`/y`) patterns give the same result every time.

```typescript
// Phone number validation
expectly("555-123-4567").toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);

// Version string
expectly("v1.2.3").toMatchPattern(/^v\d+\.\d+\.\d+$/);

// Custom patterns
expectly("ABC-123").toMatchPattern(/^[A-Z]{3}-\d{3}$/);

// A string pattern throws
expectly("ABC-123").toMatchPattern("ABC" as any);
// TypeError: Expected a RegExp pattern, got: "ABC"

// Test example
test("validate product code format", async () => {
	const productCode = "PROD-2024-001";
	expectly(productCode).toMatchPattern(/^PROD-\d{4}-\d{3}$/);
});
```

## toEqualCaseInsensitive()

Validates that a string equals another string, ignoring letter case. Case folding is Unicode-aware and locale-independent, so `"Straße"` equals `"STRASSE"`.

```typescript
expectly("Hello World").toEqualCaseInsensitive("hello world");
expectly("ÉCOLE").toEqualCaseInsensitive("école");
expectly("Straße").toEqualCaseInsensitive("STRASSE");

// Other differences still count
expectly("hello world").not.toEqualCaseInsensitive("hello  world");
```

## toEqualIgnoringWhitespace()

Validates that a string equals another string after removing all whitespace (spaces, tabs, line breaks, non-breaking spaces).

```typescript
// Formatted numbers
expectly("1 234 567").toEqualIgnoringWhitespace("1234567");

// Text copied from the page with line breaks
expectly("Order\n  #12345\n").toEqualIgnoringWhitespace("Order #12345");

// Letter case still counts
expectly("Order #12345").not.toEqualIgnoringWhitespace("order #12345");
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
		color: "#0055FF",
	};

	expectly(response.id).toBeUUID(4);
	expectly(response.website).toBeValidUrl();
	expectly(response.username).toBeAlphanumeric();
	expectly(response.color.slice(1)).toBeHexadecimal({ prefix: "forbidden" });
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
// Expected format: xxxxxxxx-xxxx-[1-8]xxx-[89ab]xxx-xxxxxxxxxxxx

// Pattern matching failure
expectly("ABC-12").toMatchPattern(/^[A-Z]{3}-\d{3}$/);
// Error: Expected string to match pattern: /^[A-Z]{3}-\d{3}$/
// Received: "ABC-12"

// Wrong receiver type
expectly(12345).toBeNumericString();
// TypeError: toBeNumericString: received value must be a string, got: number
```

## Related

- [Locator Matchers](./LOCATOR_MATCHERS.md) - For DOM element text validation
- [String Array Matchers](./STRING_ARRAY_MATCHERS.md) - For validating arrays of strings
- [Generic Matchers](./GENERIC_MATCHERS.md) - For type validation

[← Back to README](../README.md)
