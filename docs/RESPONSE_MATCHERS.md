# Response Matchers

HTTP status assertions for Playwright's `APIResponse` (from `request`, `page.request` or `context.request`) and `Response` (from `page.goto()`, `page.waitForResponse()` and similar).

## Module Organization

The response matchers are available through `expectly`, through `expect` extended with `expectlyMatchers`, and as a granular import (`expectlyResponse`, with the `HttpStatusClass` type).

```typescript
// Option 1: Use the unified expectly interface (recommended)
import { expectly } from "@cerios/playwright-expectly";
await expectly(response).toHaveStatus(201);

// Option 2: Use the granular import
import { expectlyResponse } from "@cerios/playwright-expectly";
await expectlyResponse(response).toHaveStatus("2xx");
```

## Available Matchers

- [toHaveStatus()](#tohavestatus)

## toHaveStatus()

Asserts the HTTP status code of a response: an exact code, or a class of codes. Playwright's built-in `toBeOK()` only checks the 200–299 range.

**Signature:** `toHaveStatus(expected)`

| `expected`                 | Passes when                         |
| -------------------------- | ----------------------------------- |
| `201`                      | the status is exactly 201           |
| `"2xx"` … `"5xx"`, `"1xx"` | the status is in that hundred range |

```typescript
import { expectly } from "@cerios/playwright-expectly";

test("creates a user", async ({ request }) => {
	const response = await request.post("/api/users", { data: { name: "Ada" } });
	await expectly(response).toHaveStatus(201);
});

test("rejects invalid input", async ({ request }) => {
	await expectly(await request.post("/api/users", { data: {} })).toHaveStatus(422);
	await expectly(await request.get("/api/admin")).toHaveStatus("4xx");
});

test("page loads without a server error", async ({ page }) => {
	const response = await page.goto("/dashboard");
	await expectly(response!).not.toHaveStatus("5xx");
});
```

The status is known when the response arrives, so the assertion does not retry; it returns a promise because a failure reads the response body. Use `await`.

A failure is reported in the format of Playwright's `toBeOK()`, with the expected and received status added. For an `APIResponse` it shows the same call log (request and response headers) and the same response text: only for textual content types (`text/*`, JSON, XML, …, so binary bodies are never printed) and truncated to 1000 characters. Like `toBeOK()`, a failing `.not` assertion shows them too.

```text
expect(response).toHaveStatus(200) failed

Expected: 200
Received: 404 Not Found

Call log:
→ GET https://api.example/users/42
  user-agent: Playwright/1.64.1 (x64; windows 10.0) node/24.18
  accept: */*
← 404 Not Found
  content-type: application/json

Response text:
{"error":"User 42 not found"}
```

A page `Response` has no call log, so its URL is shown instead. A body that cannot be read (for example after `response.dispose()`) is left out.

An `expected` that is not an integer from 100 to 599 or one of `"1xx"` to `"5xx"` throws a `TypeError`, as does a receiver without `status()`, `statusText()` and `url()` methods.

## Related

- [Page Matchers](./PAGE_MATCHERS.md) - For cookies, web storage and URL search params
- [String Matchers](./STRING_MATCHERS.md) - `toBeValidJSON()` for response bodies read as text
- [Collection Matchers](./COLLECTION_MATCHERS.md) - For keys, values and entries of parsed JSON

[← Back to README](../README.md)
