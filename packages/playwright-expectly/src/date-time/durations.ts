import { normalize } from "./inputs";
import type { Duration, PlainDate, TemporalDurationLike, ZonedDateTime } from "./temporal";
import { getTemporal, temporalKind, toActiveDuration } from "./temporal";
import type { DateInput, DurationInput } from "./types";

const DURATION_UNITS = [
	"years",
	"months",
	"weeks",
	"days",
	"hours",
	"minutes",
	"seconds",
	"milliseconds",
	"microseconds",
	"nanoseconds",
] as const;

type DurationUnit = (typeof DURATION_UNITS)[number];

const CALENDAR_UNITS: readonly DurationUnit[] = ["years", "months", "weeks"];

const NANOSECONDS: Record<Exclude<DurationUnit, "years" | "months" | "weeks">, bigint> = {
	days: 86_400_000_000_000n,
	hours: 3_600_000_000_000n,
	minutes: 60_000_000_000n,
	seconds: 1_000_000_000n,
	milliseconds: 1_000_000n,
	microseconds: 1_000n,
	nanoseconds: 1n,
};

function fromObject(input: object, label: string): Duration {
	const unknownKeys = Object.keys(input).filter((key) => !(DURATION_UNITS as readonly string[]).includes(key));
	if (unknownKeys.length > 0) {
		throw new TypeError(`Invalid ${label}: unknown duration unit(s) ${unknownKeys.join(", ")}`);
	}
	const fields = input as Partial<Record<DurationUnit, unknown>>;
	for (const unit of DURATION_UNITS) {
		const value = fields[unit];
		if (value !== undefined && !Number.isSafeInteger(value)) {
			throw new TypeError(
				`Invalid ${label}: ${unit} must be an integer, received ${typeof value === "number" ? value : typeof value}`,
			);
		}
	}
	if (DURATION_UNITS.every((unit) => fields[unit] === undefined)) {
		throw new TypeError(`Invalid ${label}: specify at least one duration unit`);
	}
	return getTemporal().Duration.from(fields as Record<DurationUnit, number>);
}

/**
 * Normalizes a duration object, Temporal.Duration (any implementation) or ISO 8601 duration string.
 * @throws TypeError for unknown units, fractional values or mixed signs.
 */
export function normalizeDuration(input: DurationInput, label: string): Duration {
	try {
		if (typeof input === "string") return getTemporal().Duration.from(input);
		if (temporalKind(input) === "Duration") return toActiveDuration(input as TemporalDurationLike);
		if (typeof input === "object" && input !== null && temporalKind(input) === undefined) {
			return fromObject(input, label);
		}
	} catch (error) {
		if (error instanceof TypeError && error.message.startsWith(`Invalid ${label}`)) throw error;
		throw new TypeError(`Invalid ${label}: ${error instanceof Error ? error.message : String(error)}`);
	}
	throw new TypeError(`Invalid ${label}: expected a duration object, Temporal.Duration or ISO 8601 duration string`);
}

function hasCalendarUnits(duration: Duration): boolean {
	return CALENDAR_UNITS.some((unit) => duration[unit] !== 0);
}

/**
 * Exact elapsed nanoseconds of a duration. `days` count as 24 hours; years, months and weeks are
 * rejected because their length depends on the calendar.
 */
export function elapsedNanoseconds(duration: Duration, label: string): bigint {
	if (hasCalendarUnits(duration)) {
		throw new TypeError(
			`Invalid ${label}: ${duration.toString()} uses years, months or weeks, whose elapsed length depends on the calendar. ` +
				"Use days (24 hours each) or smaller units.",
		);
	}
	let total = 0n;
	for (const [unit, nanoseconds] of Object.entries(NANOSECONDS) as Array<[keyof typeof NANOSECONDS, bigint]>) {
		total += BigInt(duration[unit]) * nanoseconds;
	}
	return total;
}

/** Elapsed nanoseconds of a non-negative duration input. */
export function elapsedLimit(input: DurationInput, label: string): bigint {
	const duration = normalizeDuration(input, label);
	if (duration.sign < 0) throw new TypeError(`Invalid ${label}: ${duration.toString()} must not be negative`);
	return elapsedNanoseconds(duration, label);
}

/** A non-negative calendar-aware duration. */
export function nonNegativeDuration(input: DurationInput, label: string): Duration {
	const duration = normalizeDuration(input, label);
	if (duration.sign < 0) throw new TypeError(`Invalid ${label}: ${duration.toString()} must not be negative`);
	return duration;
}

function plural(count: string, unit: string): string {
	return `${count} ${unit}${count === "1" ? "" : "s"}`;
}

/** Human-readable elapsed time, e.g. `17.25 seconds` or `1 hour 2 minutes 3.5 seconds`. */
export function formatElapsed(nanoseconds: bigint): string {
	const negative = nanoseconds < 0n;
	let rest = negative ? -nanoseconds : nanoseconds;
	const parts: string[] = [];
	for (const unit of ["days", "hours", "minutes"] as const) {
		const size = NANOSECONDS[unit];
		if (rest >= size) {
			parts.push(plural((rest / size).toString(), unit.slice(0, -1)));
			rest %= size;
		}
	}
	const second = NANOSECONDS.seconds;
	if (rest > 0n || parts.length === 0) {
		const fraction = (rest % second).toString().padStart(9, "0").replace(/0+$/, "");
		parts.push(plural(`${(rest / second).toString()}${fraction ? `.${fraction}` : ""}`, "second"));
	}
	return `${negative ? "-" : ""}${parts.join(" ")}`;
}

/** Human-readable duration, e.g. `1 month 2 days` (ISO form appended for precision). */
export function formatDuration(duration: Duration): string {
	const parts = DURATION_UNITS.filter((unit) => duration[unit] !== 0).map((unit) =>
		plural(String(Math.abs(duration[unit])), unit.slice(0, -1)),
	);
	const text = parts.length === 0 ? "0 seconds" : `${duration.sign < 0 ? "-" : ""}${parts.join(" ")}`;
	return `${text} (${duration.toString()})`;
}

function toRelativeTo(input: DateInput): PlainDate | ZonedDateTime {
	const value = normalize(input, "relativeTo");
	if (value.kind === "date") return value.value;
	if (value.kind === "dateTime") return value.value.toPlainDate();
	if (value.kind === "zoned") return value.value;
	if (value.kind === "instant" && value.offset !== undefined) return value.value.toZonedDateTimeISO(value.offset);
	throw new TypeError(
		`Invalid relativeTo: ${JSON.stringify(value.display)} has no calendar or time zone; ` +
			"use a calendar date, a local datetime, an ISO string with an offset or a ZonedDateTime",
	);
}

/**
 * Orders two durations. Years, months and weeks have no fixed length, so they require `relativeTo`;
 * without it, days count as 24 hours (Temporal semantics).
 */
export function compareDurations(left: Duration, right: Duration, relativeTo: DateInput | undefined): number {
	if (relativeTo === undefined) {
		if (hasCalendarUnits(left) || hasCalendarUnits(right)) {
			throw new TypeError(
				`Cannot compare ${left.toString()} with ${right.toString()}: years, months and weeks have no fixed length. ` +
					"Pass { relativeTo } with the date the durations start from.",
			);
		}
		return getTemporal().Duration.compare(left, right);
	}
	return getTemporal().Duration.compare(left, right, { relativeTo: toRelativeTo(relativeTo) });
}
