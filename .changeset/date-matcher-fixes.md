---
"@cerios/playwright-expectly": major
---

Fix date range, time zone and calendar edge cases.

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
