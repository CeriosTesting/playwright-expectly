import { expect, test } from "@playwright/test";

import {
	isISODate,
	isISODateTime,
	isISOInstant,
	isISOLocalDateTime,
	isISOTime,
	isISOZonedDateTime,
	parseISODate,
	parseISODateTime,
	parseISOInstant,
	parseISOLocalDateTime,
	parseISOTime,
	parseISOZonedDateTime,
} from "../../src/date-time/iso-parse";

test.describe("strict ISO grammar", () => {
	const valid: Array<[string, (value: unknown) => boolean]> = [
		["2026-10-25", isISODate],
		["2024-02-29", isISODate],
		["0000-01-01", isISODate],
		["14:30", isISOTime],
		["14:30:45", isISOTime],
		["14:30:45.123456789", isISOTime],
		["00:00:00", isISOTime],
		["2026-10-25T14:30:00", isISOLocalDateTime],
		["2026-10-25T14:30:00.1", isISOLocalDateTime],
		["2026-10-25T14:30:00.123456789", isISOLocalDateTime],
		["2026-10-25T14:30:00Z", isISOInstant],
		["2026-10-25T14:30:00+01:00", isISOInstant],
		["2026-10-25T14:30:00-05:30", isISOInstant],
		["2026-10-25T14:30:00.000000001Z", isISOInstant],
		["2026-10-25T14:30:00+01:00[Europe/Amsterdam]", isISOZonedDateTime],
		["2026-10-25T14:30:00[Europe/Amsterdam]", isISOZonedDateTime],
		["2026-10-25T13:30:00Z[Europe/Amsterdam]", isISOZonedDateTime],
		["2026-10-25T14:30:00+05:30[+05:30]", isISOZonedDateTime],
		["2026-10-25T14:30:00[America/Argentina/Buenos_Aires]", isISOZonedDateTime],
	];

	for (const [value, guard] of valid) {
		test(`accepts ${value}`, () => {
			expect(guard(value)).toBe(true);
		});
	}

	const invalid: Array<[string, string, (value: unknown) => boolean]> = [
		["impossible day", "2026-02-30", isISODate],
		["non-leap February 29", "2025-02-29", isISODate],
		["1900 is not a leap year", "1900-02-29", isISODate],
		["month 13", "2026-13-01", isISODate],
		["month 00", "2026-00-10", isISODate],
		["day-first order", "25-10-2026", isISODate],
		["slashes", "2026/10/25", isISODate],
		["basic format", "20261025", isISODate],
		["single-digit month", "2026-1-25", isISODate],
		["expanded year", "+002026-10-25", isISODate],
		["surrounding whitespace", " 2026-10-25", isISODate],
		["hour 24", "24:00", isISOTime],
		["minute 60", "12:60", isISOTime],
		["leap second", "23:59:60", isISOTime],
		["hour only", "12", isISOTime],
		["too many fraction digits", "12:00:00.1234567890", isISOTime],
		["comma fraction", "12:00:00,5", isISOTime],
		["space separator", "2026-10-25 14:30:00", isISODateTime],
		["lowercase t", "2026-10-25t14:30:00", isISODateTime],
		["lowercase z", "2026-10-25T14:30:00z", isISODateTime],
		["seconds required in datetimes", "2026-10-25T14:30", isISODateTime],
		["impossible time", "2026-10-25T29:99:00", isISODateTime],
		["impossible date in datetime", "2026-04-31T00:00:00Z", isISODateTime],
		["leap second in datetime", "2026-12-31T23:59:60Z", isISODateTime],
		["basic offset", "2026-10-25T14:30:00+0100", isISOInstant],
		["hour-only offset", "2026-10-25T14:30:00+01", isISOInstant],
		["unknown-offset marker", "2026-10-25T14:30:00-00:00", isISOInstant],
		["offset out of range", "2026-10-25T14:30:00+24:00", isISOInstant],
		["local datetime is not an instant", "2026-10-25T14:30:00", isISOInstant],
		["zoned datetime is not an instant", "2026-10-25T14:30:00+01:00[Europe/Amsterdam]", isISOInstant],
		["unknown zone", "2026-10-25T14:30:00[Mars/Olympus_Mons]", isISOZonedDateTime],
		["offset disagrees with zone", "2026-10-25T14:30:00+05:00[Europe/Amsterdam]", isISOZonedDateTime],
		["calendar annotation", "2026-10-25T14:30:00+01:00[Europe/Amsterdam][u-ca=iso8601]", isISOZonedDateTime],
		["critical flag", "2026-10-25T14:30:00+01:00[!Europe/Amsterdam]", isISOZonedDateTime],
		["nonexistent local time (DST gap)", "2026-03-29T02:30:00[Europe/Amsterdam]", isISOZonedDateTime],
		["ambiguous local time (DST overlap) without offset", "2026-10-25T02:30:00[Europe/Amsterdam]", isISOZonedDateTime],
		["date only is not a datetime", "2026-10-25", isISODateTime],
	];

	for (const [description, value, guard] of invalid) {
		test(`rejects ${description}: ${value}`, () => {
			expect(guard(value)).toBe(false);
		});
	}

	test("accepts both occurrences of a repeated hour when the offset disambiguates", () => {
		expect(isISOZonedDateTime("2026-10-25T02:30:00+02:00[Europe/Amsterdam]")).toBe(true);
		expect(isISOZonedDateTime("2026-10-25T02:30:00+01:00[Europe/Amsterdam]")).toBe(true);
	});
});

test.describe("type guards", () => {
	test("return false for non-string values", () => {
		const values: unknown[] = [null, undefined, 20261025, new Date("2026-10-25"), {}, [], true, Symbol("x"), 1n];
		for (const guard of [isISODate, isISOTime, isISOLocalDateTime, isISODateTime, isISOInstant, isISOZonedDateTime]) {
			for (const value of values) expect(guard(value)).toBe(false);
		}
	});

	test("isISODateTime accepts every datetime kind but not dates or times", () => {
		expect(isISODateTime("2026-10-25T14:30:00")).toBe(true);
		expect(isISODateTime("2026-10-25T14:30:00Z")).toBe(true);
		expect(isISODateTime("2026-10-25T14:30:00[Europe/Amsterdam]")).toBe(true);
		expect(isISODateTime("14:30:00")).toBe(false);
	});

	test("narrow unknown external values", () => {
		const response: { createdAt: unknown } = { createdAt: "2026-10-25T12:30:45Z" };
		if (!isISOInstant(response.createdAt)) throw new Error("expected a valid instant");
		const createdAt: string = response.createdAt;
		expect(createdAt).toBe("2026-10-25T12:30:45Z");
	});
});

test.describe("parse functions", () => {
	test("return the original string after validation", () => {
		expect(parseISODate("2026-10-25")).toBe("2026-10-25");
		expect(parseISOTime("09:00")).toBe("09:00");
		expect(parseISOLocalDateTime("2026-10-25T14:30:00.123456789")).toBe("2026-10-25T14:30:00.123456789");
		expect(parseISOInstant("2026-10-25T14:30:00+01:00")).toBe("2026-10-25T14:30:00+01:00");
		expect(parseISODateTime("2026-10-25T14:30:00Z")).toBe("2026-10-25T14:30:00Z");
		expect(parseISOZonedDateTime("2026-10-25T14:30:00+01:00[Europe/Amsterdam]")).toBe(
			"2026-10-25T14:30:00+01:00[Europe/Amsterdam]",
		);
	});

	test("accept dynamic strings and validate them at runtime", () => {
		const dynamic: string = ["2026", "10", "25"].join("-");
		expect(parseISODate(dynamic)).toBe("2026-10-25");
	});

	test("throw descriptive errors for impossible values", () => {
		const dynamic: string = "2026-02-30";
		expect(() => parseISODate(dynamic)).toThrow(TypeError);
		expect(() => parseISODate(dynamic)).toThrow(/"2026-02-30" is not a valid ISO date \(YYYY-MM-DD\)/);
	});

	test("throw for the wrong kind with the expected format", () => {
		const local: string = "2026-10-25T12:30:45";
		expect(() => parseISOInstant(local)).toThrow(/not a supported ISO instant/);
	});

	test("throw for invalid offsets and zone annotations", () => {
		const badOffset: string = "2026-10-25T12:00:00+25:00";
		const badZone: string = "2026-10-25T12:00:00[Nowhere/City]";
		const mismatch: string = "2026-10-25T12:00:00+05:00[Europe/Amsterdam]";
		expect(() => parseISOInstant(badOffset)).toThrow(TypeError);
		expect(() => parseISOZonedDateTime(badZone)).toThrow(/not a valid ISO zoned datetime/);
		expect(() => parseISOZonedDateTime(mismatch)).toThrow(/not a valid ISO zoned datetime/);
	});

	test("throw for non-string values from untyped callers", () => {
		expect(() => parseISODate(20261025 as unknown as string)).toThrow(/expected a string, received number/);
	});
});
