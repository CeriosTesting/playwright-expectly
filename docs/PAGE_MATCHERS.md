# Page Matchers

Cookie and web storage matchers for Playwright pages and browser contexts.

## Module Organization

The page matchers are available through `expectly`, through `expect` extended with `expectlyMatchers`, and as a granular import (`expectlyPage`, with the `CookieOptions` type).

```typescript
// Option 1: Use the unified expectly interface (recommended)
import { expectly } from "@cerios/playwright-expectly";
await expectly(page).toHaveCookie("consent", "granted");

// Option 2: Use the granular import
import { expectlyPage } from "@cerios/playwright-expectly";
await expectlyPage(page).toHaveLocalStorageItem("theme", "dark");
```

## Available Matchers

- [toHaveCookie()](#tohavecookie)
- [toHaveLocalStorageItem() / toHaveSessionStorageItem()](#tohavelocalstorageitem--tohavesessionstorageitem)

All page matchers return a promise, so use `await`.

## Retry Behavior

All page matchers retry until they match or the timeout expires, like Playwright's web-first assertions. This matters because a cookie or storage item is often written shortly after the click that triggers it, for example when a response sets a cookie. They replace polling code such as:

```typescript
await expect
	.poll(async () => (await page.context().cookies()).find((cookie) => cookie.name === "consent")?.value)
	.toBe("granted");
```

- `timeout` defaults to `expect.timeout` from the Playwright config, and `intervals` sets custom polling intervals
- `.not` retries until the cookie or item is gone (or no longer has the given value), so it can follow a logout click directly
- Storage reads interrupted by a navigation are retried. Other errors, such as a closed page, are thrown at once

## toHaveCookie()

Asserts that the browser context has a cookie, retrying until it does.

**Signature:** `toHaveCookie(name, value?, options?)`

| Parameter         | Type               | Description                                                                            |
| ----------------- | ------------------ | -------------------------------------------------------------------------------------- |
| `name`            | `string`           | The cookie name (a non-empty string)                                                   |
| `value`           | `string \| RegExp` | Optional exact value or pattern. Without it, any value matches                         |
| `options.domain`  | `string`           | Only consider cookies for this domain, as stored (`".example.com"` or `"example.com"`) |
| `options.path`    | `string`           | Only consider cookies with this path                                                   |
| `options.timeout` | `number`           | Maximum time to retry in ms                                                            |

The receiver is a `Page` or a `BrowserContext`. For a page, the cookies of its browser context are checked: all cookies in that context, for every URL, not only those for the page's current URL. The assertion passes when at least one cookie with that name (and matching `domain` and `path`) has a matching value.

```typescript
import { expectly } from "@cerios/playwright-expectly";

// Consent banner sets a cookie
await page.getByRole("button", { name: "Accept all" }).click();
await expectly(page).toHaveCookie("consent", "granted");

// Any value
await expectly(page).toHaveCookie("session_id");

// Value pattern, scoped to a domain and path, on a BrowserContext
await expectly(context).toHaveCookie("session_id", /^[a-f0-9]{32}$/, { domain: ".example.com", path: "/" });

// Logout removes the cookie
await page.getByRole("button", { name: "Log out" }).click();
await expectly(page).not.toHaveCookie("session_id");

// With timeout
await expectly(page).toHaveCookie("ab_test_group", /^[AB]$/, { timeout: 10000 });
```

A failure lists every cookie with that name, with its domain and path:

```text
Expected cookie "consent" with value "granted"
Received: "denied" (.example.com/)
```

## toHaveLocalStorageItem() / toHaveSessionStorageItem()

Asserts that the page's `localStorage` or `sessionStorage` has an item, retrying until it does.

**Signature:** `toHaveLocalStorageItem(key, value?, options?)` and `toHaveSessionStorageItem(key, value?, options?)`

| Parameter         | Type               | Description                                                    |
| ----------------- | ------------------ | -------------------------------------------------------------- |
| `key`             | `string`           | The storage key                                                |
| `value`           | `string \| RegExp` | Optional exact value or pattern. Without it, any value matches |
| `options.timeout` | `number`           | Maximum time to retry in ms                                    |

The receiver must be a `Page`; a `BrowserContext` throws a `TypeError`. Storage is read in the page's main frame, for the origin it currently shows, so navigate to your application first: on `about:blank`, reading storage throws a `SecurityError`. Stored values are strings; match JSON with a pattern or parse it yourself.

```typescript
// Theme toggle persists the choice
await page.getByRole("button", { name: "Dark mode" }).click();
await expectly(page).toHaveLocalStorageItem("theme", "dark");

// Any value
await expectly(page).toHaveLocalStorageItem("auth-token");

// Pattern, e.g. a UUID
await expectly(page).toHaveSessionStorageItem("cart-id", /^[0-9a-f-]{36}$/);

// JSON content
await expectly(page).toHaveLocalStorageItem("settings", /"language":"nl"/);

// The draft is cleared after submitting
await page.getByRole("button", { name: "Submit" }).click();
await expectly(page).not.toHaveLocalStorageItem("draft");
```

A failure shows the stored value, or `(no such item)`:

```text
Expected page to have localStorage item "theme" with value "dark"
Received: "light"
```

## Common Use Cases

### Consent and Session Flow

```typescript
test("cookie consent and login", async ({ page }) => {
	await page.goto("/");

	await page.getByRole("button", { name: "Accept all" }).click();
	await expectly(page).toHaveCookie("consent", "granted");

	await page.getByLabel("Email").fill("user@example.com");
	await page.getByLabel("Password").fill("secret");
	await page.getByRole("button", { name: "Log in" }).click();
	await expectly(page).toHaveCookie("session_id", /^[a-f0-9]{32}$/);

	await page.getByRole("button", { name: "Log out" }).click();
	await expectly(page).not.toHaveCookie("session_id");
});
```

### Persisted Preferences

```typescript
test("preferences are stored", async ({ page }) => {
	await page.goto("/settings");

	await page.getByLabel("Language").selectOption("nl");
	await expectly(page).toHaveLocalStorageItem("language", "nl");

	// Survives a reload
	await page.reload();
	await expectly(page).toHaveLocalStorageItem("language", "nl");
});
```

### Shopping Cart

```typescript
test("cart is kept per tab", async ({ page }) => {
	await page.goto("/products/1");

	await page.getByRole("button", { name: "Add to cart" }).click();
	await expectly(page).toHaveSessionStorageItem("cart-id");
});
```

## Error Handling

```typescript
// Wrong receiver
await expectly(page.locator("body")).toHaveCookie("consent");
// TypeError: toHaveCookie: received value must be a Page or BrowserContext

await expectly(context).toHaveLocalStorageItem("theme");
// TypeError: toHaveLocalStorageItem: received value must be a Page

// Empty cookie name
await expectly(page).toHaveCookie("");
// TypeError: toHaveCookie: cookie name must be a non-empty string
```

## Related

- [Locator Matchers](./LOCATOR_MATCHERS.md) - For DOM element validation
- [String Matchers](./STRING_MATCHERS.md) - For validating values you read yourself

[← Back to README](../README.md)
