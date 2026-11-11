---
"@cerios/playwright-expectly": minor
---

Add inclusive, relative-age, week, year and collection extreme date matchers.

- **Chronology:** `toBeOnOrBefore()` and `toBeOnOrAfter()` are the inclusive counterparts of `toBeBefore()` and `toBeAfter()`. A calendar date compared with a timestamp covers its whole day in `toBeOnOrBefore()`, like the end of `toBeBetween()`.
- **Relative to now:** `toBeOlderThan(duration)` and `toBeNewerThan(duration)` check that a value lies more or less than `duration` before now (strict). Unlike `toBeWithinLast()`, `toBeNewerThan()` passes for future values.
- **Calendar:** `toBeSameWeek()` and `toBeThisWeek()` with a `weekStartsOn` option (default Monday), `toBeInWeek(week, { year })` for ISO 8601 week numbers and week-numbering years, `toBeInYear(year)`, and `toBeThisMonth()` / `toBeThisYear()`, which honour `{ now, timeZone, calendar }`.
- **Collections:** `toHaveEarliestDate(date)` and `toHaveLatestDate(date)` assert the exact minimum or maximum of a date array.
- **Types:** `WeekStart`, `WeekOptions`, `WeekNumberOptions`, `RelativeWeekOptions` and `RelativeCalendarOptions`.
