import { parseISOValue } from "./iso";
import type { Instant, PlainDate, PlainDateTime, PlainTime, ZonedDateTime } from "./temporal";
import type {
	TemporalInstantLike,
	TemporalPlainDateLike,
	TemporalPlainDateTimeLike,
	TemporalPlainTimeLike,
	TemporalZonedDateTimeLike,
} from "./types";

export type {
	CalendarDateInput,
	DateInput,
	DateTimeInput,
	DurationCompareOptions,
	DurationInput,
	DurationObject,
	DurationRange,
	EndOfDayOptions,
	ISODateTimeValidationOptions,
	InstantInput,
	RelativeTimeOptions,
	SubsecondPrecision,
	TimeInput,
	TimeOfDayOptions,
	TimeZoneOptions,
	TruncationUnit,
	UniqueDatesOptions,
} from "./types";
import {
	getTemporal,
	temporalKind,
	toActiveInstant,
	toActivePlainDate,
	toActivePlainDateTime,
	toActivePlainTime,
	toActiveZonedDateTime,
} from "./temporal";

export type NormalizedDateTime =
	| { kind: "date"; value: PlainDate; display: string }
	| { kind: "dateTime"; value: PlainDateTime; display: string }
	| { kind: "time"; value: PlainTime; display: string }
	/** `offset` is only set when an ISO string spelled it out; it is never inferred. */
	| { kind: "instant"; value: Instant; offset?: string; display: string }
	| { kind: "zoned"; value: ZonedDateTime; offset?: string; display: string };

export type AbsoluteDateTime = Extract<NormalizedDateTime, { kind: "instant" | "zoned" }>;

export const KIND_NAMES: Record<NormalizedDateTime["kind"], string> = {
	date: "calendar date",
	dateTime: "local datetime",
	time: "time of day",
	instant: "absolute timestamp",
	zoned: "zoned datetime",
};

function describe(value: unknown): string {
	if (value === null) return "null";
	if (Array.isArray(value)) return "an array";
	if (typeof value === "object") return Object.prototype.toString.call(value).slice(8, -1);
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		typeof value === "bigint"
	) {
		return `${typeof value} ${String(value)}`;
	}
	return typeof value;
}

function normalizeString(value: string, label: string): NormalizedDateTime {
	const parsed = parseISOValue(value, label);
	switch (parsed.kind) {
		case "date":
			return { kind: "date", value: parsed.value, display: value };
		case "time":
			return { kind: "time", value: parsed.value, display: value };
		case "localDateTime":
			return { kind: "dateTime", value: parsed.value, display: value };
		case "instant":
			return { kind: "instant", value: parsed.value, offset: parsed.offset, display: value };
		case "zonedDateTime":
			return { kind: "zoned", value: parsed.value, offset: parsed.offset, display: value };
	}
}

function normalizeTemporal(value: object, label: string): NormalizedDateTime | undefined {
	switch (temporalKind(value)) {
		case "Instant": {
			const instant = toActiveInstant(value as TemporalInstantLike);
			return { kind: "instant", value: instant, display: instant.toString() };
		}
		case "ZonedDateTime": {
			const zoned = toActiveZonedDateTime(value as TemporalZonedDateTimeLike, label);
			return { kind: "zoned", value: zoned, offset: zoned.offset, display: zoned.toString() };
		}
		case "PlainDate": {
			const date = toActivePlainDate(value as TemporalPlainDateLike, label);
			return { kind: "date", value: date, display: date.toString() };
		}
		case "PlainDateTime": {
			const dateTime = toActivePlainDateTime(value as TemporalPlainDateTimeLike, label);
			return { kind: "dateTime", value: dateTime, display: dateTime.toString() };
		}
		case "PlainTime": {
			const time = toActivePlainTime(value as TemporalPlainTimeLike);
			return { kind: "time", value: time, display: time.toString() };
		}
		default:
			return undefined;
	}
}

/**
 * Converts any supported input into a Temporal value of the active implementation.
 * @throws TypeError naming `label` for invalid Dates, unsupported strings and unsupported types.
 */
export function normalize(value: unknown, label: string): NormalizedDateTime {
	if (value instanceof Date) {
		const epochMilliseconds = value.getTime();
		if (Number.isNaN(epochMilliseconds)) throw new TypeError(`Invalid ${label}: Invalid Date`);
		return {
			kind: "instant",
			value: getTemporal().Instant.fromEpochMilliseconds(epochMilliseconds),
			display: value.toISOString(),
		};
	}
	if (typeof value === "string") return normalizeString(value, label);
	const normalized = typeof value === "object" && value !== null ? normalizeTemporal(value, label) : undefined;
	if (normalized === undefined) {
		throw new TypeError(
			`Invalid ${label}: expected a Date, an ISO 8601 string or a Temporal value, received ${describe(value)}`,
		);
	}
	return normalized;
}

/** Like {@link normalize}, restricted to the given kinds. */
export function normalizeAs<K extends NormalizedDateTime["kind"]>(
	value: unknown,
	label: string,
	kinds: readonly K[],
): Extract<NormalizedDateTime, { kind: K }> {
	const normalized = normalize(value, label);
	if (!(kinds as readonly string[]).includes(normalized.kind)) {
		const allowed = kinds.map((kind) => KIND_NAMES[kind]).join(" or ");
		throw new TypeError(
			`Invalid ${label}: expected ${allowed}, received ${KIND_NAMES[normalized.kind]} ${JSON.stringify(normalized.display)}`,
		);
	}
	return normalized as Extract<NormalizedDateTime, { kind: K }>;
}

export function isAbsolute(value: NormalizedDateTime): value is AbsoluteDateTime {
	return value.kind === "instant" || value.kind === "zoned";
}
