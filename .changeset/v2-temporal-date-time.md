---
"@cerios/playwright-expectly": major
---

Rebuild the date matchers on Temporal: one type-safe Date/DateTime API for `Date`, strict ISO 8601 strings and Temporal values (native or polyfilled), with nanosecond precision and explicit time-zone handling. See [docs/DATE_MATCHERS.md](../docs/DATE_MATCHERS.md).

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
