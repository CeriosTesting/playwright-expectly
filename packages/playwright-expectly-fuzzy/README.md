# 🎭 Playwright Expectly Fuzzy | By Cerios

[![npm version](https://badge.fury.io/js/%40cerios%2Fplaywright-expectly-fuzzy.svg)](https://www.npmjs.com/package/@cerios/playwright-expectly-fuzzy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Fuzzy string matching matchers for Playwright. Validates AI-generated text, chatbot replies, and dynamic content where exact wording may vary — using [fuzzball](https://www.npmjs.com/package/fuzzball)'s `token_sort_ratio` algorithm.

Part of the [playwright-expectly](https://github.com/CeriosTesting/playwright-expectly) ecosystem.

## Features

- 🤖 **AI-Ready** — Tolerates minor wording variations, typos, and rephrasing
- 🔀 **Word-order-insensitive** — `"hello world"` and `"world hello"` both score 100
- 🎯 **Configurable threshold** — 0–100 similarity score, default 80
- 🌍 **Unicode-aware** — NFC normalization, letters in any script kept, punctuation treated as word separators; optional case-sensitive comparison
- 🎨 **Locator support** — Works directly on Playwright `Locator` objects with automatic polling
- 💪 **Type-Safe** — Full TypeScript support with Playwright `expect` type augmentation
- ⚡ **Lightweight** — Only Playwright and `fuzzball` required

## Installation

```bash
npm install @cerios/playwright-expectly-fuzzy --save-dev
```

> **Peer dependency:** requires `@playwright/test` to be installed.

## Quick Start

### Recommended: a single `tests/support` module

Create ONE shared module in your own project that extends Playwright's `expect` and captures the return value, then re-exports it. Every fixture file and spec file imports `test`/`expect` from this module — never straight from `@playwright/test`.

```typescript
// tests/support/expect.ts
import "@cerios/playwright-expectly-fuzzy";

import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";
import { expect as baseExpect, test as base } from "@playwright/test";

// MUST capture the return value — never call `.extend()` and discard it.
export const expect = baseExpect.extend(expectlyFuzzyMatchers);
export const test = base;
```

Combining with `@cerios/playwright-expectly` (or your own matchers) via `mergeExpects()` — recommended when composing 2+ matcher sources:

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

If you only need the standalone package exports, the shorter form is also valid:

```typescript
import { expectly } from "@cerios/playwright-expectly";
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";
import { expect as baseExpect, mergeExpects, test as base } from "@playwright/test";

export const expect = mergeExpects(baseExpect, expectly, expectlyFuzzy);
export const test = base;
```

Then use `expect` as usual in your tests:

```typescript
import { expect, test } from "./support/expect";

test("AI content validation", async ({ page }) => {
	expect("Hello Wrold").toMatchFuzzy("Hello World");
	await expect(page.locator("[data-testid='ai-summary']")).toMatchFuzzy("quarterly revenue increase", 75);
});
```

Capturing the return value keeps your setup aligned with Playwright's extended-`expect` model and composes cleanly when you merge multiple matcher sources.

### Standalone `expectlyFuzzy`

Use `expectlyFuzzy` directly without modifying Playwright's `expect`:

```typescript
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

// Passes — minor typo tolerated (default threshold 80)
expectlyFuzzy("Hello Wrold").toMatchFuzzy("Hello World");

// Word-order-insensitive — scores 100
expectlyFuzzy("world hello").toMatchFuzzy("hello world");

// Custom threshold for more lenient matching (scores 63)
expectlyFuzzy("The cat sat on the mat").toMatchFuzzy("A cat sits on a mat", 60);

// With negation
expectlyFuzzy("completely different").not.toMatchFuzzy("hello world");
```

> **Upgrading from 1.x:** the deprecated `setupExpectlyFuzzy()` is removed. Use the `tests/support` pattern above instead. See the [root README](../../README.md#upgrading-from-1x) for migration examples.

## Available Matchers

### `toMatchFuzzy(expected, threshold?, options?)`

Asserts that a string or locator's text content fuzzy-matches the expected string using fuzzball's `token_sort_ratio` algorithm.

| Parameter               | Type      | Default | Description                                                    |
| ----------------------- | --------- | ------- | -------------------------------------------------------------- |
| `expected`              | `string`  | —       | The string to compare against                                  |
| `threshold`             | `number`  | `80`    | Minimum similarity score (0–100). Pass to be lenient.          |
| `options.caseSensitive` | `boolean` | `false` | Compare letter case too                                        |
| `options.timeout`       | `number`  | —       | Locators only: maximum time to retry (default: expect timeout) |

**Key behaviours:**

- Scores range from **0–100** and are rounded to integers; assertion passes when `score >= threshold`
- **Word-order-insensitive**: token sort normalises word order before comparison
- **Preprocessing**: both strings are NFC-normalized, runs of punctuation, symbols and whitespace become single word separators, letters in any script are kept, and case is ignored unless `caseSensitive: true`
- Strings that are equal after preprocessing score **100**, including two empty strings, so `"HELLO, World!"` matches `"hello world"` at threshold 100
- Non-string receivers throw a `TypeError`
- Locator variant **polls** until the condition is met (or times out); a missing element fails both the assertion and `.not` with `element(s) not found`

```typescript
// String
expectlyFuzzy("Hello Wrold").toMatchFuzzy("Hello World"); // score 91 ≥ 80 ✓

// Case-sensitive
expectlyFuzzy("Hello World").not.toMatchFuzzy("hello world", 100, { caseSensitive: true });

// Locator (async)
await expectlyFuzzyLocator(page.locator("[data-testid='summary']")).toMatchFuzzy(
	"The report shows an increase in quarterly revenue",
	75,
);

// Negation
expectlyFuzzy("completely different text").not.toMatchFuzzy("hello world");
```

[📖 View full fuzzy matcher docs →](../../docs/FUZZY_MATCHERS.md)

## Exports

| Export                         | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `expectlyFuzzy`                | `expect` extended with all fuzzy matchers          |
| `expectlyFuzzyMatchers`        | Matcher object — pass to `baseExpect.extend()`     |
| `expectlyFuzzyString`          | `expect` extended with string-only fuzzy matchers  |
| `expectlyFuzzyStringMatchers`  | String fuzzy matcher object                        |
| `expectlyFuzzyLocator`         | `expect` extended with locator-only fuzzy matchers |
| `expectlyFuzzyLocatorMatchers` | Locator fuzzy matcher object                       |

## Usage Examples

### Validating AI-generated summaries

```typescript
import { expectlyFuzzyLocator } from "@cerios/playwright-expectly-fuzzy";

test("AI summary is close enough", async ({ page }) => {
	await expectlyFuzzyLocator(page.locator("[data-testid='ai-summary']")).toMatchFuzzy(
		"The report shows an increase in quarterly revenue",
		75,
	);
});
```

### Validating chatbot responses

```typescript
test("chatbot reply is on topic", async ({ page }) => {
	await expect(page.locator("[data-testid='bot-reply']")).toMatchFuzzy(
		"Your order has been shipped and will arrive in 3 to 5 business days",
		70,
	);
});
```

### Testing with word-order variance

```typescript
test("word order does not matter", () => {
	expectlyFuzzy("revenue quarterly increase report").toMatchFuzzy("quarterly revenue increase report");
});
```

## Related Packages

- [`@cerios/playwright-expectly`](https://www.npmjs.com/package/@cerios/playwright-expectly) — Core matchers: strings, numbers, dates, arrays, objects, and locators

## License

MIT — see [LICENSE](../../LICENSE)
