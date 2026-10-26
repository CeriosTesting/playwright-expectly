# @cerios/playwright-expectly-core

## 1.1.0

### Minor Changes

- 3f88bd6: Locator matchers now resolve elements the way Playwright's own assertions do.

  - **Timeouts:** each locator action receives the remaining assertion time, so a short `actionTimeout` no longer cuts a longer `{ timeout }` or expect timeout short.
  - **Missing elements:** a missing element no longer blocks inside a Playwright action. Polling continues until it appears; if it never does, both the assertion and its `.not` form fail with `element(s) not found`, as `expect(locator).not.toHaveAttribute()` does. Previously the `.not` form failed after the full timeout with a misleading `Received: null`.
  - **Errors:** strict mode violations and other non-timeout errors are thrown at once instead of being retried or turned into a failed assertion.
  - **Positioning matchers** (`toBeAbove`, `toBeBelow`, `toBeLeftOf`, `toBeRightOf`):
    - A hidden element (no bounding box) is reported as such, and its `.not` form no longer passes without comparing anything.
    - Edges within 0.5px count as touching.
    - Messages print real edge values.
  - **`toBeStable`:**
    - `timeout: 0` means no timeout, as in Playwright.
    - The default stability window shrinks to fit a short expect timeout.
    - The deadline is checked after every sleep.
    - Strict mode violations are thrown.
    - A missing element fails the `.not` form too.
  - **Smaller fixes:**
    - `toHaveDirectText` normalizes whitespace in the expected text as it does in the element text.
    - `toHaveDataAttribute` prints regex expectations correctly.
    - `toHaveCountVisible` rejects negative or fractional counts.
  - **Fuzzy matching:**
    - `toMatchFuzzy` preprocesses with Unicode-aware rules: NFC normalization, non-ASCII letters kept, punctuation and whitespace as separators.
    - Text that is equal after preprocessing (including two empty strings) scores 100.
    - A new `{ caseSensitive: true }` option compares letter case.
    - Non-string receivers get a clear error.
  - **Validators:**
    - `toBeUUID` accepts RFC 9562 versions 1–8 and the nil and max UUIDs.
    - `toBeValidUrl` requires an `http`/`https` URL with `//` and a valid host by default (`{ protocols }` accepts other schemes), so `localhost:3000`, `C:\Windows` and `javascript:` URLs are no longer valid.
    - `toBeValidEmail` rejects leading, trailing and consecutive dots and hyphen-edged domain labels.
    - Case and title-case checks are Unicode-aware and keep inner capitals such as `McDonald` and `Jean-Luc`.
    - `toBeAlphanumeric` takes `{ unicode: true }`.
    - `toMatchPattern` throws for a non-RegExp pattern instead of matching everything.
  - **Stack traces:** stack frame filtering is anchored to the package and workspace folders, so user code in a folder named `playwright-expectly/src` keeps its frames.
  - **Wrong receivers:** locator-only matchers called on something other than a Locator throw a clear `TypeError` instead of an internal error.
  - **New core exports:** `pollLocators` and `locatorNotFoundMessage` for custom locator matchers.

### Patch Changes

- 1b21746: Report thrown matcher validation errors and locator API errors at the user's assertion call site. Preserve synchronous behavior, asynchronous rejections, error identity, messages, causes, and metadata. Nested native assertion and browser API steps remain available for diagnostics.
- 1b21746: Fix stale object-uniqueness results after mutation and compare rich values using deep strict equality. Make regex assertions independent of `lastIndex`, isolate concurrent return-aware polling assertions, fix consecutive-month checks at month ends, and reject impossible ISO dates.

  Reject cyclic partial-matching inputs with an explicit error while allowing shared acyclic references. Numeric comparisons reject non-finite values; sum, average and median use a magnitude-aware floating-point tolerance.

  Defer matcher stack formatting and partial-match diagnostic scoring until needed, dispose visibility-check handles, and reduce generated declarations with explicit expect types. Derive matcher return types from the public extension API to support Playwright 1.40 declarations, and add packaged-consumer compatibility checks in CI.

## 1.0.1

### Patch Changes

- 0b4b966: Raise the minimum supported Playwright version to `1.63.0` across all packages and update the development toolchain dependencies.

## 1.0.0

### Major Changes

- a0a7486: Fix GitHub issue #41 (`setupExpectly()` in `playwright.config.ts` does not enable Date-based `toBeCloseTo` on native Playwright `expect`).

  Playwright's `expect.extend()` only mutates the _original_ `expect` object in place for matcher names that don't collide with a Playwright built-in; `toBeCloseTo` collides with Playwright's own built-in numeric matcher, so `setupExpectly()`/`setupExpectlyFuzzy()` (which discard the return value of `.extend()`) could never make the Date `toBeCloseTo` matcher work, regardless of where they were called. This is not fixable inside those functions — the correct pattern is capturing the return value yourself, e.g. `export const expect = baseExpect.extend(expectlyMatchers)`.

  - `setupExpectly()` and `setupExpectlyFuzzy()` are now **deprecated** (not removed) — they remain fully backward compatible and continue to work for every matcher that doesn't collide with a Playwright built-in, but their JSDoc now explains the real limitation and recommends building your own `tests/support/expect.ts` instead.
  - Documentation across the root README, package READMEs, and `docs/FUZZY_MATCHERS.md` now leads with a `tests/support/expect.ts` pattern — extending Playwright's `expect` yourself via `.extend()` (capturing the return value) or `mergeExpects()` — instead of `setupExpectly()`/`setupExpectlyFuzzy()`.
  - `@cerios/playwright-expectly-fuzzy` internals were realigned with `@cerios/playwright-expectly`'s structure: `expectlyFuzzyMatchers`/`expectlyFuzzy` now live in a single canonical `src/expectly-fuzzy.ts` module (previously duplicated between `index.ts` and `playwright-setup.ts`).
  - Added `README.md` for `@cerios/playwright-expectly` and `@cerios/playwright-expectly-core` (previously missing).

## 0.1.1

### Patch Changes

- 2496788: Move the shared negated-aware polling helper into core and fix locator and fuzzy locator `.not` matchers so passing negated assertions stop as soon as the negated condition is met instead of waiting for the full poll timeout.

## 0.1.0

### Minor Changes

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

### Patch Changes

- 1dbbb85: **Migrate build tooling from tsup to tsdown and improve matcher type inference**
  - Replaced `tsup` with `tsdown` as the build tool for all three packages (`playwright-expectly`, `playwright-expectly-core`, `playwright-expectly-fuzzy`)
  - Added explicit type assertions on `expectlyMatchers` and `expectlyLocatorMatchers` spread objects so TypeScript correctly infers the full union of all matcher method signatures, improving IntelliSense across all matcher groups
