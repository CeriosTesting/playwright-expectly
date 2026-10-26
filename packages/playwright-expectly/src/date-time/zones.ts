import type { AbsoluteDateTime, NormalizedDateTime } from "./inputs";
import { KIND_NAMES, isAbsolute, normalize } from "./inputs";
import type { Instant, PlainDate, PlainDateTime, PlainTime, ZonedDateTime } from "./temporal";
import { ISO_CALENDAR, getTemporal, validateCalendar } from "./temporal";
import type { InstantInput } from "./types";

/** The machine's time zone, which `Date` getters use. */
function systemTimeZone(): string {
	return getTemporal().Now.timeZoneId();
}

/** Validates an IANA identifier or `±HH:mm` offset accepted by Temporal. */
export function validateTimeZone(timeZone: unknown, label = "time zone"): string {
	if (typeof timeZone !== "string")
		throw new TypeError(`Invalid ${label}: expected a string, received ${typeof timeZone}`);
	try {
		return getTemporal().Instant.fromEpochNanoseconds(0n).toZonedDateTimeISO(timeZone).timeZoneId;
	} catch {
		throw new TypeError(`Invalid ${label}: ${JSON.stringify(timeZone)} is not a known IANA time zone or ±HH:mm offset`);
	}
}

/**
 * Resolves the one zone an assertion places absolute timestamps in:
 * explicit `timeZone` → a ZonedDateTime's own zone → an ISO string's explicit offset → the machine zone.
 */
export function resolveTimeZone(timeZone: string | undefined, ...values: NormalizedDateTime[]): string {
	if (timeZone !== undefined) return validateTimeZone(timeZone);
	const zoned = values.find((value) => value.kind === "zoned");
	if (zoned?.kind === "zoned") return zoned.value.timeZoneId;
	const withOffset = values.find((value) => value.kind === "instant" && value.offset !== undefined);
	if (withOffset?.kind === "instant" && withOffset.offset !== undefined) return withOffset.offset;
	return systemTimeZone();
}

/**
 * Resolves the one calendar an assertion reads years, months and days in:
 * explicit `calendar` → the non-ISO calendar the Temporal values carry → ISO 8601.
 */
export function resolveCalendar(calendar: string | undefined, ...values: NormalizedDateTime[]): string {
	if (calendar !== undefined) return validateCalendar(calendar);
	const carried = [
		...new Set(values.flatMap((value) => ("calendar" in value && value.calendar ? [value.calendar] : []))),
	];
	if (carried.length > 1) {
		throw new TypeError(`Values use different calendars (${carried.join(", ")}); pass { calendar } to choose one`);
	}
	return carried[0] ?? ISO_CALENDAR;
}

/** The same day with its fields (year, month, day, …) in `calendar`. */
export function inCalendar(date: PlainDate, calendar: string): PlainDate {
	return calendar === ISO_CALENDAR ? date : date.withCalendar(calendar);
}

export function toZoned(value: AbsoluteDateTime, timeZone: string): ZonedDateTime {
	if (value.kind === "zoned")
		return value.value.timeZoneId === timeZone ? value.value : value.value.withTimeZone(timeZone);
	return value.value.toZonedDateTimeISO(timeZone);
}

function unsupported(value: NormalizedDateTime, label: string, requirement: string): TypeError {
	return new TypeError(
		`Invalid ${label}: a ${KIND_NAMES[value.kind]} (${JSON.stringify(value.display)}) has no ${requirement}`,
	);
}

/** The calendar date of a value; absolute timestamps are placed in `timeZone`. */
export function calendarDate(value: NormalizedDateTime, timeZone: string, label: string): PlainDate {
	if (value.kind === "date") return value.value;
	if (value.kind === "dateTime") return value.value.toPlainDate();
	if (value.kind === "time") throw unsupported(value, label, "calendar date");
	return toZoned(value, timeZone).toPlainDate();
}

/** The wall-clock datetime of a value; absolute timestamps are placed in `timeZone`. */
export function wallClock(value: NormalizedDateTime, timeZone: string, label: string): PlainDateTime {
	if (value.kind === "dateTime") return value.value;
	if (value.kind === "date") throw unsupported(value, label, "time of day");
	if (value.kind === "time") throw unsupported(value, label, "calendar date");
	return toZoned(value, timeZone).toPlainDateTime();
}

/** The time of day of a value; absolute timestamps are placed in `timeZone`. */
export function timeOfDay(value: NormalizedDateTime, timeZone: string, label: string): PlainTime {
	if (value.kind === "time") return value.value;
	return wallClock(value, timeZone, label).toPlainTime();
}

/**
 * The absolute instant of a value. Local values are only converted with an explicit `timeZone`,
 * and nonexistent or repeated (DST) local times are rejected instead of guessed.
 */
export function toInstant(value: NormalizedDateTime, label: string, timeZone?: string): Instant {
	if (value.kind === "instant") return value.value;
	if (value.kind === "zoned") return value.value.toInstant();
	if (value.kind === "time") throw unsupported(value, label, "calendar date");
	if (timeZone === undefined) {
		throw new TypeError(
			`Cannot use ${label} ${JSON.stringify(value.display)} as an absolute timestamp: a ${KIND_NAMES[value.kind]} has no time zone. ` +
				"Pass { timeZone } to interpret it, or use an ISO string with Z/offset, a Date or a Temporal.Instant/ZonedDateTime.",
		);
	}
	const zone = validateTimeZone(timeZone);
	if (value.kind === "date") return value.value.toZonedDateTime({ timeZone: zone }).toInstant();
	try {
		return value.value.toZonedDateTime(zone, { disambiguation: "reject" }).toInstant();
	} catch {
		throw new TypeError(
			`Cannot use ${label} ${JSON.stringify(value.display)} in ${zone}: that local time does not exist or occurs twice (DST transition)`,
		);
	}
}

/**
 * "Now", captured once per assertion. Without `now`, `Date.now()` is read first so fake timers are
 * honoured; the more precise `Temporal.Now.instant()` is used only when it agrees to the millisecond.
 */
export function currentInstant(now: InstantInput | undefined): Instant {
	if (now === undefined) {
		const T = getTemporal();
		const milliseconds = Date.now();
		const precise = T.Now.instant();
		const drift = precise.epochMilliseconds - milliseconds;
		return drift === 0 || drift === 1 ? precise : T.Instant.fromEpochMilliseconds(milliseconds);
	}
	const normalized = normalize(now, "now");
	if (!isAbsolute(normalized)) throw unsupported(normalized, "now", "time zone; pass an absolute timestamp");
	return toInstant(normalized, "now");
}
