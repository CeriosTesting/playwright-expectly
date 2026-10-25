# 🎭 Playwright Expectly | By Cerios

[![npm version](https://badge.fury.io/js/%40cerios%2Fplaywright-expectly.svg)](https://www.npmjs.com/package/@cerios/playwright-expectly)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Comprehensive Playwright test matchers for strings, numbers, dates, arrays, objects, and locators. Simplify your E2E tests with intuitive assertions.

## Features

- 🎯 **50+ Custom Matchers** - Extensive validation for all data types
- 🔤 **String Validation** - Email, URL, UUID, alphanumeric, and more
- 🔢 **Number Arrays** - Sorting, statistics, ranges, and patterns
- 📅 **Date & Time** - `Date`, ISO strings and Temporal; time zones, DST, nanosecond precision, durations
- 🎨 **Locator Assertions** - DOM element validation and text formatting
- 📦 **Object Arrays** - Sorting, uniqueness, and property validation
- 🤖 **Fuzzy Matching** - AI-generated text validation with configurable similarity threshold (separate package)
- 💪 **Type-Safe** - Full TypeScript support
- ⚡ **Lightweight** - Only Playwright required. @cerios/playwright-expectly-fuzzy uses `fuzzball` as an optional dependency

## Installation

```bash
npm install @cerios/playwright-expectly --save-dev
```

For fuzzy matching support (AI-generated text) — [`@cerios/playwright-expectly-fuzzy`](https://www.npmjs.com/package/@cerios/playwright-expectly-fuzzy):

```bash
npm install @cerios/playwright-expectly-fuzzy --save-dev
```

## Quick Start

### Recommended: a single `tests/support` module for native `expect`

Create ONE shared module in your own project that extends Playwright's `expect` and captures the return value, then re-exports it. Every fixture file and spec file in your project imports `test`/`expect` from this module — never straight from `@playwright/test`.

```typescript
// tests/support/expect.ts
import "@cerios/playwright-expectly";

import { expectlyMatchers } from "@cerios/playwright-expectly";
import { expect as baseExpect, test as base } from "@playwright/test";

// MUST capture the return value — never call `.extend()` and discard it.
export const expect = baseExpect.extend(expectlyMatchers);
export const test = base;
```

```typescript
// any-spec-file.spec.ts
import { expect, test } from "./support/expect"; // or wherever your support module lives

test("extended expect example", async ({ page }) => {
	expect("john@example.com").toBeValidEmail();
	expect([1, 2, 3, 4]).toHaveAscendingOrder();
	expect(new Date("2025-01-02")).toBeDateCloseTo(new Date("2025-01-01"), { days: 1 });
	await expect(page.locator(".username")).toBeAlphanumeric();
});
```

This returned-value pattern is the important part: the value returned by `.extend(...)` is the fully typed `expect` that carries the Expectly matchers, and it composes cleanly with `mergeExpects()`. Expectly never overrides a Playwright built-in matcher, so Playwright's own matchers (including numeric `toBeCloseTo`) keep working on it unchanged.

### Standalone `expectly`

Use `expectly` directly when you do not want to re-export Playwright's `expect`:

```typescript
import { expectly } from "@cerios/playwright-expectly";

expectly("user@example.com").toBeValidEmail();
expectly([1, 2, 3, 4, 5]).toHaveAscendingOrder();
expectly(subscription.expiresAt).toBeInTheFuture();
await expectly(page.locator(".username")).toBeAlphanumeric();
```

#### Combining multiple matcher sources

If you also use `@cerios/playwright-expectly-fuzzy`, your own custom matchers, or multiple fixture files, combine them in that one `tests/support/expect.ts` module. Two equally valid ways to do this:

**`mergeExpects()`** — combines already-built `Expect` instances. Use this when composing 2+ independent matcher sources (recommended for multiple packages):

```typescript
import { expectlyMatchers } from "@cerios/playwright-expectly";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";
// tests/support/expect.ts
import { expect as baseExpect, mergeExpects, test as base } from "@playwright/test";

// Each matcher set is applied via `.extend()`, capturing the return value, then combined.
const expectlyExpect = baseExpect.extend(expectlyMatchers);
const fuzzyExpect = baseExpect.extend(expectlyFuzzyMatchers);

export const expect = mergeExpects(baseExpect, expectlyExpect, fuzzyExpect);
export const test = base;
```

If you only need the package-provided standalone expects, the shorter exported-expect form is also valid:

```typescript
import { expectly } from "@cerios/playwright-expectly";
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";
import { expect as baseExpect, mergeExpects, test as base } from "@playwright/test";

export const expect = mergeExpects(baseExpect, expectly, expectlyFuzzy);
export const test = base;
```

**`.extend()` directly** — layer multiple matcher sets (or your own custom matchers) in one call:

```typescript
import { expectlyMatchers } from "@cerios/playwright-expectly";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy"; // optional
// tests/support/expect.ts
import { expect as baseExpect, test as base } from "@playwright/test";

// MUST capture the return value — never call `.extend()` and discard it.
export const expect = baseExpect.extend({
	...expectlyMatchers,
	...expectlyFuzzyMatchers,
	toBeMyCustomThing(received) {
		/* ... */
	},
});
export const test = base;
```

> **Common mistake:** `mergeTests()` combines Playwright _fixture_ (`test`) objects, not matchers. Don't pass `expectlyMatchers` (a raw matcher-function dictionary) into `mergeTests()` or `mergeExpects()` — only pass real `Expect` instances (the result of `.extend()`) like `expectlyExpect` above.

If you have several fixture files (page objects, auth, API clients, etc.), give each its own `test.extend()` module, then combine them with `mergeTests()` in the same `tests/support` index alongside the merged `expect`:

```typescript
// tests/support/index.ts
import { mergeTests } from "@playwright/test";

import { expect } from "./expect";
import { test as apiTest } from "./fixtures/api.fixture";
import { test as authTest } from "./fixtures/auth.fixture";

export const test = mergeTests(authTest, apiTest);
export { expect };
```

Then every spec file imports `test`/`expect` from `tests/support` — never straight from `@playwright/test`.

If your `playwright.config` is JavaScript or is not included in your `tsconfig.json`, add one ambient import in a `.d.ts` or shared test file so IntelliSense picks up the matcher types:

```typescript
import "@cerios/playwright-expectly";
```

## Upgrading from 1.x

Version 2 of `@cerios/playwright-expectly` and `@cerios/playwright-expectly-fuzzy` contains these breaking changes:

1. **The Date matcher `toBeCloseTo` is renamed to `toBeDateCloseTo`.** The old name replaced Playwright's built-in numeric `toBeCloseTo` on every extended `expect`, so numeric assertions such as `expect(0.1 + 0.2).toBeCloseTo(0.3, 5)` failed with `Invalid actual date`. Playwright's numeric `toBeCloseTo` now works untouched next to the Date matcher.

   ```typescript
   // Before (1.x)
   expect(responseDate).toBeCloseTo(expectedDate, { seconds: 30 });

   // After (2.x)
   expect(responseDate).toBeDateCloseTo(expectedDate, { seconds: 30 });
   ```

2. **`setupExpectly()` and `setupExpectlyFuzzy()` are removed.** They were deprecated in 1.x. Replace them with a `tests/support/expect.ts` module as shown in [Quick Start](#quick-start):

   ```typescript
   import { setupExpectly } from "@cerios/playwright-expectly";
   // Before (1.x)
   import { expect, test } from "@playwright/test";

   setupExpectly();
   export { expect, test };

   import { expectlyMatchers } from "@cerios/playwright-expectly";
   // After (2.x)
   import { expect as baseExpect, test } from "@playwright/test";

   export const expect = baseExpect.extend(expectlyMatchers);
   export { test };
   ```

3. **Date matchers are rebuilt on Temporal** and accept `Date`, strict ISO 8601 strings and Temporal values. Results that used to be approximate or environment-dependent are now exact:
   - `toBeValidISODate()` validates calendar dates (`YYYY-MM-DD`); use the new `toBeValidISODateTime()` for datetimes.
   - `toMatchTimeZone()` is removed. It checked the machine's offset, not the value's; use `toHaveOffset()` or `toHaveTimeZone()`.
   - `toHaveDateRange()` and `toHaveDateGapsLargerThan()` use exact calendar arithmetic instead of 30.44-day months, 365.25-day years and a ±1 day tolerance.
   - `toHaveUniqueDates(true)` becomes `toHaveUniqueDates({ ignoreTime: true })`.

   See [Upgrading the date matchers](./docs/DATE_MATCHERS.md#upgrading-from-1x) for the full list.

## Available Matchers

### String Matchers

- `toBeValidEmail()` - Validate email format
- `toBeValidUrl()` - Validate URL format
- `toBeUUID(version?)` - Validate UUID (optionally specific version)
- `toBeAlphanumeric()` - Only letters and numbers
- `toBeNumericString()` - Only digits
- `toStartWith(prefix)` / `toEndWith(suffix)` - String boundaries
- `toMatchPattern(regex)` - Regular expression matching

[📖 View all string matchers →](./docs/STRING_MATCHERS.md)

### Number Array Matchers

- `toHaveAscendingOrder()` / `toHaveDescendingOrder()` - Sort validation
- `toHaveAverage(value)` / `toHaveMedian(value)` - Statistical validation
- `toHaveMin(value)` / `toHaveMax(value)` - Boundary validation
- `toBeAllPositive()` / `toBeAllNegative()` - Sign validation
- `toBeMonotonic()` - Consistent direction
- `toHaveConsecutiveIntegers()` - Sequential validation

[📖 View all number array matchers →](./docs/NUMBER_ARRAY_MATCHERS.md)

### Date Matchers

Accepts `Date`, strict ISO 8601 strings and Temporal values (native or polyfilled), with nanosecond precision and explicit time zones.

- `toBeBefore(date)` / `toBeAfter(date)` / `toBeSameInstant(date)` - Chronology
- `toBeWithinLast(duration)` / `toBeWithinNext(duration)` - Relative to now
- `toBeWithinDurationAfter(start, limit)` - Event timing
- `toBeSameDay(date, { timeZone })` / `toBeToday()` / `toBeWeekday()` - Calendar
- `toBeWithinTimeOfDay(start, end)` / `toBeSameHour(date)` / `toBeAtEndOfDay()` - Clock
- `toBeValidISODateTime()` / `toHaveOffset(offset)` / `toHaveTimeZone(zone)` - Validation
- `toHaveMaximumDateGap(duration)` / `toHaveDateRange(duration)` - Collections
- `toBeShorterThan(duration)` / `toBeDurationBetween(min, max)` - Durations
- `parseISOInstant()` / `isISOInstant()` and `ISOInstantString`-style types - Typed ISO strings

[📖 View all date matchers →](./docs/DATE_MATCHERS.md)

### Locator Matchers

- `toBeAlphanumeric()` - Alphanumeric text
- `toBeNumericString()` - Numeric text
- `toBeUUID(version?)` - UUID format
- `toBeUpperCase()` / `toBeLowerCase()` - Case validation
- `toBeTitleCase()` - Title case format
- `toHaveSrc(value)` / `toHaveHref(value)` / `toHaveAlt(value)` - Attribute validation

[📖 View all locator matchers →](./docs/LOCATOR_MATCHERS.md)

### Object Array Matchers

- `toHaveObjectsInAscendingOrderBy(property)` - Sort by property
- `toHaveObjectsInDescendingOrderBy(property)` - Reverse sort by property
- `toHaveOnlyUniqueObjects()` - Uniqueness validation

[📖 View all object array matchers →](./docs/OBJECT_ARRAY_MATCHERS.md)

### String Array Matchers

- `toHaveAscendingOrder()` / `toHaveDescendingOrder()` - Alphabetical order
- `toHaveStrictlyAscendingOrder()` - No duplicates ascending
- `toBeMonotonic()` - Consistent direction
- `toHaveUniqueValues()` - No duplicates

[📖 View all string array matchers →](./docs/STRING_ARRAY_MATCHERS.md)

### Generic Matchers

- `toBeInteger()` / `toBeFloat()` - Number type validation
- `toBeAnyOf(...values)` - Multiple value matching
- `toEqualPartially(expected, options)` - Partial object and array matching with configurable array modes
- `toBeNullish()` - Null or undefined check
- `toBePrimitive()` / `toBeArray()` / `toBeObject()` - Type checking

[📖 View all generic matchers →](./docs/GENERIC_MATCHERS.md)

### Fuzzy Matchers (`@cerios/playwright-expectly-fuzzy`)

- `toMatchFuzzy(expected, threshold?)` - Fuzzy string matching using fuzzball's token-sort ratio. Works on strings and locators. Ideal for AI-generated text validation.

[📖 View fuzzy matchers →](./docs/FUZZY_MATCHERS.md)

## Usage Examples

### Basic String Validation

```typescript
import { expectly } from "@cerios/playwright-expectly";

test("validate user input", async () => {
	expectly("john.doe@example.com").toBeValidEmail();
	expectly("https://example.com").toBeValidUrl();
	expectly("550e8400-e29b-41d4-a716-446655440000").toBeUUID(4);
});
```

### Number Array Assertions

```typescript
test("validate sorted data", async () => {
	const scores = [85, 90, 92, 95];

	expectly(scores).toHaveAscendingOrder();
	expectly(scores).toHaveAverage(90.5);
	expectly(scores).toBeAllPositive();
});
```

### Date Comparisons

```typescript
import { expectly, parseISOInstant } from "@cerios/playwright-expectly";

test("validate dates", async () => {
	const order = await api.getOrder(456);
	const createdAt = parseISOInstant(order.createdAt); // validated, typed ISO string

	expectly(createdAt).toBeWithinLast({ minutes: 5 });
	expectly(order.completedAt).toBeWithinDurationAfter(createdAt, { seconds: 15 });
	expectly(order.deliveryDate).toBeWeekday({ timeZone: "Europe/Amsterdam" });
});
```

### DOM Element Validation

```typescript
test("validate form elements", async ({ page }) => {
	await expectly(page.locator(".email")).toBeValidEmail();
	await expectly(page.locator(".username")).toBeAlphanumeric();
	await expectly(page.locator("img")).toHaveAlt("Company Logo");
});
```

## Advanced Usage

### Extend in one place (global)

Use this when you want all tests to use the extra matchers without importing `expectly` everywhere.

```typescript
import { expectlyMatchers } from "@cerios/playwright-expectly";
// e.g. tests/support/expect.ts
import { expect as baseExpect, test } from "@playwright/test";

export const expect = baseExpect.extend(expectlyMatchers);
export { test };
```

### Exported matcher objects

All matcher objects are exported, so you can extend `expect` with everything or only specific families.

```typescript
import { expectlyDateMatchers, expectlyMatchers, expectlyStringMatchers } from "@cerios/playwright-expectly";
import { expect as baseExpect } from "@playwright/test";

// All matchers
const expect = baseExpect.extend(expectlyMatchers);

// Or only selected matcher families
const expectStringsAndDates = baseExpect.extend({
	...expectlyStringMatchers,
	...expectlyDateMatchers,
});
```

### Use expectly families directly

Use this when you want a smaller, explicit API per matcher family.

```typescript
import { expectlyDate, expectlyLocator, expectlyNumberArray, expectlyString } from "@cerios/playwright-expectly";

expectlyString("ABC123").toBeAlphanumeric();
expectlyNumberArray([10, 20, 30]).toHaveAscendingOrder();
expectlyDate(new Date()).toBeSameYear(new Date("2026-01-01"));
await expectlyLocator(page.locator(".email")).toBeValidEmail();
```

### Individual Matcher Imports

For tree-shaking optimization, import only what you need:

```typescript
import { expectlyString } from "@cerios/playwright-expectly";
import { expectlyNumberArray } from "@cerios/playwright-expectly";
import { expectlyDate } from "@cerios/playwright-expectly";

expectlyString("test@example.com").toBeValidEmail();
expectlyNumberArray([1, 2, 3]).toHaveAscendingOrder();
expectlyDate("2026-10-25").toBeAfter("2026-10-20");
```

### Negation

All matchers support `.not` for inverse assertions:

```typescript
expectly("not-an-email").not.toBeValidEmail();
expectly([5, 3, 1]).not.toHaveAscendingOrder();
await expectly(page.locator(".text")).not.toBeNumericString();
```

## Documentation

- [📖 String Matchers](./docs/STRING_MATCHERS.md) - Email, URL, UUID, alphanumeric validation
- [📖 Number Array Matchers](./docs/NUMBER_ARRAY_MATCHERS.md) - Sorting, statistics, range checks
- [📖 Date Matchers](./docs/DATE_MATCHERS.md) - Dates, datetimes, time zones, durations and typed ISO strings
- [📖 Locator Matchers](./docs/LOCATOR_MATCHERS.md) - DOM element text and attribute validation
- [📖 Object Array Matchers](./docs/OBJECT_ARRAY_MATCHERS.md) - Sorting and uniqueness by property
- [📖 String Array Matchers](./docs/STRING_ARRAY_MATCHERS.md) - Alphabetical sorting and uniqueness
- [📖 Generic Matchers](./docs/GENERIC_MATCHERS.md) - Type checking and partial matching
- [📖 Fuzzy Matchers](./docs/FUZZY_MATCHERS.md) - AI-generated text validation with fuzzy string matching

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT © [Cerios](https://github.com/CeriosTesting)

## Support

- 📫 [Report Issues](https://github.com/CeriosTesting/playwright-expectly/issues)
- 💬 [Discussions](https://github.com/CeriosTesting/playwright-expectly/discussions)
- 🌐 [Website](https://github.com/CeriosTesting/playwright-expectly)

---

Built with ❤️ by [Cerios](https://github.com/CeriosTesting)

### Values from retrying assertions

Use `expectly.pollAndReturn(callback).toMatchObject(expected)` to obtain the value that passed a matcher, or `expectly(callback).toPassAndReturn({ timeout: 5_000 })` to obtain the result of a callback that completes without throwing. Both support async callbacks and return the successful value without another callback invocation.

Wrap your own expect instance with the exported `withReturn()` helper; subsequent `.extend()` and `.configure()` calls retain these methods. Return-aware assertions always throw on failure, even with `soft: true`, so they never return a failed value as a success. See [usage examples and failure behavior](packages/playwright-expectly/README.md#returning-values-from-retrying-assertions).
