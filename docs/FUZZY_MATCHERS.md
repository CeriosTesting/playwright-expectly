# Fuzzy Matchers

Fuzzy string matching matchers using [fuzzball](https://www.npmjs.com/package/fuzzball)'s `token_sort_ratio` algorithm. Ideal for validating AI-generated text where wording, phrasing, or word order may vary.

Provided by the separate `@cerios/playwright-expectly-fuzzy` package.

## Installation

```bash
npm install @cerios/playwright-expectly-fuzzy --save-dev
```

## Available Matchers

- [toMatchFuzzy(expected, threshold?)](#tomatchfuzzy)

## toMatchFuzzy()

Asserts that a string or locator's text content fuzzy-matches the expected string using fuzzball's token-sort ratio algorithm.

- **Word-order-insensitive**: `"hello world"` and `"world hello"` score 100
- **Scores range from 0–100**; assertion passes when `score >= threshold`
- **Default threshold**: 80

**Parameters:**

- `expected` — the string to compare against
- `threshold` _(optional)_ — minimum similarity score (0–100). Defaults to **80**.

### String usage

```typescript
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

// Passes with default threshold (80) — minor typo tolerated
expectlyFuzzy("Hello Wrold").toMatchFuzzy("Hello World");

// Word-order-insensitive — scores 100
expectlyFuzzy("world hello").toMatchFuzzy("hello world");

// Custom threshold for more lenient matching
expectlyFuzzy("The cat sat on the mat").toMatchFuzzy("A cat sits on a mat", 70);

// With negation
expectlyFuzzy("completely different").not.toMatchFuzzy("hello world");
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
```

### Extending Playwright `expect`

#### Option A: `setupExpectlyFuzzy()` (recommended)

Call `setupExpectlyFuzzy()` in your `playwright.config.ts` to register `toMatchFuzzy` on Playwright's native `expect` globally. Full IntelliSense and type support is included automatically.

```typescript
// playwright.config.ts
import { setupExpectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

setupExpectlyFuzzy();
```

Use alongside `setupExpectly()` if you also want the core matchers:

```typescript
// playwright.config.ts
import { setupExpectly } from "@cerios/playwright-expectly";
import { setupExpectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";

setupExpectly();
setupExpectlyFuzzy();
```

Then use `expect` in any test file without additional imports:

```typescript
import { expect, test } from "@playwright/test";

test("fuzzy match via expect", async ({ page }) => {
	expect("Hello Wrold").toMatchFuzzy("Hello World");
	await expect(page.locator("[data-testid='summary']")).toMatchFuzzy("quarterly revenue increase", 75);
});
```

#### Option B: Manual `expect.extend`

For explicit control, extend `expect` in a shared fixtures file:

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

test("fuzzy match", async ({ page }) => {
	expect("Hello Wrold").toMatchFuzzy("Hello World");
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
Similarity score: 14 (threshold: 80)
```
