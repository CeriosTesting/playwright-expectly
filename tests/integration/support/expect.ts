import { expectlyMatchers } from "@cerios/playwright-expectly";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";
import { expect as baseExpect, mergeExpects, test } from "@playwright/test";

/**
 * Canonical multi-package example: a single `tests/support` module that combines matchers
 * from `@cerios/playwright-expectly` and `@cerios/playwright-expectly-fuzzy` via `mergeExpects`.
 * Every test file in this project imports `test`/`expect` from here — never directly from
 * `@playwright/test` or the individual expectly packages.
 *
 * Each matcher set is first applied via `baseExpect.extend()`, capturing the return value, then
 * combined with `mergeExpects()` — never call `.extend()` and discard its return value.
 */
const expectlyExpect = baseExpect.extend(expectlyMatchers);
const fuzzyExpect = baseExpect.extend(expectlyFuzzyMatchers);

export const expect = mergeExpects(baseExpect, expectlyExpect, fuzzyExpect);
export { test };
