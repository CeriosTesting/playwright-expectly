# Locator Matchers

DOM element text and attribute validation matchers for Playwright locators.

## Module Organization

The locator matchers are organized into seven categories for better maintainability and granular imports:

- **Text Matchers** (`expectlyLocatorText`) - Text content validation
- **Attribute Matchers** (`expectlyLocatorAttributes`) - HTML attribute and computed style validation
- **Positioning Matchers** (`expectlyLocatorPositioning`) - Spatial relationship validation
- **State Matchers** (`expectlyLocatorState`) - Dynamic behavior and element state
- **Visibility Matchers** (`expectlyLocatorVisibility`) - Visible element count validation
- **Count Matchers** (`expectlyLocatorCount`) - Element count ranges
- **Order Matchers** (`expectlyLocatorOrder`) - Sorted texts across all matched elements

### Import Options

```typescript
// Option 1: Use the unified expectly interface (recommended)
import { expectly } from "@cerios/playwright-expectly";
await expectly(locator).toStartWith("Hello");

// Option 2: Use the combined expectlyLocator
import { expectlyLocator } from "@cerios/playwright-expectly";
await expectlyLocator(locator).toStartWith("Hello");

// Option 3: Use granular imports for specific categories
import { expectlyLocatorText } from "@cerios/playwright-expectly";
import { expectlyLocatorAttributes } from "@cerios/playwright-expectly";
import { expectlyLocatorVisibility } from "@cerios/playwright-expectly";
import { expectlyLocatorCount } from "@cerios/playwright-expectly";
import { expectlyLocatorOrder } from "@cerios/playwright-expectly";
await expectlyLocatorText(locator).toStartWith("Hello");
await expectlyLocatorAttributes(locator).toHavePlaceholder("Search");
await expectlyLocatorVisibility(page.locator(".item")).toHaveCountVisible(3);
await expectlyLocatorCount(page.locator(".item")).toHaveCountGreaterThan(0);
await expectlyLocatorOrder(page.locator("td.name")).toHaveTextsInAscendingOrder();
```

The option types `CountOptions`, `TextOrderOptions` and `StylesOptions` are exported as well.

## Available Matchers

### Text Validation Matchers (`expectlyLocatorText`)

- [toStartWith() / toEndWith()](#tostartwith--toendwith)
- [toMatchPattern()](#tomatchpattern)
- [toBeValidEmail() / toBeValidUrl()](#tobevalidemail--tobevalidurl)
- [toBeAlphanumeric() / toBeNumericString()](#tobealphanumeric--tobenumericstring)
- [toBeUpperCase() / toBeLowerCase() / toBeTitleCase()](#tobeuppercase--tobelowercase--tobetitlecase)
- [toBeUUID()](#tobeuuid)
- [toHaveDirectText()](#tohavedirecttext)

### Attribute Matchers (`expectlyLocatorAttributes`)

- [toHavePlaceholder()](#tohaveplaceholder)
- [toHaveHref() / toHaveSrc() / toHaveAlt()](#tohavehref--tohavesrc--tohavealt)
- [toHaveTarget()](#tohavetarget)
- [toHaveDataAttribute()](#tohavedataattribute)
- [toHaveAriaLabel()](#tohavearialabel)
- [toBeRequired()](#toberequired)
- [toBeReadOnly()](#tobereadonly)
- [toHaveStyles()](#tohavestyles)

### Positioning Matchers (`expectlyLocatorPositioning`)

- [toBeAbove() / toBeBelow()](#tobeabove--tobebelow)
- [toBeLeftOf() / toBeRightOf()](#tobeleftof--toberightof)

### State Matchers (`expectlyLocatorState`)

- [toBeStable()](#tobestable)

### Visibility Matchers (`expectlyLocatorVisibility`)

- [toHaveCountVisible()](#tohavecountvisible)

### Count Matchers (`expectlyLocatorCount`)

- [toHaveCountGreaterThan() / toHaveCountGreaterThanOrEqual()](#tohavecountgreaterthan--tohavecountgreaterthanorequal)
- [toHaveCountLessThan() / toHaveCountLessThanOrEqual()](#tohavecountlessthan--tohavecountlessthanorequal)
- [toHaveCountBetween()](#tohavecountbetween)

### Order Matchers (`expectlyLocatorOrder`)

- [toHaveTextsInAscendingOrder() / toHaveTextsInDescendingOrder()](#tohavetextsinascendingorder--tohavetextsindescendingorder)

See also [Missing Elements and Retries](#missing-elements-and-retries).

## toStartWith() / toEndWith()

Validates that a locator's text starts with or ends with the expected string.

```typescript
import { expectly } from "@cerios/playwright-expectly";

// Check greeting message
await expectly(page.locator(".welcome")).toStartWith("Hello, ");

// Validate prefix in title
await expectly(page.locator("h1")).toStartWith("Chapter 1:");

// Check file extension in filename
await expectly(page.locator(".filename")).toEndWith(".pdf");

// Validate suffix in text
await expectly(page.locator(".price")).toEndWith(" USD");
```

## toMatchPattern()

Validates that a locator's text matches a regular expression.

The pattern must be a `RegExp`. A string or any other value throws a `TypeError` before polling starts, instead of matching everything. The pattern's `lastIndex` is ignored and left untouched, so global and sticky patterns are safe to reuse.

```typescript
// Validate phone number format
await expectly(page.locator(".phone")).toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);

// Check alphanumeric ID
await expectly(page.locator(".order-id")).toMatchPattern(/^[A-Z0-9]{8}$/);

// Version string
await expectly(page.locator(".version")).toMatchPattern(/^v\d+\.\d+\.\d+$/);
```

## toBeValidEmail() / toBeValidUrl()

Validates that a locator's text is a valid email or URL.

`toBeValidEmail()` rules:

- No whitespace, and an `@` between the local part and the domain
- The local part has no leading, trailing or consecutive dots (`.john@`, `john.@` and `john..doe@` fail)
- The domain has at least two dot-separated labels, and no label starts or ends with a hyphen (`user@-example.com` fails)

`toBeValidUrl(options?)` rules:

- An absolute URL without whitespace, whose scheme is in `protocols` (default `["http", "https"]`, with or without the colon)
- Web schemes (`http`, `https`, `ftp`, `ws`, `wss`) must be written with `//` and a valid host (domain name, IPv4 or IPv6 address)
- So `localhost:3000`, `example.com`, `C:\Windows`, `http:/example.com` and `javascript:alert(1)` are not valid by default, while `http://localhost:3000` is

```typescript
// Validate email in profile
await expectly(page.locator(".user-email")).toBeValidEmail();

// Check contact info
await expectly(page.locator('[data-testid="email"]')).toBeValidEmail();

// Validate link text
await expectly(page.locator(".website-url")).toBeValidUrl();

// Check API endpoint display
await expectly(page.locator(".api-url")).toBeValidUrl();

// Accept other schemes, combined with polling options
await expectly(page.locator(".websocket-url")).toBeValidUrl({ protocols: ["wss"] });
await expectly(page.locator(".contact-link")).toBeValidUrl({ protocols: ["mailto"], timeout: 5000 });
```

## toBeAlphanumeric() / toBeNumericString()

Validates text contains only letters/numbers or only numbers.

`toBeAlphanumeric()` accepts ASCII letters and digits only. Pass `{ unicode: true }` to accept any Unicode letter, combining mark or number (`café`, `Ærø`, `東京`). `toBeNumericString()` accepts only the digits `0`-`9`.

```typescript
// Validate username format
await expectly(page.locator(".username")).toBeAlphanumeric();

// Check product code
await expectly(page.locator(".product-code")).toBeAlphanumeric();

// Validate PIN code
await expectly(page.locator(".pin-code")).toBeNumericString();

// Check ZIP code
await expectly(page.locator(".zip-code")).toBeNumericString();

// Accept non-ASCII letters, with polling options
await expectly(page.locator(".city")).toBeAlphanumeric({ unicode: true, timeout: 5000 });
```

## toBeUpperCase() / toBeLowerCase() / toBeTitleCase()

Validates text case formatting. The checks are Unicode-aware, so `ÉCOLE` is uppercase and `Ærøskøbing` is title case.

- `toBeUpperCase()` / `toBeLowerCase()`: the text contains at least one letter of that case and none of the other. Digits, spaces and punctuation are ignored, so `SKU-42` is uppercase.
- `toBeTitleCase()`: every word starts with a capital letter. Words are runs of letters, digits and apostrophes, so `Jean-Luc` is two words and `Don't` is one. Inner capitals are kept (`McDonald` and `O'Brien` pass), and words that start with a digit are skipped. A word written entirely in capitals passes only up to two letters (`UK`), so `NASA Launch` fails.

```typescript
// Validate capitalized heading
await expectly(page.locator(".heading")).toBeUpperCase();

// Check state abbreviation
await expectly(page.locator(".state-code")).toBeUpperCase();

// Validate lowercase username
await expectly(page.locator(".username")).toBeLowerCase();

// Check email format
await expectly(page.locator(".email")).toBeLowerCase();

// Validate book title format
await expectly(page.locator(".book-title")).toBeTitleCase();

// Check proper name formatting
await expectly(page.locator(".full-name")).toBeTitleCase();
```

## toBeUUID()

Validates that a locator's text is a valid [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562) UUID (case-insensitive).

Without a version, versions 1-8 and the nil (`00000000-0000-0000-0000-000000000000`) and max (`ffffffff-ffff-ffff-ffff-ffffffffffff`) UUIDs are accepted. With a version (`1`-`8`), only that version is accepted. The variant digit must be `8`, `9`, `a` or `b`.

```typescript
// Validate any UUID
await expectly(page.locator(".transaction-id")).toBeUUID();

// Validate specific UUID v4
await expectly(page.locator(".user-id")).toBeUUID(4);

// Time-ordered UUID v7
await expectly(page.locator(".event-id")).toBeUUID(7);

// With timeout
await expectly(page.locator(".session-id")).toBeUUID(4, { timeout: 5000 });
```

## toHaveDirectText()

Validates the element's own text, ignoring text inside child elements. Whitespace is trimmed and collapsed to single spaces in both the element text and the expected text.

```typescript
// HTML: <button>Save changes <span class="badge">3</span></button>
await expectly(page.locator("button")).toHaveDirectText("Save changes");

// Line breaks and indentation in the expected text are normalized too
await expectly(page.locator("button")).toHaveDirectText(`
	Save changes
`);

// With timeout
await expectly(page.locator(".label")).toHaveDirectText("Total:", { timeout: 3000 });
```

## toHavePlaceholder()

Validates an input element's placeholder attribute.

```typescript
// Check input placeholder
await expectly(page.locator('input[name="email"]')).toHavePlaceholder("Enter your email");

// Validate placeholder with regex
await expectly(page.locator(".search-input")).toHavePlaceholder(/search/i);

// With timeout
await expectly(page.locator("#username")).toHavePlaceholder("Username", { timeout: 3000 });
```

## toHaveHref() / toHaveSrc() / toHaveAlt()

Validates link, image, and accessibility attributes.

```typescript
// Check link destination
await expectly(page.locator("a.home-link")).toHaveHref("/");

// Validate external link with regex
await expectly(page.locator(".external-link")).toHaveHref(/^https:\/\//);

// Check image source
await expectly(page.locator("img.logo")).toHaveSrc("/images/logo.png");

// Validate CDN source with regex
await expectly(page.locator(".product-image")).toHaveSrc(/cdn\.example\.com/);

// Check alt text for accessibility
await expectly(page.locator("img.avatar")).toHaveAlt("User profile picture");

// Validate alt text pattern
await expectly(page.locator(".thumbnail")).toHaveAlt(/product image/i);
```

## toHaveTarget()

Validates tooltip and link target attributes.

```typescript
// Check if link opens in new tab
await expectly(page.locator("a.external")).toHaveTarget("_blank");

// Validate target attribute
await expectly(page.locator(".help-link")).toHaveTarget(/_blank|_top/);
```

## toHaveDataAttribute()

Validates custom data attributes.

```typescript
// Check if data attribute exists
await expectly(page.locator(".item")).toHaveDataAttribute("id");

// Check data attribute value
await expectly(page.locator(".item")).toHaveDataAttribute("status", "active");

// Validate with regex
await expectly(page.locator(".item")).toHaveDataAttribute("price", /^\d+\.\d{2}$/);

// Can use 'data-' prefix or not
await expectly(page.locator(".widget")).toHaveDataAttribute("data-config", "{}");
await expectly(page.locator(".widget")).toHaveDataAttribute("config", "{}"); // Same
```

## toHaveAriaLabel()

Validates accessibility labels for screen readers.

```typescript
// Check accessibility label
await expectly(page.locator("button.close")).toHaveAriaLabel("Close dialog");

// Validate aria-label for screen readers
await expectly(page.locator(".menu-btn")).toHaveAriaLabel(/menu/i);

// Form accessibility
await expectly(page.locator("input#search")).toHaveAriaLabel("Search input");
```

## toBeRequired()

Validates that form elements have the required attribute.

```typescript
// Check if input is required
await expectly(page.locator('input[name="email"]')).toBeRequired();

// Validate select is required
await expectly(page.locator('select[name="country"]')).toBeRequired();

// Test form validation
await expectly(page.locator("#username")).toBeRequired();
await expectly(page.locator("#optional-field")).not.toBeRequired();
```

## toBeReadOnly()

Validates that input or textarea elements have the readonly attribute.

```typescript
// Check if input is readonly
await expectly(page.locator('input[name="username"]')).toBeReadOnly();

// Validate textarea is readonly
await expectly(page.locator("textarea.readonly-field")).toBeReadOnly();

// Test readonly state
await expectly(page.locator("#disabled-input")).toBeReadOnly();
await expectly(page.locator("#editable-input")).not.toBeReadOnly();
```

## toHaveStyles()

Validates several computed CSS properties at once. Each value is an exact string or a `RegExp`, compared with the trimmed computed value as the browser reports it (colors as `rgb(...)`, font weights as numbers, lengths in `px`).

- Use CSS property names (`font-weight`, not `fontWeight`). Custom properties such as `--brand-color` work too
- `{ pseudo: "::before" }` or `{ pseudo: "::after" }` reads the styles of that pseudo-element
- A failure lists every property that differs. `.not` passes when at least one property differs

```typescript
// Several properties in one retrying assertion
await expectly(page.locator(".alert")).toHaveStyles({
	color: "rgb(255, 0, 0)",
	"font-weight": "700",
	"background-color": /^rgba?\(/,
});

// Custom properties (design tokens)
await expectly(page.locator(":root")).toHaveStyles({ "--brand-color": "#0055ff" });

// Pseudo-elements
await expectly(page.locator(".badge")).toHaveStyles({ content: '"New"' }, { pseudo: "::before" });

// With timeout
await expectly(page.locator(".modal")).toHaveStyles({ opacity: "1" }, { timeout: 3000 });
```

## toBeAbove() / toBeBelow()

Validates vertical positioning between elements.

Positioning matchers compare the bounding boxes of both elements:

- `toBeAbove()` passes when the first element's bottom edge is at or above the other element's top edge. `toBeBelow()` is the mirror image
- Edges within 0.5px count as touching, so layouts with transforms or zoom do not fail on sub-pixel gaps
- A hidden element has no bounding box. The matcher keeps retrying until it becomes visible. If it never does, both the assertion and its `.not` form fail with `First element is not visible (it has no bounding box)` (or `Second element ...`)
- Failure messages print the compared edges, such as `First element bottom: 120px` and `Second element top: 96px`

```typescript
// Check if header is above content
await expectly(page.locator("header")).toBeAbove(page.locator("main"));

// Validate navigation is above footer
await expectly(page.locator("nav")).toBeAbove(page.locator("footer"));

// Check if footer is below content
await expectly(page.locator("footer")).toBeBelow(page.locator("main"));

// Validate content is below header
await expectly(page.locator("main")).toBeBelow(page.locator("header"));
```

## toBeLeftOf() / toBeRightOf()

Validates horizontal positioning between elements. The same rules apply as for [toBeAbove() / toBeBelow()](#tobeabove--tobebelow), using the left and right edges.

```typescript
// Check if sidebar is left of content
await expectly(page.locator(".sidebar")).toBeLeftOf(page.locator(".content"));

// Validate icon is left of text
await expectly(page.locator(".icon")).toBeLeftOf(page.locator(".label"));

// Check if content is right of sidebar
await expectly(page.locator(".content")).toBeRightOf(page.locator(".sidebar"));

// Validate text is right of icon
await expectly(page.locator(".label")).toBeRightOf(page.locator(".icon"));
```

## toBeStable()

Validates that element content remains unchanged for a specified duration. Useful for waiting until dynamic content has finished updating. The element's `innerHTML` is compared between checks.

| Option              | Default                                                     | Description                              |
| ------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| `timeout`           | `expect.timeout` from the config                            | Maximum wait in ms. `0` means no timeout |
| `stabilityDuration` | `500`, or half the timeout when the timeout is below 1000ms | How long the content must stay unchanged |
| `checkInterval`     | `100`, or half the stability duration when that is shorter  | Time between checks in ms                |

- The defaults shrink to fit a short expect timeout, so `toBeStable()` works without options in a config with `expect: { timeout: 500 }`
- Options are validated: `checkInterval` must be at most half of `stabilityDuration`. With a non-zero timeout, `stabilityDuration` must be less than `timeout`, and `timeout` at least `checkInterval + stabilityDuration`
- A missing element, or one that detaches, restarts the stability window. If the element never appears, both `toBeStable()` and `.not.toBeStable()` fail
- Strict mode violations (a locator that matches several elements) are thrown immediately

```typescript
// Wait for element to stop changing (default: 500ms stability)
await expectly(page.locator(".live-updates")).toBeStable();

// Custom stability requirements
await expectly(page.locator(".loading-content")).toBeStable({
	stabilityDuration: 1000, // Content must be stable for 1000ms
	checkInterval: 200, // Check every 200ms
	timeout: 10000, // Give up after 10000ms
});

// Wait for animation to finish
await expectly(page.locator(".animated-widget")).toBeStable({
	stabilityDuration: 300,
});

// No timeout: wait as long as it takes (the test timeout still applies)
await expectly(page.locator(".report")).toBeStable({ timeout: 0 });
```

## toHaveCountVisible()

Validates that a locator resolves to the expected number of visible elements.

```typescript
// Validate visible list items
await expectly(page.locator(".list-item")).toHaveCountVisible(3);

// Validate visible table rows with custom timeout
await expectly(page.locator("tbody tr")).toHaveCountVisible(5, { timeout: 5000 });

// Works with dynamic content
await expectly(page.locator(".notification")).toHaveCountVisible(1, { timeout: 3000 });
```

The count must be a non-negative integer. Anything else throws a `TypeError`.

## toHaveCountGreaterThan() / toHaveCountGreaterThanOrEqual()

Validates that a locator matches more than (or at least) `count` elements, retrying until it does. Playwright's `toHaveCount()` only checks an exact number; these matchers replace `expect.poll(() => locator.count()).toBeGreaterThan(n)`.

All matching elements are counted, like `toHaveCount()`. Pass `{ visible: true }` to count only visible elements. Zero matching elements is a valid count, not an `element(s) not found` error.

```typescript
// At least one search result
await expectly(page.locator(".search-result")).toHaveCountGreaterThan(0);

// A full page of visible rows
await expectly(page.locator("tbody tr")).toHaveCountGreaterThanOrEqual(10, { visible: true });

// With timeout
await expectly(page.locator(".card")).toHaveCountGreaterThan(3, { timeout: 5000 });
```

## toHaveCountLessThan() / toHaveCountLessThanOrEqual()

Validates that a locator matches fewer than (or at most) `count` elements, retrying until it does.

```typescript
// No more than two toasts at a time
await expectly(page.locator(".toast")).toHaveCountLessThan(3);

// At most one visible error
await expectly(page.locator(".error")).toHaveCountLessThanOrEqual(1, { visible: true });
```

## toHaveCountBetween()

Validates that a locator matches between `min` and `max` elements (inclusive), retrying until it does.

```typescript
// Pagination shows 1 to 10 page links
await expectly(page.locator(".page-item")).toHaveCountBetween(1, 10);

// Only visible elements
await expectly(page.locator(".suggestion")).toHaveCountBetween(1, 5, { visible: true });
```

Counts must be non-negative integers (`TypeError` otherwise), and `min` greater than `max` throws a `RangeError`.

## toHaveTextsInAscendingOrder() / toHaveTextsInDescendingOrder()

Validates that the texts of all elements a locator matches are in ascending or descending order, such as a table column after clicking a sort button. The matchers retry until the texts are in order, so they can follow the click directly.

- Texts are read with `textContent` (hidden elements included) and trimmed
- Equal neighbours are allowed unless `strict: true`
- If the locator matches no elements, both the assertion and its `.not` form fail with `element(s) not found`
- A failure names the first pair out of order, such as `First violation at index 1 → 2: "Charlie" then "Bob"`

| Option         | Default          | Description                                                                                             |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| `numeric`      | `false`          | Compare digit sequences by value, so `"Item 2"` sorts before `"Item 10"`                                |
| `locale`       | -                | Compare with the rules of a locale (`Intl.Collator`), such as `"de"` or `"sv"`                          |
| `ignoreCase`   | `false`          | Ignore letter case                                                                                      |
| `strict`       | `false`          | Reject equal neighbours                                                                                 |
| `parse`        | -                | Convert each trimmed text before comparing, such as a price to a number. A `NaN` result is out of order |
| `useInnerText` | `false`          | Read the rendered `innerText` instead of `textContent`                                                  |
| `timeout`      | `expect.timeout` | Maximum time to retry in ms                                                                             |

Without `numeric`, `locale` or `ignoreCase`, strings are compared by UTF-16 code units, so uppercase letters sort before lowercase ones. When `parse` returns numbers, they are compared numerically.

```typescript
// Sort a table by name
await page.getByRole("button", { name: "Sort by name" }).click();
await expectly(page.locator("td.name")).toHaveTextsInAscendingOrder({ ignoreCase: true });

// Prices such as "$1,299.00"
await expectly(page.locator("td.price")).toHaveTextsInAscendingOrder({
	parse: (text) => Number(text.replace(/[^\d.-]/g, "")),
});

// Newest first, with dates such as "Oct 25, 2026"
await expectly(page.locator("td.date")).toHaveTextsInDescendingOrder({ parse: (text) => Date.parse(text) });

// Natural order ("File 2" before "File 10") without duplicates
await expectly(page.locator(".file-name")).toHaveTextsInAscendingOrder({ numeric: true, strict: true });

// Locale-aware order
await expectly(page.locator(".city")).toHaveTextsInAscendingOrder({ locale: "sv" });
```

## Common Use Cases

### Using Granular Imports

```typescript
import {
	expectlyLocatorText,
	expectlyLocatorAttributes,
	expectlyLocatorCount,
	expectlyLocatorOrder,
	expectlyLocatorPositioning,
	expectlyLocatorState,
	expectlyLocatorVisibility,
} from "@cerios/playwright-expectly";

test("validate with granular imports", async ({ page }) => {
	await page.goto("/form");

	// Text validation
	const email = page.locator("#email");
	await email.fill("user@example.com");
	await expectlyLocatorText(email).toBeValidEmail();
	await expectlyLocatorText(email).toBeLowerCase();

	// Attribute validation
	const submitBtn = page.locator('button[type="submit"]');
	await expectlyLocatorAttributes(submitBtn).toHaveAriaLabel("Submit form");
	await expectlyLocatorAttributes(submitBtn).toHaveDataAttribute("action", "submit");

	// Positioning validation
	const header = page.locator("header");
	const main = page.locator("main");
	await expectlyLocatorPositioning(header).toBeAbove(main);

	// State validation
	const loadingSpinner = page.locator(".spinner");
	await expectlyLocatorState(loadingSpinner).toBeStable();

	// Visibility validation
	await expectlyLocatorVisibility(page.locator(".item")).toHaveCountVisible(2);

	// Count and order validation
	await expectlyLocatorCount(page.locator(".country option")).toHaveCountGreaterThan(1);
	await expectlyLocatorOrder(page.locator(".country option")).toHaveTextsInAscendingOrder();
});
```

### Layout and Positioning Testing

```typescript
test("validate page layout", async ({ page }) => {
	await page.goto("/dashboard");

	// Vertical positioning
	await expectly(page.locator("header")).toBeAbove(page.locator("main"));
	await expectly(page.locator("main")).toBeAbove(page.locator("footer"));
	await expectly(page.locator("nav")).toBeAbove(page.locator("footer"));

	// Horizontal positioning
	await expectly(page.locator(".sidebar")).toBeLeftOf(page.locator(".content"));
	await expectly(page.locator(".content")).toBeRightOf(page.locator(".sidebar"));

	// Icon positioning
	const icon = page.locator(".notification-icon");
	const badge = page.locator(".notification-badge");
	await expectly(icon).toBeLeftOf(badge);
});
```

### Dynamic Content Stability

```typescript
test("wait for content to stabilize", async ({ page }) => {
	await page.goto("/live-feed");

	// Wait for live updates to finish
	const feed = page.locator(".live-feed");
	await expectly(feed).toBeStable({
		stabilityDuration: 1000,
		timeout: 10000,
	});

	// Validate stable content
	const firstItem = feed.locator(".item").first();
	await expectly(firstItem.locator(".title")).toBeTitleCase();
});
```

### Sortable Tables

```typescript
test("sort products by price", async ({ page }) => {
	await page.goto("/products");

	// The table has rows before sorting
	await expectly(page.locator("tbody tr")).toHaveCountGreaterThan(0);

	// Ascending after the first click, descending after the second
	const priceHeader = page.getByRole("columnheader", { name: "Price" });
	const prices = page.locator("tbody td.price");
	const toNumber = (text: string) => Number(text.replace(/[^\d.-]/g, ""));

	await priceHeader.click();
	await expectly(prices).toHaveTextsInAscendingOrder({ parse: toNumber });

	await priceHeader.click();
	await expectly(prices).toHaveTextsInDescendingOrder({ parse: toNumber });
});
```

### Form Validation

```typescript
test("validate registration form elements", async ({ page }) => {
	await page.goto("/register");

	// Input placeholders
	await expectly(page.locator("#email")).toHavePlaceholder("Enter your email");
	await expectly(page.locator("#password")).toHavePlaceholder("Choose a password");

	// Actual values
	await page.locator("#email").fill("user@example.com");
	await expectly(page.locator("#email")).toBeValidEmail();

	await page.locator("#username").fill("user123");
	await expectly(page.locator("#username")).toBeAlphanumeric();

	await page.locator("#zip").fill("12345");
	await expectly(page.locator("#zip")).toBeNumericString();
});
```

### UI Component Testing

```typescript
test("validate product card", async ({ page }) => {
	const productCard = page.locator(".product-card").first();

	// Text formatting
	await expectly(productCard.locator(".product-title")).toBeTitleCase();
	await expectly(productCard.locator(".product-code")).toBeUpperCase();

	// Image validation
	await expectly(productCard.locator("img")).toHaveSrc(/cdn\.example\.com/);
	await expectly(productCard.locator("img")).toHaveAlt(/product/i);

	// Link validation
	await expectly(productCard.locator("a")).toHaveHref(/^\/products\//);

	// Data attributes
	await expectly(productCard).toHaveDataAttribute("product-id");
	await expectly(productCard).toHaveDataAttribute("category", "electronics");

	// Styling
	await expectly(productCard.locator(".sale-price")).toHaveStyles({ color: "rgb(204, 0, 0)", "font-weight": "700" });
});
```

### Accessibility Testing

```typescript
test("validate accessibility attributes", async ({ page }) => {
	await page.goto("/dashboard");

	// ARIA labels
	await expectly(page.locator("button.menu")).toHaveAriaLabel("Main menu");
	await expectly(page.locator("button.close")).toHaveAriaLabel("Close");

	// Image alt text
	await expectly(page.locator(".logo")).toHaveAlt("Company Logo");
	await expectly(page.locator(".avatar")).toHaveAlt(/user profile/i);

	// Link targets for external links
	await expectly(page.locator("a.external")).toHaveTarget("_blank");
});
```

### Content Validation

```typescript
test("validate dynamic content", async ({ page }) => {
	await page.goto("/user/profile");

	// Email formatting
	const email = page.locator(".user-email");
	await expectly(email).toBeValidEmail();
	await expectly(email).toBeLowerCase();

	// URLs
	const website = page.locator(".user-website");
	await expectly(website).toBeValidUrl();
	await expectly(website).toStartWith("https://");

	// IDs
	const userId = page.locator(".user-id");
	await expectly(userId).toBeUUID(4);

	// Formatted text
	const fullName = page.locator(".user-name");
	await expectly(fullName).toBeTitleCase();
});
```

### Link and Navigation Testing

```typescript
test("validate navigation links", async ({ page }) => {
	await page.goto("/");

	// Internal links
	await expectly(page.locator("a.home")).toHaveHref("/");
	await expectly(page.locator("a.about")).toHaveHref("/about");

	// External links
	await expectly(page.locator("a.docs")).toHaveHref(/^https:\/\/docs\./);
	await expectly(page.locator("a.docs")).toHaveTarget("_blank");

	// Link text
	await expectly(page.locator("a.home")).toMatchPattern(/^home$/i);
});
```

## Timeout Configuration

All locator matchers retry until they pass or the timeout expires. The timeout defaults to `expect.timeout` in your Playwright config (5 seconds unless configured) and can be set per assertion. `intervals` sets custom polling intervals.

Each browser action inside a matcher receives the remaining assertion time, so a short `actionTimeout` no longer cuts a longer assertion timeout short.

```typescript
// Default timeout (expect.timeout from the config)
await expectly(page.locator(".username")).toBeAlphanumeric();

// Custom timeout (10 seconds)
await expectly(page.locator(".username")).toBeAlphanumeric({ timeout: 10000 });

// Short timeout for fast-failing tests
await expectly(page.locator(".quick-element")).toBeValidEmail({ timeout: 2000 });

// Custom polling intervals
await expectly(page.locator(".status")).toStartWith("Ready", { timeout: 5000, intervals: [100, 250, 500] });
```

## Missing Elements and Retries

Locator matchers resolve elements the way Playwright's own assertions do:

- **Missing elements:** a missing element never blocks inside a Playwright action. The matcher keeps retrying until the element appears. If it never does, both the assertion and its `.not` form fail with `element(s) not found`, as `expect(locator).not.toHaveAttribute()` does. `.not` never passes just because the element is absent.
- **Two locators:** positioning matchers name the missing one, such as `element(s) not found (second locator)`, and treat a hidden element the same way.
- **Errors:** strict mode violations (a locator that resolves to several elements) and other errors that are not timeouts are thrown at once instead of being retried until the timeout.
- **Wrong receivers:** text, attribute, style and positioning matchers that only work on locators (such as `toBeUpperCase()` or `toHaveStyles()`) throw a `TypeError` when called on something else.

To assert that an element is absent, use Playwright's `toHaveCount(0)` or `not.toBeAttached()`.

## Error Handling

When locators fail to be found or assertions fail, descriptive errors are provided:

```typescript
// Element never appears (both forms fail)
await expectly(page.locator(".missing")).toBeValidEmail();
await expectly(page.locator(".missing")).not.toBeValidEmail();
// Error: element(s) not found

// Assertion failure
await expectly(page.locator(".email")).toBeValidEmail();
// Error: Expected locator text to be a valid email address
// Received: "not-an-email"

// Locator-only matcher on a string
await expectly("HELLO").toBeUpperCase();
// TypeError: This matcher needs a Playwright Locator, got: string
```

## Related

- [String Matchers](./STRING_MATCHERS.md) - For string value validation
- [Generic Matchers](./GENERIC_MATCHERS.md) - For type validation
- [Date Matchers](./DATE_MATCHERS.md) - For date validation
- [Page Matchers](./PAGE_MATCHERS.md) - For cookies and web storage

[← Back to README](../README.md)
