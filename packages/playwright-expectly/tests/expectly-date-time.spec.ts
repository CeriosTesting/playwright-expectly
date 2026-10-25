import { expect, test } from "@playwright/test";
import { Temporal } from "temporal-polyfill";

import { getRejectedErrorSync } from "../../../tests/common/assertion-utils";
import { parseISOInstant } from "../src/date-time/iso-parse";
import { expectlyDate } from "../src/expectly-date";

const NOW = "2026-10-25T12:00:00Z";

test.describe("toBeSameInstant", () => {
	test("compares instants regardless of offset or zone", () => {
		expectlyDate("2026-10-25T12:00:00Z").toBeSameInstant("2026-10-25T13:00:00+01:00");
		expectlyDate(new Date("2026-10-25T12:00:00Z")).toBeSameInstant(Temporal.Instant.from("2026-10-25T12:00:00Z"));
		expectlyDate(Temporal.ZonedDateTime.from("2026-10-25T21:00:00+09:00[Asia/Tokyo]")).toBeSameInstant(
			"2026-10-25T12:00:00Z",
		);
	});

	test("preserves nanosecond precision without tolerance", () => {
		expectlyDate("2026-10-25T12:00:00.000000001Z").not.toBeSameInstant("2026-10-25T12:00:00Z");
		const error = getRejectedErrorSync(() => {
			expectlyDate("2026-10-25T12:00:00.000000001Z").toBeSameInstant("2026-10-25T12:00:00Z");
		});
		expect(error.message).toContain("Difference:");
		expect(error.message).toContain("0.000000001 seconds (later)");
	});

	test("rejects local values, which are not instants", () => {
		expect(() => expectlyDate("2026-10-25T12:00:00").toBeSameInstant("2026-10-25T12:00:00Z")).toThrow(
			/expected absolute timestamp or zoned datetime, received local datetime/,
		);
		expect(() => expectlyDate("2026-10-25T12:00:00Z").toBeSameInstant("2026-10-25")).toThrow(TypeError);
	});
});

test.describe("toBeSameHour / toBeSameMinute / toBeSameSecond", () => {
	test("compare at the requested precision", () => {
		expectlyDate("2026-10-25T12:30:45Z").toBeSameHour("2026-10-25T12:59:59Z");
		expectlyDate("2026-10-25T12:30:45Z").toBeSameMinute("2026-10-25T12:30:10Z");
		expectlyDate("2026-10-25T12:30:45.123Z").toBeSameSecond("2026-10-25T12:30:45Z");
	});

	test("are clock buckets, not differences of less than one unit", () => {
		expectlyDate("2026-10-25T12:59:59Z").not.toBeSameHour("2026-10-25T13:00:00Z");
		expectlyDate("2026-10-25T12:30:59.999Z").not.toBeSameMinute("2026-10-25T12:31:00Z");
		expectlyDate("2026-10-25T12:30:44.999999999Z").not.toBeSameSecond("2026-10-25T12:30:45Z");
	});

	test("respect the comparison zone for half-hour offsets", () => {
		// 12:40Z and 13:10Z are 12:xx in UTC but 18:10 and 18:40 in Kolkata (+05:30).
		expectlyDate("2026-10-25T12:40:00Z").not.toBeSameHour("2026-10-25T13:10:00Z", { timeZone: "UTC" });
		expectlyDate("2026-10-25T12:40:00Z").toBeSameHour("2026-10-25T13:10:00Z", { timeZone: "Asia/Kolkata" });
	});

	test("compare local datetimes by wall-clock time", () => {
		expectlyDate("2026-10-25T09:15:00").toBeSameHour(Temporal.PlainDateTime.from("2026-10-25T09:45:00"));
		expectlyDate("2026-10-25T09:15:00").not.toBeSameHour("2026-10-26T09:15:00");
	});

	test("reject values without a time", () => {
		expect(() => expectlyDate("2026-10-25").toBeSameHour("2026-10-25T00:00:00")).toThrow(TypeError);
	});

	test("explain the compared buckets on failure", () => {
		const error = getRejectedErrorSync(() => {
			expectlyDate("2026-10-25T12:30:00Z").toBeSameHour("2026-10-25T14:00:00Z");
		});
		expect(error.message).toContain("Expected dates to be in the same hour");
		expect(error.message).toContain("Received hour:");
		expect(error.message).toContain("Time zone:");
	});
});

test.describe("toBeWithinLast / toBeWithinNext", () => {
	test("accept values inside the window, including exact boundaries", () => {
		expectlyDate("2026-10-25T11:55:00Z").toBeWithinLast({ minutes: 5 }, { now: NOW });
		expectlyDate(NOW).toBeWithinLast({ minutes: 5 }, { now: NOW });
		expectlyDate("2026-10-25T12:30:00Z").toBeWithinNext({ minutes: 30 }, { now: NOW });
		expectlyDate(NOW).toBeWithinNext("PT30M", { now: NOW });
	});

	test("reject values just outside the window at nanosecond precision", () => {
		expectlyDate("2026-10-25T11:54:59.999999999Z").not.toBeWithinLast({ minutes: 5 }, { now: NOW });
		expectlyDate("2026-10-25T12:30:00.000000001Z").not.toBeWithinNext({ minutes: 30 }, { now: NOW });
	});

	test("reject the opposite direction", () => {
		expectlyDate("2026-10-25T12:00:00.001Z").not.toBeWithinLast({ minutes: 5 }, { now: NOW });
		expectlyDate("2026-10-25T11:59:59.999Z").not.toBeWithinNext({ minutes: 5 }, { now: NOW });
		const error = getRejectedErrorSync(() => {
			expectlyDate("2026-10-25T12:01:00Z").toBeWithinLast({ minutes: 5 }, { now: NOW });
		});
		expect(error.message).toContain("In the future by: 1 minute");
	});

	test("honour mocked clocks through Date.now()", () => {
		const realNow = Date.now;
		Date.now = (): number => Date.parse(NOW);
		try {
			expectlyDate("2026-10-25T11:58:00Z").toBeWithinLast({ minutes: 5 });
			expectlyDate("2026-10-25T11:50:00Z").not.toBeWithinLast({ minutes: 5 });
		} finally {
			Date.now = realNow;
		}
	});

	test("work with validated branded strings", () => {
		const createdAt = parseISOInstant("2026-10-25T11:57:30Z");
		expectlyDate(createdAt).toBeWithinLast({ minutes: 5 }, { now: NOW });
	});

	test("reject calendar units and negative durations", () => {
		expect(() => expectlyDate(NOW).toBeWithinLast({ months: 1 }, { now: NOW })).toThrow(/years, months or weeks/);
		expect(() => expectlyDate(NOW).toBeWithinLast({ minutes: -5 }, { now: NOW })).toThrow(/must not be negative/);
		expect(() => expectlyDate(NOW).toBeWithinLast({ minuts: 5 } as never, { now: NOW })).toThrow(
			/unknown duration unit/,
		);
	});
});

test.describe("toBeWithinDurationAfter", () => {
	const createdAt = "2026-10-25T12:00:00.000Z";

	test("checks the maximum elapsed time, inclusive", () => {
		expectlyDate("2026-10-25T12:00:15Z").toBeWithinDurationAfter(createdAt, { seconds: 15 });
		expectlyDate("2026-10-25T12:00:15.000000001Z").not.toBeWithinDurationAfter(createdAt, { seconds: 15 });
	});

	test("supports min and max boundaries", () => {
		const window = { min: { seconds: 1 }, max: { seconds: 10 } };
		expectlyDate("2026-10-25T12:00:01Z").toBeWithinDurationAfter(createdAt, window);
		expectlyDate("2026-10-25T12:00:10Z").toBeWithinDurationAfter(createdAt, window);
		expectlyDate("2026-10-25T12:00:00.5Z").not.toBeWithinDurationAfter(createdAt, window);
		expectlyDate("2026-10-25T12:00:10.001Z").not.toBeWithinDurationAfter(createdAt, window);
		expectlyDate("2026-10-25T13:00:00Z").toBeWithinDurationAfter(createdAt, { min: { seconds: 1 } });
	});

	test("requires chronological order", () => {
		expectlyDate("2026-10-25T11:59:59Z").not.toBeWithinDurationAfter(createdAt, { seconds: 15 });
	});

	test("reports actual versus expected duration", () => {
		const error = getRejectedErrorSync(() => {
			expectlyDate("2026-10-25T12:00:17.250Z").toBeWithinDurationAfter(createdAt, { seconds: 15 });
		});
		// oxlint-disable-next-line no-control-regex
		const message = error.message.replace(/\u001b\[\d+m/g, "");
		expect(message).toContain("Expected event to occur within 15 seconds after the start");
		expect(message).toContain(`Start:   "${createdAt}"`);
		expect(message).toContain(`Actual:  "2026-10-25T12:00:17.250Z"`);
		expect(message).toContain("Elapsed: 17.25 seconds");
		expect(message).toContain("Maximum: 15 seconds");
	});

	test("rejects invalid limits", () => {
		expect(() => expectlyDate(createdAt).toBeWithinDurationAfter(createdAt, { seconds: -1 })).toThrow(/negative/);
		expect(() =>
			expectlyDate(createdAt).toBeWithinDurationAfter(createdAt, { min: { seconds: 5 }, max: { seconds: 1 } }),
		).toThrow(/exceeds maximum/);
		expect(() => expectlyDate(createdAt).toBeWithinDurationAfter(createdAt, { days: 1, months: 1 })).toThrow(
			/years, months or weeks/,
		);
	});
});

test.describe("toBeWithinTimeOfDay", () => {
	test("checks a daytime window with inclusive boundaries", () => {
		const options = { timeZone: "Europe/Amsterdam" };
		expectlyDate("2026-10-26T08:00:00Z").toBeWithinTimeOfDay("09:00", "17:00", options);
		expectlyDate("2026-10-26T16:00:00Z").toBeWithinTimeOfDay("09:00", "17:00", options);
		expectlyDate("2026-10-26T16:00:00.001Z").not.toBeWithinTimeOfDay("09:00", "17:00", options);
		expectlyDate("2026-10-26T07:59:59Z").not.toBeWithinTimeOfDay("09:00", "17:00", options);
	});

	test("handles overnight windows", () => {
		expectlyDate("23:30").toBeWithinTimeOfDay("22:00", "06:00");
		expectlyDate("05:59:59").toBeWithinTimeOfDay("22:00", "06:00");
		expectlyDate("12:00").not.toBeWithinTimeOfDay("22:00", "06:00");
	});

	test("accepts PlainTime and local datetimes without inventing a date or zone", () => {
		expectlyDate(Temporal.PlainTime.from("10:15")).toBeWithinTimeOfDay(Temporal.PlainTime.from("09:00"), "17:00");
		expectlyDate("2026-10-25T10:15:00").toBeWithinTimeOfDay("09:00", "17:00");
		expect(() => expectlyDate("10:15").toBeWithinTimeOfDay("09:00", "17:00", { timeZone: "Europe/Amsterdam" })).toThrow(
			/timeZone option only applies to absolute timestamps/,
		);
	});

	test("uses the explicit offset of an ISO string by default", () => {
		expectlyDate("2026-10-25T09:30:00+05:30").toBeWithinTimeOfDay("09:00", "10:00");
	});
});

test.describe("toBeTruncatedTo", () => {
	test("checks the value, not its formatting", () => {
		expectlyDate("2026-10-25T12:30:45.000Z").toBeTruncatedTo("second");
		expectlyDate("2026-10-25T12:30:00Z").toBeTruncatedTo("minute");
		expectlyDate("2026-10-25T12:00:00.000000Z").toBeTruncatedTo("hour");
		expectlyDate("2026-10-25T12:30:45.123Z").toBeTruncatedTo("millisecond");
		expectlyDate("2026-10-25T12:30:45.123456Z").toBeTruncatedTo("microsecond");
	});

	test("fails when lower components are set", () => {
		expectlyDate("2026-10-25T12:30:45.000000001Z").not.toBeTruncatedTo("microsecond");
		expectlyDate("2026-10-25T12:30:45.0001Z").not.toBeTruncatedTo("millisecond");
		expectlyDate("2026-10-25T12:30:01Z").not.toBeTruncatedTo("minute");
		const error = getRejectedErrorSync(() => expectlyDate("2026-10-25T12:30:45.5Z").toBeTruncatedTo("second"));
		expect(error.message).toContain("Truncated:");
	});

	test("uses the zone for hours, so half-hour offsets work", () => {
		expectlyDate("2026-10-25T12:00:00+05:30").toBeTruncatedTo("hour");
		expectlyDate("2026-10-25T06:30:00Z").not.toBeTruncatedTo("hour");
		expectlyDate("2026-10-25T06:30:00Z").toBeTruncatedTo("hour", { timeZone: "Asia/Kolkata" });
	});

	test("supports local datetimes and times", () => {
		expectlyDate("2026-10-25T12:00:00").toBeTruncatedTo("hour");
		expectlyDate(Temporal.PlainTime.from("12:34:56.789")).toBeTruncatedTo("millisecond");
	});

	test("rejects unknown units", () => {
		expect(() => expectlyDate(NOW).toBeTruncatedTo("day" as never)).toThrow(/Invalid unit/);
	});
});

test.describe("toHaveTimeZone", () => {
	test("checks the IANA time zone of zoned values", () => {
		expectlyDate("2026-10-25T14:30:00+01:00[Europe/Amsterdam]").toHaveTimeZone("Europe/Amsterdam");
		expectlyDate(Temporal.ZonedDateTime.from("2026-10-25T14:30:00[Asia/Tokyo]")).toHaveTimeZone("Asia/Tokyo");
		expectlyDate("2026-10-25T14:30:00+01:00[Europe/Amsterdam]").not.toHaveTimeZone("Europe/Paris");
	});

	test("treats time-zone aliases and casing as the same zone", () => {
		expectlyDate("2026-10-25T14:30:00[Europe/Kiev]").toHaveTimeZone("Europe/Kyiv");
		expectlyDate("2026-10-25T14:30:00[Europe/Amsterdam]").toHaveTimeZone("europe/amsterdam");
	});

	test("does not confuse an offset with a time zone", () => {
		expect(() => expectlyDate("2026-10-25T14:30:00+01:00[Europe/Amsterdam]").toHaveTimeZone("+01:00")).toThrow(
			/Use toHaveOffset/,
		);
		expect(() => expectlyDate("2026-10-25T14:30:00+01:00").toHaveTimeZone("Europe/Amsterdam")).toThrow(
			/expected zoned datetime/,
		);
		expect(() => expectlyDate(new Date()).toHaveTimeZone("UTC")).toThrow(/expected zoned datetime/);
	});

	test("rejects unknown zones", () => {
		expect(() => expectlyDate("2026-10-25T14:30:00[Europe/Amsterdam]").toHaveTimeZone("Nowhere/City")).toThrow(
			/not a known IANA time zone/,
		);
	});
});

test.describe("toHaveOffset", () => {
	test("checks the explicitly represented offset", () => {
		expectlyDate("2026-10-25T12:00:00+01:00").toHaveOffset("+01:00");
		expectlyDate("2026-10-25T12:00:00Z").toHaveOffset("Z");
		expectlyDate("2026-10-25T12:00:00Z").toHaveOffset("+00:00");
		expectlyDate("2026-10-25T12:00:00-05:30").not.toHaveOffset("-05:00");
	});

	test("reads the offset of zoned values, including DST", () => {
		expectlyDate("2026-07-01T12:00:00[Europe/Amsterdam]").toHaveOffset("+02:00");
		expectlyDate(Temporal.ZonedDateTime.from("2026-12-01T12:00:00[Europe/Amsterdam]")).toHaveOffset("+01:00");
	});

	test("never infers an offset from a Date or Instant", () => {
		expect(() => expectlyDate(new Date()).toHaveOffset("+00:00")).toThrow(/has no explicit offset/);
		expect(() => expectlyDate(Temporal.Now.instant()).toHaveOffset("+00:00")).toThrow(/has no explicit offset/);
		expect(() => expectlyDate("2026-10-25T12:00:00").toHaveOffset("+00:00")).toThrow(/has no explicit offset/);
	});

	test("rejects malformed expected offsets", () => {
		expect(() => expectlyDate(NOW).toHaveOffset("+0100")).toThrow(/Invalid expected offset/);
	});
});

test.describe("toBeValidISODateTime", () => {
	test("accepts local, offset and zoned datetimes", () => {
		expectlyDate("2026-10-25T12:30:45").toBeValidISODateTime();
		expectlyDate("2026-10-25T12:30:45Z").toBeValidISODateTime();
		expectlyDate("2026-10-25T12:30:45.123456789+01:00").toBeValidISODateTime();
		expectlyDate("2026-10-25T12:30:45[Europe/Amsterdam]").toBeValidISODateTime();
	});

	test("requireOffset distinguishes absolute timestamps from local datetimes", () => {
		expectlyDate("2026-10-25T12:30:45+01:00").toBeValidISODateTime({ requireOffset: true });
		expectlyDate("2026-10-25T12:30:45Z[Europe/Amsterdam]").toBeValidISODateTime({ requireOffset: true });
		expectlyDate("2026-10-25T12:30:45").not.toBeValidISODateTime({ requireOffset: true });
		expectlyDate("2026-10-25T12:30:45[Europe/Amsterdam]").not.toBeValidISODateTime({ requireOffset: true });
	});

	test("rejects invalid components with a reason", () => {
		expectlyDate("2026-02-29T12:00:00Z").not.toBeValidISODateTime();
		expectlyDate("2026-10-25T24:00:00Z").not.toBeValidISODateTime();
		expectlyDate(new Date()).not.toBeValidISODateTime();
		const error = getRejectedErrorSync(() => expectlyDate("2026-02-29T12:00:00Z").toBeValidISODateTime());
		expect(error.message).toContain("Problem:");
	});
});

test.describe("toBeAtStartOfDay / toBeAtEndOfDay", () => {
	const amsterdam = { timeZone: "Europe/Amsterdam" };

	test("start of day uses calendar-aware midnight", () => {
		expectlyDate("2026-10-24T22:00:00Z").toBeAtStartOfDay(amsterdam);
		expectlyDate("2026-10-25T00:00:00Z").not.toBeAtStartOfDay(amsterdam);
		expectlyDate("2026-10-25T00:00:00Z").toBeAtStartOfDay({ timeZone: "UTC" });
		expectlyDate("2026-10-25T00:00:00").toBeAtStartOfDay();
		expectlyDate("2026-10-25T00:00:00.000000001").not.toBeAtStartOfDay();
	});

	test("start of day handles zones where midnight does not exist", () => {
		// Santiago switches to DST at 00:00 on 2026-09-06: that day starts at 01:00.
		expectlyDate("2026-09-06T01:00:00-03:00[America/Santiago]").toBeAtStartOfDay();
	});

	test("end of day is the last moment at the requested precision", () => {
		expectlyDate("2026-10-25T22:59:59.999Z").toBeAtEndOfDay(amsterdam);
		expectlyDate("2026-10-25T22:59:59.998Z").not.toBeAtEndOfDay(amsterdam);
		expectlyDate("2026-10-25T22:59:59.999999999Z").toBeAtEndOfDay(amsterdam);
		expectlyDate("2026-10-25T22:59:59.999Z").not.toBeAtEndOfDay({ ...amsterdam, precision: "nanosecond" });
		expectlyDate("2026-10-25T22:59:59Z").toBeAtEndOfDay({ ...amsterdam, precision: "second" });
		expectlyDate("2026-10-25T23:00:00Z").not.toBeAtEndOfDay(amsterdam);
		expectlyDate("2026-10-25T23:59:59.999").toBeAtEndOfDay();
	});

	test("reject values without a time", () => {
		expect(() => expectlyDate("2026-10-25").toBeAtStartOfDay()).toThrow(TypeError);
		expect(() => expectlyDate("2026-10-25T23:59:59Z").toBeAtEndOfDay({ precision: "day" as never })).toThrow(
			/Invalid precision/,
		);
	});
});

test.describe("toBeSameTimeOfDay", () => {
	test("compares wall-clock times on different dates", () => {
		expectlyDate("2026-10-25T09:30:00").toBeSameTimeOfDay("2026-11-10T09:30:00");
		expectlyDate("2026-10-25T09:30:00").toBeSameTimeOfDay("09:30");
		expectlyDate("2026-10-25T09:30:00").not.toBeSameTimeOfDay("2026-10-25T09:30:00.000000001");
	});

	test("respects precision", () => {
		expectlyDate("09:30:15").toBeSameTimeOfDay("09:30:45", { precision: "minute" });
		expectlyDate("09:30:15").not.toBeSameTimeOfDay("09:30:45", { precision: "second" });
	});

	test("reads absolute timestamps on one comparison zone", () => {
		// Winter (+01:00) and summer (+02:00) 09:30 in Amsterdam are different UTC times.
		expectlyDate("2026-01-15T08:30:00Z").toBeSameTimeOfDay("2026-07-15T07:30:00Z", { timeZone: "Europe/Amsterdam" });
		expectlyDate("2026-01-15T08:30:00Z").not.toBeSameTimeOfDay("2026-07-15T07:30:00Z", { timeZone: "UTC" });
	});
});

test.describe("toHaveMaximumDateGap", () => {
	test("checks consecutive values in input order", () => {
		expectlyDate(["2026-10-25T12:00:00Z", "2026-10-25T12:05:00Z", "2026-10-25T12:09:00Z"]).toHaveMaximumDateGap({
			minutes: 5,
		});
		expectlyDate(["2026-10-25T12:00:00Z", "2026-10-25T12:05:00.001Z"]).not.toHaveMaximumDateGap({ minutes: 5 });
	});

	test("reports the offending pair and the actual gap", () => {
		const error = getRejectedErrorSync(() => {
			expectlyDate(["2026-10-25T12:00:00Z", "2026-10-25T12:04:00Z", "2026-10-25T12:12:30Z"]).toHaveMaximumDateGap({
				minutes: 5,
			});
		});
		expect(error.message).toContain("Offending pair at index 1 → 2");
		expect(error.message).toContain("8 minutes 30 seconds");
	});

	test("measures unordered pairs by their distance", () => {
		expectlyDate(["2026-10-25T12:05:00Z", "2026-10-25T12:00:00Z"]).toHaveMaximumDateGap({ minutes: 5 });
	});

	test("distinguishes elapsed time from calendar gaps", () => {
		const acrossDst = ["2026-10-24T12:00:00+02:00[Europe/Amsterdam]", "2026-10-25T12:00:00+01:00[Europe/Amsterdam]"];
		// The calendar day of the DST change lasts 25 hours.
		expectlyDate(acrossDst).toHaveMaximumDateGap({ days: 1 });
		expectlyDate(acrossDst).not.toHaveMaximumDateGap({ hours: 24 });
		expectlyDate(["2026-01-31", "2026-02-28"]).toHaveMaximumDateGap({ months: 1 });
		expectlyDate(["2026-01-31", "2026-03-01"]).not.toHaveMaximumDateGap({ months: 1 });
	});
});
