# @cerios/playwright-expectly

## 1.4.0

### Minor Changes

- a0a7486: Fix GitHub issue #41 (`setupExpectly()` in `playwright.config.ts` does not enable Date-based `toBeCloseTo` on native Playwright `expect`).

  Playwright's `expect.extend()` only mutates the _original_ `expect` object in place for matcher names that don't collide with a Playwright built-in; `toBeCloseTo` collides with Playwright's own built-in numeric matcher, so `setupExpectly()`/`setupExpectlyFuzzy()` (which discard the return value of `.extend()`) could never make the Date `toBeCloseTo` matcher work, regardless of where they were called. This is not fixable inside those functions — the correct pattern is capturing the return value yourself, e.g. `export const expect = baseExpect.extend(expectlyMatchers)`.

  - `setupExpectly()` and `setupExpectlyFuzzy()` are now **deprecated** (not removed) — they remain fully backward compatible and continue to work for every matcher that doesn't collide with a Playwright built-in, but their JSDoc now explains the real limitation and recommends building your own `tests/support/expect.ts` instead.
  - Documentation across the root README, package READMEs, and `docs/FUZZY_MATCHERS.md` now leads with a `tests/support/expect.ts` pattern — extending Playwright's `expect` yourself via `.extend()` (capturing the return value) or `mergeExpects()` — instead of `setupExpectly()`/`setupExpectlyFuzzy()`.
  - `@cerios/playwright-expectly-fuzzy` internals were realigned with `@cerios/playwright-expectly`'s structure: `expectlyFuzzyMatchers`/`expectlyFuzzy` now live in a single canonical `src/expectly-fuzzy.ts` module (previously duplicated between `index.ts` and `playwright-setup.ts`).
  - Added `README.md` for `@cerios/playwright-expectly` and `@cerios/playwright-expectly-core` (previously missing).

### Patch Changes

- Updated dependencies [a0a7486]
  - @cerios/playwright-expectly-core@1.0.0

## 1.3.5

### Patch Changes

- 2496788: Move the shared negated-aware polling helper into core and fix locator and fuzzy locator `.not` matchers so passing negated assertions stop as soon as the negated condition is met instead of waiting for the full poll timeout.
- 17295ec: Improve matcher setup reliability and refresh the docs around worker-side Playwright setup.

  For `@cerios/playwright-expectly`, `toEqualPartially()` now has clearer array mismatch output, supports configurable array modes, validates matcher options at runtime, and tolerates repeated `setupExpectly()` calls safely.

  For `@cerios/playwright-expectly-fuzzy`, `setupExpectlyFuzzy()` can now be called repeatedly without re-registering matchers, and the docs now explain that worker-side shared fixtures are the reliable way to register fuzzy matchers across Playwright workers.

- de1d5ef: Fix running integration test in CI and generating reports for all tests.
- Updated dependencies [2496788]
  - @cerios/playwright-expectly-core@0.1.1

## 1.3.4

### Patch Changes

- a39a55d: Update documentation

## 1.3.3

### Patch Changes

- 95e2bb8: Refactored internals to use the new `@cerios/playwright-expectly-core` shared utilities package. No changes to the public API.

  ## New packages

  ### `@cerios/playwright-expectly-core` (`0.1.0`)

  New shared utilities package extracted from the core library. Provides `withMatcherState` and `PollOptions` for building custom matchers.

  ### `@cerios/playwright-expectly-fuzzy` (`0.1.0`)

  New optional package for fuzzy string matching using [fuzzball](https://www.npmjs.com/package/fuzzball)'s `token_sort_ratio` algorithm. Ideal for validating AI-generated text where wording or word order may vary.

  **`toMatchFuzzy(expected, threshold?)`**

  - Works on both strings and Playwright locators
  - Word-order-insensitive: `"hello world"` and `"world hello"` score 100
  - Scores range from 0–100; assertion passes when score ≥ threshold
  - Default threshold: 80
  - Error messages include the computed similarity score and threshold for easy debugging

  ```bash
  npm install @cerios/playwright-expectly-fuzzy --save-dev
  ```

- 1dbbb85: **Migrate build tooling from tsup to tsdown and improve matcher type inference**

  - Replaced `tsup` with `tsdown` as the build tool for all three packages (`playwright-expectly`, `playwright-expectly-core`, `playwright-expectly-fuzzy`)
  - Added explicit type assertions on `expectlyMatchers` and `expectlyLocatorMatchers` spread objects so TypeScript correctly infers the full union of all matcher method signatures, improving IntelliSense across all matcher groups

- Updated dependencies [95e2bb8]
- Updated dependencies [1dbbb85]
  - @cerios/playwright-expectly-core@0.1.0
