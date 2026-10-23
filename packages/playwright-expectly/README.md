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

### Recommended: a single `tests/support` module for native `expect`

Create ONE shared module in your own project that extends Playwright's `expect` and captures the return value, then re-exports it. Every fixture file and spec file imports `test`/`expect` from this module — never straight from `@playwright/test`.

```typescript
// tests/support/expect.ts
import "@cerios/playwright-expectly";

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
	expect(new Date("2025-01-02")).toBeDateCloseTo(new Date("2025-01-01"), { days: 1 });
	await expect(page.locator(".username")).toBeAlphanumeric();
});
```

Capturing the return value is the key detail: the value returned by `.extend(...)` is the fully typed `expect` that carries the Expectly matchers. Expectly never overrides a Playwright built-in matcher, so Playwright's own matchers (including numeric `toBeCloseTo`) keep working on it unchanged.

### Standalone `expectly`

```typescript
import { expectly } from "@cerios/playwright-expectly";

expectly("user@example.com").toBeValidEmail();
expectly([1, 2, 3, 4, 5]).toHaveAscendingOrder();
expectly(new Date()).toBeInTheFuture(new Date("2020-01-01"));
await expectly(page.locator(".username")).toBeAlphanumeric();
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

If you only need the standalone package exports, the shorter form is also valid:

```typescript
import { expectly } from "@cerios/playwright-expectly";
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";
import { expect as baseExpect, mergeExpects, test as base } from "@playwright/test";

export const expect = mergeExpects(baseExpect, expectly, expectlyFuzzy);
export const test = base;
```

> **Upgrading from 1.x:** the Date matcher `toBeCloseTo` is renamed to `toBeDateCloseTo`, and the deprecated `setupExpectly()` is removed. Use the `tests/support` pattern above instead. See the [root README](../../README.md#upgrading-from-1x) for migration examples.

## Available Matchers

- **String** — `toBeValidEmail()`, `toBeValidUrl()`, `toBeUUID()`, `toBeAlphanumeric()`, `toStartWith()`, `toEndWith()`, `toMatchPattern()`, and more — [📖 docs](../../docs/STRING_MATCHERS.md)
- **Number Array** — `toHaveAscendingOrder()`, `toHaveAverage()`, `toBeAllPositive()`, `toBeMonotonic()`, and more — [📖 docs](../../docs/NUMBER_ARRAY_MATCHERS.md)
- **Date** — `toBeDateCloseTo()`, `toBeInTheFuture()`, `toBeSameDay()`, `toBeInQuarter()`, and more — [📖 docs](../../docs/DATE_MATCHERS.md)
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
