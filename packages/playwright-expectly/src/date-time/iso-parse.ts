import type { ISOKind } from "./iso";
import { parseISOValue, tryParseISO } from "./iso";
import type {
	ISODateString,
	ISODateTimeString,
	ISOInstantString,
	ISOLiteral,
	ISOLocalDateTimeString,
	ISOTimeString,
	ISOZonedDateTimeString,
	ValidatedISODate,
	ValidatedISODateTime,
	ValidatedISOInstant,
	ValidatedISOLocalDateTime,
	ValidatedISOTime,
	ValidatedISOZonedDateTime,
} from "./iso-types";

const DATE_TIME_KINDS: readonly ISOKind[] = ["localDateTime", "instant", "zonedDateTime"];

function validate(value: string, kinds: readonly ISOKind[]): string {
	if (typeof value !== "string") {
		throw new TypeError(`Invalid ISO string: expected a string, received ${typeof value}`);
	}
	parseISOValue(value, "ISO string", kinds);
	return value;
}

/**
 * Validates an ISO calendar date (`YYYY-MM-DD`) and returns it branded as {@link ValidatedISODate}.
 * Malformed string literals are rejected at compile time; every value is validated at runtime.
 * @throws TypeError for malformed or impossible dates such as `"2026-02-30"`.
 */
export function parseISODate<S extends string>(value: ISOLiteral<S, ISODateString, "ISO date">): ValidatedISODate {
	return validate(value, ["date"]) as ValidatedISODate;
}

/** Validates an ISO time of day (`HH:mm[:ss[.fffffffff]]`). */
export function parseISOTime<S extends string>(value: ISOLiteral<S, ISOTimeString, "ISO time">): ValidatedISOTime {
	return validate(value, ["time"]) as ValidatedISOTime;
}

/** Validates a local ISO datetime without offset or time zone (`YYYY-MM-DDTHH:mm:ss[.fffffffff]`). */
export function parseISOLocalDateTime<S extends string>(
	value: ISOLiteral<S, ISOLocalDateTimeString, "ISO local datetime">,
): ValidatedISOLocalDateTime {
	return validate(value, ["localDateTime"]) as ValidatedISOLocalDateTime;
}

/** Validates any supported ISO datetime: local, instant (offset) or zoned (IANA annotation). */
export function parseISODateTime<S extends string>(
	value: ISOLiteral<S, ISODateTimeString, "ISO datetime">,
): ValidatedISODateTime {
	return validate(value, DATE_TIME_KINDS) as ValidatedISODateTime;
}

/** Validates an absolute ISO timestamp with `Z` or a numeric offset. The offset is preserved. */
export function parseISOInstant<S extends string>(
	value: ISOLiteral<S, ISOInstantString, "ISO instant">,
): ValidatedISOInstant {
	return validate(value, ["instant"]) as ValidatedISOInstant;
}

/** Validates an ISO datetime with an IANA time-zone annotation; offsets must agree with the zone. */
export function parseISOZonedDateTime<S extends string>(
	value: ISOLiteral<S, ISOZonedDateTimeString, "ISO zoned datetime">,
): ValidatedISOZonedDateTime {
	return validate(value, ["zonedDateTime"]) as ValidatedISOZonedDateTime;
}

/** True for a string holding a valid ISO calendar date (`YYYY-MM-DD`). */
export function isISODate(value: unknown): value is ValidatedISODate {
	return tryParseISO(value, ["date"]) !== undefined;
}

/** True for a string holding a valid ISO time of day. */
export function isISOTime(value: unknown): value is ValidatedISOTime {
	return tryParseISO(value, ["time"]) !== undefined;
}

/** True for a string holding a valid local ISO datetime (no offset, no time zone). */
export function isISOLocalDateTime(value: unknown): value is ValidatedISOLocalDateTime {
	return tryParseISO(value, ["localDateTime"]) !== undefined;
}

/** True for a string holding any valid ISO datetime: local, instant or zoned. */
export function isISODateTime(value: unknown): value is ValidatedISODateTime {
	return tryParseISO(value, DATE_TIME_KINDS) !== undefined;
}

/** True for a string holding a valid absolute ISO timestamp with `Z` or a numeric offset. */
export function isISOInstant(value: unknown): value is ValidatedISOInstant {
	return tryParseISO(value, ["instant"]) !== undefined;
}

/** True for a string holding a valid ISO datetime with an IANA time-zone annotation. */
export function isISOZonedDateTime(value: unknown): value is ValidatedISOZonedDateTime {
	return tryParseISO(value, ["zonedDateTime"]) !== undefined;
}
