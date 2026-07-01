# 🎭 Playwright Expectly Fuzzy | By Cerios

[![npm version](https://badge.fury.io/js/%40cerios%2Fplaywright-expectly-fuzzy.svg)](https://www.npmjs.com/package/@cerios/playwright-expectly-fuzzy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Fuzzy string matching matchers for Playwright. Validates AI-generated text, chatbot replies, and dynamic content where exact wording may vary — using [fuzzball](https://www.npmjs.com/package/fuzzball)'s `token_sort_ratio` algorithm.

Part of the [playwright-expectly](https://github.com/CeriosTesting/playwright-expectly) ecosystem.

## Features

- 🤖 **AI-Ready** — Tolerates minor wording variations, typos, and rephrasing
- 🔀 **Word-order-insensitive** — `"hello world"` and `"world hello"` both score 100
- 🎯 **Configurable threshold** — 0–100 similarity score, default 80
- 🎨 **Locator support** — Works directly on Playwright `Locator` objects with automatic polling
- 💪 **Type-Safe** — Full TypeScript support with Playwright `expect` type augmentation
- ⚡ **Lightweight** — Only Playwright and `fuzzball` required

## Installation

```bash
npm install @cerios/playwright-expectly-fuzzy --save-dev
```

> **Peer dependency:** requires `@playwright/test` to be installed.

## Quick Start

### Option 1: `expectlyFuzzy` (standalone)

Use `expectlyFuzzy` directly without modifying Playwright's `expect`:

```typescript
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

// Passes — minor typo tolerated (default threshold 80)
expectlyFuzzy("Hello Wrold").toMatchFuzzy("Hello World");

// Word-order-insensitive — scores 100
expectlyFuzzy("world hello").toMatchFuzzy("hello world");

// Custom threshold for more lenient matching
expectlyFuzzy("The cat sat on the mat").toMatchFuzzy("A cat sits on a mat", 70);

// With negation
expectlyFuzzy("completely different").not.toMatchFuzzy("hello world");
```

### Option 2: Extend Playwright `expect` with `setupExpectlyFuzzy`

`setupExpectlyFuzzy()` extends Playwright's `expect` in the current process.

In some Playwright versions or project setups, calling it from `playwright.config.ts` may appear to work. However, config-time setup is not guaranteed across worker boundaries.

The reliable approach is to call it in the same worker context that imports and uses Playwright's `expect`, typically from a shared fixtures module.

```typescript
// Sometimes seen in playwright.config.ts, but not guaranteed across worker boundaries
import { setupExpectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

setupExpectlyFuzzy();
```

Recommended worker-side setup:

```typescript
// tests/fixtures.ts
import { expect, test } from "@playwright/test";
import { setupExpectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

setupExpectlyFuzzy();

export { expect, test };
```

Then use `expect` as usual in your tests:

```typescript
import { expect, test } from "./fixtures";

test("AI content validation", async ({ page }) => {
	expect("Hello Wrold").toMatchFuzzy("Hello World");
	await expect(page.locator("[data-testid='ai-summary']")).toMatchFuzzy("quarterly revenue increase", 75);
});
```

Use alongside `setupExpectly()` from the core package to get all matchers:

```typescript
// tests/fixtures.ts
import { expect, test } from "@playwright/test";
import { setupExpectly } from "@cerios/playwright-expectly";
import { setupExpectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

setupExpectly();
setupExpectlyFuzzy();

export { expect, test };
```

Idempotency note: calling `setupExpectlyFuzzy()` more than once is safe; repeated calls are ignored.

### Option 3: Manual `expect.extend`

For explicit control, extend `expect` in a shared fixtures file and re-export it:

```typescript
// tests/fixtures.ts
import { expect, test as base } from "@playwright/test";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";

expect.extend(expectlyFuzzyMatchers);

export { expect };
export const test = base;
```

Then import `expect` from your fixtures file in each test:

```typescript
import { expect, test } from "./fixtures";

test("chatbot reply", async ({ page }) => {
	expect("Hello Wrold").toMatchFuzzy("Hello World");
	await expect(page.locator("[data-testid='bot-reply']")).toMatchFuzzy(
		"Your order has been shipped and will arrive in 3 to 5 business days",
		70,
	);
});
```

## Available Matchers

### `toMatchFuzzy(expected, threshold?)`

Asserts that a string or locator's text content fuzzy-matches the expected string using fuzzball's `token_sort_ratio` algorithm.

| Parameter   | Type     | Default | Description                                           |
| ----------- | -------- | ------- | ----------------------------------------------------- |
| `expected`  | `string` | —       | The string to compare against                         |
| `threshold` | `number` | `80`    | Minimum similarity score (0–100). Pass to be lenient. |

**Key behaviours:**

- Scores range from **0–100**; assertion passes when `score >= threshold`
- **Word-order-insensitive**: token sort normalises word order before comparison
- Locator variant **polls** until the condition is met (or times out)

```typescript
// String
expectlyFuzzy("Hello Wrold").toMatchFuzzy("Hello World"); // score ~89 ≥ 80 ✓

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

| Export                         | Description                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| `expectlyFuzzy`                | `expect` extended with all fuzzy matchers                    |
| `expectlyFuzzyMatchers`        | Matcher object — pass to `expect.extend()`                   |
| `expectlyFuzzyString`          | `expect` extended with string-only fuzzy matchers            |
| `expectlyFuzzyStringMatchers`  | String fuzzy matcher object                                  |
| `expectlyFuzzyLocator`         | `expect` extended with locator-only fuzzy matchers           |
| `expectlyFuzzyLocatorMatchers` | Locator fuzzy matcher object                                 |
| `setupExpectlyFuzzy`           | Registers all fuzzy matchers on Playwright's global `expect` |

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
