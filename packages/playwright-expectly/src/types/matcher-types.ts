import type { PollOptions } from "@cerios/playwright-expectly-core";
import type { Locator } from "@playwright/test";

import type {
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
			 * This uses Number.isInteger() internally, which returns false for
			 * NaN, Infinity, and non-number types.
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
			 * Asserts that the received value is a plain object.
			 *
			 * A plain object must be of type 'object', not null, and not an array.
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
			 *
			 * @param pattern - The regular expression to match against
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('555-123-4567').toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);
			 */
			toMatchPattern(pattern: RegExp, options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string is a valid email address format.
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('user@example.com').toBeValidEmail();
			 * expect('not-an-email').not.toBeValidEmail();
			 */
			toBeValidEmail(options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string is a valid URL format.
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('https://example.com').toBeValidUrl();
			 * expect('not a url').not.toBeValidUrl();
			 */
			toBeValidUrl(options?: PollOptions): T extends Locator ? Promise<R> : R;

			/**
			 * Asserts that a string contains only letters and numbers (no spaces or special characters).
			 *
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('user123').toBeAlphanumeric();
			 * expect('user 123').not.toBeAlphanumeric();
			 */
			toBeAlphanumeric(options?: PollOptions): T extends Locator ? Promise<R> : R;

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
			 * Asserts that a string is a valid UUID.
			 *
			 * @param version - Optional: specific UUID version (1, 3, 4, or 5)
			 * @param options - Optional polling configuration
			 *
			 * @example
			 * expect('550e8400-e29b-41d4-a716-446655440000').toBeUUID();
			 * expect('f47ac10b-58cc-4372-a567-0e02b2c3d479').toBeUUID(4);
			 */
			toBeUUID(version?: 1 | 3 | 4 | 5, options?: PollOptions): T extends Locator ? Promise<R> : R;

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
			 * Asserts that a date falls between two dates (inclusive).
			 *
			 * @example
			 * expect(eventDate).toBeBetween("2026-01-01", "2026-12-31");
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
			 *
			 * @example
			 * expect("2026-10-25").toBeSameMonth("2026-10-01");
			 */
			toBeSameMonth(expectedDate: DateInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that two dates are in the same year.
			 *
			 * @example
			 * expect("2026-01-01").toBeSameYear("2026-12-31");
			 */
			toBeSameYear(expectedDate: DateInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that a date is today. "Now" is captured once (`now` option, else `Date.now()`).
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
			 * Future timestamps fail. "Now" is captured once (`now` option, else `Date.now()`).
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
			 * @example
			 * expect([event1.timestamp, event2.timestamp, event3.timestamp]).toHaveMaximumDateGap({ minutes: 5 });
			 */
			toHaveMaximumDateGap(maxGap: DurationInput, options?: TimeZoneOptions): R;

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
			 *
			 * @example
			 * expect("2024-06-15").toBeLeapYear();
			 * expect("2023-06-15").not.toBeLeapYear();
			 */
			toBeLeapYear(options?: TimeZoneOptions): R;

			/**
			 * Asserts that an array of dates spans exactly the given duration from its earliest to its
			 * latest value. Calendar units are calendar-exact; no tolerance is applied.
			 *
			 * @example
			 * expect(["2026-01-01", "2026-01-15", "2026-01-31"]).toHaveDateRange({ days: 30 });
			 * expect(["2026-01-31", "2026-02-28"]).toHaveDateRange({ months: 1 });
			 */
			toHaveDateRange(expectedRange: DurationInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that an array of dates is consecutive by the specified unit (sorted first).
			 *
			 * @example
			 * expect(["2026-01-01", "2026-01-02", "2026-01-03"]).toHaveConsecutiveDates("day");
			 */
			toHaveConsecutiveDates(unit: "day" | "month" | "year", options?: TimeZoneOptions): R;

			/**
			 * Asserts that all dates in an array fall within a range (inclusive).
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
			 *
			 * @example
			 * expect("2026-01-01").toBeStartOfMonth();
			 */
			toBeStartOfMonth(options?: TimeZoneOptions): R;

			/**
			 * Asserts that a date is the last day of the month.
			 *
			 * @example
			 * expect("2026-01-31").toBeEndOfMonth();
			 */
			toBeEndOfMonth(options?: TimeZoneOptions): R;

			/**
			 * Asserts that a sorted array of dates has at least one gap larger than `minGap`.
			 *
			 * @example
			 * expect(activityDates).toHaveDateGapsLargerThan({ days: 7 });
			 */
			toHaveDateGapsLargerThan(minGap: DurationInput, options?: TimeZoneOptions): R;

			/**
			 * Asserts that a date falls within a specific quarter of the year.
			 *
			 * @example
			 * expect(date).toBeInQuarter(1); // Jan-Mar
			 */
			toBeInQuarter(expectedQuarter: 1 | 2 | 3 | 4, options?: TimeZoneOptions): R;

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
			 *
			 * @param expectedMonth - Month name or number (1-12)
			 *
			 * @example
			 * expect(date).toBeInMonth("January");
			 */
			toBeInMonth(expectedMonth: MonthName | number, options?: TimeZoneOptions): R;

			/**
			 * Asserts that an array of numbers is in ascending order (smallest to largest).
			 *
			 * @example
			 * expect([9.99, 19.99, 29.99]).toHaveAscendingOrder();
			 */
			toHaveAscendingOrder(): R;

			/**
			 * Asserts that an array of numbers is in descending order (largest to smallest).
			 *
			 * @example
			 * expect([100, 95, 87, 75]).toHaveDescendingOrder();
			 */
			toHaveDescendingOrder(): R;

			/**
			 * Asserts that an array of numbers sums to the expected value.
			 *
			 * @param expected - The expected sum
			 *
			 * @example
			 * expect([10.99, 5.50, 15.00]).toHaveSum(31.49);
			 */
			toHaveSum(expected: number): R;

			/**
			 * Asserts that an array of numbers has the expected average (mean).
			 *
			 * @param expected - The expected average
			 *
			 * @example
			 * expect([85, 90, 95, 80]).toHaveAverage(87.5);
			 */
			toHaveAverage(expected: number): R;

			/**
			 * Asserts that an array of numbers has the expected median (middle value).
			 *
			 * @param expected - The expected median
			 *
			 * @example
			 * expect([50000, 60000, 70000, 80000, 90000]).toHaveMedian(70000);
			 */
			toHaveMedian(expected: number): R;

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
			 *
			 * @param expected - The expected range
			 *
			 * @example
			 * expect([10, 15, 20, 25, 30]).toHaveRange(20);
			 */
			toHaveRange(expected: number): R;

			/**
			 * Asserts that all numbers in an array fall within the specified range (inclusive).
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
			toHaveStrictlyAscendingOrder(): R;

			/**
			 * Asserts that numbers are in strictly descending order (each element < previous).
			 *
			 * Unlike toHaveDescendingOrder, this rejects equal consecutive values.
			 *
			 * @example
			 * expect([100, 75, 50, 25]).toHaveStrictlyDescendingOrder();
			 * expect([5, 4, 4, 3]).not.toHaveStrictlyDescendingOrder();
			 */
			toHaveStrictlyDescendingOrder(): R;

			/**
			 * Asserts that an array is monotonic (consistently ascending or descending).
			 *
			 * A monotonic array never changes direction — equal consecutive values are allowed.
			 *
			 * @example
			 * expect([1, 2, 2, 3, 4]).toBeMonotonic();
			 * expect([1, 3, 2, 4]).not.toBeMonotonic();
			 */
			toBeMonotonic(): R;

			/**
			 * Asserts that all values in an array are unique (no duplicates).
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
			 * Uses deep equality comparison via JSON serialization to detect duplicates.
			 *
			 * @example
			 * expect([{ id: 1 }, { id: 2 }, { id: 3 }]).toHaveOnlyUniqueObjects();
			 * expect([{ id: 1 }, { id: 1 }]).not.toHaveOnlyUniqueObjects();
			 */
			toHaveOnlyUniqueObjects(): R;

			/**
			 * Asserts that an array of objects is sorted in ascending order by a specific property.
			 *
			 * @param propertyName - The property name to sort by
			 *
			 * @example
			 * expect([{ age: 25 }, { age: 30 }, { age: 35 }]).toHaveObjectsInAscendingOrderBy('age');
			 */
			toHaveObjectsInAscendingOrderBy(propertyName: string): R;

			/**
			 * Asserts that an array of objects is sorted in descending order by a specific property.
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
		}
	}
}
