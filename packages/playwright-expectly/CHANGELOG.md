# @cerios/playwright-expectly

## 2.0.0

### Major Changes

- 3f88bd6: Fix date range, time zone and calendar edge cases.

  - **Range end dates:** a calendar-date end bound of `toBeBetween` and `toHaveDatesWithinRange` covers that whole day. Compared with timestamps, `"2026-10-31T12:00:00Z"` is now between `"2026-10-01"` and `"2026-10-31"` (`{ timeZone: "UTC" }`); the range ends where the next day starts.
  - **Inverted ranges:** `toHaveDatesWithinRange` throws when the start is after the end, like `toBeBetween`.
  - **Conflicting zones:** calendar and time-of-day matchers throw when values carry different zones (or, without zones, different offsets) instead of using the first value's zone, so the result no longer depends on argument order. Chronology matchers still compare instants across zones.
  - **Ignored `timeZone` options:** a `timeZone` option that cannot apply (all values local) throws instead of being ignored. Invalid zones are rejected even when every value is an absolute timestamp.
  - **Today, yesterday, tomorrow:** `toBeToday`, `toBeYesterday` and `toBeTomorrow` compare a local value with today in the zone that `now` spells out, and failure messages always name the zone used.
  - **Months:** `toBeInMonth` rejects month numbers and codes that the calendar does not have, such as `"M13"` in ISO, `13` in Islamic or Persian calendars, and leap codes outside Hebrew, Chinese and Korean calendars. Single-digit codes such as `"M5"` get a clear error, and the `MonthCode` type requires two digits.
  - **Messages:** `toHaveMaximumDateGap` prints an unsigned gap for descending pairs.
  - **Stricter inputs:**
    - Duration ranges reject objects that mix `{ min, max }` with duration units.
    - Duration strings must be strict ISO 8601 (uppercase designators, fractions only on seconds).
    - The `relativeTo` type is narrowed to the values it accepts (`RelativeToInput`).
  - **Tests:** the date specs no longer depend on the machine time zone, and CI also runs them in America/New_York and Pacific/Kiritimati.

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

- 1b21746: **Breaking:** rename the Date matcher `toBeCloseTo` to `toBeDateCloseTo`, and remove the deprecated `setupExpectly()` / `setupExpectlyFuzzy()`.

  - **`toBeCloseTo` → `toBeDateCloseTo`** (`@cerios/playwright-expectly`). The Date matcher was registered under the same name as Playwright's built-in numeric `toBeCloseTo`, so every `expect` extended with `expectlyMatchers` (including `mergeExpects()` compositions and the standalone `expectly`) lost numeric support: `expect(0.1 + 0.2).toBeCloseTo(0.3, 5)` threw `Invalid actual date`, while TypeScript still accepted the call. The Date matcher now has its own name, and Playwright's numeric `toBeCloseTo` keeps working unchanged next to it.

    ```typescript
    // Before
    expect(responseDate).toBeCloseTo(expectedDate, { seconds: 30 });

    // After
    expect(responseDate).toBeDateCloseTo(expectedDate, { seconds: 30 });
    ```

  - **`setupExpectly()` and `setupExpectlyFuzzy()` are removed.** Both were deprecated in 1.x. Extend Playwright's `expect` yourself and capture the return value, e.g. in `tests/support/expect.ts`:

    ```typescript
    import { expectlyMatchers } from "@cerios/playwright-expectly";
    import { expect as baseExpect, test } from "@playwright/test";

    export const expect = baseExpect.extend(expectlyMatchers);
    export { test };
    ```

- 3f88bd6: Rebuild the date matchers on Temporal: one type-safe Date/DateTime API for `Date`, strict ISO 8601 strings and Temporal values (native or polyfilled), with nanosecond precision and explicit time-zone handling. See [docs/DATE_MATCHERS.md](../docs/DATE_MATCHERS.md).

  **New**

  - Every date matcher accepts `Date`, ISO strings (`2026-10-25`, `2026-10-25T14:30:00`, `…Z`, `…+01:00`, `…[Europe/Amsterdam]`) and `Temporal.Instant`, `ZonedDateTime`, `PlainDateTime`, `PlainDate` and `PlainTime` values from any implementation. Calendar and time-of-day matchers take a `timeZone` option. Matchers relative to now take a `now` option.
  - New matchers:
    - `toBeSameInstant`
    - `toBeSameHour`, `toBeSameMinute`, `toBeSameSecond`
    - `toBeWithinLast`, `toBeWithinNext`
    - `toBeWithinDurationAfter`
    - `toBeWithinTimeOfDay`
    - `toBeTruncatedTo`
    - `toHaveTimeZone`, `toHaveOffset`
    - `toBeValidISODateTime`
    - `toBeAtStartOfDay`, `toBeAtEndOfDay`
    - `toBeSameTimeOfDay`
    - `toHaveMaximumDateGap`
    - `toBeShorterThan`, `toBeLongerThan`, `toBeDurationBetween`
  - ISO template literal types: `ISODateString`, `ISOTimeString`, `ISOLocalDateTimeString`, `ISOInstantString`, `ISOZonedDateTimeString`, `ISODateTimeString`, `SupportedISOString`.
  - Runtime-validated branded types (`ValidatedISODate`, `ValidatedISOInstant`, …), returned by the literal-aware `parseISODate`, `parseISOTime`, `parseISOLocalDateTime`, `parseISODateTime`, `parseISOInstant` and `parseISOZonedDateTime`, and narrowed by the `isISO*` type guards.
  - Public input types: `DateInput`, `DateTimeInput`, `InstantInput`, `TimeInput`, `DurationInput`, plus structural `Temporal*Like` types that work without TypeScript's `esnext.temporal` lib.
  - Non-ISO calendars: Temporal values in any calendar (`hebrew`, `islamic-umalqura`, `persian`, `japanese`, …) are accepted. Matchers that read years or months (`toBeSameMonth`, `toBeSameYear`, `toBeLeapYear`, `toBeInMonth`, `toBeInQuarter`, `toBeStartOfMonth`, `toBeEndOfMonth`, `toHaveConsecutiveDates`, `toHaveDateRange`, `toHaveDateGapsLargerThan`, `toHaveMaximumDateGap`) take a `calendar` option. It defaults to the values' own calendar, else ISO 8601. `toBeInMonth` also accepts month codes such as `"M05L"`.
  - "Now" honours fake timers through `Date.now()` and gains sub-millisecond precision from native `Temporal.Now` when both clocks agree.
  - Adds a runtime dependency on `temporal-polyfill` (its `full` build, which includes the non-ISO calendars). A global Temporal that implements the current specification is preferred, and `globalThis` is never modified.

  **Breaking**

  - `toBeValidISODate()` validates calendar dates (`YYYY-MM-DD`). Use `toBeValidISODateTime()` for datetimes.
  - `toMatchTimeZone()` is removed. It reported the machine's offset rather than the value's. Use `toHaveOffset()` or `toHaveTimeZone()`.
  - `toHaveDateRange()` is exact and calendar-aware: months and years are no longer approximated, and the ±1 day tolerance is removed.
  - `toHaveDateGapsLargerThan()` measures months and years with calendar arithmetic.
  - `toHaveUniqueDates(ignoreTime)` becomes `toHaveUniqueDates({ ignoreTime, timeZone })`.
  - Duration objects (deviations, ranges, gaps) must use integer units, and unknown units are rejected. Elapsed-time matchers reject years, months and weeks.
  - Comparing local values with absolute timestamps requires a `timeZone` option. Nonexistent or repeated DST local times throw instead of being guessed.
  - Calendar matchers use calendar-day arithmetic, so `toBeYesterday()` and `toBeTomorrow()` are correct across DST changes.
  - `toBeBetween()` throws when the start is after the end.
  - Failure messages use a shared, aligned layout, and durations are shown in human-readable units.

- 3f88bd6: Fix value, array and partial-matching edge cases.

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

### Minor Changes

- 3f88bd6: Add matchers that Playwright users frequently ask for.

  - **Locator count ranges** (retrying, with `{ visible: true }` to count only visible elements):
    - `toHaveCountGreaterThan`, `toHaveCountGreaterThanOrEqual`
    - `toHaveCountLessThan`, `toHaveCountLessThanOrEqual`
    - `toHaveCountBetween`
  - **Sorted locator texts:** `toHaveTextsInAscendingOrder` and `toHaveTextsInDescendingOrder` check a table column or list after a sort click, with `numeric`, `locale`, `ignoreCase`, `strict`, `parse` (for example prices) and `useInnerText` options.
  - **Multiple styles:** `toHaveStyles({ ... })` checks several computed CSS properties at once, including custom properties and `::before`/`::after`.
  - **Page and context state:** `toHaveCookie(name, value?, { domain, path })` on a `Page` or `BrowserContext`, and `toHaveLocalStorageItem` / `toHaveSessionStorageItem` on a `Page`. All retry until they match.
  - **Value matchers known from jest-extended:**
    - `toSatisfy`, `toSatisfyAll`, `toSatisfyAny`
    - `toIncludeSameMembers`, `toIncludeAllMembers`, `toIncludeAnyMembers`
    - `toContainKey`, `toContainKeys`, `toContainAllKeys`, `toContainEntry`, `toContainEntries`, `toBeEmptyObject`
    - `toEqualCaseInsensitive`, `toEqualIgnoringWhitespace`, `toBeHexadecimal`
    - `toBeEven`, `toBeOdd`, `toBeFinite`
    - `toResolve`, `toReject`, `toThrowWithMessage`
  - **New exports:** `expectlyLocatorCount`, `expectlyLocatorOrder`, `expectlyPage`, `expectlyCollection` and `expectlyFunction`, with their option types.
  - **Declarations:** `expectly` is now declared as `ExpectWithReturn<typeof expectlyMatchers>`, and the declaration bundle never inlines Playwright's own types, so the published types work with every supported Playwright version and with strict package managers.

- 1b21746: Add `pollAndReturn()` and `toPassAndReturn()` to `expectly`, preserving native Playwright retry semantics while returning the value from the successful attempt. Export `withReturn()` for user-created expect instances.

  Return-aware assertions reject on failure even when configured as soft. Their boxed report steps and failure stacks point to the user's matcher invocation, with native retry details nested underneath.

### Patch Changes

- 1b21746: Report thrown matcher validation errors and locator API errors at the user's assertion call site. Preserve synchronous behavior, asynchronous rejections, error identity, messages, causes, and metadata. Nested native assertion and browser API steps remain available for diagnostics.
- 1b21746: Fix stale object-uniqueness results after mutation and compare rich values using deep strict equality. Make regex assertions independent of `lastIndex`, isolate concurrent return-aware polling assertions, fix consecutive-month checks at month ends, and reject impossible ISO dates.

  Reject cyclic partial-matching inputs with an explicit error while allowing shared acyclic references. Numeric comparisons reject non-finite values; sum, average and median use a magnitude-aware floating-point tolerance.

  Defer matcher stack formatting and partial-match diagnostic scoring until needed, dispose visibility-check handles, and reduce generated declarations with explicit expect types. Derive matcher return types from the public extension API to support Playwright 1.40 declarations, and add packaged-consumer compatibility checks in CI.

- Updated dependencies [1b21746]
- Updated dependencies [3f88bd6]
- Updated dependencies [1b21746]
  - @cerios/playwright-expectly-core@1.1.0

## 1.4.1

### Patch Changes

- 0b4b966: Raise the minimum supported Playwright version to `1.63.0` across all packages and update the development toolchain dependencies.
- Updated dependencies [0b4b966]
  - @cerios/playwright-expectly-core@1.0.1

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
