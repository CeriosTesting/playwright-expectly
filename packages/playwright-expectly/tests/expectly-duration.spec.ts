import { expect, test } from "@playwright/test";
import { Temporal } from "temporal-polyfill";

import { getRejectedErrorSync } from "../../../tests/common/assertion-utils";
import { expectlyDate } from "../src/expectly-date";

test.describe("toBeShorterThan / toBeLongerThan", () => {
	test("compare Temporal durations, duration objects and ISO strings", () => {
		expectlyDate(Temporal.Duration.from({ seconds: 5 })).toBeShorterThan({ seconds: 10 });
		expectlyDate("PT2H").toBeLongerThan({ minutes: 90 });
		expectlyDate({ milliseconds: 1500 }).toBeLongerThan("PT1S");
		expectlyDate({ nanoseconds: 999 }).toBeShorterThan({ microseconds: 1 });
	});

	test("are strict", () => {
		expectlyDate({ minutes: 1 }).not.toBeShorterThan({ seconds: 60 });
		expectlyDate({ minutes: 1 }).not.toBeLongerThan({ seconds: 60 });
	});

	test("count days as 24 hours without relativeTo", () => {
		expectlyDate({ days: 1 }).toBeLongerThan({ hours: 23 });
	});

	test("require relativeTo for years, months and weeks", () => {
		expect(() => expectlyDate({ months: 1 }).toBeLongerThan({ days: 30 })).toThrow(/Pass \{ relativeTo \}/);
		expect(() => expectlyDate({ days: 3 }).toBeShorterThan({ weeks: 1 })).toThrow(/no fixed length/);
	});

	test("use the calendar for relativeTo", () => {
		expectlyDate({ months: 1 }).toBeShorterThan({ days: 30 }, { relativeTo: "2026-02-01" });
		expectlyDate({ months: 1 }).toBeLongerThan({ days: 30 }, { relativeTo: "2026-01-01" });
		// The DST day in Amsterdam lasts 25 hours.
		expectlyDate({ days: 1 }).toBeLongerThan(
			{ hours: 24 },
			{ relativeTo: "2026-10-25T00:00:00+02:00[Europe/Amsterdam]" },
		);
		expect(() =>
			// @ts-expect-error A Date has no calendar or time zone, so the type rejects it too.
			expectlyDate({ months: 1 }).toBeLongerThan({ days: 30 }, { relativeTo: new Date() }),
		).toThrow(/Invalid relativeTo/);
	});

	test("report both durations", () => {
		const error = getRejectedErrorSync(() => expectlyDate("PT15S").toBeShorterThan({ seconds: 10 }));
		expect(error.message).toContain("Expected duration to be shorter than 10 seconds (PT10S)");
		expect(error.message).toContain("15 seconds (PT15S)");
	});

	test("reject invalid durations", () => {
		expect(() => expectlyDate("5 minutes").toBeShorterThan({ seconds: 10 })).toThrow(/Invalid actual duration/);
		expect(() => expectlyDate({ seconds: 1.5 }).toBeShorterThan({ seconds: 10 })).toThrow(/must be an integer/);
		expect(() => expectlyDate({ hours: 1, minutes: -1 }).toBeShorterThan({ seconds: 10 })).toThrow(
			/Invalid actual duration/,
		);
		expect(() => expectlyDate({}).toBeShorterThan({ seconds: 10 })).toThrow(/at least one duration unit/);
	});
});

test.describe("toBeDurationBetween", () => {
	test("is inclusive", () => {
		expectlyDate({ seconds: 5 }).toBeDurationBetween({ seconds: 5 }, { seconds: 10 });
		expectlyDate({ seconds: 10 }).toBeDurationBetween({ seconds: 5 }, "PT10S");
		expectlyDate({ seconds: 11 }).not.toBeDurationBetween({ seconds: 5 }, { seconds: 10 });
	});

	test("supports calendar units with relativeTo", () => {
		expectlyDate({ days: 31 }).toBeDurationBetween({ months: 1 }, { days: 31 }, { relativeTo: "2026-01-01" });
		expectlyDate({ days: 29 }).not.toBeDurationBetween({ months: 1 }, { days: 31 }, { relativeTo: "2026-01-01" });
	});

	test("rejects an inverted range", () => {
		expect(() => expectlyDate({ seconds: 5 }).toBeDurationBetween({ seconds: 10 }, { seconds: 5 })).toThrow(
			/exceeds maximum/,
		);
	});
});
