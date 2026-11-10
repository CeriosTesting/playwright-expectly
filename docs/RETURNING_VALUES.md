# Returning Values from Retrying Assertions

Playwright's `expect.poll()` and `expect(callback).toPass()` retry until an assertion passes, but they don't give you the value that made it pass. Expectly adds two return-aware variants:

- `expectly.pollAndReturn(callback).<matcher>()` resolves with the polled value that satisfied the matcher.
- `expectly(callback).toPassAndReturn()` resolves with the result of the first callback attempt that completed without throwing.

Both accept synchronous and asynchronous callbacks, and neither calls the callback again after it succeeds.

## Contents

- [pollAndReturn()](#pollandreturn)
- [toPassAndReturn()](#topassandreturn)
- [Your own expect: withReturn()](#your-own-expect-withreturn)
- [Failure behavior](#failure-behavior)
- [Soft assertions](#soft-assertions)
- [Failure locations](#failure-locations)
- [Types](#types)

## pollAndReturn()

```typescript
import { expectly } from "@cerios/playwright-expectly";

const order = await expectly
	.pollAndReturn(() => fetchOrder(), { timeout: 5_000, intervals: [100, 250] })
	.toMatchObject({ status: "COMPLETED" });
// `order` is the value that matched.
```

`fetchOrder()` is your own application helper. The second argument takes the same options as `expect.poll()`: `message`, `timeout` and `intervals`.

Any matcher on the expect instance works after `pollAndReturn()`, including Expectly matchers, your own registered matchers and `.not`:

```typescript
const uuid = await expectly.pollAndReturn(() => fetchUuid()).toBeUUID(4);
const status = await expectly.pollAndReturn(() => fetchStatus()).not.toBe("PENDING");
```

A `pollAndReturn()` assertion object can be reused or invoked concurrently; each matcher invocation captures its own successful value.

## toPassAndReturn()

```typescript
const readyOrder = await expectly(async () => {
	const current = await fetchOrder();
	expectly(current.status).toBe("COMPLETED");
	return current;
}).toPassAndReturn({ timeout: 5_000, intervals: [100, 250] });
```

The options are those of Playwright's `toPass()`: `timeout` and `intervals`. `toPassAndReturn()` uses the native `toPass()` timeout behavior, so provide an explicit timeout when you need a bound.

Inside the callback, use throwing assertions for conditions that must trigger a retry. Soft assertions don't throw, so they don't cause a retry.

## Your own expect: withReturn()

`expectly` already has both methods. To add them to your own configured or extended expect instance, wrap it with `withReturn()` after composing your matcher sources:

```typescript
// tests/support/expect.ts
import { expectlyMatchers, withReturn } from "@cerios/playwright-expectly";
import { expect as baseExpect, test as base } from "@playwright/test";

export const expect = withReturn(baseExpect.extend(expectlyMatchers));
export const test = base;
```

When you combine sources with `mergeExpects()`, wrap its result:

```typescript
export const expect = withReturn(mergeExpects(baseExpect, expectlyExpect, fuzzyExpect));
```

Later `.soft`, `.configure()` and `.extend()` calls on the wrapped instance keep the return-aware methods and your custom matcher types.

## Failure behavior

By default, return-aware assertions throw on failure, like other Playwright assertions. Retry options and custom messages follow the corresponding Playwright APIs.

## Soft assertions

Use `.soft` or `.configure({ soft: true })`. A failure is then recorded and the test continues, as with native soft assertions. Because the assertion did not pass, the result may not be a passing value:

- `toPassAndReturn()` resolves with `undefined`, because no attempt succeeded.
- `pollAndReturn()` resolves with the last polled value, which did not satisfy the matcher, or with `undefined` if the callback never returned a value.

```typescript
const order = await expectly.soft.pollAndReturn(() => fetchOrder()).toMatchObject({ status: "COMPLETED" });
const readyOrder = await expectly.soft(() => fetchReadyOrder()).toPassAndReturn({ timeout: 5_000 });
// Both are typed `Order | undefined`; the test is already marked as failed when a check did not pass.
```

Regular assertions keep their configured behavior.

## Failure locations

Return-aware assertions appear as boxed Playwright steps. The assertion step and the reported failure point to the line where your test invokes the matcher, including detached matcher calls. Native retry steps stay nested underneath for diagnostics and may show internal implementation locations when expanded. Caught errors also point to the invocation and keep their original message, matcher details and cause.

## Types

Soft return types are `T | undefined`. TypeScript can only track this when the soft flag is set on the wrapped instance:

| Expression                                     | Runtime | Result type       |
| ---------------------------------------------- | ------- | ----------------- |
| `expectly.soft` / `withReturn(expect).soft`    | soft    | `T \| undefined`  |
| `withReturn(expect).configure({ soft: true })` | soft    | `T \| undefined`  |
| `withReturn(expect.configure({ soft: true }))` | soft    | `T` (not tracked) |
| `expectly` / `withReturn(expect)`              | throws  | `T`               |

Exported types: `ExpectWithReturn`, `PollAndReturnMatchers`, `PollAndReturnOptions`, `ToPassAndReturnMatchers`, `ToPassAndReturnOptions`.

## Related

- [Checking for Duplicate Matcher Names](./CHECK_MATCHERS.md) - Verify the expect you wrap with `withReturn()`
- [Generic Matchers](./GENERIC_MATCHERS.md) - `toEqualPartially()` for matching polled objects

[← Back to README](../README.md)
