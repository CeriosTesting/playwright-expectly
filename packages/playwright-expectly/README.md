# 🎭 Playwright Expectly | By Cerios

[![npm version](https://badge.fury.io/js/%40cerios%2Fplaywright-expectly.svg)](https://www.npmjs.com/package/@cerios/playwright-expectly)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Comprehensive Playwright test matchers for strings, numbers, dates, arrays, objects, and locators. Simplify your E2E tests with intuitive assertions like `toBeAlphanumeric`, `toHaveAscendingOrder`, `toBeInTheFuture`, and 50+ more matchers.

## Features

- 🎯 **50+ Custom Matchers** — extensive validation for all data types
- 🔤 **String Validation** — email, URL, UUID, alphanumeric, and more
- 🔢 **Number Arrays** — sorting, statistics, ranges, and patterns
- 📅 **Date Operations** — comparisons, ranges, quarters, and business logic
- 🎨 **Locator Assertions** — DOM element validation and text formatting
- 📦 **Object Arrays** — sorting, uniqueness, and property validation
- 🤖 **Fuzzy Matching** — AI-generated text validation (separate [`@cerios/playwright-expectly-fuzzy`](https://www.npmjs.com/package/@cerios/playwright-expectly-fuzzy) package)
- 💪 **Type-Safe** — full TypeScript support
- ⚡ **Lightweight** — only Playwright required

## Installation

```bash
npm install @cerios/playwright-expectly --save-dev
```

> **Peer dependency:** requires `@playwright/test` to be installed.

## Quick Start

### Option 1: Use `expectly` directly

```typescript
import { expectly } from "@cerios/playwright-expectly";

expectly("user@example.com").toBeValidEmail();
expectly([1, 2, 3, 4, 5]).toHaveAscendingOrder();
expectly(new Date()).toBeInTheFuture(new Date("2020-01-01"));
await expectly(page.locator(".username")).toBeAlphanumeric();
```

### Option 2 (recommended): a single `tests/support` module for native `expect`

Create ONE shared module in your own project that extends Playwright's `expect` and captures the return value, then re-exports it. Every fixture file and spec file imports `test`/`expect` from this module — never straight from `@playwright/test`.

```typescript
// tests/support/expect.ts
import { expect as baseExpect, test as base } from "@playwright/test";
import { expectlyMatchers } from "@cerios/playwright-expectly";

// MUST capture the return value — never call `.extend()` and discard it.
export const expect = baseExpect.extend(expectlyMatchers);
export const test = base;
```

```typescript
import { expect, test } from "./support/expect";

test("extended expect example", async ({ page }) => {
	expect("john@example.com").toBeValidEmail();
	expect([1, 2, 3, 4]).toHaveAscendingOrder();
	await expect(page.locator(".username")).toBeAlphanumeric();
});
```

Combining with `@cerios/playwright-expectly-fuzzy`, or your own matchers, via `mergeExpects()`:

```typescript
// tests/support/expect.ts
import { expect as baseExpect, mergeExpects, test as base } from "@playwright/test";
import { expectlyMatchers } from "@cerios/playwright-expectly";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";

const expectlyExpect = baseExpect.extend(expectlyMatchers);
const fuzzyExpect = baseExpect.extend(expectlyFuzzyMatchers);

export const expect = mergeExpects(baseExpect, expectlyExpect, fuzzyExpect);
export const test = base;
```

> **Note:** you may see a `setupExpectly()` function in older docs or code — it is **deprecated**. Playwright's `expect.extend()` only mutates the _original_ `expect` object in place for matcher names that don't collide with a Playwright built-in. `toBeCloseTo` collides with Playwright's own built-in numeric matcher, so `setupExpectly()` can never make the Date `toBeCloseTo` matcher work, regardless of where it's called. The `tests/support` pattern above always works correctly.

## Available Matchers

- **String** — `toBeValidEmail()`, `toBeValidUrl()`, `toBeUUID()`, `toBeAlphanumeric()`, `toStartWith()`, `toEndWith()`, `toMatchPattern()`, and more — [📖 docs](../../docs/STRING_MATCHERS.md)
- **Number Array** — `toHaveAscendingOrder()`, `toHaveAverage()`, `toBeAllPositive()`, `toBeMonotonic()`, and more — [📖 docs](../../docs/NUMBER_ARRAY_MATCHERS.md)
- **Date** — `toBeCloseTo()`, `toBeInTheFuture()`, `toBeSameDay()`, `toBeInQuarter()`, and more — [📖 docs](../../docs/DATE_MATCHERS.md)
- **Locator** — `toBeAlphanumeric()`, `toBeUpperCase()`, `toHaveSrc()`, `toHaveHref()`, and more — [📖 docs](../../docs/LOCATOR_MATCHERS.md)
- **Object Array** — `toHaveObjectsInAscendingOrderBy()`, `toHaveOnlyUniqueObjects()`, and more — [📖 docs](../../docs/OBJECT_ARRAY_MATCHERS.md)
- **String Array** — `toHaveAscendingOrder()`, `toHaveStrictlyAscendingOrder()`, `toHaveUniqueValues()`, and more — [📖 docs](../../docs/STRING_ARRAY_MATCHERS.md)
- **Generic** — `toBeInteger()`, `toBeAnyOf()`, `toEqualPartially()`, `toBeNullish()`, and more — [📖 docs](../../docs/GENERIC_MATCHERS.md)

## Links

- [Full project README](https://github.com/CeriosTesting/playwright-expectly#readme)
- [Changelog](./CHANGELOG.md)
- [Issues](https://github.com/CeriosTesting/playwright-expectly/issues)

## License

MIT © Cerios
