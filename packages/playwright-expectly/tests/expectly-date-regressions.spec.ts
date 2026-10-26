import { expect, test } from "@playwright/test";

import { getRejectedErrorSync } from "../../../tests/common/assertion-utils";
import { expectlyDate } from "../src/expectly-date";

test.describe("date-only range end bounds", () => {
	test("an end date covers that whole day when compared with timestamps", () => {
		expectlyDate("2026-10-31T12:00:00Z").toBeBetween("2026-10-01", "2026-10-31", { timeZone: "UTC" });
		expectlyDate("2026-10-31T23:59:59.999999999Z").toBeBetween("2026-10-01", "2026-10-31", { timeZone: "UTC" });
		expectlyDate("2026-11-01T00:00:00Z").not.toBeBetween("2026-10-01", "2026-10-31", { timeZone: "UTC" });
	});

	test("the whole end day follows the comparison zone", () => {
		// 23:30Z on Oct 31 is already Nov 1 in Amsterdam.
		expectlyDate("2026-10-31T23:30:00Z").not.toBeBetween("2026-10-01", "2026-10-31", {
			timeZone: "Europe/Amsterdam",
		});
	});

	test("toHaveDatesWithinRange covers the end day too", () => {
		expectlyDate(["2026-03-01T00:00:00Z", "2026-03-31T18:00:00Z"]).toHaveDatesWithinRange("2026-03-01", "2026-03-31", {
			timeZone: "UTC",
		});
		expectlyDate(["2026-04-01T00:00:00Z"]).not.toHaveDatesWithinRange("2026-03-01", "2026-03-31", { timeZone: "UTC" });
	});

	test("timestamp end bounds stay inclusive instants", () => {
		expectlyDate("2026-10-31T12:00:00Z").toBeBetween("2026-10-01T00:00:00Z", "2026-10-31T12:00:00Z");
		expectlyDate("2026-10-31T12:00:00.000000001Z").not.toBeBetween("2026-10-01T00:00:00Z", "2026-10-31T12:00:00Z");
	});

	test("toHaveDatesWithinRange rejects an inverted range", () => {
		expect(() => expectlyDate(["2026-06-01"]).not.toHaveDatesWithinRange("2026-12-31", "2026-01-01")).toThrow(
			"is after end date",
		);
	});
});

test.describe("time zone resolution", () => {
	const newYork = "2026-10-25T01:00:00-04:00[America/New_York]";
	const tokyo = "2026-10-26T08:00:00+09:00[Asia/Tokyo]";

	test("values in different zones need an explicit zone, in either order", () => {
		expect(() => expectlyDate(newYork).toBeSameDay(tokyo)).toThrow("different time zones");
		expect(() => expectlyDate(tokyo).toBeSameDay(newYork)).toThrow("different time zones");
		expectlyDate(newYork).toBeSameDay(tokyo, { timeZone: "America/New_York" });
		expectlyDate(tokyo).toBeSameDay(newYork, { timeZone: "America/New_York" });
	});

	test("values with different offsets need an explicit zone for calendar matchers", () => {
		expect(() => expectlyDate("2026-10-25T23:30:00+01:00").toBeSameDay("2026-10-25T23:30:00Z")).toThrow(
			"different UTC offsets",
		);
	});

	test("chronology still compares instants across zones", () => {
		expectlyDate(newYork).toBeBefore(tokyo);
		expectlyDate("2026-10-25T12:00:00+01:00").toBeBefore("2026-10-25T12:00:00Z");
	});

	test("an unknown timeZone is rejected even for absolute timestamps", () => {
		expect(() => expectlyDate("2026-10-25T12:00:00Z").toBeInThePast({ timeZone: "Mars/Base" })).toThrow(
			"not a known IANA time zone",
		);
	});

	test("a timeZone option that cannot apply throws instead of being ignored", () => {
		expect(() => expectlyDate("2026-10-20").toBeBefore("2026-10-25", { timeZone: "UTC" })).toThrow(
			"only applies to absolute timestamps",
		);
		expect(() => expectlyDate("2026-10-25T10:15:00").toBeSameHour("2026-10-25T10:45:00", { timeZone: "UTC" })).toThrow(
			"only applies to absolute timestamps",
		);
		expect(() => expectlyDate("2026-10-25T00:00:00").toBeAtStartOfDay({ timeZone: "UTC" })).toThrow(
			"only applies to absolute timestamps",
		);
	});
});

test.describe("today, yesterday and tomorrow", () => {
	test("a local date is compared with today where `now` is", () => {
		// 00:30 on Oct 26 in Amsterdam is still Oct 25 in UTC.
		const now = "2026-10-26T00:30:00+01:00[Europe/Amsterdam]";
		expectlyDate("2026-10-26").toBeToday({ now });
		expectlyDate("2026-10-25").toBeYesterday({ now });
		expectlyDate("2026-10-27").toBeTomorrow({ now });
	});

	test("the failure message names the zone used for local values", () => {
		const error = getRejectedErrorSync(() =>
			expectlyDate("2026-10-24").toBeToday({ now: "2026-10-26T00:30:00+01:00[Europe/Amsterdam]" }),
		);
		expect(error.message).toContain("Time zone");
		expect(error.message).toContain("Europe/Amsterdam");
	});
});

test.describe("month codes and numbers", () => {
	test("month codes that the calendar does not have throw", () => {
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth("M13")).toThrow('does not exist in the "iso8601" calendar');
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth("M00")).toThrow("does not exist");
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth("M05L")).toThrow("does not exist");
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth("M05L", { calendar: "hebrew" })).not.toThrow();
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth("M03L", { calendar: "hebrew" })).toThrow("does not exist");
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth("M13", { calendar: "ethiopic" })).not.toThrow();
	});

	test("a single-digit month code is reported as a month code mistake", () => {
		expect(() => expectlyDate("2026-10-25").toBeInMonth("M5" as never)).toThrow('two-digit month code such as "M05"');
	});

	test("month 13 only exists in calendars that have a 13th month", () => {
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth(13, { calendar: "islamic-umalqura" })).toThrow(
			"Must be between 1 and 12",
		);
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth(13, { calendar: "persian" })).toThrow(
			"Must be between 1 and 12",
		);
		expect(() => expectlyDate("2026-10-25").not.toBeInMonth(13, { calendar: "hebrew" })).not.toThrow();
	});
});

test.describe("gaps and durations", () => {
	test("toHaveMaximumDateGap prints an unsigned gap for descending pairs", () => {
		const error = getRejectedErrorSync(() =>
			expectlyDate(["2026-10-25T12:08:30Z", "2026-10-25T12:00:00Z"]).toHaveMaximumDateGap({ minutes: 1 }),
		);
		expect(error.message).toContain("8 minutes 30 seconds");
		expect(error.message).not.toContain("-8 minutes");
	});

	test("a duration range must not mix min/max with units", () => {
		const createdAt = "2026-10-25T12:00:00Z";
		expect(() =>
			expectlyDate("2026-10-25T12:00:05Z").toBeWithinDurationAfter(createdAt, {
				min: { seconds: 1 },
				hours: 1,
			}),
		).toThrow("not both");
	});

	test("duration strings are strict ISO 8601", () => {
		for (const loose of ["pt5m", "PT0,5S", "PT1.5H", "P", "PT"]) {
			expect(() => expectlyDate("PT10M").toBeLongerThan(loose), loose).toThrow("is not an ISO 8601 duration");
		}
		expectlyDate("PT10M").toBeLongerThan("PT5M");
		expectlyDate("PT1S").toBeLongerThan("PT0.5S");
		expectlyDate("P1DT2H").toBeLongerThan("-PT1H");
	});
});
