/**
 * Public date/time types. This module has no runtime imports, so published declarations never
 * depend on a Temporal implementation or on the global `Temporal` namespace.
 */

/**
 * Structural Temporal types.
 *
 * Public signatures never reference the global `Temporal` namespace: it only exists with recent
 * TypeScript libs. These interfaces accept values from native Temporal, `temporal-polyfill` and
 * `@js-temporal/polyfill` alike; the `Symbol.toStringTag` literal keeps the kinds distinct.
 */
export interface TemporalInstantLike {
	readonly [Symbol.toStringTag]: "Temporal.Instant";
	readonly epochNanoseconds: bigint;
	toString(): string;
}

export interface TemporalZonedDateTimeLike {
	readonly [Symbol.toStringTag]: "Temporal.ZonedDateTime";
	readonly epochNanoseconds: bigint;
	readonly timeZoneId: string;
	readonly calendarId: string;
	readonly offset: string;
	toString(): string;
}

export interface TemporalPlainDateLike {
	readonly [Symbol.toStringTag]: "Temporal.PlainDate";
	readonly year: number;
	readonly month: number;
	readonly day: number;
	readonly calendarId: string;
	toString(): string;
}

export interface TemporalPlainTimeLike {
	readonly [Symbol.toStringTag]: "Temporal.PlainTime";
	readonly hour: number;
	readonly minute: number;
	readonly second: number;
	readonly millisecond: number;
	readonly microsecond: number;
	readonly nanosecond: number;
	toString(): string;
}

export interface TemporalPlainDateTimeLike {
	readonly [Symbol.toStringTag]: "Temporal.PlainDateTime";
	readonly year: number;
	readonly month: number;
	readonly day: number;
	readonly hour: number;
	readonly minute: number;
	readonly second: number;
	readonly millisecond: number;
	readonly microsecond: number;
	readonly nanosecond: number;
	readonly calendarId: string;
	toString(): string;
}

export interface TemporalDurationLike {
	readonly [Symbol.toStringTag]: "Temporal.Duration";
	readonly years: number;
	readonly months: number;
	readonly weeks: number;
	readonly days: number;
	readonly hours: number;
	readonly minutes: number;
	readonly seconds: number;
	readonly milliseconds: number;
	readonly microseconds: number;
	readonly nanoseconds: number;
	toString(): string;
}

/**
 * String members are plain `string` so dynamic values stay assignable; they are validated strictly
 * at runtime (see `SupportedISOString` and the `parseISO*()` functions for compile-time checks).
 */

/** An absolute timestamp: `Date`, `Temporal.Instant`, `Temporal.ZonedDateTime` or an ISO string with `Z`/offset/zone. */
export type InstantInput = Date | string | TemporalInstantLike | TemporalZonedDateTimeLike;

/** A value with a date and a time: absolute timestamps and `Temporal.PlainDateTime`. */
export type DateTimeInput = InstantInput | TemporalPlainDateTimeLike;

/** Any value with a calendar date: datetimes and `Temporal.PlainDate`. */
export type DateInput = DateTimeInput | TemporalPlainDateLike;

/** Values that can be placed on a calendar (alias of {@link DateInput}). */
export type CalendarDateInput = DateInput;

/** A time of day: `Temporal.PlainTime` or an ISO time string (`HH:mm[:ss[.fffffffff]]`). */
export type TimeInput = string | TemporalPlainTimeLike;

/** A duration as an object of units, a `Temporal.Duration` or an ISO 8601 duration string such as `"PT5M"`. */
export type DurationInput = DurationObject | TemporalDurationLike | string;

export interface DurationObject {
	years?: number;
	months?: number;
	weeks?: number;
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
	milliseconds?: number;
	microseconds?: number;
	nanoseconds?: number;
}

export interface TimeZoneOptions {
	/**
	 * IANA time zone (e.g. `"Europe/Amsterdam"`) or fixed offset (`"+01:00"`) used to place absolute
	 * timestamps on a calendar/clock, and required to compare local values with absolute ones.
	 */
	timeZone?: string;
}

export interface RelativeTimeOptions extends TimeZoneOptions {
	/** The moment treated as "now". Defaults to `Date.now()`, so fake timers are honoured. */
	now?: InstantInput;
}

export interface DurationRange {
	/** Inclusive lower bound. */
	min?: DurationInput;
	/** Inclusive upper bound. */
	max?: DurationInput;
}

export type TruncationUnit = "hour" | "minute" | "second" | "millisecond" | "microsecond";

export type SubsecondPrecision = "second" | "millisecond" | "microsecond" | "nanosecond";

export interface EndOfDayOptions extends TimeZoneOptions {
	/** The resolution of "the last moment of the day". Default: `"millisecond"`. */
	precision?: SubsecondPrecision;
}

export interface TimeOfDayOptions extends TimeZoneOptions {
	/** Compare only down to this unit. Default: `"nanosecond"` (exact). */
	precision?: TruncationUnit | "nanosecond";
}

export interface DurationCompareOptions {
	/** Required to compare durations containing years, months or weeks. */
	relativeTo?: DateInput;
}

export interface ISODateTimeValidationOptions {
	/** Require `Z` or an explicit `±HH:mm` offset (an absolute timestamp). Default: `false`. */
	requireOffset?: boolean;
}

export interface UniqueDatesOptions extends TimeZoneOptions {
	/** Compare calendar dates only. Default: `false`. */
	ignoreTime?: boolean;
}
