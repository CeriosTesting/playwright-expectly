import { expect, test } from "@playwright/test";
import { Temporal } from "temporal-polyfill/full/implementation";

import { expectlyDate } from "../../src/expectly-date";

const HEBREW = { calendar: "hebrew" };

function inCalendar(iso: string, calendar: string): Temporal.PlainDate {
	return Temporal.PlainDate.from(iso).withCalendar(calendar);
}

test.describe("calendar resolution", () => {
	test("defaults to ISO 8601 for strings, Dates and ISO Temporal values", () => {
		expectlyDate("2026-10-25").toBeInMonth("October");
		expectlyDate("2026-10-25").not.toBeLeapYear();
		expectlyDate(new Date("2024-02-29T12:00:00Z")).toBeLeapYear({ timeZone: "UTC" });
	});

	test("uses the calendar option", () => {
		expectlyDate("2026-10-25").toBeLeapYear(HEBREW);
		expectlyDate("2026-10-25").toBeInMonth(2, HEBREW);
		expectlyDate("2026-10-12").toBeStartOfMonth(HEBREW);
	});

	test("uses the calendar a Temporal value carries", () => {
		const hebrew = inCalendar("2026-10-25", "hebrew");
		expectlyDate(hebrew).toBeLeapYear();
		expectlyDate(hebrew).toBeSameMonth("2026-10-12");
		expectlyDate("2026-10-12").toBeSameMonth(hebrew);
	});

	test("the calendar option overrides the value's own calendar", () => {
		const hebrew = inCalendar("2026-10-25", "hebrew");
		expectlyDate(hebrew).not.toBeLeapYear({ calendar: "iso8601" });
		expectlyDate(hebrew).toBeInMonth("October", { calendar: "gregory" });
	});

	test("values in different non-ISO calendars require an explicit calendar", () => {
		const hebrew = inCalendar("2026-10-25", "hebrew");
		const persian = inCalendar("2026-10-25", "persian");
		expect(() => expectlyDate(hebrew).toBeSameMonth(persian)).toThrow(
			/Values use different calendars \(hebrew, persian\); pass \{ calendar \}/,
		);
		expectlyDate(hebrew).toBeSameMonth(persian, HEBREW);
	});

	test("rejects unknown calendars and canonicalizes aliases", () => {
		expect(() => expectlyDate("2026-10-25").toBeLeapYear({ calendar: "klingon" })).toThrow(
			'Invalid calendar: "klingon" is not a supported calendar',
		);
		// "islamicc" is the legacy alias of "islamic-civil" (2026-10-12 is 29 Rabi' al-Thani 1448 there).
		expectlyDate("2026-10-12").toBeInMonth("M04", { calendar: "islamicc" });
	});

	test("matchers that do not read calendar fields accept any mix of calendars", () => {
		const hebrew = inCalendar("2026-10-25", "hebrew");
		const persian = inCalendar("2026-10-25", "persian");
		expectlyDate(hebrew).toBeSameDay(persian);
		expectlyDate(hebrew).toBeSpecificDayOfWeek("Sunday");
		expectlyDate(persian).toBeWeekend();
		expectlyDate([hebrew, persian]).not.toHaveUniqueDates();
		expectlyDate(inCalendar("2026-10-24", "hebrew")).toBeBefore(persian);
	});
});

test.describe("Hebrew calendar", () => {
	test("5787 is a leap year with 13 months", () => {
		expectlyDate("2026-10-25").toBeLeapYear(HEBREW);
		expectlyDate("2025-10-25").not.toBeLeapYear(HEBREW);
	});

	test("months match by number or by month code", () => {
		// 2027-02-10 is 3 Adar I 5787: the sixth month, code M05L.
		expectlyDate("2027-02-10").toBeInMonth(6, HEBREW);
		expectlyDate("2027-02-10").toBeInMonth("M05L", HEBREW);
		expectlyDate("2027-03-10").toBeInMonth("M06", HEBREW);
		expectlyDate("2027-03-10").not.toBeInMonth("M05L", HEBREW);
	});

	test("month names are rejected", () => {
		expect(() => expectlyDate("2026-10-25").toBeInMonth("October", HEBREW)).toThrow(
			/Month names only apply to Gregorian-based calendars, not "hebrew"/,
		);
		expect(() => expectlyDate("2026-10-25").toBeInMonth(14, HEBREW)).toThrow(/Must be between 1 and 13/);
	});

	test("quarters are undefined in a 13-month year", () => {
		expect(() => expectlyDate("2026-10-25").toBeInQuarter(1, HEBREW)).toThrow(
			/Quarters are undefined in the "hebrew" calendar: year 5787 has 13 months/,
		);
		expectlyDate("2025-10-25").toBeInQuarter(1, HEBREW);
	});

	test("same month and start and end of month", () => {
		expectlyDate("2026-10-12").toBeSameMonth("2026-11-10", HEBREW);
		expectlyDate("2026-10-11").not.toBeSameMonth("2026-10-12", HEBREW);
		expectlyDate("2026-10-12").toBeStartOfMonth(HEBREW);
		expectlyDate("2026-11-10").toBeEndOfMonth(HEBREW);
		expectlyDate("2026-10-31").not.toBeEndOfMonth(HEBREW);
	});

	test("failure messages show the date in the calendar", () => {
		let message = "";
		try {
			expectlyDate("2027-03-10").toBeInMonth("M05L", HEBREW);
		} catch (error) {
			message = (error as Error).message;
		}
		expect(message).toContain("month 7 (M06)");
		expect(message).toContain("2027-03-10 (Wednesday), hebrew 5787-M06-01");
	});
});

test.describe("other calendars", () => {
	test("Islamic and Persian month boundaries", () => {
		const islamic = { calendar: "islamic-umalqura" };
		expectlyDate("2026-10-12").toBeStartOfMonth(islamic);
		expectlyDate("2026-11-10").toBeEndOfMonth(islamic);
		expectlyDate("2026-10-25").toBeInQuarter(2, islamic);

		const persian = { calendar: "persian" };
		expectlyDate("2026-10-23").toBeStartOfMonth(persian);
		expectlyDate("2026-11-21").toBeEndOfMonth(persian);
		expectlyDate("2026-10-25").toBeInMonth(8, persian);
	});

	test("Gregorian-based calendars accept month names and quarter labels", () => {
		const japanese = inCalendar("2026-10-25", "japanese");
		expectlyDate(japanese).toBeInMonth("October");
		expectlyDate(japanese).toBeInQuarter(4);
		expectlyDate(inCalendar("2026-10-25", "buddhist")).toBeSameYear("2026-01-01");
	});

	test("Ethiopic years have 13 months", () => {
		expect(() => expectlyDate("2026-10-25").toBeInQuarter(1, { calendar: "ethiopic" })).toThrow(/has 13 months/);
	});
});

test.describe("calendar arithmetic in collections and durations", () => {
	test("toHaveConsecutiveDates walks through Adar I and Adar II", () => {
		// 1 Shevat, 1 Adar I and 1 Adar II 5787
		expectlyDate(["2027-01-09", "2027-02-08", "2027-03-10"]).toHaveConsecutiveDates("month", HEBREW);
		expectlyDate(["2027-01-09", "2027-03-10"]).not.toHaveConsecutiveDates("month", HEBREW);
		// 1 Shevat and 30 Adar I are consecutive Hebrew months; January and March are not.
		expectlyDate(["2027-01-09", "2027-03-09"]).toHaveConsecutiveDates("month", HEBREW);
		expectlyDate(["2027-01-09", "2027-03-09"]).not.toHaveConsecutiveDates("month");
	});

	test("toHaveDateRange adds months in the calendar", () => {
		// One Hebrew month after 1 Adar I is 1 Adar II; one ISO month is 2027-03-08.
		expectlyDate(["2027-02-08", "2027-03-10"]).toHaveDateRange({ months: 1 }, HEBREW);
		expectlyDate(["2027-02-08", "2027-03-08"]).toHaveDateRange({ months: 1 });
		expectlyDate([inCalendar("2027-02-08", "hebrew"), inCalendar("2027-03-10", "hebrew")]).toHaveDateRange({
			months: 1,
		});
	});

	test("toHaveDateGapsLargerThan and toHaveMaximumDateGap use the calendar", () => {
		expectlyDate(["2027-02-08", "2027-03-09"]).not.toHaveDateGapsLargerThan({ months: 1 }, HEBREW);
		expectlyDate(["2027-02-08", "2027-03-09"]).toHaveDateGapsLargerThan({ months: 1 });
		expectlyDate(["2027-02-08", "2027-03-09"]).toHaveMaximumDateGap({ months: 1 }, HEBREW);
	});

	test("duration relativeTo keeps its own calendar", () => {
		// Adar I 5787 has 30 days; February 2027 has 28.
		expectlyDate({ days: 30 }).toBeDurationBetween(
			{ months: 1 },
			{ months: 1 },
			{
				relativeTo: inCalendar("2027-02-08", "hebrew"),
			},
		);
		expectlyDate({ days: 30 }).toBeLongerThan({ months: 1 }, { relativeTo: "2027-02-08" });
	});
});
