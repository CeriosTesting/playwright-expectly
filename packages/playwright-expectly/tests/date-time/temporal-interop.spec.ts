import { Temporal as JsTemporal } from "@js-temporal/polyfill";
import { expect, test } from "@playwright/test";
import { Temporal as Polyfill } from "temporal-polyfill/full/implementation";

import { normalize } from "../../src/date-time/inputs";
import { getTemporal, temporalKind } from "../../src/date-time/temporal";
import { expectlyDate } from "../../src/expectly-date";

const globals = globalThis as { Temporal?: unknown };
const nativeTemporal = globals.Temporal;

test.describe("Temporal implementation detection", () => {
	test("detects every Temporal kind by tag, not by instanceof", () => {
		expect(temporalKind(JsTemporal.Instant.from("2026-10-25T12:00:00Z"))).toBe("Instant");
		expect(temporalKind(Polyfill.ZonedDateTime.from("2026-10-25T12:00:00[UTC]"))).toBe("ZonedDateTime");
		expect(temporalKind(JsTemporal.PlainDate.from("2026-10-25"))).toBe("PlainDate");
		expect(temporalKind(JsTemporal.PlainDateTime.from("2026-10-25T12:00"))).toBe("PlainDateTime");
		expect(temporalKind(JsTemporal.PlainTime.from("12:00"))).toBe("PlainTime");
		expect(temporalKind(JsTemporal.Duration.from("PT1S"))).toBe("Duration");
		expect(temporalKind(new Date())).toBeUndefined();
		expect(temporalKind("2026-10-25")).toBeUndefined();
	});

	test("never assigns globalThis.Temporal", () => {
		expectlyDate("2026-10-25T12:00:00Z").toBeSameInstant(JsTemporal.Instant.from("2026-10-25T12:00:00Z"));
		expect(globals.Temporal).toBe(nativeTemporal);
	});
});

test.describe("values from another implementation", () => {
	test("are converted without losing nanosecond precision", () => {
		const instant = JsTemporal.Instant.from("2026-10-25T12:00:00.123456789Z");
		expectlyDate(instant).toBeSameInstant("2026-10-25T12:00:00.123456789Z");
		expectlyDate(instant).not.toBeSameInstant("2026-10-25T12:00:00.123456788Z");
	});

	test("keep their time zone and offset", () => {
		const zoned = JsTemporal.ZonedDateTime.from("2026-10-25T02:30:00+01:00[Europe/Amsterdam]");
		expectlyDate(zoned).toHaveTimeZone("Europe/Amsterdam");
		expectlyDate(zoned).toHaveOffset("+01:00");
		expectlyDate(zoned).toBeSameInstant("2026-10-25T01:30:00Z");
	});

	test("work with calendar, time-of-day and duration matchers", () => {
		expectlyDate(JsTemporal.PlainDate.from("2026-10-25")).toBeSameDay(Polyfill.PlainDate.from("2026-10-25"));
		expectlyDate(JsTemporal.PlainDateTime.from("2026-10-25T09:30:00")).toBeSameTimeOfDay(
			JsTemporal.PlainTime.from("09:30"),
		);
		expectlyDate(JsTemporal.Duration.from({ seconds: 5 })).toBeShorterThan(Polyfill.Duration.from({ seconds: 10 }));
	});

	test("accept non-ISO calendars, converting them to the same ISO day", () => {
		const hebrew = JsTemporal.PlainDate.from("2026-10-25").withCalendar("hebrew");
		expectlyDate(hebrew).toBeSameDay("2026-10-25");
		expectlyDate(hebrew).not.toBeWeekday();
		expectlyDate(hebrew).toBeInMonth(2);
		expectlyDate(JsTemporal.PlainDateTime.from("2026-10-25T09:30").withCalendar("persian")).toBeSameTimeOfDay("09:30");
		expectlyDate(
			JsTemporal.ZonedDateTime.from("2026-10-25T12:00:00+01:00[Europe/Amsterdam]").withCalendar("japanese"),
		).toBeSameInstant("2026-10-25T11:00:00Z");
	});
});

test.describe("global Temporal preference", () => {
	test.afterEach(() => {
		globals.Temporal = nativeTemporal;
	});

	test("uses a global Temporal implementation when one is present", () => {
		globals.Temporal = JsTemporal;
		expect(getTemporal()).toBe(JsTemporal);
		const normalized = normalize("2026-10-25T12:00:00Z", "value");
		expect(normalized.value).toBeInstanceOf(JsTemporal.Instant);
		expectlyDate(Polyfill.Instant.from("2026-10-25T12:00:00Z")).toBeSameInstant("2026-10-25T13:00:00+01:00");
		expectlyDate("2026-10-25T02:30:00+02:00[Europe/Amsterdam]").toBeBefore(
			"2026-10-25T02:30:00+01:00[Europe/Amsterdam]",
		);
	});

	test("falls back to the bundled polyfill when no global is present", () => {
		globals.Temporal = undefined;
		expect(getTemporal()).toBe(Polyfill);
	});

	test("ignores a global that is not a Temporal implementation", () => {
		globals.Temporal = { Instant: "nope" };
		expect(getTemporal()).toBe(Polyfill);
	});
});

test.describe("native Temporal", () => {
	test.skip(nativeTemporal === undefined, "Native Temporal is not available (run Node with --harmony-temporal)");

	const native = nativeTemporal as typeof Polyfill;
	// Engines that still ship an outdated draft (e.g. Node 24 --harmony-temporal) lack calendarId.
	const conforming = nativeTemporal !== undefined && "calendarId" in native.PlainDate.prototype;

	test("is preferred only when it implements the current specification", () => {
		expect(getTemporal()).toBe(conforming ? nativeTemporal : Polyfill);
	});

	test("interoperates with polyfilled values", () => {
		expectlyDate(native.Instant.from("2026-10-25T12:00:00.000000001Z")).toBeSameInstant(
			JsTemporal.Instant.from("2026-10-25T12:00:00.000000001Z"),
		);
		expectlyDate(native.ZonedDateTime.from("2026-10-25T02:30:00+01:00[Europe/Amsterdam]")).toHaveOffset("+01:00");
		expectlyDate(native.PlainDate.from("2026-10-25")).toBeSameDay("2026-10-25");
		expectlyDate("2026-10-25T12:00:00Z").toBeSameInstant(native.Instant.from("2026-10-25T12:00:00Z"));
	});
});
