import { withMatcherState } from "@cerios/playwright-expectly-core";

import type { NormalizedDateTime } from "../date-time/inputs";
import { isAbsolute, normalizeAs } from "../date-time/inputs";
import type { PlainDateTime, PlainTime, ZonedDateTime } from "../date-time/temporal";
import { getTemporal } from "../date-time/temporal";
import type {
	DateTimeInput,
	EndOfDayOptions,
	SubsecondPrecision,
	TimeInput,
	TimeOfDayOptions,
	TimeZoneOptions,
	TruncationUnit,
} from "../date-time/types";
import { resolveTimeZone, timeOfDay, toZoned, wallClock } from "../date-time/zones";

import { dateMatcherResult, rejectTimeZoneWithoutAbsolute, zoneLine } from "./date-matcher-utils";

const TRUNCATION_UNITS: readonly TruncationUnit[] = ["hour", "minute", "second", "millisecond", "microsecond"];
const PRECISION_NANOSECONDS: Record<SubsecondPrecision, number> = {
	second: 1e9,
	millisecond: 1e6,
	microsecond: 1e3,
	nanosecond: 1,
};

const DATE_TIME_KINDS = ["dateTime", "instant", "zoned"] as const;
const TIME_KINDS = ["time", "dateTime", "instant", "zoned"] as const;

type Clock = { kind: "zoned"; value: ZonedDateTime } | { kind: "dateTime"; value: PlainDateTime };

/** Absolute values in the resolved zone; local datetimes as they are. */
function onClock(value: NormalizedDateTime, timeZone: string): Clock {
	return isAbsolute(value)
		? { kind: "zoned", value: toZoned(value, timeZone) }
		: { kind: "dateTime", value: wallClock(value, timeZone, "actual date") };
}

function validateUnit<T extends string>(unit: T, allowed: readonly T[], label: string): T {
	if (!allowed.includes(unit))
		throw new TypeError(`Invalid ${label}: ${String(unit)}. Use one of ${allowed.join(", ")}`);
	return unit;
}

function sameUnit(
	actual: unknown,
	expected: unknown,
	unit: "hour" | "minute" | "second",
	timeZone: string | undefined,
): { pass: boolean; received: NormalizedDateTime; target: NormalizedDateTime; zone: string; floors: [string, string] } {
	const received = normalizeAs(actual, "actual date", DATE_TIME_KINDS);
	const target = normalizeAs(expected, "expected date", DATE_TIME_KINDS);
	rejectTimeZoneWithoutAbsolute(timeZone, [received, target]);
	const zone = resolveTimeZone(timeZone, received, target);
	const round = { smallestUnit: unit, roundingMode: "floor" } as const;
	if (isAbsolute(received) && isAbsolute(target)) {
		// Compare the floored instants so the two occurrences of a repeated DST hour stay distinct.
		const left = toZoned(received, zone).round(round);
		const right = toZoned(target, zone).round(round);
		return {
			pass: left.epochNanoseconds === right.epochNanoseconds,
			received,
			target,
			zone,
			floors: [left.toString(), right.toString()],
		};
	}
	const left = wallClock(received, zone, "actual date").round(round);
	const right = wallClock(target, zone, "expected date").round(round);
	return { pass: left.equals(right), received, target, zone, floors: [left.toString(), right.toString()] };
}

function sameUnitResult(
	state: Parameters<typeof dateMatcherResult>[0],
	name: string,
	unit: "hour" | "minute" | "second",
	actual: DateTimeInput,
	expected: DateTimeInput,
	options: TimeZoneOptions | undefined,
): ReturnType<typeof dateMatcherResult> {
	const { pass, received, target, zone, floors } = sameUnit(actual, expected, unit, options?.timeZone);
	return dateMatcherResult(state, {
		name,
		pass,
		subject: "dates",
		expectation: `be in the same ${unit}`,
		lines: () => [
			["Expected", target.display, "expected"],
			["Received", received.display, "received"],
			[`Expected ${unit}`, floors[1]],
			[`Received ${unit}`, floors[0]],
			zoneLine(zone, received, target),
		],
		expected,
		actual,
	});
}

function truncate(value: PlainTime, precision: TimeOfDayOptions["precision"]): PlainTime {
	if (precision === undefined || precision === "nanosecond") return value;
	return value.round({ smallestUnit: validateUnit(precision, TRUNCATION_UNITS, "precision"), roundingMode: "trunc" });
}

function compareTimes(left: PlainTime, right: PlainTime): number {
	return getTemporal().PlainTime.compare(left, right);
}

/**
 * Time-of-day matchers. Absolute timestamps are read on the clock of one zone per assertion: the
 * `timeZone` option, else a ZonedDateTime's zone, else an ISO string's offset, else the machine zone.
 */
export const expectlyDateTimeOfDayMatchers = withMatcherState({
	toBeSameHour(actual: DateTimeInput, expected: DateTimeInput, options?: TimeZoneOptions) {
		return sameUnitResult(this, "toBeSameHour", "hour", actual, expected, options);
	},

	toBeSameMinute(actual: DateTimeInput, expected: DateTimeInput, options?: TimeZoneOptions) {
		return sameUnitResult(this, "toBeSameMinute", "minute", actual, expected, options);
	},

	toBeSameSecond(actual: DateTimeInput, expected: DateTimeInput, options?: TimeZoneOptions) {
		return sameUnitResult(this, "toBeSameSecond", "second", actual, expected, options);
	},

	toBeWithinTimeOfDay(actual: DateTimeInput | TimeInput, start: TimeInput, end: TimeInput, options?: TimeZoneOptions) {
		const received = normalizeAs(actual, "actual date", TIME_KINDS);
		rejectTimeZoneWithoutAbsolute(options?.timeZone, [received]);
		const from = normalizeAs(start, "start time", ["time"]).value;
		const to = normalizeAs(end, "end time", ["time"]).value;
		const zone = resolveTimeZone(options?.timeZone, received);
		const time = timeOfDay(received, zone, "actual date");
		const overnight = compareTimes(from, to) > 0;
		const afterStart = compareTimes(time, from) >= 0;
		const beforeEnd = compareTimes(time, to) <= 0;
		return dateMatcherResult(this, {
			name: "toBeWithinTimeOfDay",
			pass: overnight ? afterStart || beforeEnd : afterStart && beforeEnd,
			subject: "time",
			expectation: `be between ${from.toString()} and ${to.toString()}${overnight ? " (overnight)" : ""}, inclusive`,
			lines: () => [
				["Received", received.display, "received"],
				["Time of day", time.toString()],
				zoneLine(zone, received),
			],
			expected: { start, end },
			actual,
		});
	},

	toBeTruncatedTo(actual: DateTimeInput | TimeInput, unit: TruncationUnit, options?: TimeZoneOptions) {
		const smallestUnit = validateUnit(unit, TRUNCATION_UNITS, "unit");
		const received = normalizeAs(actual, "actual date", TIME_KINDS);
		rejectTimeZoneWithoutAbsolute(options?.timeZone, [received]);
		const zone = resolveTimeZone(options?.timeZone, received);
		const round = { smallestUnit, roundingMode: "trunc" } as const;
		const value = received.kind === "time" ? received.value : onClock(received, zone).value;
		const truncated = value.round(round);
		// Same kind and zone, and Temporal serializes every non-zero digit: equal strings mean equal values.
		return dateMatcherResult(this, {
			name: "toBeTruncatedTo",
			pass: truncated.toString() === value.toString(),
			expectation: `be truncated to the ${smallestUnit}`,
			lines: () => [
				["Received", received.display, "received"],
				["Truncated", truncated.toString(), "expected"],
				zoneLine(zone, received),
			],
			expected: unit,
			actual,
		});
	},

	toBeAtStartOfDay(actual: DateTimeInput, options?: TimeZoneOptions) {
		const received = normalizeAs(actual, "actual date", DATE_TIME_KINDS);
		rejectTimeZoneWithoutAbsolute(options?.timeZone, [received]);
		const zone = resolveTimeZone(options?.timeZone, received);
		const clock = onClock(received, zone);
		const start = clock.kind === "zoned" ? clock.value.startOfDay() : clock.value.toPlainDate().toPlainDateTime();
		return dateMatcherResult(this, {
			name: "toBeAtStartOfDay",
			// Same kind and zone: equal serializations mean equal values.
			pass: start.toString() === clock.value.toString(),
			expectation: "be at the start of the day",
			lines: () => [
				["Start of day", start.toString(), "expected"],
				["Received", received.display, "received"],
				zoneLine(zone, received),
			],
			actual,
		});
	},

	toBeAtEndOfDay(actual: DateTimeInput, options?: EndOfDayOptions) {
		const precision = validateUnit(
			options?.precision ?? "millisecond",
			Object.keys(PRECISION_NANOSECONDS) as SubsecondPrecision[],
			"precision",
		);
		const received = normalizeAs(actual, "actual date", DATE_TIME_KINDS);
		rejectTimeZoneWithoutAbsolute(options?.timeZone, [received]);
		const zone = resolveTimeZone(options?.timeZone, received);
		const { last, next, pass } = endOfDayWindow(onClock(received, zone), zone, PRECISION_NANOSECONDS[precision]);
		return dateMatcherResult(this, {
			name: "toBeAtEndOfDay",
			pass,
			expectation: `be at the end of the day (${precision} precision)`,
			lines: () => [
				["Last moment", last, "expected"],
				["Received", received.display, "received"],
				["Next day starts", next],
				zoneLine(zone, received),
			],
			actual,
		});
	},

	toBeSameTimeOfDay(
		actual: DateTimeInput | TimeInput,
		expected: DateTimeInput | TimeInput,
		options?: TimeOfDayOptions,
	) {
		const received = normalizeAs(actual, "actual date", TIME_KINDS);
		const target = normalizeAs(expected, "expected date", TIME_KINDS);
		rejectTimeZoneWithoutAbsolute(options?.timeZone, [received, target]);
		const zone = resolveTimeZone(options?.timeZone, received, target);
		const left = truncate(timeOfDay(received, zone, "actual date"), options?.precision);
		const right = truncate(timeOfDay(target, zone, "expected date"), options?.precision);
		return dateMatcherResult(this, {
			name: "toBeSameTimeOfDay",
			pass: left.equals(right),
			subject: "times",
			expectation: "be the same time of day",
			lines: () => [
				["Expected", target.display, "expected"],
				["Received", received.display, "received"],
				["Expected time", right.toString()],
				["Received time", left.toString()],
				options?.precision !== undefined && ["Precision", options.precision],
				zoneLine(zone, received, target),
			],
			expected,
			actual,
		});
	},
});

/** The half-open window [next start of day − 1 unit, next start of day); days are never assumed to last 24 h. */
function endOfDayWindow(clock: Clock, timeZone: string, unit: number): { last: string; next: string; pass: boolean } {
	const T = getTemporal();
	if (clock.kind === "zoned") {
		const next = clock.value.toPlainDate().add({ days: 1 }).toZonedDateTime({ timeZone });
		const last = next.subtract({ nanoseconds: unit });
		const pass = T.ZonedDateTime.compare(clock.value, last) >= 0 && T.ZonedDateTime.compare(clock.value, next) < 0;
		return { last: last.toString(), next: next.toString(), pass };
	}
	const next = clock.value.toPlainDate().add({ days: 1 }).toPlainDateTime();
	const last = next.subtract({ nanoseconds: unit });
	const pass = T.PlainDateTime.compare(clock.value, last) >= 0 && T.PlainDateTime.compare(clock.value, next) < 0;
	return { last: last.toString(), next: next.toString(), pass };
}
