# 🎭 Playwright Expectly | By Cerios

[![npm version](https://badge.fury.io/js/%40cerios%2Fplaywright-expectly.svg)](https://www.npmjs.com/package/@cerios/playwright-expectly)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Comprehensive Playwright test matchers for strings, numbers, dates, arrays, objects, locators, and page state. Simplify your E2E tests with intuitive assertions like `toBeAlphanumeric`, `toHaveAscendingOrder`, `toBeInTheFuture`, and 130+ more matchers.

## Features

- 🎯 **130+ Custom Matchers** — extensive validation for all data types
- 🔤 **String Validation** — email, URL, UUID, alphanumeric, hexadecimal, case-insensitive equality, and more
- 🔢 **Number Arrays** — sorting, statistics, ranges, and patterns
- 📅 **Date & Time** — `Date`, ISO strings and Temporal; time zones, DST, nanosecond precision, durations
- 🎨 **Locator Assertions** — DOM element validation, text formatting, count ranges, sorted texts, and computed styles
- 🍪 **Page State** — retrying cookie, `localStorage` and `sessionStorage` assertions
- 📦 **Object Arrays** — sorting, uniqueness, and property validation
- 🧺 **Collections & Functions** — array members, object keys and entries, promises, and thrown errors
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

import { expectlyMatchers } from "@cerios/playwright-expectly";
import { expect as baseExpect, test as base } from "@playwright/test";

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
expectly(subscription.expiresAt).toBeInTheFuture();
await expectly(page.locator(".username")).toBeAlphanumeric();
```

Combining with `@cerios/playwright-expectly-fuzzy`, or your own matchers, via `mergeExpects()`:

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

> **Upgrading from 1.x:** the Date matcher `toBeCloseTo` is renamed to `toBeDateCloseTo`, the deprecated `setupExpectly()` is removed (use the `tests/support` pattern above instead), and the date matchers are rebuilt on Temporal with exact calendar semantics: `toBeValidISODate()` now validates `YYYY-MM-DD` and `toMatchTimeZone()` is replaced by `toHaveOffset()` / `toHaveTimeZone()`. See the [root README](../../README.md#upgrading-from-1x) for migration examples.

## Available Matchers

- **String** — `toBeValidEmail()`, `toBeValidUrl()`, `toBeUUID()`, `toBeAlphanumeric()`, `toBeHexadecimal()`, `toEqualCaseInsensitive()`, `toEqualIgnoringWhitespace()`, `toMatchPattern()`, and more — [📖 docs](../../docs/STRING_MATCHERS.md)
- **Number Array** — `toHaveAscendingOrder()`, `toHaveAverage()`, `toBeAllPositive()`, `toBeMonotonic()`, and more — [📖 docs](../../docs/NUMBER_ARRAY_MATCHERS.md)
- **Date & Time** — `Date`, ISO strings and Temporal values: `toBeWithinLast()`, `toBeWithinDurationAfter()`, `toBeSameInstant()`, `toBeSameDay()`, `toBeWithinTimeOfDay()`, `toHaveOffset()`, duration matchers, plus `parseISO*()` / `isISO*()` and typed ISO strings — [📖 docs](../../docs/DATE_MATCHERS.md)
- **Locator** — `toBeAlphanumeric()`, `toBeUpperCase()`, `toHaveSrc()`, `toHaveStyles()`, `toHaveCountGreaterThan()`, `toHaveCountBetween()`, `toHaveTextsInAscendingOrder()`, and more — [📖 docs](../../docs/LOCATOR_MATCHERS.md)
- **Page** — `toHaveCookie()` on a `Page` or `BrowserContext`, `toHaveLocalStorageItem()`, `toHaveSessionStorageItem()` — [📖 docs](../../docs/PAGE_MATCHERS.md)
- **Object Array** — `toHaveObjectsInAscendingOrderBy()`, `toHaveOnlyUniqueObjects()`, and more — [📖 docs](../../docs/OBJECT_ARRAY_MATCHERS.md)
- **String Array** — `toHaveAscendingOrder()`, `toHaveStrictlyAscendingOrder()`, `toHaveUniqueValues()`, and more — [📖 docs](../../docs/STRING_ARRAY_MATCHERS.md)
- **Generic** — `toBeInteger()`, `toBeAnyOf()`, `toSatisfy()`, `toBeEven()`, `toBeFinite()`, `toEqualPartially()`, `toBeNullish()`, and more — [📖 docs](../../docs/GENERIC_MATCHERS.md)
- **Collection & Function** — `toSatisfyAll()`, `toIncludeSameMembers()`, `toContainKeys()`, `toContainEntry()`, `toBeEmptyObject()`, `toResolve()`, `toReject()`, `toThrowWithMessage()`, and more — [📖 docs](../../docs/COLLECTION_MATCHERS.md)

## Links

- [Full project README](https://github.com/CeriosTesting/playwright-expectly#readme)
- [Changelog](./CHANGELOG.md)
- [Issues](https://github.com/CeriosTesting/playwright-expectly/issues)

## License

MIT © Cerios

## Type-narrowing assertions

Playwright's `expect(name).toBeDefined()` checks the value, but TypeScript still sees `name` as possibly `undefined` afterwards. That is a TypeScript limit: a check can only narrow a variable that is passed straight to it, and in `expect(name).toBeDefined()` the variable goes to `expect()`. So Expectly adds copies of these matchers on the expect object itself:

```typescript
import { expectly } from "@cerios/playwright-expectly";

const name: string | undefined = await getName();
expectly.toBeDefined(name); // runs expectly(name).toBeDefined()
name.toUpperCase(); // name: string, no `if (!name) throw` needed

const user: User | null = await findUser(id);
expectly.not.toBeNull(user, "user was not found"); // runs expectly(user, "user was not found").not.toBeNull()
user.email; // user: User
```

| Assertion              | Narrows to                | `.not` narrows to         |
| ---------------------- | ------------------------- | ------------------------- |
| `toBeDefined(value)`   | `Exclude<T, undefined>`   | `undefined`               |
| `toBeUndefined(value)` | `undefined`               | `Exclude<T, undefined>`   |
| `toBeNull(value)`      | `null`                    | `Exclude<T, null>`        |
| `toBeTruthy(value)`    | what `if (value)` leaves  | what `if (!value)` leaves |
| `toBeFalsy(value)`     | what `if (!value)` leaves | what `if (value)` leaves  |

Each one runs the native Playwright matcher, so pass/fail behavior, failure messages and report steps are Playwright's own. Reporting works exactly like a matcher call: the step, the failure and soft failures point at your assertion line. As in Playwright, `toBeDefined()` passes for `null`; use `expectly.not.toBeNull()` or `expectly.toBeTruthy()` to reject `null` too. The optional second argument is the same custom message that `expect(value, message)` accepts.

**Soft assertions do not narrow.** `expectly.soft.toBeDefined(name)` (or one from `configure({ soft: true })`) records the failure and lets the test continue, so `name` may still be `undefined` afterwards and keeps its original type.

**Your own expect: wrap it with `withReturn()` and annotate it with `WithReturn<typeof …>`.** TypeScript only narrows through an expect whose type is written out (error TS2775: "Assertions require every name in the call target to be declared with an explicit type annotation"). `expectly` already has one. `WithReturn<typeof yourExpect>` is that annotation for any expect, so you never list matcher types, whether you merge the fuzzy package, your own matchers, or anything else:

```typescript
// tests/support/expect.ts
import { expectly, withReturn } from "@cerios/playwright-expectly";
import type { WithReturn } from "@cerios/playwright-expectly";
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";
import { expect as baseExpect, mergeExpects, test as base } from "@playwright/test";

const myExpect = baseExpect.extend({
	toBeEven(received: number) {
		return { pass: received % 2 === 0, message: () => `expected ${received} to be even` };
	},
});

const merged = mergeExpects(baseExpect, expectly, expectlyFuzzy, myExpect);
export const expect: WithReturn<typeof merged> = withReturn(merged);
export const test = base;
```

```typescript
import { expect, test } from "./support/expect";

test("narrowing with all matchers", async () => {
	const order: Order | undefined = await findOrder(id);
	expect.toBeDefined(order); // order: Order
	expect(order.total).toBeEven();
	expect(order.label).toMatchFuzzy("express delivery");
});
```

Apply `withReturn()` last, to the final expect: `mergeExpects()` and Playwright's own `extend()` return a plain Playwright expect. `.soft`, `.configure()` and `.extend()` on the wrapped expect keep the assertions and the right types.

## Returning values from retrying assertions

`expectly.pollAndReturn()` returns the value that satisfied the matcher. `expectly(callback).toPassAndReturn()` returns the result of the first callback attempt that completes without throwing. Both support synchronous and asynchronous callbacks without calling them again after success.

```typescript
import { expectly } from "@cerios/playwright-expectly";

const order = await expectly
	.pollAndReturn(() => fetchOrder(), { timeout: 5_000, intervals: [100, 250] })
	.toMatchObject({ status: "COMPLETED" });

const readyOrder = await expectly(async () => {
	const current = await fetchOrder();
	expectly(current.status).toBe("COMPLETED");
	return current;
}).toPassAndReturn({ timeout: 5_000, intervals: [100, 250] });
```

Here, `fetchOrder()` is your application helper. Polling supports `.not` and registered custom matchers. Retry options and custom messages follow the corresponding Playwright APIs; `toPassAndReturn()` uses native `toPass()` timeout behavior, so provide an explicit timeout when you need a bound.

For your own configured or extended expect instance, apply `withReturn()` after composing matcher sources:

```typescript
import { expectlyMatchers, withReturn } from "@cerios/playwright-expectly";
import { expect as baseExpect } from "@playwright/test";

export const expect = withReturn(baseExpect.extend(expectlyMatchers));
const uuid = await expect.pollAndReturn(() => fetchUuid()).toBeUUID(4);
```

Subsequent `.soft`, `.configure()` and `.extend()` calls preserve the return-aware methods and custom matcher types. When using `mergeExpects()`, wrap its result with `withReturn()`.

**Failure behavior:** by default, return-aware assertions throw on failure, like other Playwright assertions.

**Soft assertions:** use `.soft` or `.configure({ soft: true })`. A failure is then recorded and the test continues, as with native soft assertions. Because the assertion did not pass, the result may not be a passing value:

- `toPassAndReturn()` resolves with `undefined`, because no attempt succeeded.
- `pollAndReturn()` resolves with the last polled value, which did not satisfy the matcher. It resolves with `undefined` if the callback never returned a value.

```typescript
const order = await expectly.soft.pollAndReturn(() => fetchOrder()).toMatchObject({ status: "COMPLETED" });
const readyOrder = await expectly.soft(() => fetchReadyOrder()).toPassAndReturn({ timeout: 5_000 });
// Both are typed `Order | undefined`; the test is already marked as failed when a check did not pass.
```

Soft return types are `T | undefined`. TypeScript can only track this when the soft flag is set on the wrapped instance (`expectly.soft`, `withReturn(expect).configure({ soft: true })`). `withReturn(expect.configure({ soft: true }))` behaves the same at runtime, but its types still say `T`.

Regular assertions retain their configured behavior. Inside `toPassAndReturn()` callbacks, use throwing assertions for conditions that must trigger retries; soft assertions do not throw.

**Failure locations:** return-aware assertions appear as boxed Playwright steps. The assertion step and reported failure point to the line where your test invokes the matcher, including detached matcher calls. Native retry steps remain nested underneath for diagnostics and may show internal implementation locations when expanded. Caught errors also point to the invocation while retaining their original message, matcher details, and cause. Regular assertions keep their native reporting.

Ordinary Expectly matchers also report thrown validation and locator API errors at your assertion call site. Their original error type, message, cause, and metadata are preserved. Expanded native equality, polling, and browser API steps can still show implementation locations.

### Edge-case behavior

- Object uniqueness compares current values using Node's deep strict equality, including Dates, Maps, Sets, bigint, and cycles. There is no cache across assertions. Property order does not matter; prototypes and explicit `undefined` properties do. This comparison can take quadratic time for large arrays.
- Regex assertions test from index zero without modifying the supplied expression's `lastIndex`, including global and sticky expressions.
- Partial matching supports shared references but rejects circular plain objects and arrays in either input with a clear error, including under `.not`.
- Numeric comparisons reject `NaN` and infinities. Sum, average, median and range tolerate the rounding error of the whole computation, which grows with the number of values and their magnitude, so `[0.01, 2.03, 1.2]` sums to `3.24`; pass `{ tolerance }` for an explicit absolute bound. Empty arrays have no average or median and never match.
- Consecutive months compare calendar months, independent of the day of month. ISO validation rejects impossible calendar dates such as `2026-02-30`; see the [date matchers](../../docs/DATE_MATCHERS.md) for the accepted formats.
- A `pollAndReturn()` assertion object can be reused or invoked concurrently; each matcher invocation captures its own successful value.

CI tests packaged libraries against the minimum supported Playwright version, 1.40, as well as the project's current version. The minimum-version declaration check uses TypeScript 5.9 because TypeScript 7 rejects legacy syntax in Playwright 1.40's own declarations.
