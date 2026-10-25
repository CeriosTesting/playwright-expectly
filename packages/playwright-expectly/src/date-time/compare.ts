import { elapsedNanoseconds, formatDuration, formatElapsed } from "./durations";
import type { NormalizedDateTime } from "./inputs";
import { KIND_NAMES, isAbsolute } from "./inputs";
import type { Duration, PlainDate, PlainDateTime, ZonedDateTime } from "./temporal";
import { getTemporal } from "./temporal";
import { resolveTimeZone, toInstant, validateTimeZone } from "./zones";

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
		return values.map((value) => value as Point);
	}
	if (kinds.size > 1 && timeZone === undefined) {
		throw new TypeError(
			`Cannot compare a mix of ${describeMix(values)} without a time zone. ` +
				"Pass { timeZone } to interpret local values, or use values of the same kind.",
		);
	}
	const zone = timeZone === undefined ? resolveTimeZone(undefined, ...values) : validateTimeZone(timeZone);
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
 * Temporal `.add()` semantics: years, months, weeks and days follow the calendar (DST-aware in the
 * comparison zone), smaller units are exact elapsed time.
 */
export function addToPoint(point: Point, duration: Duration, label: string): Point {
	if (point.kind === "absolute") return { ...point, value: point.value.add(duration) };
	if (point.kind === "dateTime") return { ...point, value: point.value.add(duration) };
	const { hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
	if ([hours, minutes, seconds, milliseconds, microseconds, nanoseconds].some((value) => value !== 0)) {
		throw new TypeError(`Invalid ${label}: calendar dates can only be shifted by years, months, weeks or days`);
	}
	return { ...point, value: point.value.add(duration) };
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
