import { expect, test } from "@playwright/test";
import { Temporal } from "temporal-polyfill";

import { expectlyDate } from "../src/expectly-date";

const AMS = { timeZone: "Europe/Amsterdam" };

test.describe("existing matchers accept ISO strings and Temporal values", () => {
	test("chronological matchers", () => {
		expectlyDate("2026-10-25").toBeAfter("2026-10-20");
		expectlyDate(Temporal.PlainDate.from("2026-10-20")).toBeBefore("2026-10-25");
		expectlyDate("2026-10-25T12:00:00Z").toBeBefore(Temporal.Instant.from("2026-10-25T12:00:00.000000001Z"));
		expectlyDate("2026-10-25T09:00:00").toBeBetween("2026-10-25T08:00:00", "2026-10-25T17:00:00");
		expectlyDate("2026-10-25T12:00:00Z").toBeDateCloseTo("2026-10-25T13:00:30+01:00", { seconds: 30 });
		expectlyDate("2026-10-25T12:00:00.000000500Z").toBeDateCloseTo("2026-10-25T12:00:00Z", { nanoseconds: 500 });
		expectlyDate("2026-10-25T12:00:00.000000501Z").not.toBeDateCloseTo("2026-10-25T12:00:00Z", "PT0.0000005S");
	});

	test("calendar matchers", () => {
		expectlyDate(Temporal.PlainDate.from("2026-10-25")).toBeSameMonth("2026-10-01");
		expectlyDate("2026-10-25T23:30:00+01:00").toBeSameDay("2026-10-25");
		expectlyDate("2026-10-25").toBeWeekend();
		expectlyDate("2026-10-26").toBeWeekday();
		expectlyDate("2024-02-29").toBeLeapYear();
		expectlyDate("2026-10-25").toBeInQuarter(4);
		expectlyDate("2026-10-25").toBeInMonth("October");
		expectlyDate("2026-10-25").toBeSpecificDayOfWeek("Sunday");
		expectlyDate("2026-10-25").toBeSpecificDayOfWeek(0);
		expectlyDate("2026-02-28").toBeEndOfMonth();
		expectlyDate("2024-02-28").not.toBeEndOfMonth();
	});

	test("collection matchers", () => {
		expectlyDate(["2026-10-25", Temporal.PlainDate.from("2026-10-26"), "2026-10-27"]).toHaveConsecutiveDates("day");
		expectlyDate(["2026-10-25T10:00:00Z", "2026-10-25T09:00:00Z"]).toHaveDatesDescendingOrder();
		expectlyDate(["2026-01-15", "2026-02-15"]).toHaveDatesWithinRange("2026-01-01", "2026-03-31");
		expectlyDate(["2026-10-25T12:00:00Z", "2026-10-25T13:00:00+01:00"]).not.toHaveUniqueDates();
	});

	test("comparing local values with absolute timestamps requires an explicit time zone", () => {
		expect(() => expectlyDate("2026-10-25T12:00:00").toBeBefore("2026-10-25T13:00:00Z")).toThrow(/Pass \{ timeZone \}/);
		expectlyDate("2026-10-25T12:00:00").toBeBefore("2026-10-25T13:00:00Z", AMS);
		expectlyDate("2026-10-25").toBeBefore("2026-10-24T22:00:00.001Z", AMS);
		expect(() => expectlyDate("2026-10-25").toBeBefore("2026-10-25T12:00:00")).toThrow(/without a time zone/);
	});

	test("unsupported values fail with clear errors", () => {
		expect(() => expectlyDate("10/25/2026").toBeToday()).toThrow(/is not a supported ISO date/);
		expect(() => expectlyDate(1_761_393_600_000).toBeInThePast()).toThrow(
			/expected a Date, an ISO 8601 string or a Temporal value, received number/,
		);
		expect(() => expectlyDate(new Date("invalid")).toBeBefore(new Date())).toThrow("Invalid actual date: Invalid Date");
		expect(() => expectlyDate("2026-10-25").toBeBetween("2026-12-31", "2026-01-01")).toThrow(/is after end date/);
	});
});

test.describe("time-zone aware calendar comparisons", () => {
	test("the same instant falls on different days in different zones", () => {
		const instant = "2026-10-25T23:30:00Z";
		expectlyDate(instant).toBeSameDay("2026-10-25");
		expectlyDate(instant).toBeSameDay("2026-10-26", AMS);
		expectlyDate(instant).toBeSameDay("2026-10-26", { timeZone: "Asia/Tokyo" });
		expectlyDate(instant).toBeInMonth(10, { timeZone: "UTC" });
	});

	test("a ZonedDateTime is placed in its own zone unless timeZone is given", () => {
		const tokyo = Temporal.ZonedDateTime.from("2026-11-01T01:00:00+09:00[Asia/Tokyo]");
		expectlyDate(tokyo).toBeStartOfMonth();
		expectlyDate(tokyo).toBeEndOfMonth({ timeZone: "UTC" });
		expectlyDate(tokyo).toBeSameDay("2026-10-31T23:00:00+01:00", AMS);
	});

	test("ISO strings with an explicit offset use that offset", () => {
		expectlyDate("2026-10-31T23:30:00-02:00").toBeEndOfMonth();
		expectlyDate("2026-10-31T23:30:00-02:00").toBeStartOfMonth({ timeZone: "UTC" });
	});

	test("Dates keep using the machine zone, like Date getters", () => {
		const date = new Date("2026-10-25T23:30:00Z");
		const local = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		expectlyDate(date).toBeSameDay(local);
		expectlyDate(date).toBeSpecificDayOfWeek(date.getDay());
	});

	test("today, yesterday and tomorrow use calendar days in the comparison zone", () => {
		const now = "2026-10-25T23:30:00Z"; // Monday 00:30 in Amsterdam, Sunday 23:30 in UTC
		expectlyDate("2026-10-26").toBeToday({ ...AMS, now });
		expectlyDate("2026-10-25").toBeToday({ timeZone: "UTC", now });
		expectlyDate("2026-10-25").toBeYesterday({ ...AMS, now });
		expectlyDate("2026-10-27T00:00:00").toBeTomorrow({ ...AMS, now });
		expectlyDate("2026-10-26T12:00:00+01:00[Europe/Amsterdam]").toBeToday({ now });
	});

	test("rejects unknown time zones", () => {
		expect(() => expectlyDate("2026-10-25").toBeToday({ timeZone: "Mars/Base" })).toThrow(/not a known IANA time zone/);
	});
});

test.describe("DST transitions in Europe/Amsterdam", () => {
	test("the repeated hour on 2026-10-25 has two distinct instants", () => {
		const first = "2026-10-25T02:30:00+02:00[Europe/Amsterdam]";
		const second = "2026-10-25T02:30:00+01:00[Europe/Amsterdam]";
		expectlyDate(first).toBeBefore(second);
		expectlyDate(first).not.toBeSameInstant(second);
		expectlyDate(first).not.toBeSameHour(second);
		expectlyDate(first).toBeSameDay(second);
		expectlyDate(first).toBeSameTimeOfDay(second);
		expectlyDate(second).toBeWithinDurationAfter(first, { hours: 1 });
	});

	test("ambiguous and nonexistent local times are rejected instead of guessed", () => {
		expect(() => expectlyDate("2026-10-25T02:30:00").toBeBefore("2026-10-25T12:00:00Z", AMS)).toThrow(
			/does not exist or occurs twice/,
		);
		expect(() => expectlyDate("2026-03-29T02:30:00").toBeBefore("2026-03-29T12:00:00Z", AMS)).toThrow(
			/does not exist or occurs twice/,
		);
	});

	test("calendar days around DST are not 24 hours long", () => {
		expectlyDate([
			"2026-10-25T00:00:00+02:00[Europe/Amsterdam]",
			"2026-10-26T00:00:00+01:00[Europe/Amsterdam]",
		]).toHaveDateRange({ days: 1 });
		expectlyDate(["2026-10-24T22:00:00Z", "2026-10-25T23:00:00Z"]).toHaveDateRange({ days: 1 }, AMS);
		expectlyDate(["2026-10-24T22:00:00Z", "2026-10-25T23:00:00Z"]).toHaveDateRange({ hours: 25 });
		expectlyDate(["2026-03-28T23:00:00Z", "2026-03-29T22:00:00Z"]).toHaveDateRange({ days: 1 }, AMS);
	});

	test("start and end of day on the 25-hour day", () => {
		expectlyDate("2026-10-24T22:00:00Z").toBeAtStartOfDay(AMS);
		expectlyDate("2026-10-25T22:59:59.999Z").toBeAtEndOfDay(AMS);
		expectlyDate("2026-10-25T21:59:59.999Z").not.toBeAtEndOfDay(AMS);
	});

	test("start and end of day on the 23-hour day", () => {
		expectlyDate("2026-03-28T23:00:00Z").toBeAtStartOfDay(AMS);
		expectlyDate("2026-03-29T21:59:59.999Z").toBeAtEndOfDay(AMS);
	});

	test("yesterday is a calendar day, even across the DST change", () => {
		expectlyDate("2026-10-25T00:30:00+02:00[Europe/Amsterdam]").toBeYesterday({
			now: "2026-10-26T00:10:00+01:00",
			...AMS,
		});
	});
});

test.describe("calendar-exact durations in collections", () => {
	test("toHaveDateRange is exact, with no tolerance", () => {
		expectlyDate(["2026-01-31", "2026-02-28"]).toHaveDateRange({ months: 1 });
		expectlyDate(["2024-01-01", "2025-01-01"]).toHaveDateRange({ years: 1 });
		expectlyDate(["2024-01-01", "2024-12-31"]).not.toHaveDateRange({ years: 1 });
		expectlyDate(["2026-01-01", "2026-01-11"]).not.toHaveDateRange({ days: 11 });
		expectlyDate(["2026-01-01T00:00:00", "2026-01-01T01:30:00"]).toHaveDateRange("PT1H30M");
	});

	test("toHaveDateGapsLargerThan uses calendar months", () => {
		expectlyDate(["2026-01-31", "2026-02-28"]).not.toHaveDateGapsLargerThan({ months: 1 });
		expectlyDate(["2026-01-31", "2026-03-01"]).toHaveDateGapsLargerThan({ months: 1 });
		expectlyDate(["2026-01-01T00:00:00Z", "2026-01-01T00:00:01Z"]).toHaveDateGapsLargerThan({ seconds: 0 });
	});

	test("calendar dates cannot be shifted by time units", () => {
		expect(() => expectlyDate(["2026-01-01", "2026-01-02"]).toHaveDateRange({ hours: 24 })).toThrow(
			/calendar dates can only be shifted by years, months, weeks or days/,
		);
	});

	test("toHaveUniqueDates can ignore time in a zone", () => {
		const values = ["2026-10-25T22:30:00Z", "2026-10-25T23:30:00Z"];
		expectlyDate(values).not.toHaveUniqueDates({ ignoreTime: true, timeZone: "UTC" });
		expectlyDate(values).toHaveUniqueDates({ ignoreTime: true, ...AMS });
	});
});
