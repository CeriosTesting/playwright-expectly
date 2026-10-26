# Date Matchers

Date, datetime, time-of-day and duration assertions for `Date`, strict ISO 8601 strings and [Temporal](https://tc39.es/proposal-temporal/docs/) values, with nanosecond precision and explicit time-zone handling.

```typescript
import { expectly, parseISOInstant } from "@cerios/playwright-expectly";

expectly("2026-10-25").toBeAfter("2026-10-20");
expectly(order.completedAt).toBeWithinDurationAfter(order.createdAt, { seconds: 15 });
expectly(parseISOInstant(response.createdAt)).toBeWithinLast({ minutes: 5 });
expectly(appointment.scheduledAt).toBeWithinTimeOfDay("09:00", "17:00", { timeZone: "Europe/Amsterdam" });
```

## Contents

- [Supported inputs](#supported-inputs)
- [ISO 8601 format](#iso-8601-format)
- [Type safety: template literal types, branded strings and Temporal](#type-safety)
- [Parsing functions and type guards](#parsing-functions-and-type-guards)
- [Temporal compatibility](#temporal-compatibility)
- [Time zones](#time-zones)
- [Calendars](#calendars)
- [Durations and precision](#durations-and-precision)
- Matchers
  - [Chronology](#chronology): `toBeBefore`, `toBeAfter`, `toBeBetween`, `toBeDateCloseTo`, `toBeSameInstant`
  - [Relative to now](#relative-to-now): `toBeInThePast`, `toBeInTheFuture`, `toBeWithinLast`, `toBeWithinNext`
  - [Event timing](#event-timing): `toBeWithinDurationAfter`
  - [Calendar](#calendar): `toBeSameDay`, `toBeSameMonth`, `toBeSameYear`, `toBeToday`, `toBeYesterday`, `toBeTomorrow`, `toBeWeekday`, `toBeWeekend`, `toBeLeapYear`, `toBeInQuarter`, `toBeInMonth`, `toBeSpecificDayOfWeek`, `toBeStartOfMonth`, `toBeEndOfMonth`
  - [Clock and time of day](#clock-and-time-of-day): `toBeSameHour`, `toBeSameMinute`, `toBeSameSecond`, `toBeSameTimeOfDay`, `toBeWithinTimeOfDay`, `toBeTruncatedTo`, `toBeAtStartOfDay`, `toBeAtEndOfDay`
  - [Validation, offsets and time zones](#validation-offsets-and-time-zones): `toBeValidISODate`, `toBeValidISODateTime`, `toHaveOffset`, `toHaveTimeZone`
  - [Collections](#collections): `toHaveDatesAscendingOrder`, `toHaveDatesDescendingOrder`, `toHaveDateRange`, `toHaveConsecutiveDates`, `toHaveDatesWithinRange`, `toHaveUniqueDates`, `toHaveDateGapsLargerThan`, `toHaveMaximumDateGap`
  - [Durations](#duration-matchers): `toBeShorterThan`, `toBeLongerThan`, `toBeDurationBetween`
- [Unsupported and ambiguous combinations](#unsupported-and-ambiguous-combinations)
- [Upgrading from 1.x](#upgrading-from-1x)

## Supported inputs

Every date matcher accepts the following representations. Each one is classified into exactly one kind:

| Input                                                       | Kind                      | Example                                                 |
| ----------------------------------------------------------- | ------------------------- | ------------------------------------------------------- |
| `Date`                                                      | absolute timestamp        | `new Date("2026-10-25T12:00:00Z")`                      |
| `Temporal.Instant`                                          | absolute timestamp        | `Temporal.Instant.from("2026-10-25T12:00:00Z")`         |
| ISO string with `Z` or offset                               | absolute timestamp        | `"2026-10-25T14:30:00Z"`, `"2026-10-25T14:30:00+01:00"` |
| `Temporal.ZonedDateTime` / ISO string with `[Zone]`         | zoned datetime (absolute) | `"2026-10-25T14:30:00+01:00[Europe/Amsterdam]"`         |
| `Temporal.PlainDateTime` / ISO string without offset        | local datetime            | `"2026-10-25T14:30:00"`                                 |
| `Temporal.PlainDate` / ISO date string                      | calendar date             | `"2026-10-25"`                                          |
| `Temporal.PlainTime` / ISO time string (time-of-day inputs) | time of day               | `"14:30"`, `"14:30:45.123"`                             |

The public input types are `InstantInput`, `DateTimeInput`, `DateInput` (alias `CalendarDateInput`), `TimeInput` and `DurationInput`.

Strings are never passed to `new Date()`. A date-only string is a calendar date, not midnight UTC. A local datetime has no time zone, so it is not silently placed in UTC or in the machine's zone. Invalid `Date` objects, unsupported strings, numbers and other values throw a `TypeError` that names the offending argument.

## ISO 8601 format

Expectly accepts a strict, unambiguous subset of ISO 8601 / RFC 9557:

| Part        | Accepted                                                         | Rejected                                                            |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Date        | `YYYY-MM-DD` (4-digit year)                                      | `2026/10/25`, `25-10-2026`, `20261025`, `+002026-10-25`, `2026-1-5` |
| Time of day | `HH:mm`, `HH:mm:ss`, `HH:mm:ss.f` (1–9 fraction digits)          | `24:00`, leap second `:60`, `12:00:00,5`, `12`                      |
| Datetime    | date + uppercase `T` + `HH:mm:ss[.fffffffff]` (seconds required) | space or lowercase `t`, `2026-10-25T14:30`                          |
| Offset      | `Z` or `±HH:mm`                                                  | lowercase `z`, `+0100`, `+01`, `-00:00` (unknown-offset marker)     |
| Zone        | one IANA annotation, e.g. `[Europe/Amsterdam]`, or `[±HH:mm]`    | unknown zones, `[!Zone]`, calendar annotations `[u-ca=…]`           |

Values must also exist: `2026-02-30`, `1900-02-29` and `2026-04-31T00:00:00Z` are rejected. A zoned string whose offset disagrees with its zone is rejected. A zoned string without an offset is rejected when its local time is nonexistent or repeated because of a DST transition (`2026-03-29T02:30:00[Europe/Amsterdam]`).

## Type safety

There are three levels of guarantee. Each serves a different purpose.

| Level                        | What it guarantees                                                    | When it is checked                |
| ---------------------------- | --------------------------------------------------------------------- | --------------------------------- |
| Template literal type        | The **shape** of a string literal, e.g. month `01`–`12`               | Compile time                      |
| Branded `ValidatedISO*` type | The string passed **full validation**, including calendar correctness | Runtime, then carried in the type |
| Temporal object              | A real date/time value with precise semantics                         | Construction                      |

### Template literal types

```typescript
import type {
	ISODateString,
	ISODateTimeString,
	ISOInstantString,
	ISOZonedDateTimeString,
} from "@cerios/playwright-expectly";

const date = "2026-10-25" satisfies ISODateString;
const local = "2026-10-25T14:30:00" satisfies ISODateTimeString;
const instant = "2026-10-25T14:30:00Z" satisfies ISOInstantString;
const zoned = "2026-10-25T14:30:00+01:00[Europe/Amsterdam]" satisfies ISOZonedDateTimeString;

const a = "2026-13-25" satisfies ISODateString; // ✗ invalid month
const b = "25-10-2026" satisfies ISODateString; // ✗ wrong format
const c = "2026-10-25T29:99:00" satisfies ISODateTimeString; // ✗ invalid hour
```

Available types: `ISODateString`, `ISOTimeString`, `ISOLocalDateTimeString`, `ISOInstantString`, `ISOZonedDateTimeString`, `ISODateTimeString` (local, instant or zoned) and `SupportedISOString` (date or datetime).

The types are structural only. To keep type checking fast and avoid "union type too complex" errors (TS2590), only these components are range-checked:

- month and day in dates;
- hour and minute in times;
- hour in datetimes.

Everything else, including whether the date exists (`"2026-02-30" satisfies ISODateString` compiles), is checked at runtime.

### Matcher arguments accept any string

Matchers accept plain `string` so dynamic values, such as API responses, keep working. As a consequence, **a malformed string literal passed directly to a matcher is not a compile error**. It fails at runtime with a descriptive error. This is a deliberate trade-off: Playwright's `expect.extend()` typings always add a `string`-accepting signature, so a literal-checking overload on the matcher itself could never take effect. For compile-time checks of literals, use `satisfies` or a parse function.

### Branded validated strings

`parseISO*()` functions and `isISO*()` guards return or narrow to branded types such as `ValidatedISODate` and `ValidatedISOInstant`. A branded value is still the original string at runtime, but the type proves it passed validation. The brand cannot be created any other way.

```typescript
const createdAt = parseISOInstant(apiResponse.createdAt); // ValidatedISOInstant
expectly(createdAt).toBeWithinLast({ minutes: 5 });

const value: unknown = response.createdAt;
if (isISOInstant(value)) {
	expectly(value).toBeWithinLast({ minutes: 5 });
}
```

## Parsing functions and type guards

| Parse (throws `TypeError`) | Guard (`value is …`) | Accepts                               |
| -------------------------- | -------------------- | ------------------------------------- |
| `parseISODate`             | `isISODate`          | `YYYY-MM-DD`                          |
| `parseISOTime`             | `isISOTime`          | `HH:mm[:ss[.fffffffff]]`              |
| `parseISOLocalDateTime`    | `isISOLocalDateTime` | datetime without offset or zone       |
| `parseISOInstant`          | `isISOInstant`       | datetime with `Z` or `±HH:mm`         |
| `parseISOZonedDateTime`    | `isISOZonedDateTime` | datetime with an IANA zone annotation |
| `parseISODateTime`         | `isISODateTime`      | any of the three datetime kinds       |

- **Parse functions** take a `string` and return it unchanged, so precision, offset and zone annotation are preserved. They are literal-aware: `parseISODate("2026-13-25")` is a compile error, while dynamic strings are validated at runtime. Error messages name the expected format and the reason, e.g. `"2026-02-30" is not a valid ISO date (YYYY-MM-DD): …`.
- **Guards** take `unknown` and return `false` for non-strings, `null` and `undefined`.

Parse functions, guards, `toBeValidISODate()` and `toBeValidISODateTime()` all share one validator.

## Temporal compatibility

- Expectly uses the global `Temporal` when it implements the current specification (native, or a polyfill you installed globally). Otherwise it uses its bundled [`temporal-polyfill`](https://github.com/fullcalendar/temporal-polyfill). Expectly never assigns `globalThis.Temporal`.
- Engines that ship an outdated draft (for example Node 24 with `--harmony-temporal`, which lacks `calendarId` and `timeZoneId`) are detected and not used as the implementation. Values they create are still accepted.
- Values are recognised by their `Symbol.toStringTag`, not `instanceof`. Values from native Temporal, `temporal-polyfill` and `@js-temporal/polyfill` can be mixed freely and are converted without losing nanosecond precision.
- Public types are structural (`TemporalInstantLike`, `TemporalZonedDateTimeLike`, `TemporalPlainDateLike`, `TemporalPlainDateTimeLike`, `TemporalPlainTimeLike`, `TemporalDurationLike`). They do not require TypeScript's `esnext.temporal` lib, and they accept values from any of those implementations.
- Temporal values in any calendar are accepted (see [Calendars](#calendars)). The bundled polyfill is the `full` build, so non-ISO calendars work without native Temporal.

## Time zones

**Placing an absolute timestamp on a calendar or clock** (calendar matchers, `toBeSameHour`, `toBeAtStartOfDay`, `toBeWithinTimeOfDay`, …) is always unambiguous. One zone is resolved per assertion and applied to every value:

1. the `timeZone` option, if given (`"Europe/Amsterdam"`, `"UTC"` or a fixed `"+05:30"`);
2. otherwise the zone of a `ZonedDateTime` or zoned ISO string;
3. otherwise the explicit offset of an ISO string (`Z` means UTC);
4. otherwise the machine's time zone, used for `Date` and `Temporal.Instant` (as `Date` getters do).

Values that carry different zones, or (without zones) different offsets, throw instead of letting the argument order decide: pass `{ timeZone }` to choose one. Chronology matchers compare instants and need no zone. A `timeZone` option that cannot apply (all values local) throws rather than being ignored.

For `toBeToday`, `toBeYesterday` and `toBeTomorrow`, a local value is compared with today in the zone that `now` spells out, so `{ now: "2026-10-26T00:30:00+01:00[Europe/Amsterdam]" }` means 26 October.

```typescript
expectly("2026-10-25T23:30:00Z").toBeSameDay("2026-10-25"); // UTC, from the string
expectly("2026-10-25T23:30:00Z").toBeSameDay("2026-10-26", { timeZone: "Europe/Amsterdam" });
```

**Interpreting a local value as an absolute timestamp** only happens with an explicit `timeZone`. A calendar date then means the start of that day, except as the end of a range (`toBeBetween`, `toHaveDatesWithinRange`), where it covers the whole day. Nonexistent and repeated local times around DST transitions throw instead of being guessed. Comparing a calendar date with a local datetime without `timeZone` throws.

```typescript
expectly("2026-10-25T12:00:00").toBeBefore("2026-10-25T13:00:00Z"); // ✗ throws: no time zone
expectly("2026-10-25T12:00:00").toBeBefore("2026-10-25T13:00:00Z", { timeZone: "Europe/Amsterdam" }); // ✓
```

Calendar days are never assumed to last 24 hours. In Europe/Amsterdam, 2026-10-25 has 25 hours and 2026-03-29 has 23.

## Calendars

ISO strings and `Date` values are always in the ISO 8601 calendar. Temporal values can carry any calendar Temporal supports (`hebrew`, `islamic-umalqura`, `persian`, `japanese`, `chinese`, `ethiopic`, …).

**Days are the same in every calendar.** Matchers that compare days, weekdays, instants or times of day (`toBeSameDay`, `toBeToday`, `toBeWeekday`, `toBeSpecificDayOfWeek`, chronology, time of day, ordering, uniqueness, …) accept any mix of calendars and need no option.

**Years and months differ per calendar.** These matchers read them in one calendar per assertion, resolved like the time zone:

1. the `calendar` option, if given;
2. otherwise the non-ISO calendar the Temporal values carry (values in two different non-ISO calendars throw; pass `{ calendar }`);
3. otherwise `"iso8601"`.

| Matcher                                                               | Reads                                                     |
| --------------------------------------------------------------------- | --------------------------------------------------------- |
| `toBeSameMonth`, `toBeSameYear`, `toBeLeapYear`                       | year, month code, leap year                               |
| `toBeInMonth`, `toBeInQuarter`, `toBeStartOfMonth`, `toBeEndOfMonth`  | month, day of month                                       |
| `toHaveConsecutiveDates`                                              | consecutive months and years                              |
| `toHaveDateRange`, `toHaveDateGapsLargerThan`, `toHaveMaximumDateGap` | adding years and months (weeks and smaller are unchanged) |

```typescript
// 2026-10-25 is 14 Cheshvan 5787, a Hebrew leap year with 13 months.
expectly("2026-10-25").toBeLeapYear({ calendar: "hebrew" });
expectly(Temporal.PlainDate.from("2026-10-25").withCalendar("hebrew")).toBeLeapYear(); // its own calendar
expectly("2027-02-10").toBeInMonth("M05L", { calendar: "hebrew" }); // Adar I, by month code
expectly("2027-02-10").toBeInMonth(6, { calendar: "hebrew" }); // the 6th month this year
expectly(["2027-02-08", "2027-03-10"]).toHaveDateRange({ months: 1 }, { calendar: "hebrew" }); // 1 Adar I → 1 Adar II
```

- `toBeInMonth` takes a month number in that calendar (`1`–`12`, or `13` in Hebrew, Chinese, Korean, Coptic and Ethiopic calendars), a two-digit month code (`"M01"` … `"M12"`, `"M13"` in Coptic and Ethiopic, `"M05L"` for the Hebrew leap month) or, for Gregorian-based calendars (`iso8601`, `gregory`, `japanese`, `buddhist`, `roc`), an English month name. Month numbers and codes the calendar does not have throw, so `.not` cannot pass vacuously. Month numbers shift in leap years; month codes do not.
- `toBeInQuarter` throws for years without 12 months (Hebrew leap years, Ethiopic, Coptic).
- Duration matchers add calendar units in the calendar of `relativeTo`.
- ISO strings with a calendar annotation (`[u-ca=hebrew]`) are still rejected; use a Temporal value or the `calendar` option.

## Durations and precision

Durations are given as an object (`{ minutes: 5 }`), a `Temporal.Duration` or an ISO 8601 duration string (`"PT5M"`; uppercase designators, fractions only on seconds). Units are `years`, `months`, `weeks`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`, `microseconds` and `nanoseconds`. Values must be integers, signs must not be mixed, and unknown units are rejected.

| Context                                                                                            | Semantics                                                                                                                      |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Elapsed time**: `toBeDateCloseTo`, `toBeWithinLast`, `toBeWithinNext`, `toBeWithinDurationAfter` | Exact elapsed time. `days` = 24 hours; years, months and weeks are rejected because their length varies.                       |
| **Calendar spans**: `toHaveDateRange`, `toHaveDateGapsLargerThan`, `toHaveMaximumDateGap`          | Temporal `.add()` semantics. Date units follow the calendar (Jan 31 + 1 month = Feb 28, DST-aware days); time units are exact. |
| **Duration matchers**                                                                              | `Temporal.Duration.compare`. Years, months and weeks require `relativeTo`.                                                     |

Comparisons use bigint epoch nanoseconds, so nanosecond precision is preserved. `Date` values have millisecond precision.

**"Now"** is captured once per assertion. You can pass it explicitly with `{ now }`. Otherwise:

- `Date.now()` is read first, so fake timers that replace `Date` (Sinon, Jest, Vitest) are honoured.
- `Temporal.Now.instant()` is then used when it agrees with `Date.now()` to the millisecond. With native Temporal this adds sub-millisecond precision, so a value from `Temporal.Now.instant()` taken just before the assertion is reliably in the past. The polyfill's clock is `Date.now()` itself, so nothing changes there.
- Playwright's `page.clock` controls the browser, not the test runner. To compare against the page's fake time, pass it with `{ now }`.

## Chronology

```typescript
// Strictly before / after
expectly(user.createdAt).toBeBefore(user.updatedAt);
expectly("2026-10-25").toBeAfter("2026-10-20");

// Inclusive range
expectly(eventDate).toBeBetween("2026-01-01", "2026-12-31");

// Within an elapsed deviation (inclusive)
expectly(responseDate).toBeDateCloseTo(expectedDate, { seconds: 30 });
expectly("2026-10-25T12:00:00.000000500Z").toBeDateCloseTo("2026-10-25T12:00:00Z", { nanoseconds: 500 });

// Exactly the same instant, regardless of offset or zone. No tolerance.
expectly("2026-10-25T12:00:00Z").toBeSameInstant("2026-10-25T13:00:00+01:00");
```

Absolute timestamps compare as instants. Calendar dates and local datetimes compare with values of their own kind. To mix kinds, pass `{ timeZone }`. `toBeSameInstant()` accepts absolute values only.

## Relative to now

```typescript
expectly(user.createdAt).toBeInThePast();
expectly(subscription.expiresAt).toBeInTheFuture();

expectly(order.createdAt).toBeWithinLast({ minutes: 5 }); // 0 ≤ now − value ≤ 5 min
expectly(token.expiresAt).toBeWithinNext({ minutes: 30 }); // 0 ≤ value − now ≤ 30 min

// Deterministic tests: pin "now"
expectly("2026-10-25T11:55:00Z").toBeWithinLast({ minutes: 5 }, { now: "2026-10-25T12:00:00Z" });
```

Boundaries are inclusive. `toBeWithinLast()` fails for future timestamps and `toBeWithinNext()` fails for past ones. Local values need `{ timeZone }`.

## Event timing

`toBeWithinDurationAfter(start, limit)` checks that an event happened after `start`, within an elapsed duration. `limit` is either a maximum or a `{ min, max }` window; both bounds are inclusive.

```typescript
expectly(order.completedAt).toBeWithinDurationAfter(order.createdAt, { seconds: 15 });

expectly(payment.processedAt).toBeWithinDurationAfter(payment.createdAt, {
	min: { seconds: 1 },
	max: { seconds: 10 },
});
```

Events before `start` fail. Negative limits and `min > max` throw. A failure shows the measured duration:

```text
Expected event to occur within 15 seconds after the start

Start:   "2026-10-25T12:00:00.000Z"
Actual:  "2026-10-25T12:00:17.250Z"
Elapsed: 17.25 seconds
Maximum: 15 seconds
```

## Calendar

All calendar matchers accept `{ timeZone }` ([zone resolution](#time-zones)). Matchers relative to today also accept `{ now }`. Matchers that read years or months also accept `{ calendar }` ([calendars](#calendars)).

```typescript
expectly(eventDate).toBeSameDay(new Date());
expectly(Temporal.PlainDate.from("2026-10-25")).toBeSameMonth("2026-10-01");
expectly("2026-01-01").toBeSameYear("2026-12-31");

expectly(order.createdAt).toBeToday({ timeZone: "Europe/Amsterdam" });
expectly(lastLogin).toBeYesterday(); // calendar day, DST-safe
expectly(scheduledDate).toBeTomorrow();

expectly(deliveryDate).toBeWeekday(); // Monday–Friday
expectly(event.date).toBeWeekend(); // Saturday–Sunday
expectly("2024-06-15").toBeLeapYear();
expectly(date).toBeInQuarter(4); // Oct–Dec
expectly(date).toBeInMonth("October"); // or 10 (1–12), or "M10"
expectly(meetingDate).toBeSpecificDayOfWeek("Monday"); // or 1 (0 = Sunday … 6 = Saturday)
expectly("2026-02-01").toBeStartOfMonth();
expectly("2026-02-28").toBeEndOfMonth();
```

## Clock and time of day

```typescript
// Same clock bucket, not "less than one unit apart"
expectly("2026-10-25T12:30:45Z").toBeSameHour("2026-10-25T12:59:59Z");
expectly("2026-10-25T12:30:45Z").toBeSameMinute("2026-10-25T12:30:10Z");
expectly("2026-10-25T12:30:45.123Z").toBeSameSecond("2026-10-25T12:30:45Z");
expectly("2026-10-25T12:59:59Z").not.toBeSameHour("2026-10-25T13:00:00Z");

// Wall-clock time, ignoring the date
expectly("2026-10-25T09:30:00").toBeSameTimeOfDay("2026-11-10T09:30:00");
expectly("09:30:15").toBeSameTimeOfDay("09:30:45", { precision: "minute" });

// Inclusive window. start > end is an overnight window.
expectly(appointment.scheduledAt).toBeWithinTimeOfDay("09:00", "17:00", { timeZone: "Europe/Amsterdam" });
expectly(shift.startedAt).toBeWithinTimeOfDay("22:00", "06:00", { timeZone: "Europe/Amsterdam" });

// No components below the unit (checks the value, not the formatting)
expectly("2026-10-25T12:30:45.000Z").toBeTruncatedTo("second");
expectly("2026-10-25T12:30:00Z").toBeTruncatedTo("minute");

// Start and end of the calendar day
expectly(timestamp).toBeAtStartOfDay({ timeZone: "Europe/Amsterdam" });
expectly(timestamp).toBeAtEndOfDay({ timeZone: "Europe/Amsterdam", precision: "millisecond" });
```

- **Same hour/minute/second.** Absolute values are floored in the comparison zone and compared as instants, so the two occurrences of a repeated DST hour (`02:30+02:00` and `02:30+01:00`) are different hours. Local datetimes compare by wall clock. If one value is absolute and the other local, the absolute one is read on the clock of the comparison zone. Plain dates and times are rejected.
- **`toBeWithinTimeOfDay()`.** Accepts `PlainTime` and ISO time strings as bounds. A `PlainTime` or local datetime is used as-is: no date or zone is invented, and passing `timeZone` with them throws. Absolute values are read on the clock of the comparison zone.
- **`toBeTruncatedTo()`.** Units are `hour`, `minute`, `second`, `millisecond` and `microsecond`. For `hour`, the zone matters: `"2026-10-25T12:00:00+05:30"` is truncated to the hour in its own offset.
- **`toBeAtStartOfDay()`.** Uses the real start of the day, which is not always 00:00. For example, 2026-09-06 in America/Santiago starts at 01:00.
- **`toBeAtEndOfDay()`.** Passes for values in the half-open window `[start of next day − 1 unit, start of next day)`. `precision` is `second`, `millisecond` (default), `microsecond` or `nanosecond`, so `…23:59:59.999` passes at millisecond precision but not at nanosecond precision.

## Validation, offsets and time zones

```typescript
expectly("2026-10-25").toBeValidISODate(); // calendar date only
expectly("2026-02-30").not.toBeValidISODate();

expectly("2026-10-25T12:30:45Z").toBeValidISODateTime(); // local, offset or zoned
expectly("2026-10-25T12:30:45+01:00").toBeValidISODateTime({ requireOffset: true });
expectly("2026-10-25T12:30:45").not.toBeValidISODateTime({ requireOffset: true });

expectly("2026-10-25T12:00:00+01:00").toHaveOffset("+01:00");
expectly("2026-10-25T12:00:00Z").toHaveOffset("Z");
expectly(zonedDateTime).toHaveTimeZone("Europe/Amsterdam");
```

- The validation matchers fail (rather than throw) for non-strings, and report the reason.
- **`toHaveOffset()`** reads the offset that is explicitly represented: in an ISO string, or the current offset of a `ZonedDateTime`. It throws for `Date`, `Temporal.Instant` and local values, because their source offset is unknown and is never inferred.
- **`toHaveTimeZone()`** requires a `ZonedDateTime` or zoned string. It compares IANA identities, so aliases match (`Europe/Kiev` = `Europe/Kyiv`, case-insensitive). Passing an offset such as `"+01:00"` throws; use `toHaveOffset()` for offsets.

## Collections

```typescript
expectly(dates).toHaveDatesAscendingOrder(); // equal neighbours allowed
expectly(timeline).toHaveDatesDescendingOrder();

// Exact span from earliest to latest value, calendar-aware, no tolerance
expectly(["2026-01-01", "2026-01-15", "2026-01-31"]).toHaveDateRange({ days: 30 });
expectly(["2026-01-31", "2026-02-28"]).toHaveDateRange({ months: 1 });

expectly(["2026-01-01", "2026-01-02", "2026-01-03"]).toHaveConsecutiveDates("day"); // sorted first; also "month", "year"
expectly(transactions).toHaveDatesWithinRange("2026-01-01", "2026-03-31"); // inclusive
expectly(eventTimestamps).toHaveUniqueDates(); // nanosecond identity
expectly(dailyRecords).toHaveUniqueDates({ ignoreTime: true, timeZone: "Europe/Amsterdam" });

// At least one gap larger than the duration (values sorted first)
expectly(activityDates).toHaveDateGapsLargerThan({ days: 7 });

// Every consecutive pair, in input order, at most this far apart
expectly([event1.timestamp, event2.timestamp, event3.timestamp]).toHaveMaximumDateGap({ minutes: 5 });
```

`toHaveMaximumDateGap()` reports the offending pair and its actual gap. Across a DST change, `{ days: 1 }` allows a 25-hour gap but `{ hours: 24 }` does not.

## Duration matchers

```typescript
expectly(Temporal.Duration.from({ seconds: 5 })).toBeShorterThan({ seconds: 10 }); // strict
expectly("PT2H").toBeLongerThan({ minutes: 90 }); // strict
expectly(result.elapsed).toBeDurationBetween({ seconds: 1 }, "PT10S"); // inclusive

// Years, months and weeks need a starting point
expectly({ days: 31 }).toBeDurationBetween({ months: 1 }, { days: 31 }, { relativeTo: "2026-01-01" });
```

`relativeTo` accepts a calendar date, local datetime, zoned datetime or ISO string with an offset.

## Unsupported and ambiguous combinations

| Combination                                                          | Behaviour                         |
| -------------------------------------------------------------------- | --------------------------------- |
| Local value vs absolute timestamp without `timeZone`                 | Throws: pass `{ timeZone }`       |
| Calendar date vs local datetime without `timeZone`                   | Throws: ambiguous                 |
| Nonexistent or repeated local time converted with `timeZone`         | Throws: no guessing               |
| `toBeSameInstant()` with a local value                               | Throws: not an instant            |
| `toBeSameHour/Minute/Second()`, start/end of day with a date or time | Throws: no time of day or no date |
| `toHaveOffset()` on `Date`, `Instant` or local values                | Throws: offset unknown            |
| `toHaveTimeZone()` on non-zoned values, or with an offset            | Throws                            |
| `timeZone` option with only local values (time-of-day matchers)      | Throws: has no effect             |
| Years, months or weeks in elapsed-time matchers                      | Throws: variable length           |
| Years, months or weeks in duration matchers without `relativeTo`     | Throws                            |
| Hours or smaller units added to calendar dates                       | Throws                            |
| Non-ISO calendars, numbers, non-ISO strings                          | Throws a `TypeError`              |

## Upgrading from 1.x

| 1.x                                                                  | 2.x                                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Date matchers accept only `Date`                                     | `Date`, strict ISO strings and Temporal values                                             |
| `toBeValidISODate()` validates `YYYY-MM-DDTHH:mm:ss[.sss][Z]`        | validates `YYYY-MM-DD`; use `toBeValidISODateTime()` for datetimes                         |
| `toMatchTimeZone(offset)` checks the **machine's** offset for a Date | removed; use `toHaveOffset()` (explicit offset) or `toHaveTimeZone()` (IANA zone)          |
| `toHaveDateRange()` approximates months/years with ±1 day tolerance  | exact, calendar-aware span                                                                 |
| `toHaveDateGapsLargerThan()` approximates months (30.44 d) and years | calendar-exact                                                                             |
| `toHaveUniqueDates(true)`                                            | `toHaveUniqueDates({ ignoreTime: true })`                                                  |
| Deviation/gap objects allow fractional units                         | integer units, plus `milliseconds`, `microseconds`, `nanoseconds`, `weeks` (where allowed) |
| `toBeBetween()` with `start > end` fails                             | throws                                                                                     |

## Related

- [Number Array Matchers](./NUMBER_ARRAY_MATCHERS.md) - For numerical validation
- [Generic Matchers](./GENERIC_MATCHERS.md) - For type validation
- [Locator Matchers](./LOCATOR_MATCHERS.md) - For DOM date validation

[← Back to README](../README.md)
