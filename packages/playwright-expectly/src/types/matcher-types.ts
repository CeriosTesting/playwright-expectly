import type { PollOptions } from "@cerios/playwright-expectly-core";
import type { Locator } from "@playwright/test";

import type {
	CalendarFieldOptions,
	DateInput,
	DateTimeInput,
	DurationCompareOptions,
	DurationInput,
	DurationRange,
	EndOfDayOptions,
	ISODateTimeValidationOptions,
	InstantInput,
	RelativeTimeOptions,
	TimeInput,
	TimeOfDayOptions,
	TimeZoneOptions,
	TruncationUnit,
	UniqueDatesOptions,
} from "../date-time/types";
import type { StylesOptions } from "../expectly-locator/expectly-locator-attributes";
import type { CountOptions } from "../expectly-locator/expectly-locator-count";
import type { TextOrderOptions } from "../expectly-locator/expectly-locator-order";
import type { CookieOptions } from "../expectly-page";
import type { NumericToleranceOptions, StringOrderOptions } from "../matchers/common-utils";
import type { UrlValidationOptions, UUIDVersion } from "../matchers/text-validation-utils";

export type StabilityOptions = Pick<PollOptions, "timeout"> & {
	stabilityDuration?: number;
	checkInterval?: number;
};

export type PartialMatchOptions = {
	requireExplicitUndefinedKeyPresence?: boolean;
	arrayMode?: "subset" | "exactLength" | "exactOrder";
};

export type DayOfWeek = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export type MonthName =
	| "January"
	| "February"
	| "March"
	| "April"
	| "May"
	| "June"
	| "July"
	| "August"
	| "September"
	| "October"
	| "November"
	| "December";
type MonthCodeDigits = `${"0" | "1"}${"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"}`;
/**
 * A Temporal month code: `"M01"` … `"M12"`, `"M13"` in Coptic and Ethiopic calendars, and `L` for leap months
 * (`"M05L"` is Hebrew Adar I; Chinese and Korean calendars have `"M01L"` … `"M12L"`). Codes the calendar does
 * not have throw.
 */
export type MonthCode = `M${MonthCodeDigits}` | `M${MonthCodeDigits}L`;

declare global {
	export namespace PlaywrightTest {
		export interface Matchers<R, T> {
			/**
			 * Asserts that the received value matches at least one of the provided possibilities.
			 *
			 * Supports comparison of:
			 * - Primitive values via Object.is (including NaN support)
			 * - Structured values (objects, arrays, functions) via strict deep equality
			 *
			 * @param possibilities - One or more values to compare against
			 *
			 * @example
			 * // Primitive values
			 * expect(status).toBeAnyOf(200, 201, 204);
			 *
			 * @example
			 * // Objects
			 * expect(response).toBeAnyOf(
			 *   { status: 'success', code: 200 },
			 *   { status: 'created', code: 201 }
			 * );
			 *
			 * @example
			 * // Mixed types
			 * expect(value).toBeAnyOf(null, undefined, 0, '');
			 */
			toBeAnyOf(...possibilities: unknown[]): R;

			/**
			 * Asserts that the received value is either null or undefined.
			 *
			 * This is a convenient matcher for checking nullish values,
			 * which is common when dealing with optional properties or API responses.
			 *
			 * @example
			 * // Testing optional values
			 * expect(user.middleName).toBeNullish();
			 * expect(response.data).not.toBeNullish();
			 */
			toBeNullish(): R;

			/**
			 * Asserts that the received value is an integer number.
			 *
			 * An integer is a whole number without decimal places.
			 * Integral numbers (Number.isInteger) and BigInts pass; NaN, Infinity and other types fail.
			 *
			 * @example
			 * expect(42).toBeInteger();
			 * expect(3.14).not.toBeInteger();
			 */
			toBeInteger(): R;

			/**
			 * Asserts that the received value is a floating-point number (has decimal places).
			 *
			 * A float must be a number type, not NaN, not an integer, and a finite value.
			 *
			 * @example
			 * expect(3.14).toBeFloat();
			 * expect(42).not.toBeFloat();
			 */
			toBeFloat(): R;

			/**
			 * Asserts that the received value is a primitive type.
			 *
			 * Primitive types: string, number, boolean, null, undefined, bigint, symbol.
			 *
			 * @example
			 * expect('hello').toBePrimitive();
			 * expect({}).not.toBePrimitive();
			 */
			toBePrimitive(): R;

			/**
			 * Asserts that the received value is an array.
			 *
			 * Uses Array.isArray() internally for accurate array detection.
			 *
			 * @example
			 * expect([1, 2, 3]).toBeArray();
			 * expect({ length: 3 }).not.toBeArray();
			 */
			toBeArray(): R;

			/**
			 * Asserts that the received value is a non-null, non-array object.
			 *
			 * Class instances, `Date`, `Map` and other built-in objects pass too; functions do not.
			 *
			 * @example
			 * expect({ name: 'John' }).toBeObject();
			 * expect([]).not.toBeObject();
			 */
			toBeObject(): R;

			/**
			 * Asserts that an object partially matches the expected structure.
			 *
			 * Extracts only the fields specified in expected from the actual value:
			 * - Objects: only checks properties present in expected (extra properties ignored)
			 * - Arrays: finds matching items regardless of position or extra items
			 * - Nested structures: applies partial matching recursively
			 *
			 * @param expected - The partial structure to match
			 * @param options - Optional behavior flags
			 *   - requireExplicitUndefinedKeyPresence: when true, keys explicitly set to undefined in expected
			 *     must exist in actual. Default is false.
			 *   - arrayMode:
			 *     - subset (default): expected array is treated as a one-to-one subset of actual (order ignored)
			 *     - exactLength: one-to-one matching with required equal lengths (order ignored)
			 *     - exactOrder: one-to-one positional matching with required equal lengths
			 *
			 * @example
			 * expect({ id: 1, name: 'Alice', role: 'admin' }).toEqualPartially({ name: 'Alice' });
			 *
			 * @example
			 * expect([{ id: 1 }, { id: 2 }]).toEqualPartially([{ id: 2 }]);
			 */
			toEqualPartially(expected: unknown, options?: PartialMatchOptions): R;

			/**
			 * Asserts that a string starts with the expected substring.
			 *
			 * @param expected - The substring that should appear at the start
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('https://example.com').toStartWith('https://');
			 */
			toStartWith(expected: string, options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string ends with the expected substring.
			 *
			 * @param expected - The substring that should appear at the end
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('document.pdf').toEndWith('.pdf');
			 */
			toEndWith(expected: string, options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string matches a regular expression pattern.
			 * The pattern must be a RegExp; anything else throws a TypeError.
			 *
			 * @param pattern - The regular expression to match against
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('555-123-4567').toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
			 */
			toMatchPattern(pattern: RegExp, options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string is a valid email address format: a local part without leading, trailing or
			 * consecutive dots, and a domain of at least two dot-separated labels that do not start or end with a hyphen.
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('user@example.com').toBeValidEmail();
			 * expect('not-an-email').not.toBeValidEmail();
			 */
			toBeValidEmail(options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string is an absolute URL with an accepted scheme. Web schemes (http, https, ftp,
			 * ws, wss) must be written with `//` and a valid host; whitespace is never allowed.
			 *
			 * @param options - `protocols`: accepted schemes, with or without the colon (default `["http", "https"]`),
			 *   plus polling configuration for locators
			 *
			 * @example
			 * expect('https://example.com').toBeValidUrl();
			 * expect('not a url').not.toBeValidUrl();
			 * expect('localhost:3000').not.toBeValidUrl(); // "localhost:" would be the scheme
			 * expect('mailto:user@example.com').toBeValidUrl({ protocols: ['mailto'] });
			 */
			toBeValidUrl(options?: UrlValidationOptions & PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string contains only letters and numbers (no spaces or special characters).
			 * Only ASCII letters and digits count, unless `unicode` is set.
			 *
			 * @param options - `unicode`: accept any Unicode letter, mark or number; plus polling configuration
			 *
			 * @example
			 * expect('user123').toBeAlphanumeric();
			 * expect('user 123').not.toBeAlphanumeric();
			 * expect('café').toBeAlphanumeric({ unicode: true });
			 */
			toBeAlphanumeric(options?: { unicode?: boolean } & PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string contains only numeric digits (0-9).
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('1234').toBeNumericString();
			 * expect('12a34').not.toBeNumericString();
			 */
			toBeNumericString(options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string is a valid RFC 9562 UUID. Without a version, versions 1–8 and the nil and max
			 * UUIDs are accepted.
			 *
			 * @param version - Optional: specific UUID version (1–8)
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('550e8400-e29b-41d4-a716-446655440000').toBeUUID();
			 * expect('f47ac10b-58cc-4372-a567-0e02b2c3d479').toBeUUID(4);
			 */
			toBeUUID(version?: UUIDVersion, options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a date is within an elapsed-time deviation of another date (inclusive).
			 *
			 * Days count as 24 hours; years, months and weeks are rejected. Nanosecond precision is preserved.
			 *
			 * @param expectedDate - The date to compare against
			 * @param deviation - Allowed difference, e.g. `{ seconds: 30 }`, a Temporal.Duration or `"PT30S"`
			 * @param options - `timeZone` to compare local values with absolute timestamps
			 *
			 * @example
			 * expect(responseDate).toBeDateCloseTo(expectedDate, { seconds: 30 });
			 */
			toBeDateCloseTo(expectedDate: DateInput, deviation: DurationInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that an array of dates is in ascending (earliest to latest) order. Equal values are allowed.
			 *
			 * @example
			 * expect(["2026-01-01", "2026-01-02"]).toHaveDatesAscendingOrder();
			 */
			toHaveDatesAscendingOrder(options?: TimeZoneOptions): R;

			/**
			 * Asserts that an array of dates is in descending (latest to earliest) order. Equal values are allowed.
			 *
			 * @example
			 * expect([new Date("2026-12-31"), new Date("2026-01-01")]).toHaveDatesDescendingOrder();
			 */
			toHaveDatesDescendingOrder(options?: TimeZoneOptions): R;

			/**
			 * Asserts that a date is strictly before another date.
			 *
			 * Absolute timestamps compare as instants; calendar dates and local datetimes compare with
			 * values of the same kind. Mixing kinds requires `timeZone`.
			 *
			 * @example
			 * expect(startDate).toBeBefore(endDate);
			 * expect("2026-10-20").toBeBefore("2026-10-25");
			 */
			toBeBefore(expectedDate: DateInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that a date is strictly after another date.
			 *
			 * @example
			 * expect(expiryDate).toBeAfter(new Date());
			 * expect("2026-10-25").toBeAfter("2026-10-20");
			 */
			toBeAfter(expectedDate: DateInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that a date falls between two dates (inclusive). Throws when the start is after the end.
			 *
			 * A calendar-date end bound covers that whole day: compared with timestamps (which needs `timeZone`),
			 * the range ends just before the next day starts in that zone, not at the end date's midnight.
			 *
			 * @example
			 * expect(eventDate).toBeBetween("2026-01-01", "2026-12-31");
			 * expect("2026-12-31T18:00:00Z").toBeBetween("2026-01-01", "2026-12-31", { timeZone: "UTC" });
			 */
			toBeBetween(startDate: DateInput, endDate: DateInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that two absolute timestamps denote exactly the same instant, regardless of offset or
			 * time zone. Nanosecond precision, no tolerance. Local dates and datetimes are rejected.
			 *
			 * @example
			 * expect("2026-10-25T12:00:00Z").toBeSameInstant("2026-10-25T13:00:00+01:00");
			 */
			toBeSameInstant(expectedDate: InstantInput): R;

			/**
			 * Asserts that two dates are on the same calendar day.
			 *
			 * Absolute timestamps are placed in one zone: `timeZone`, else a ZonedDateTime's zone, else an
			 * ISO string's offset, else the machine zone.
			 *
			 * @example
			 * expect(eventDate).toBeSameDay(new Date());
			 * expect("2026-10-25T23:30:00Z").toBeSameDay("2026-10-26", { timeZone: "Europe/Amsterdam" });
			 */
			toBeSameDay(expectedDate: DateInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that two dates are in the same month and year.
			 * Uses the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @example
			 * expect("2026-10-25").toBeSameMonth("2026-10-01");
			 * expect("2026-10-25").toBeSameMonth("2026-10-12", { calendar: "hebrew" }); // both Cheshvan 5787
			 */
			toBeSameMonth(expectedDate: DateInput, options?: CalendarFieldOptions): R;

			/**
			 * Asserts that two dates are in the same year.
			 * Uses the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @example
			 * expect("2026-01-01").toBeSameYear("2026-12-31");
			 */
			toBeSameYear(expectedDate: DateInput, options?: CalendarFieldOptions): R;

			/**
			 * Asserts that a date is today. "Now" is captured once (`now` option, else the current time).
			 *
			 * @example
			 * expect(new Date()).toBeToday();
			 * expect(order.createdAt).toBeToday({ timeZone: "Europe/Amsterdam" });
			 */
			toBeToday(options?: RelativeTimeOptions): R;

			/**
			 * Asserts that a date is yesterday (calendar-aware, DST-safe).
			 *
			 * @example
			 * expect(lastLogin).toBeYesterday();
			 */
			toBeYesterday(options?: RelativeTimeOptions): R;

			/**
			 * Asserts that a date is tomorrow (calendar-aware, DST-safe).
			 *
			 * @example
			 * expect(scheduledDate).toBeTomorrow();
			 */
			toBeTomorrow(options?: RelativeTimeOptions): R;

			/**
			 * Asserts that a date falls on a weekday (Monday through Friday).
			 *
			 * @example
			 * expect(deliveryDate).toBeWeekday();
			 */
			toBeWeekday(options?: TimeZoneOptions): R;

			/**
			 * Asserts that a date falls on a weekend (Saturday or Sunday).
			 *
			 * @example
			 * expect(event.date).toBeWeekend();
			 */
			toBeWeekend(options?: TimeZoneOptions): R;

			/**
			 * Asserts that a timestamp is in the past. Local values require `timeZone`.
			 *
			 * @example
			 * expect(user.createdAt).toBeInThePast();
			 */
			toBeInThePast(options?: RelativeTimeOptions): R;

			/**
			 * Asserts that a timestamp is in the future. Local values require `timeZone`.
			 *
			 * @example
			 * expect(subscription.expiresAt).toBeInTheFuture();
			 */
			toBeInTheFuture(options?: RelativeTimeOptions): R;

			/**
			 * Asserts that a timestamp lies within the given elapsed time before now (inclusive).
			 * Future timestamps fail. "Now" is captured once (`now` option, else the current time).
			 *
			 * @example
			 * expect(order.createdAt).toBeWithinLast({ minutes: 5 });
			 */
			toBeWithinLast(duration: DurationInput, options?: RelativeTimeOptions): R;

			/**
			 * Asserts that a timestamp lies within the given elapsed time after now (inclusive).
			 * Past timestamps fail.
			 *
			 * @example
			 * expect(token.expiresAt).toBeWithinNext({ minutes: 30 });
			 */
			toBeWithinNext(duration: DurationInput, options?: RelativeTimeOptions): R;

			/**
			 * Asserts that an event happened after `start`, within a maximum elapsed time or a
			 * `{ min, max }` window (inclusive). Elapsed time, never calendar approximations.
			 *
			 * @example
			 * expect(order.completedAt).toBeWithinDurationAfter(order.createdAt, { seconds: 15 });
			 * expect(payment.processedAt).toBeWithinDurationAfter(payment.createdAt, {
			 *   min: { seconds: 1 },
			 *   max: { seconds: 10 },
			 * });
			 */
			toBeWithinDurationAfter(start: DateInput, limit: DurationInput | DurationRange, options?: TimeZoneOptions): R;

			/**
			 * Asserts that two datetimes fall in the same clock hour (not merely within 60 minutes).
			 * Repeated DST hours are distinguished by their offset.
			 *
			 * @example
			 * expect("2026-10-25T12:30:45Z").toBeSameHour("2026-10-25T12:59:59Z");
			 */
			toBeSameHour(expectedDate: DateTimeInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that two datetimes fall in the same clock minute.
			 *
			 * @example
			 * expect("2026-10-25T12:30:45Z").toBeSameMinute("2026-10-25T12:30:10Z");
			 */
			toBeSameMinute(expectedDate: DateTimeInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that two datetimes fall in the same clock second.
			 *
			 * @example
			 * expect("2026-10-25T12:30:45.123Z").toBeSameSecond("2026-10-25T12:30:45Z");
			 */
			toBeSameSecond(expectedDate: DateTimeInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that a time of day lies within a window (inclusive). `start` after `end` is an
			 * overnight window, e.g. `"22:00"` to `"06:00"`.
			 *
			 * @example
			 * expect(appointment.scheduledAt).toBeWithinTimeOfDay("09:00", "17:00", { timeZone: "Europe/Amsterdam" });
			 */
			toBeWithinTimeOfDay(start: TimeInput, end: TimeInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that a value has no components below `unit` (checks the value, not its formatting).
			 *
			 * @example
			 * expect("2026-10-25T12:30:45.000Z").toBeTruncatedTo("second");
			 * expect("2026-10-25T12:30:00Z").toBeTruncatedTo("minute");
			 */
			toBeTruncatedTo(unit: TruncationUnit, options?: TimeZoneOptions): R;

			/**
			 * Asserts that a ZonedDateTime (value or ISO string with `[Zone]`) has an IANA time zone.
			 * Offsets are rejected; use `toHaveOffset()` for those.
			 *
			 * @example
			 * expect(zonedDateTime).toHaveTimeZone("Europe/Amsterdam");
			 */
			toHaveTimeZone(expectedTimeZone: string): R;

			/**
			 * Asserts the explicitly represented UTC offset of an ISO string or ZonedDateTime.
			 * The offset is never inferred from a Date or Instant.
			 *
			 * @example
			 * expect("2026-10-25T12:00:00+01:00").toHaveOffset("+01:00");
			 * expect("2026-10-25T12:00:00Z").toHaveOffset("Z");
			 */
			toHaveOffset(expectedOffset: string): R;

			/**
			 * Asserts that a string is a strictly valid ISO 8601 datetime: local, with offset, or with an
			 * IANA zone annotation. Shares its validation with `isISODateTime()` and `parseISODateTime()`.
			 *
			 * @example
			 * expect("2026-10-25T12:30:45Z").toBeValidISODateTime();
			 * expect("2026-10-25T12:30:45+01:00").toBeValidISODateTime({ requireOffset: true });
			 */
			toBeValidISODateTime(options?: ISODateTimeValidationOptions): R;

			/**
			 * Asserts that a timestamp is exactly at the start of its day, which is not always 00:00 on
			 * DST transition days.
			 *
			 * @example
			 * expect(timestamp).toBeAtStartOfDay({ timeZone: "Europe/Amsterdam" });
			 */
			toBeAtStartOfDay(options?: TimeZoneOptions): R;

			/**
			 * Asserts that a timestamp is the last moment of its day at the given precision
			 * (default millisecond). Days are never assumed to last 24 hours.
			 *
			 * @example
			 * expect(timestamp).toBeAtEndOfDay({ timeZone: "Europe/Amsterdam", precision: "millisecond" });
			 */
			toBeAtEndOfDay(options?: EndOfDayOptions): R;

			/**
			 * Asserts that two values have the same wall-clock time, ignoring the calendar date.
			 *
			 * @example
			 * expect("2026-10-25T09:30:00").toBeSameTimeOfDay("2026-11-10T09:30:00");
			 */
			toBeSameTimeOfDay(expected: DateTimeInput | TimeInput, options?: TimeOfDayOptions): R;

			/**
			 * Asserts that consecutive values (in input order) are at most `maxGap` apart.
			 *
			 * Unlike elapsed-time matchers such as `toBeDateCloseTo`, `{ days: 1 }` is one calendar day in the comparison
			 * zone (23 or 25 hours across DST); for `Date` values that zone is the machine's unless `timeZone` is given.
			 *
			 * @example
			 * expect([event1.timestamp, event2.timestamp, event3.timestamp]).toHaveMaximumDateGap({ minutes: 5 });
			 */
			toHaveMaximumDateGap(maxGap: DurationInput, options?: CalendarFieldOptions): R;

			/**
			 * Asserts that a duration is strictly shorter than `limit`. Years, months and weeks require `relativeTo`.
			 *
			 * @example
			 * expect(Temporal.Duration.from({ seconds: 5 })).toBeShorterThan({ seconds: 10 });
			 */
			toBeShorterThan(limit: DurationInput, options?: DurationCompareOptions): R;

			/**
			 * Asserts that a duration is strictly longer than `limit`. Years, months and weeks require `relativeTo`.
			 *
			 * @example
			 * expect("PT2H").toBeLongerThan({ minutes: 90 });
			 */
			toBeLongerThan(limit: DurationInput, options?: DurationCompareOptions): R;

			/**
			 * Asserts that a duration lies between `min` and `max` (inclusive).
			 *
			 * @example
			 * expect({ days: 31 }).toBeDurationBetween({ months: 1 }, { days: 31 }, { relativeTo: "2026-01-01" });
			 */
			toBeDurationBetween(min: DurationInput, max: DurationInput, options?: DurationCompareOptions): R;

			/**
			 * Asserts that a date's year is a leap year.
			 * Uses the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @example
			 * expect("2024-06-15").toBeLeapYear();
			 * expect("2023-06-15").not.toBeLeapYear();
			 * expect("2026-10-25").toBeLeapYear({ calendar: "hebrew" }); // 5787 has 13 months
			 */
			toBeLeapYear(options?: CalendarFieldOptions): R;

			/**
			 * Asserts that an array of dates spans exactly the given duration from its earliest to its
			 * latest value. Calendar units are calendar-exact; no tolerance is applied. Years and months
			 * follow the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @example
			 * expect(["2026-01-01", "2026-01-15", "2026-01-31"]).toHaveDateRange({ days: 30 });
			 * expect(["2026-01-31", "2026-02-28"]).toHaveDateRange({ months: 1 });
			 */
			toHaveDateRange(expectedRange: DurationInput, options?: CalendarFieldOptions): R;

			/**
			 * Asserts that an array of dates is consecutive by the specified unit (sorted first).
			 * Uses the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @example
			 * expect(["2026-01-01", "2026-01-02", "2026-01-03"]).toHaveConsecutiveDates("day");
			 */
			toHaveConsecutiveDates(unit: "day" | "month" | "year", options?: CalendarFieldOptions): R;

			/**
			 * Asserts that all dates in an array fall within a range (inclusive). Throws when the start is after the
			 * end. A calendar-date end bound covers that whole day, as in `toBeBetween`.
			 *
			 * @example
			 * expect(transactions).toHaveDatesWithinRange("2026-01-01", "2026-03-31");
			 */
			toHaveDatesWithinRange(startDate: DateInput, endDate: DateInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that all dates in an array are unique (nanosecond identity, or calendar date with `ignoreTime`).
			 *
			 * @example
			 * expect(eventTimestamps).toHaveUniqueDates();
			 * expect(dailyRecords).toHaveUniqueDates({ ignoreTime: true });
			 */
			toHaveUniqueDates(options?: UniqueDatesOptions): R;

			/**
			 * Asserts that a value is a strictly valid ISO 8601 calendar date (`YYYY-MM-DD`).
			 * Shares its validation with `isISODate()` and `parseISODate()`.
			 *
			 * @example
			 * expect("2026-10-25").toBeValidISODate();
			 * expect("2026-02-30").not.toBeValidISODate();
			 */
			toBeValidISODate(): R;

			/**
			 * Asserts that a date is the first day of the month.
			 * Uses the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @example
			 * expect("2026-01-01").toBeStartOfMonth();
			 */
			toBeStartOfMonth(options?: CalendarFieldOptions): R;

			/**
			 * Asserts that a date is the last day of the month.
			 * Uses the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @example
			 * expect("2026-01-31").toBeEndOfMonth();
			 */
			toBeEndOfMonth(options?: CalendarFieldOptions): R;

			/**
			 * Asserts that a sorted array of dates has at least one gap larger than `minGap`.
			 * Years and months follow the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @example
			 * expect(activityDates).toHaveDateGapsLargerThan({ days: 7 });
			 */
			toHaveDateGapsLargerThan(minGap: DurationInput, options?: CalendarFieldOptions): R;

			/**
			 * Asserts that a date falls within a specific quarter of the year.
			 * Uses the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 * Throws for calendars whose year does not have 12 months (e.g. Hebrew leap years, Ethiopic).
			 *
			 * @example
			 * expect(date).toBeInQuarter(1); // Jan-Mar
			 */
			toBeInQuarter(expectedQuarter: 1 | 2 | 3 | 4, options?: CalendarFieldOptions): R;

			/**
			 * Asserts that a date falls on a specific day of the week.
			 *
			 * @param expectedDay - Day name or number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
			 *
			 * @example
			 * expect(meetingDate).toBeSpecificDayOfWeek("Monday");
			 */
			toBeSpecificDayOfWeek(expectedDay: DayOfWeek | number, options?: TimeZoneOptions): R;

			/**
			 * Asserts that a date falls within a specific month.
			 * Uses the `calendar` option, else the values' own non-ISO calendar, else ISO 8601.
			 *
			 * @param expectedMonth - Month number in the calendar (1-12, or 1-13), month code (`"M05L"`), or
			 * English month name (Gregorian-based calendars only)
			 *
			 * @example
			 * expect(date).toBeInMonth("January");
			 * expect("2027-02-10").toBeInMonth("M05L", { calendar: "hebrew" }); // Adar I
			 */
			toBeInMonth(expectedMonth: MonthName | MonthCode | number, options?: CalendarFieldOptions): R;

			/**
			 * Asserts that an array of numbers or strings is in ascending order (smallest to largest).
			 * Strings are compared by UTF-16 code units unless `options` sets `numeric` or `locale`.
			 *
			 * @example
			 * expect([9.99, 19.99, 29.99]).toHaveAscendingOrder();
			 * expect(["2", "10"]).toHaveAscendingOrder({ numeric: true });
			 */
			toHaveAscendingOrder(options?: StringOrderOptions): R;

			/**
			 * Asserts that an array of numbers or strings is in descending order (largest to smallest).
			 * Strings are compared by UTF-16 code units unless `options` sets `numeric` or `locale`.
			 *
			 * @example
			 * expect([100, 95, 87, 75]).toHaveDescendingOrder();
			 */
			toHaveDescendingOrder(options?: StringOrderOptions): R;

			/**
			 * Asserts that an array of numbers sums to the expected value.
			 * Rounding errors of the floating-point computation are tolerated; pass `tolerance` for an explicit bound.
			 *
			 * @param expected - The expected sum
			 *
			 * @example
			 * expect([10.99, 5.50, 15.00]).toHaveSum(31.49);
			 */
			toHaveSum(expected: number, options?: NumericToleranceOptions): R;

			/**
			 * Asserts that an array of numbers has the expected average (mean). An empty array has no average and never matches.
			 * Rounding errors of the floating-point computation are tolerated; pass `tolerance` for an explicit bound.
			 *
			 * @param expected - The expected average
			 *
			 * @example
			 * expect([85, 90, 95, 80]).toHaveAverage(87.5);
			 */
			toHaveAverage(expected: number, options?: NumericToleranceOptions): R;

			/**
			 * Asserts that an array of numbers has the expected median (middle value). An empty array has no median and never matches.
			 * Rounding errors of the floating-point computation are tolerated; pass `tolerance` for an explicit bound.
			 *
			 * @param expected - The expected median
			 *
			 * @example
			 * expect([50000, 60000, 70000, 80000, 90000]).toHaveMedian(70000);
			 */
			toHaveMedian(expected: number, options?: NumericToleranceOptions): R;

			/**
			 * Asserts that an array's minimum value equals the expected number.
			 *
			 * @param expected - The expected minimum value
			 *
			 * @example
			 * expect([19.99, 9.99, 29.99]).toHaveMin(9.99);
			 */
			toHaveMin(expected: number): R;

			/**
			 * Asserts that an array's maximum value equals the expected number.
			 *
			 * @param expected - The expected maximum value
			 *
			 * @example
			 * expect([78, 92, 85, 95, 88]).toHaveMax(95);
			 */
			toHaveMax(expected: number): R;

			/**
			 * Asserts that an array's range (max - min) equals the expected number.
			 * Rounding errors of the floating-point computation are tolerated; pass `tolerance` for an explicit bound.
			 *
			 * @param expected - The expected range
			 *
			 * @example
			 * expect([10, 15, 20, 25, 30]).toHaveRange(20);
			 */
			toHaveRange(expected: number, options?: NumericToleranceOptions): R;

			/**
			 * Asserts that all numbers in an array fall within the specified range (inclusive).
			 * Throws when `min` is greater than `max`.
			 *
			 * @param min - The minimum allowed value
			 * @param max - The maximum allowed value
			 *
			 * @example
			 * expect([45, 67, 89, 92, 78]).toBeAllBetween(0, 100);
			 */
			toBeAllBetween(min: number, max: number): R;

			/**
			 * Asserts that all numbers in an array are positive (greater than 0).
			 *
			 * @example
			 * expect([10.99, 5.50, 15.00]).toBeAllPositive();
			 */
			toBeAllPositive(): R;

			/**
			 * Asserts that all numbers in an array are negative (less than 0).
			 *
			 * @example
			 * expect([-5, -10, -3.50]).toBeAllNegative();
			 */
			toBeAllNegative(): R;

			/**
			 * Asserts that all numbers in an array are integers (whole numbers).
			 *
			 * @example
			 * expect([1, 5, 10, 3]).toBeAllIntegers();
			 */
			toBeAllIntegers(): R;

			/**
			 * Asserts that all numbers in an array are greater than a specified value.
			 *
			 * @param value - The threshold value
			 *
			 * @example
			 * expect([75, 82, 91, 88]).toBeAllGreaterThan(70);
			 */
			toBeAllGreaterThan(value: number): R;

			/**
			 * Asserts that all numbers in an array are less than a specified value.
			 *
			 * @param value - The threshold value
			 *
			 * @example
			 * expect([150, 200, 180, 220]).toBeAllLessThan(250);
			 */
			toBeAllLessThan(value: number): R;

			/**
			 * Asserts that numbers are in strictly ascending order (each element > previous).
			 *
			 * Unlike toHaveAscendingOrder, this rejects equal consecutive values.
			 *
			 * @example
			 * expect([10, 20, 35, 50]).toHaveStrictlyAscendingOrder();
			 * expect([1, 2, 2, 3]).not.toHaveStrictlyAscendingOrder();
			 */
			toHaveStrictlyAscendingOrder(options?: StringOrderOptions): R;

			/**
			 * Asserts that numbers are in strictly descending order (each element < previous).
			 *
			 * Unlike toHaveDescendingOrder, this rejects equal consecutive values.
			 *
			 * @example
			 * expect([100, 75, 50, 25]).toHaveStrictlyDescendingOrder();
			 * expect([5, 4, 4, 3]).not.toHaveStrictlyDescendingOrder();
			 */
			toHaveStrictlyDescendingOrder(options?: StringOrderOptions): R;

			/**
			 * Asserts that an array is monotonic (consistently ascending or descending).
			 *
			 * A monotonic array never changes direction — equal consecutive values are allowed.
			 *
			 * @example
			 * expect([1, 2, 2, 3, 4]).toBeMonotonic();
			 * expect([1, 3, 2, 4]).not.toBeMonotonic();
			 */
			toBeMonotonic(options?: StringOrderOptions): R;

			/**
			 * Asserts that all values in an array are unique (no duplicates).
			 * Values are compared like `Set` (SameValueZero), so `0` and `-0` count as duplicates.
			 *
			 * @example
			 * expect([101, 202, 303]).toHaveUniqueValues();
			 * expect([1, 2, 2, 3]).not.toHaveUniqueValues();
			 */
			toHaveUniqueValues(): R;

			/**
			 * Asserts that an array contains consecutive integers (e.g., 1, 2, 3, 4).
			 *
			 * The array will be sorted before checking, so [3, 1, 2] would pass.
			 *
			 * @example
			 * expect([1, 2, 3, 4, 5]).toHaveConsecutiveIntegers();
			 * expect([1, 2, 4, 5]).not.toHaveConsecutiveIntegers();
			 */
			toHaveConsecutiveIntegers(): R;

			/**
			 * Asserts that an array contains only unique objects (no duplicates).
			 *
			 * Uses deep strict equality (`util.isDeepStrictEqual`) to detect duplicates, so prototypes, `Date`,
			 * `Map` and `Set` contents are compared, and `0` and `-0` are distinct.
			 *
			 * @example
			 * expect([{ id: 1 }, { id: 2 }, { id: 3 }]).toHaveOnlyUniqueObjects();
			 * expect([{ id: 1 }, { id: 1 }]).not.toHaveOnlyUniqueObjects();
			 */
			toHaveOnlyUniqueObjects(): R;

			/**
			 * Asserts that an array of objects is sorted in ascending order by a specific property
			 * (own or inherited, including getters). Values must be numbers, strings, bigints, booleans or valid Dates;
			 * NaN, Invalid Date, objects, functions and symbols throw, and values of different types fail.
			 *
			 * @param propertyName - The property name to sort by
			 *
			 * @example
			 * expect([{ age: 25 }, { age: 30 }, { age: 35 }]).toHaveObjectsInAscendingOrderBy('age');
			 */
			toHaveObjectsInAscendingOrderBy(propertyName: string): R;

			/**
			 * Asserts that an array of objects is sorted in descending order by a specific property
			 * (own or inherited, including getters). Values must be numbers, strings, bigints, booleans or valid Dates;
			 * NaN, Invalid Date, objects, functions and symbols throw, and values of different types fail.
			 *
			 * @param propertyName - The property name to sort by
			 *
			 * @example
			 * expect([{ score: 950 }, { score: 850 }, { score: 750 }]).toHaveObjectsInDescendingOrderBy('score');
			 */
			toHaveObjectsInDescendingOrderBy(propertyName: string): R;

			/**
			 * Asserts that the locator's text is all uppercase letters.
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('.heading')).toBeUpperCase();
			 */
			toBeUpperCase(options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's text is all lowercase letters.
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('.username')).toBeLowerCase();
			 */
			toBeLowerCase(options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's text is in title case (first letter of each word capitalized).
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('.book-title')).toBeTitleCase();
			 */
			toBeTitleCase(options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator has the expected text, ignoring text from any child elements.
			 *
			 * @param expectedText - The expected direct text (excluding nested elements)
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * // HTML: <div>new value<span>old value</span></div>
			 * await expect(page.locator('div')).toHaveDirectText('new value');
			 */
			toHaveDirectText(expectedText: string, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element has the specified placeholder attribute.
			 *
			 * @param expected - The expected placeholder text or regex pattern
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('input[name="email"]')).toHavePlaceholder('Enter your email');
			 */
			toHavePlaceholder(expected: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element has the specified href attribute.
			 *
			 * @param expected - The expected href value or regex pattern
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('a.home-link')).toHaveHref('/');
			 */
			toHaveHref(expected: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element has the specified src attribute.
			 *
			 * @param expected - The expected src value or regex pattern
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('img.logo')).toHaveSrc('/images/logo.png');
			 */
			toHaveSrc(expected: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element has the specified alt attribute.
			 *
			 * @param expected - The expected alt text or regex pattern
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('img.avatar')).toHaveAlt('User profile picture');
			 */
			toHaveAlt(expected: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element has a data attribute with an optional expected value.
			 *
			 * @param name - The data attribute name (with or without 'data-' prefix)
			 * @param expected - Optional: expected attribute value or regex pattern
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('.item')).toHaveDataAttribute('id');
			 * await expect(page.locator('.item')).toHaveDataAttribute('status', 'active');
			 */
			toHaveDataAttribute(name: string, expected?: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element has the specified aria-label attribute.
			 *
			 * @param expected - The expected aria-label text or regex pattern
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('button.close')).toHaveAriaLabel('Close dialog');
			 */
			toHaveAriaLabel(expected: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element has the specified target attribute.
			 *
			 * @param expected - The expected target value or regex pattern
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('a.external')).toHaveTarget('_blank');
			 */
			toHaveTarget(expected: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element is required (has the required attribute).
			 * Applies to form input elements.
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('input[name="email"]')).toBeRequired();
			 */
			toBeRequired(options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element is readonly (has the readonly attribute).
			 * Applies to input and textarea elements.
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('input[name="username"]')).toBeReadOnly();
			 */
			toBeReadOnly(options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element is positioned above another element.
			 * Compares the bottom edge of the current element with the top edge of the other element.
			 *
			 * @param otherLocator - The locator to compare against
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('header')).toBeAbove(page.locator('main'));
			 */
			toBeAbove(otherLocator: Locator, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element is positioned below another element.
			 * Compares the top edge of the current element with the bottom edge of the other element.
			 *
			 * @param otherLocator - The locator to compare against
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('footer')).toBeBelow(page.locator('main'));
			 */
			toBeBelow(otherLocator: Locator, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element is positioned to the left of another element.
			 * Compares the right edge of the current element with the left edge of the other element.
			 *
			 * @param otherLocator - The locator to compare against
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('.sidebar')).toBeLeftOf(page.locator('.content'));
			 */
			toBeLeftOf(otherLocator: Locator, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's element is positioned to the right of another element.
			 * Compares the left edge of the current element with the right edge of the other element.
			 *
			 * @param otherLocator - The locator to compare against
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('.content')).toBeRightOf(page.locator('.sidebar'));
			 */
			toBeRightOf(otherLocator: Locator, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator's content remains stable (unchanged) for a specified duration.
			 * Useful for waiting until dynamic content has finished updating.
			 *
			 * @param options - Optional configuration
			 * @param options.stabilityDuration - Duration in ms that content must remain unchanged (default: 500)
			 * @param options.checkInterval - Interval in ms between stability checks (default: 100)
			 * @param options.timeout - Maximum time in ms to wait for stability
			 *
			 * @example
			 * await expect(page.locator('.live-updates')).toBeStable();
			 * await expect(page.locator('.loading-content')).toBeStable({ stabilityDuration: 1000, timeout: 10000 });
			 */
			toBeStable(options?: StabilityOptions): Promise<R>;

			/**
			 * Asserts that the locator has the expected number of visible elements.
			 *
			 * @param count - The expected number of visible elements
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * await expect(page.locator('.list-item')).toHaveCountVisible(3);
			 * await expect(page.locator('tbody tr')).toHaveCountVisible(5, { timeout: 5000 });
			 */
			toHaveCountVisible(count: number, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the locator matches more than `count` elements, retrying until it does.
			 *
			 * @param options - `visible: true` counts only visible elements; plus polling configuration
			 *
			 * @example
			 * await expect(page.locator('.search-result')).toHaveCountGreaterThan(0);
			 */
			toHaveCountGreaterThan(count: number, options?: CountOptions): Promise<R>;

			/**
			 * Asserts that the locator matches at least `count` elements, retrying until it does.
			 *
			 * @example
			 * await expect(page.locator('tbody tr')).toHaveCountGreaterThanOrEqual(10, { visible: true });
			 */
			toHaveCountGreaterThanOrEqual(count: number, options?: CountOptions): Promise<R>;

			/**
			 * Asserts that the locator matches fewer than `count` elements, retrying until it does.
			 *
			 * @example
			 * await expect(page.locator('.toast')).toHaveCountLessThan(3);
			 */
			toHaveCountLessThan(count: number, options?: CountOptions): Promise<R>;

			/**
			 * Asserts that the locator matches at most `count` elements, retrying until it does.
			 *
			 * @example
			 * await expect(page.locator('.error')).toHaveCountLessThanOrEqual(1);
			 */
			toHaveCountLessThanOrEqual(count: number, options?: CountOptions): Promise<R>;

			/**
			 * Asserts that the locator matches between `min` and `max` elements (inclusive), retrying until it does.
			 *
			 * @example
			 * await expect(page.locator('.page-item')).toHaveCountBetween(1, 10);
			 */
			toHaveCountBetween(min: number, max: number, options?: CountOptions): Promise<R>;

			/**
			 * Asserts that the texts of all elements the locator matches are in ascending order, retrying until they
			 * are, so it can follow a click on a sort button directly. Texts are trimmed; zero elements fail.
			 *
			 * @param options - `numeric`, `locale`, `ignoreCase`, `strict`, `parse` (convert each text, e.g. a price),
			 *   `useInnerText`, plus polling configuration
			 *
			 * @example
			 * await page.getByRole('button', { name: 'Sort by name' }).click();
			 * await expect(page.locator('td.name')).toHaveTextsInAscendingOrder({ ignoreCase: true });
			 * await expect(page.locator('td.price')).toHaveTextsInAscendingOrder({ parse: (t) => Number(t.replace(/[^\d.]/g, '')) });
			 */
			toHaveTextsInAscendingOrder(options?: TextOrderOptions): Promise<R>;

			/**
			 * Asserts that the texts of all elements the locator matches are in descending order, retrying until they are.
			 *
			 * @example
			 * await expect(page.locator('td.date')).toHaveTextsInDescendingOrder();
			 */
			toHaveTextsInDescendingOrder(options?: TextOrderOptions): Promise<R>;

			/**
			 * Asserts several computed CSS properties at once, including custom properties (`--brand-color`).
			 * Values are compared with the computed value as the browser reports it (e.g. `rgb(255, 0, 0)`).
			 *
			 * @param styles - Property names mapped to an exact string or a RegExp
			 * @param options - `pseudo: "::before" | "::after"`, plus polling configuration
			 *
			 * @example
			 * await expect(page.locator('.alert')).toHaveStyles({ color: 'rgb(255, 0, 0)', 'font-weight': '700' });
			 * await expect(page.locator('.badge')).toHaveStyles({ content: '"New"' }, { pseudo: '::before' });
			 */
			toHaveStyles(styles: Record<string, string | RegExp>, options?: StylesOptions): Promise<R>;

			/**
			 * Asserts that a page's browser context (or a BrowserContext) has a cookie, retrying until it does.
			 *
			 * @param name - The cookie name
			 * @param value - Optional exact value or RegExp
			 * @param options - `domain` and `path` filters, plus polling configuration
			 *
			 * @example
			 * await page.getByRole('button', { name: 'Accept' }).click();
			 * await expect(page).toHaveCookie('consent', 'granted');
			 */
			toHaveCookie(name: string, value?: string | RegExp, options?: CookieOptions): Promise<R>;

			/**
			 * Asserts that the page's `localStorage` has an item, retrying until it does.
			 *
			 * @example
			 * await expect(page).toHaveLocalStorageItem('theme', 'dark');
			 */
			toHaveLocalStorageItem(key: string, value?: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the page's `sessionStorage` has an item, retrying until it does.
			 *
			 * @example
			 * await expect(page).toHaveSessionStorageItem('cart-id', /^[0-9a-f-]{36}$/);
			 */
			toHaveSessionStorageItem(key: string, value?: string | RegExp, options?: PollOptions): Promise<R>;

			/**
			 * Asserts that the received value satisfies a predicate.
			 *
			 * @example
			 * expect(order.total).toSatisfy((total) => total > 0 && total < 1000);
			 */
			toSatisfy(predicate: (value: T) => unknown): R;

			/**
			 * Asserts that every element of an array satisfies a predicate.
			 *
			 * @example
			 * expect(users).toSatisfyAll((user) => user.active);
			 */
			toSatisfyAll(predicate: (value: T extends readonly (infer E)[] ? E : unknown, index: number) => unknown): R;

			/**
			 * Asserts that at least one element of an array satisfies a predicate.
			 *
			 * @example
			 * expect(roles).toSatisfyAny((role) => role.name === 'admin');
			 */
			toSatisfyAny(predicate: (value: T extends readonly (infer E)[] ? E : unknown, index: number) => unknown): R;

			/**
			 * Asserts that an array has exactly the same members as `expected`, in any order (duplicates must match
			 * in number). Members are compared with `toEqual` semantics, so asymmetric matchers work.
			 *
			 * @example
			 * expect(tags).toIncludeSameMembers(['b', 'a', 'c']);
			 */
			toIncludeSameMembers(expected: readonly unknown[]): R;

			/**
			 * Asserts that an array includes all of the given members, in any order.
			 *
			 * @example
			 * expect(permissions).toIncludeAllMembers(['read', 'write']);
			 */
			toIncludeAllMembers(expected: readonly unknown[]): R;

			/**
			 * Asserts that an array includes at least one of the given members.
			 *
			 * @example
			 * expect(statuses).toIncludeAnyMembers(['failed', 'error']);
			 */
			toIncludeAnyMembers(expected: readonly unknown[]): R;

			/**
			 * Asserts that an object has an own key.
			 *
			 * @example
			 * expect(response).toContainKey('id');
			 */
			toContainKey(key: PropertyKey): R;

			/**
			 * Asserts that an object has all of the given own keys (it may have others).
			 *
			 * @example
			 * expect(user).toContainKeys(['id', 'email']);
			 */
			toContainKeys(keys: readonly PropertyKey[]): R;

			/**
			 * Asserts that an object has exactly the given own enumerable keys, in any order. Numbers name their
			 * string keys (`1` matches the key `"1"`).
			 *
			 * @example
			 * expect(payload).toContainAllKeys(['id', 'name', 'createdAt']);
			 */
			toContainAllKeys(keys: readonly PropertyKey[]): R;

			/**
			 * Asserts that an object has an own entry with an equal value (`toEqual` semantics).
			 *
			 * @example
			 * expect(config).toContainEntry(['mode', 'production']);
			 */
			toContainEntry(entry: readonly [PropertyKey, unknown]): R;

			/**
			 * Asserts that an object has all of the given own entries.
			 *
			 * @example
			 * expect(user).toContainEntries([['role', 'admin'], ['active', true]]);
			 */
			toContainEntries(entries: readonly (readonly [PropertyKey, unknown])[]): R;

			/**
			 * Asserts that the received value is an object (not an array) without own enumerable keys; a Map or Set
			 * must also have no entries.
			 *
			 * @example
			 * expect(response.errors).toBeEmptyObject();
			 */
			toBeEmptyObject(): R;

			/**
			 * Asserts that a string equals another, ignoring letter case (Unicode case folding, locale-independent).
			 *
			 * @example
			 * expect('Hello World').toEqualCaseInsensitive('hello world');
			 */
			toEqualCaseInsensitive(expected: string): R;

			/**
			 * Asserts that a string equals another after removing all whitespace.
			 *
			 * @example
			 * expect('1 234 567').toEqualIgnoringWhitespace('1234567');
			 */
			toEqualIgnoringWhitespace(expected: string): R;

			/**
			 * Asserts that a string is hexadecimal (case-insensitive). The `0x` prefix is allowed by default.
			 *
			 * @param options - `prefix: "allowed" | "required" | "forbidden"`
			 *
			 * @example
			 * expect('0x1f').toBeHexadecimal();
			 * expect('deadBEEF').toBeHexadecimal({ prefix: 'forbidden' });
			 */
			toBeHexadecimal(options?: { prefix?: "allowed" | "required" | "forbidden" }): R;

			/**
			 * Asserts that the received value is an even integer (number or BigInt).
			 *
			 * @example
			 * expect(pageCount).toBeEven();
			 */
			toBeEven(): R;

			/**
			 * Asserts that the received value is an odd integer (number or BigInt).
			 *
			 * @example
			 * expect(3).toBeOdd();
			 */
			toBeOdd(): R;

			/**
			 * Asserts that the received value is a finite number (not NaN or ±Infinity).
			 *
			 * @example
			 * expect(ratio).toBeFinite();
			 */
			toBeFinite(): R;

			/**
			 * Asserts that a promise (or a function returning one) resolves.
			 *
			 * @example
			 * await expect(api.health()).toResolve();
			 * await expect(() => api.deleteUser(id)).not.toResolve();
			 */
			toResolve(): Promise<R>;

			/**
			 * Asserts that a promise (or a function returning one) rejects.
			 *
			 * @example
			 * await expect(api.login('wrong')).toReject();
			 */
			toReject(): Promise<R>;

			/**
			 * Asserts that a function throws an error of the given type with the given message (exact string or
			 * RegExp). A function returning a promise is awaited, and the assertion then returns a promise.
			 *
			 * @example
			 * expect(() => parse('')).toThrowWithMessage(TypeError, 'Input must not be empty');
			 * await expect(async () => api.call()).toThrowWithMessage(Error, /timeout/);
			 */
			toThrowWithMessage(
				type: abstract new (...args: never[]) => Error,
				message: string | RegExp,
			): T extends (...args: never[]) => infer Returned
				? [Returned] extends [never]
					? R
					: Returned extends PromiseLike<unknown>
						? Promise<R>
						: R
				: R;
		}
	}
}
