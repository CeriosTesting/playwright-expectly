import type {
	DateInput,
	DurationInput,
	InstantInput,
	TimeInput,
	ISODateString,
	ISODateTimeString,
	ISOInstantString,
	ISOLocalDateTimeString,
	ISOTimeString,
	ISOZonedDateTimeString,
	SupportedISOString,
	ValidatedISODate,
	ValidatedISODateTime,
	ValidatedISOInstant,
} from "@cerios/playwright-expectly";
import {
	expectly,
	isISODate,
	isISODateTime,
	isISOInstant,
	isISOZonedDateTime,
	parseISODate,
	parseISODateTime,
	parseISOInstant,
	parseISOTime,
	parseISOZonedDateTime,
} from "@cerios/playwright-expectly";
/**
 * Compile-only checks for the ISO template literal types, branded types, parse functions and guards.
 * Type-checked by `npm run lint`; `@ts-expect-error` lines must keep failing.
 */
import { Temporal as JsTemporal } from "@js-temporal/polyfill";
import { Temporal as PolyfillTemporal } from "temporal-polyfill";

// Valid literals.
export const validLiterals = [
	"2026-10-25" satisfies ISODateString,
	"0000-02-29" satisfies ISODateString,
	"14:30" satisfies ISOTimeString,
	"14:30:45.123456789" satisfies ISOTimeString,
	"2026-10-25T14:30:00" satisfies ISOLocalDateTimeString,
	"2026-10-25T14:30:00" satisfies ISODateTimeString,
	"2026-10-25T14:30:00.123456789" satisfies ISOLocalDateTimeString,
	"2026-10-25T14:30:00Z" satisfies ISOInstantString,
	"2026-10-25T14:30:00+01:00" satisfies ISOInstantString,
	"2026-10-25T14:30:00-05:30" satisfies ISOInstantString,
	"2026-10-25T14:30:00+01:00[Europe/Amsterdam]" satisfies ISOZonedDateTimeString,
	"2026-10-25T14:30:00[Europe/Amsterdam]" satisfies ISOZonedDateTimeString,
	"2026-10-25T14:30:00Z" satisfies SupportedISOString,
	// Structural types cannot prove a calendar date exists: this is caught at runtime only.
	"2026-02-30" satisfies ISODateString,
];

// Invalid structures.
// @ts-expect-error - month 13
export const invalidMonth = "2026-13-25" satisfies ISODateString;
// @ts-expect-error - day 32
export const invalidDay = "2026-10-32" satisfies ISODateString;
// @ts-expect-error - wrong order
export const wrongOrder = "25-10-2026" satisfies ISODateString;
// @ts-expect-error - slash separators
export const slashSeparators = "2026/10/25" satisfies ISODateString;
// @ts-expect-error - hour 29
export const invalidHour = "2026-10-25T29:99:00" satisfies ISODateTimeString;
// @ts-expect-error - minute 60
export const invalidMinute = "14:60" satisfies ISOTimeString;
// @ts-expect-error - space instead of T
export const spaceSeparator = "2026-10-25 14:30:00" satisfies ISODateTimeString;
// @ts-expect-error - local datetimes are not instants
export const localIsNotInstant = "2026-10-25T14:30:00" satisfies ISOInstantString;
// @ts-expect-error - instants are not local datetimes
export const instantIsNotLocal = "2026-10-25T14:30:00Z" satisfies ISOLocalDateTimeString;
// @ts-expect-error - a zoned datetime needs a zone annotation
export const missingZone = "2026-10-25T14:30:00+01:00" satisfies ISOZonedDateTimeString;
// @ts-expect-error - date only is not a datetime
export const dateIsNotDateTime = "2026-10-25" satisfies ISODateTimeString;

// Parse functions: literal-aware at compile time, dynamic strings validated at runtime.
declare const dynamic: string;
export const parsedDate: ValidatedISODate = parseISODate("2026-10-25");
export const parsedDynamic: ValidatedISODate = parseISODate(dynamic);
export const parsedInstant: ValidatedISOInstant = parseISOInstant("2026-10-25T12:30:45Z");
export const parsedDateTime: ValidatedISODateTime = parseISODateTime("2026-10-25T12:30:45");
export const parsedZoned = parseISOZonedDateTime("2026-10-25T14:30:00+01:00[Europe/Amsterdam]");
export const parsedTime = parseISOTime("09:00");
// @ts-expect-error - malformed literal is rejected before running
parseISODate("2026-13-25");
// @ts-expect-error - a local datetime literal is not an instant
parseISOInstant("2026-10-25T12:30:45");
// @ts-expect-error - hour 25
parseISOTime("25:00");

// Branded values remain strings and template types.
export const brandedIsString: string = parsedDate;
export const brandedIsTemplate: ISODateString = parsedDate;
export const brandedInstantIsDateTime: ISODateTimeString = parsedInstant;
export const reparsed: ValidatedISODate = parseISODate(parsedDate);
// @ts-expect-error - an unvalidated string is not branded
export const notBranded: ValidatedISODate = "2026-10-25";

// Guards narrow unknown values.
declare const external: unknown;
if (isISODate(external)) {
	const narrowed: ValidatedISODate = external;
	void narrowed;
}
if (isISOInstant(external)) {
	const narrowed: ISOInstantString = external;
	void narrowed;
}
if (isISODateTime(external)) {
	const narrowed: ValidatedISODateTime = external;
	void narrowed;
}
if (isISOZonedDateTime(external)) {
	const narrowed: ISOZonedDateTimeString = external;
	void narrowed;
}

// Matchers accept Date, dynamic and branded strings, and Temporal values from any implementation.

export function matcherSignatures(): void {
	expectly(new Date()).toBeBefore(new Date());
	expectly(dynamic).toBeAfter(dynamic);
	expectly(parsedInstant).toBeWithinLast({ minutes: 5 });
	expectly(parsedDate).toBeSameMonth("2026-10-01");
	expectly(JsTemporal.PlainDate.from("2026-10-25")).toBeSameMonth(PolyfillTemporal.PlainDate.from("2026-10-01"));
	expectly(JsTemporal.ZonedDateTime.from("2026-10-25T12:00:00[Europe/Amsterdam]")).toHaveTimeZone("Europe/Amsterdam");
	expectly(PolyfillTemporal.Duration.from({ seconds: 5 })).toBeShorterThan({ seconds: 10 });
	expectly("2026-10-25T12:00:00Z").toBeWithinDurationAfter(parsedInstant, { min: { seconds: 1 }, max: "PT10S" });
	expectly("2026-10-25T09:30:00").toBeWithinTimeOfDay("09:00", JsTemporal.PlainTime.from("17:00"), {
		timeZone: "Europe/Amsterdam",
	});
	expectly(["2026-10-25", new Date()]).toHaveMaximumDateGap({ days: 1 });
	expectly([new Date()]).toHaveUniqueDates({ ignoreTime: true });

	const instant: InstantInput = JsTemporal.Instant.from("2026-10-25T12:00:00Z");
	const date: DateInput = PolyfillTemporal.PlainDateTime.from("2026-10-25T12:00:00");
	const time: TimeInput = PolyfillTemporal.PlainTime.from("12:00");
	const duration: DurationInput = JsTemporal.Duration.from("PT1M");
	void [instant, date, time, duration];

	// @ts-expect-error - a PlainDate is not an absolute timestamp
	const notInstant: InstantInput = JsTemporal.PlainDate.from("2026-10-25");
	// @ts-expect-error - the boolean form of toHaveUniqueDates was replaced by an options object
	expectly([new Date()]).toHaveUniqueDates(true);
	// @ts-expect-error - toMatchTimeZone was removed in favour of toHaveOffset / toHaveTimeZone
	expectly(new Date()).toMatchTimeZone("UTC");
	// @ts-expect-error - unknown truncation unit
	expectly(new Date()).toBeTruncatedTo("day");
	void notInstant;
}
