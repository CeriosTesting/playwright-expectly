// The `implementation` entry is always the polyfill; the package root would return any global Temporal.
// The `full` build adds the non-ISO calendars (hebrew, islamic, persian, japanese, …).
import type { Temporal as TemporalTypes } from "temporal-polyfill/full/implementation";
import { Temporal as PolyfillTemporal } from "temporal-polyfill/full/implementation";

import type {
	TemporalDurationLike,
	TemporalInstantLike,
	TemporalPlainDateLike,
	TemporalPlainDateTimeLike,
	TemporalPlainTimeLike,
	TemporalZonedDateTimeLike,
} from "./types";

export type {
	TemporalDurationLike,
	TemporalInstantLike,
	TemporalPlainDateLike,
	TemporalPlainDateTimeLike,
	TemporalPlainTimeLike,
	TemporalZonedDateTimeLike,
} from "./types";

/** The implementation every computation runs on: native Temporal when present, else the polyfill. */
export type TemporalApi = typeof TemporalTypes;
export type Instant = TemporalTypes.Instant;
export type ZonedDateTime = TemporalTypes.ZonedDateTime;
export type PlainDate = TemporalTypes.PlainDate;
export type PlainDateTime = TemporalTypes.PlainDateTime;
export type PlainTime = TemporalTypes.PlainTime;
export type Duration = TemporalTypes.Duration;

type TemporalKind = "Instant" | "ZonedDateTime" | "PlainDate" | "PlainDateTime" | "PlainTime" | "Duration";

const TEMPORAL_TAG = /^\[object Temporal\.(Instant|ZonedDateTime|PlainDate|PlainDateTime|PlainTime|Duration)\]$/;
export const ISO_CALENDAR = "iso8601";

function hasPrototypeMember(constructor: unknown, member: string): boolean {
	return typeof constructor === "function" && member in (constructor as { prototype: object }).prototype;
}

/**
 * Accepts only implementations of the current specification. Early engine builds (for example
 * Node 24 with `--harmony-temporal`) expose an outdated draft without `calendarId`, `timeZoneId`
 * or `Now.timeZoneId()`; those fall back to the polyfill.
 */
function isTemporalApi(candidate: unknown): candidate is TemporalApi {
	if (typeof candidate !== "object" || candidate === null) return false;
	const api = candidate as Partial<Record<"Instant" | "ZonedDateTime" | "PlainDate" | "Duration" | "Now", unknown>>;
	return (
		typeof api.Instant === "function" &&
		typeof (api.Duration as { compare?: unknown } | undefined)?.compare === "function" &&
		typeof (api.Now as { timeZoneId?: unknown } | undefined)?.timeZoneId === "function" &&
		hasPrototypeMember(api.PlainDate, "calendarId") &&
		hasPrototypeMember(api.ZonedDateTime, "timeZoneId") &&
		hasPrototypeMember(api.ZonedDateTime, "withTimeZone")
	);
}

/**
 * Resolved per call, so a global Temporal (native, or a polyfill the user installed globally) is
 * preferred whenever it is available. Expectly itself never assigns `globalThis.Temporal`.
 */
export function getTemporal(): TemporalApi {
	const candidate: unknown = (globalThis as { Temporal?: unknown }).Temporal;
	return isTemporalApi(candidate) ? candidate : PolyfillTemporal;
}

/** Detects Temporal values from any implementation without relying on `instanceof`. */
export function temporalKind(value: unknown): TemporalKind | undefined {
	if (typeof value !== "object" || value === null) return undefined;
	const match = TEMPORAL_TAG.exec(Object.prototype.toString.call(value));
	return match ? (match[1] as TemporalKind) : undefined;
}

/** Reads an identifier from current values (`calendarId`) and outdated drafts (`calendar.id`). */
function identifier(value: object, current: string, legacy: string): string | undefined {
	const record = value as Record<string, unknown>;
	if (typeof record[current] === "string") return record[current];
	const object = record[legacy];
	if (typeof object === "string") return object;
	const id = typeof object === "object" && object !== null ? (object as { id?: unknown }).id : undefined;
	return typeof id === "string" ? id : undefined;
}

/** The calendar of a Temporal value; values without a readable calendar are treated as ISO. */
export function calendarIdOf(value: object): string {
	return identifier(value, "calendarId", "calendar") ?? ISO_CALENDAR;
}

/**
 * The same day in the ISO calendar. A value in another calendar converts itself, because its
 * `year`/`month`/`day` fields are in that calendar.
 */
function inIsoCalendar<T extends TemporalPlainDateLike | TemporalPlainDateTimeLike>(value: T, label: string): T {
	const calendar = calendarIdOf(value);
	if (calendar === ISO_CALENDAR) return value;
	const withCalendar = (value as { withCalendar?: unknown }).withCalendar;
	if (typeof withCalendar !== "function") {
		throw new TypeError(`Invalid ${label}: cannot convert calendar "${calendar}" to ISO 8601`);
	}
	return (withCalendar as (calendar: string) => T).call(value, ISO_CALENDAR);
}

/** Validates a calendar identifier known to Temporal and returns its canonical form. */
export function validateCalendar(calendar: unknown, label = "calendar"): string {
	if (typeof calendar !== "string")
		throw new TypeError(`Invalid ${label}: expected a string, received ${typeof calendar}`);
	try {
		return getTemporal().PlainDate.from("2000-01-01").withCalendar(calendar).calendarId;
	} catch {
		throw new TypeError(`Invalid ${label}: ${JSON.stringify(calendar)} is not a supported calendar`);
	}
}

// Values from another implementation are rebuilt from their public fields; same-implementation values are reused.
// Every value is converted to the ISO calendar; callers keep the original calendar via `calendarIdOf`.
export function toActiveInstant(value: TemporalInstantLike): Instant {
	const T = getTemporal();
	return value instanceof T.Instant ? value : T.Instant.fromEpochNanoseconds(value.epochNanoseconds);
}

export function toActiveZonedDateTime(value: TemporalZonedDateTimeLike, label: string): ZonedDateTime {
	const T = getTemporal();
	if (value instanceof T.ZonedDateTime) return value.withCalendar(ISO_CALENDAR);
	const timeZone = identifier(value, "timeZoneId", "timeZone");
	if (timeZone === undefined) throw new TypeError(`Invalid ${label}: the ZonedDateTime has no readable time zone`);
	return T.Instant.fromEpochNanoseconds(value.epochNanoseconds).toZonedDateTimeISO(timeZone);
}

export function toActivePlainDate(input: TemporalPlainDateLike, label: string): PlainDate {
	const value = inIsoCalendar(input, label);
	const T = getTemporal();
	if (value instanceof T.PlainDate) return value;
	return T.PlainDate.from({ year: value.year, month: value.month, day: value.day }, { overflow: "reject" });
}

function timeFields(value: TemporalPlainTimeLike | TemporalPlainDateTimeLike): Record<string, number> {
	return {
		hour: value.hour,
		minute: value.minute,
		second: value.second,
		millisecond: value.millisecond,
		microsecond: value.microsecond,
		nanosecond: value.nanosecond,
	};
}

export function toActivePlainDateTime(input: TemporalPlainDateTimeLike, label: string): PlainDateTime {
	const value = inIsoCalendar(input, label);
	const T = getTemporal();
	if (value instanceof T.PlainDateTime) return value;
	return T.PlainDateTime.from(
		{ year: value.year, month: value.month, day: value.day, ...timeFields(value) },
		{ overflow: "reject" },
	);
}

export function toActivePlainTime(value: TemporalPlainTimeLike): PlainTime {
	const T = getTemporal();
	if (value instanceof T.PlainTime) return value;
	return T.PlainTime.from(timeFields(value), { overflow: "reject" });
}

export function toActiveDuration(value: TemporalDurationLike): Duration {
	const T = getTemporal();
	if (value instanceof T.Duration) return value;
	return T.Duration.from({
		years: value.years,
		months: value.months,
		weeks: value.weeks,
		days: value.days,
		hours: value.hours,
		minutes: value.minutes,
		seconds: value.seconds,
		milliseconds: value.milliseconds,
		microseconds: value.microseconds,
		nanoseconds: value.nanoseconds,
	});
}
