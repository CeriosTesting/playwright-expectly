import { elapsedNanoseconds, formatDuration, formatElapsed } from "./durations";
import type { NormalizedDateTime } from "./inputs";
import { KIND_NAMES, isAbsolute } from "./inputs";
import type { Duration, PlainDate, PlainDateTime, ZonedDateTime } from "./temporal";
import { ISO_CALENDAR, getTemporal } from "./temporal";
import { preferredTimeZone, toInstant, validateTimeZone } from "./zones";

/** A value on a common timeline: absolute timestamps (placed in one zone) or same-kind local values. */
export type Point =
	| { kind: "absolute"; value: ZonedDateTime; display: string }
	| { kind: "dateTime"; value: PlainDateTime; display: string }
	| { kind: "date"; value: PlainDate; display: string };

function describeMix(values: readonly NormalizedDateTime[]): string {
	return [...new Set(values.map((value) => KIND_NAMES[value.kind]))].join(", ");
}

/**
 * Puts values on one comparable timeline. Absolute timestamps compare as instants. Local values
 * compare with values of the same kind. Mixing kinds requires an explicit `timeZone`, which turns
 * local values into instants (start of day for dates); nothing is converted implicitly.
 */
export function alignPoints(
	values: readonly NormalizedDateTime[],
	labels: readonly string[],
	timeZone?: string,
): Point[] {
	const timeValue = values.findIndex((value) => value.kind === "time");
	if (timeValue !== -1) {
		throw new TypeError(
			`Invalid ${labels[timeValue]}: a time of day (${JSON.stringify(values[timeValue].display)}) has no calendar date`,
		);
	}
	const kinds = new Set(values.map((value) => (isAbsolute(value) ? "absolute" : value.kind)));
	if (kinds.size <= 1 && !kinds.has("absolute")) {
		if (timeZone !== undefined) {
			throw new TypeError(
				"The timeZone option only applies to absolute timestamps or mixed values; local values of one kind are compared as they are",
			);
		}
		return values.map((value) => value as Point);
	}
	if (kinds.size > 1 && timeZone === undefined) {
		throw new TypeError(
			`Cannot compare a mix of ${describeMix(values)} without a time zone. ` +
				"Pass { timeZone } to interpret local values, or use values of the same kind.",
		);
	}
	// Absolute timestamps compare as instants; the zone only matters for DST-aware calendar arithmetic.
	const zone = timeZone === undefined ? preferredTimeZone(...values) : validateTimeZone(timeZone);
	return values.map((value, index) => ({
		kind: "absolute",
		value: toInstant(value, labels[index], zone).toZonedDateTimeISO(zone),
		display: value.display,
	}));
}

function compareBigInt(left: bigint, right: bigint): number {
	if (left === right) return 0;
	return left < right ? -1 : 1;
}

/** The end of an inclusive range; `exclusive` when the end is the start of the day after a date-only bound. */
export type RangeEnd = { point: Point; exclusive: boolean };

/**
 * The end of an inclusive date range. A calendar-date end bound that was aligned with timestamps covers
 * that whole day, so the range ends where the next day starts (exclusive) instead of at its first instant.
 */
export function rangeEnd(end: Point, original: NormalizedDateTime): RangeEnd {
	if (end.kind !== "absolute" || original.kind !== "date") return { point: end, exclusive: false };
	const nextDay = end.value.toPlainDate().add({ days: 1 }).toZonedDateTime({ timeZone: end.value.timeZoneId });
	return { point: { ...end, value: nextDay }, exclusive: true };
}

/** Whether `point` lies in the range from `start` (inclusive) to `end`. */
export function isInRange(point: Point, start: Point, end: RangeEnd): boolean {
	const toEnd = comparePoints(point, end.point);
	return comparePoints(point, start) >= 0 && (end.exclusive ? toEnd < 0 : toEnd <= 0);
}

/** Throws when an inclusive range is inverted. */
export function assertRangeOrder(start: Point, end: Point): void {
	if (comparePoints(start, end) > 0) {
		throw new TypeError(`Invalid range: start date ${start.display} is after end date ${end.display}`);
	}
}

/** Chronological order of two aligned points: negative, zero or positive. */
export function comparePoints(left: Point, right: Point): number {
	const T = getTemporal();
	if (left.kind === "absolute" && right.kind === "absolute") {
		return compareBigInt(left.value.epochNanoseconds, right.value.epochNanoseconds);
	}
	if (left.kind === "dateTime" && right.kind === "dateTime") return T.PlainDateTime.compare(left.value, right.value);
	if (left.kind === "date" && right.kind === "date") return T.PlainDate.compare(left.value, right.value);
	throw new TypeError(`Cannot compare a ${left.kind} value with a ${right.kind} value`);
}

/**
 * Temporal `.add()` semantics: years, months, weeks and days follow `calendar` (DST-aware in the
 * comparison zone), smaller units are exact elapsed time. The result is back in the ISO calendar.
 */
export function addToPoint(point: Point, duration: Duration, label: string, calendar = ISO_CALENDAR): Point {
	const shift = <T extends Point["value"]>(value: T): T =>
		(calendar === ISO_CALENDAR
			? value.add(duration)
			: value.withCalendar(calendar).add(duration).withCalendar(ISO_CALENDAR)) as T;
	if (point.kind === "absolute") return { ...point, value: shift(point.value) };
	if (point.kind === "dateTime") return { ...point, value: shift(point.value) };
	const { hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
	if ([hours, minutes, seconds, milliseconds, microseconds, nanoseconds].some((value) => value !== 0)) {
		throw new TypeError(`Invalid ${label}: calendar dates can only be shifted by years, months, weeks or days`);
	}
	return { ...point, value: shift(point.value) };
}

/** The unsigned distance between two points, formatted for diagnostics. */
export function formatDistance(left: Point, right: Point): string {
	return comparePoints(left, right) <= 0 ? formatGap(left, right) : formatGap(right, left);
}

/** The signed distance from `from` to `to`, formatted for diagnostics. */
export function formatGap(from: Point, to: Point): string {
	if (from.kind === "absolute" && to.kind === "absolute") {
		return formatElapsed(to.value.epochNanoseconds - from.value.epochNanoseconds);
	}
	if (from.kind === "dateTime" && to.kind === "dateTime") {
		return formatDuration(from.value.until(to.value, { largestUnit: "days" }));
	}
	if (from.kind === "date" && to.kind === "date")
		return formatDuration(from.value.until(to.value, { largestUnit: "days" }));
	return "n/a";
}

/**
 * Elapsed nanoseconds from `from` to `to`. Local datetimes use wall-clock difference; calendar
 * dates count 24 hours per day.
 */
export function pointDifference(from: Point, to: Point): bigint {
	if (from.kind === "absolute" && to.kind === "absolute")
		return to.value.epochNanoseconds - from.value.epochNanoseconds;
	if (from.kind === "dateTime" && to.kind === "dateTime") {
		return elapsedNanoseconds(from.value.until(to.value, { largestUnit: "hours" }), "difference");
	}
	if (from.kind === "date" && to.kind === "date") {
		return elapsedNanoseconds(from.value.until(to.value, { largestUnit: "days" }), "difference");
	}
	throw new TypeError(`Cannot compare a ${from.kind} value with a ${to.kind} value`);
}

/** Identity of a point for uniqueness checks. */
export function pointKey(point: Point): string {
	return point.kind === "absolute" ? point.value.epochNanoseconds.toString() : point.value.toString();
}
