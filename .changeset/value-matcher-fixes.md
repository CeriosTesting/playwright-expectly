---
"@cerios/playwright-expectly": major
---

Fix value, array and partial-matching edge cases.

- **Floating-point tolerance:**
  - `toHaveSum`, `toHaveAverage`, `toHaveMedian` and `toHaveRange` tolerate the rounding error of the whole computation, so `[0.01, 2.03, 1.2]` sums to `3.24` and a hundred `0.1`s sum to `10`.
  - Pass `{ tolerance }` for an explicit absolute bound.
- **Empty arrays:** `toHaveAverage([])` and `toHaveMedian([])` never match (they used to equal 0), consistent with `toHaveMin` and `toHaveMax`.
- **`toEqualPartially`:**
  - Matches class instances, objects with a custom prototype and errors by the expected fields, including getters, instead of comparing them whole.
  - Symbol keys are matched.
  - `Object.prototype` members such as `toString` no longer count as present keys.
- **Sorting objects by a property:**
  - `toHaveObjectsInAscendingOrderBy` / `toHaveObjectsInDescendingOrderBy` throw for values that cannot be ordered (NaN, Invalid Date, objects) instead of passing.
  - Dates are compared by time, and inherited properties and getters are supported.
- **String ordering:** string-array ordering matchers accept `{ numeric, locale }` for natural and locale-aware order. The combined `expectly` dispatches order matchers on the element type, so number arrays print numbers in messages.
- **Wrong receivers:** array and string matchers throw a clear `TypeError` (for example `toHaveSum: received value must be a number array, got: number`) instead of an internal error. Objects that merely have an `innerText` property are no longer treated as locators.
- **Smaller fixes:**
  - `toBeAllBetween` throws when `min` is greater than `max`.
  - `toBeInteger` accepts BigInt.
  - The docs for `toBeObject`, `toHaveUniqueValues` and `toHaveOnlyUniqueObjects` describe the actual equality rules.
