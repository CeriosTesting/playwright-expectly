# Fuzzy Matchers

Fuzzy string matching matchers using [fuzzball](https://www.npmjs.com/package/fuzzball)'s `token_sort_ratio` algorithm. Ideal for validating AI-generated text where wording, phrasing, or word order may vary.

Provided by the separate `@cerios/playwright-expectly-fuzzy` package.

## Installation

```bash
npm install @cerios/playwright-expectly-fuzzy --save-dev
```

## Available Matchers

- [toMatchFuzzy(expected, threshold?, options?)](#tomatchfuzzy)

## toMatchFuzzy()

Asserts that a string or locator's text content fuzzy-matches the expected string using fuzzball's token-sort ratio algorithm.

- **Word-order-insensitive**: `"hello world"` and `"world hello"` score 100
- **Scores range from 0–100** and are rounded to integers; assertion passes when `score >= threshold`
- **Default threshold**: 80
- **Case-insensitive** unless `caseSensitive: true`

**Parameters:**

- `expected` — the string to compare against
- `threshold` _(optional)_ — minimum similarity score (0–100). Defaults to **80**. Anything else, such as `150` or `NaN`, throws.
- `options` _(optional)_ — `caseSensitive` (default `false`), plus `timeout` and `intervals` for locators

The string form requires a string receiver; any other value throws a `TypeError`, such as `toMatchFuzzy: received value must be a string, got: number`. The locator form reads the element's `innerText` and retries until the score meets the threshold. If the element never appears, both the assertion and its `.not` form fail with `element(s) not found`.

### Preprocessing

Before scoring, both strings are preprocessed with Unicode-aware rules:

1. **NFC normalization**: `"e"` followed by a combining accent equals `"é"`.
2. **Separators**: every run of characters that are not letters, combining marks or digits (punctuation, symbols, whitespace) becomes a single space, and leading and trailing separators are removed.
3. **Letters in any script are kept**: `"Crème brûlée"`, `"Zürich"` and `"東京"` are compared as written, not stripped to ASCII.
4. **Case**: both strings are lowercased, unless `caseSensitive: true`.

Strings that are equal after preprocessing score 100, including two empty strings or two strings of only punctuation. A threshold of 100 therefore does not mean byte-equal: `"HELLO, World!"` and `"hello world"` score 100.

```typescript
// Punctuation, whitespace and case are ignored by default
expectlyFuzzy("HELLO, World!").toMatchFuzzy("hello world", 100);

// Accented letters are kept, so they count as differences
expectlyFuzzy("Crème brûlée").not.toMatchFuzzy("Creme brulee", 80); // scores 75

// Compare letter case too
expectlyFuzzy("Hello World").not.toMatchFuzzy("hello world", 100, { caseSensitive: true });

// Empty strings match each other
expectlyFuzzy("").toMatchFuzzy("", 100);
```

### String usage

```typescript
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

// Passes with default threshold (80) — minor typo tolerated
expectlyFuzzy("Hello Wrold").toMatchFuzzy("Hello World");

// Word-order-insensitive — scores 100
expectlyFuzzy("world hello").toMatchFuzzy("hello world");

// Custom threshold for more lenient matching (scores 63)
expectlyFuzzy("The cat sat on the mat").toMatchFuzzy("A cat sits on a mat", 60);

// With negation
expectlyFuzzy("completely different").not.toMatchFuzzy("hello world");

// Case-sensitive comparison
expectlyFuzzy("Order Confirmed").toMatchFuzzy("Order Confirmed", 100, { caseSensitive: true });
```

### Locator usage

```typescript
import { expectlyFuzzyLocator } from "@cerios/playwright-expectly-fuzzy";

test("AI summary matches expected content", async ({ page }) => {
	await expectlyFuzzyLocator(page.locator("[data-testid='ai-summary']")).toMatchFuzzy(
		"The report shows an increase in quarterly revenue",
		75,
	);
});

test("chatbot response is on topic", async ({ page }) => {
	await expectlyFuzzyLocator(page.locator("[data-testid='bot-reply']")).toMatchFuzzy(
		"Your order has been shipped and will arrive in 3 to 5 business days",
		70,
	);
});

test("generated heading keeps its capitalization", async ({ page }) => {
	await expectlyFuzzyLocator(page.locator("h1")).toMatchFuzzy("Quarterly Revenue Report", 90, {
		caseSensitive: true,
		timeout: 10000,
	});
});
```

### Extending Playwright `expect`

#### Option A (recommended): a single `tests/support` module

Create ONE shared module in your own project that extends Playwright's `expect` and captures the return value, then re-exports it. Every fixture file and spec file imports `test`/`expect` from this module — never straight from `@playwright/test`.

```typescript
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";
// tests/support/expect.ts
import { expect as baseExpect, test as base } from "@playwright/test";

// MUST capture the return value — never call `.extend()` and discard it.
export const expect = baseExpect.extend(expectlyFuzzyMatchers);
export const test = base;
```

Combining with `@cerios/playwright-expectly` (or your own matchers) via `mergeExpects()`:

```typescript
import { expectlyMatchers } from "@cerios/playwright-expectly";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";
// tests/support/expect.ts
import { expect as baseExpect, mergeExpects, test as base } from "@playwright/test";

const expectlyExpect = baseExpect.extend(expectlyMatchers);
const fuzzyExpect = baseExpect.extend(expectlyFuzzyMatchers);

export const expect = mergeExpects(baseExpect, expectlyExpect, fuzzyExpect);
export const test = base;
```

Then use `expect` in your tests:

```typescript
import { expect, test } from "./support/expect";

test("fuzzy match via expect", async ({ page }) => {
	expect("Hello Wrold").toMatchFuzzy("Hello World");
	await expect(page.locator("[data-testid='summary']")).toMatchFuzzy("quarterly revenue increase", 75);
});
```

#### TypeScript type augmentation

Importing `@cerios/playwright-expectly-fuzzy` automatically augments Playwright's `Matchers` interface. If your config is not included in your `tsconfig.json`, add one ambient import in a shared `.d.ts` or test file:

```typescript
import "@cerios/playwright-expectly-fuzzy";
```

### Error messages

Error output includes the computed score and threshold for easy debugging:

```
Expected string to fuzzy match: "Hello World"
Received: "completely different text"
Similarity score: 22 (threshold: 80)
```
