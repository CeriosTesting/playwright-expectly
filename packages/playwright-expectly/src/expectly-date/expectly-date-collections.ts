import { withMatcherState } from "@cerios/playwright-expectly-core";

import type { Point } from "../date-time/compare";
import {
	addToPoint,
	alignPoints,
	assertRangeOrder,
	comparePoints,
	formatDistance,
	formatGap,
	isInRange,
	pointKey,
	rangeEnd,
} from "../date-time/compare";
import { formatDuration, nonNegativeDuration } from "../date-time/durations";
import type { NormalizedDateTime } from "../date-time/inputs";
import { normalize } from "../date-time/inputs";
import type { Duration, PlainDate } from "../date-time/temporal";
import { ISO_CALENDAR, getTemporal } from "../date-time/temporal";
import type {
	CalendarFieldOptions,
	DateInput,
	DurationInput,
	TimeZoneOptions,
	UniqueDatesOptions,
} from "../date-time/types";
import { calendarDate, inCalendar, resolveCalendar, resolveTimeZone } from "../date-time/zones";

import { dateMatcherResult, indexLabels, normalizeDateArray } from "./date-matcher-utils";

type ConsecutiveUnit = "day" | "month" | "year";

function alignArray(actual: unknown, minimum: 1 | 2, timeZone: string | undefined): Point[] {
	const values = normalizeDateArray(actual, minimum);
	return alignPoints(values, indexLabels(values), timeZone);
}

/**
 * Aligns the values and resolves the calendar the years and months of `duration` are added in.
 * Weeks and shorter units do not depend on the calendar.
 */
function alignForDuration(
	actual: unknown,
	minimum: 1 | 2,
	duration: Duration,
	options: CalendarFieldOptions | undefined,
): { points: Point[]; calendar: string } {
	const values = normalizeDateArray(actual, minimum);
	const points = alignPoints(values, indexLabels(values), options?.timeZone);
	const usesCalendar = options?.calendar !== undefined || duration.years !== 0 || duration.months !== 0;
	return { points, calendar: usesCalendar ? resolveCalendar(options?.calendar, ...values) : ISO_CALENDAR };
}

function sortPoints(points: readonly Point[]): Point[] {
	return [...points].sort(comparePoints);
}

function displays(points: readonly { display: string }[]): string[] {
	return points.map((point) => point.display);
}

/** Index of the first element out of order, or -1. */
function firstOrderViolation(points: readonly Point[], direction: 1 | -1): number {
	return points.findIndex((point, index) => index > 0 && comparePoints(points[index - 1], point) * direction > 0);
}

function orderResult(
	state: Parameters<typeof dateMatcherResult>[0],
	name: string,
	actual: unknown,
	options: TimeZoneOptions | undefined,
	direction: 1 | -1,
): ReturnType<typeof dateMatcherResult> {
	const points = Array.isArray(actual) && actual.length === 0 ? [] : alignArray(actual, 1, options?.timeZone);
	const violation = firstOrderViolation(points, direction);
	const order = direction === 1 ? "ascending" : "descending";
	return dateMatcherResult(state, {
		name,
		pass: violation === -1,
		subject: "date array",
		expectation: `be in ${order} order`,
		lines: () => [
			violation !== -1 && [
				`Out of order at index ${violation}`,
				`${points[violation - 1].display} → ${points[violation].display}`,
			],
			["Expected", displays(direction === 1 ? sortPoints(points) : sortPoints(points).reverse()), "expected"],
			["Received", displays(points), "received"],
		],
		actual,
	});
}

/** Both dates are in the same calendar; months are matched by code, so 13-month years work. */
function isConsecutive(previous: PlainDate, current: PlainDate, unit: ConsecutiveUnit): boolean {
	if (unit === "day") return previous.add({ days: 1 }).equals(current);
	if (unit === "month") {
		const next = previous.with({ day: 1 }).add({ months: 1 });
		return next.year === current.year && next.monthCode === current.monthCode;
	}
	return current.year === previous.year + 1;
}

function calendarDates(
	values: readonly NormalizedDateTime[],
	timeZone: string | undefined,
	calendar = ISO_CALENDAR,
): PlainDate[] {
	const zone = resolveTimeZone(timeZone, ...values);
	return values.map((value, index) => inCalendar(calendarDate(value, zone, `date at index ${index}`), calendar));
}

/**
 * Date collection matchers: ordering, spans, gaps, ranges and uniqueness.
 * Durations follow Temporal `.add()` semantics: calendar units are calendar-exact (DST-aware),
 * time units are exact elapsed time.
 */
export const expectlyDateCollectionMatchers = withMatcherState({
	toHaveDatesAscendingOrder(actual: DateInput[], options?: TimeZoneOptions) {
		return orderResult(this, "toHaveDatesAscendingOrder", actual, options, 1);
	},

	toHaveDatesDescendingOrder(actual: DateInput[], options?: TimeZoneOptions) {
		return orderResult(this, "toHaveDatesDescendingOrder", actual, options, -1);
	},

	toHaveDateRange(actual: DateInput[], expectedRange: DurationInput, options?: CalendarFieldOptions) {
		const range = nonNegativeDuration(expectedRange, "expected range");
		const { points, calendar } = alignForDuration(actual, 1, range, options);
		const sorted = sortPoints(points);
		const [first, last] = [sorted[0], sorted[sorted.length - 1]];
		const expectedLast = addToPoint(first, range, "expected range", calendar);
		return dateMatcherResult(this, {
			name: "toHaveDateRange",
			pass: comparePoints(expectedLast, last) === 0,
			subject: "date range",
			expectation: `span exactly ${formatDuration(range)}`,
			lines: () => [
				["First date", first.display],
				["Expected last date", expectedLast.value.toString(), "expected"],
				["Actual last date", last.display, "received"],
				["Actual range", formatGap(first, last)],
			],
			expected: expectedRange,
			actual,
		});
	},

	toHaveConsecutiveDates(actual: DateInput[], unit: ConsecutiveUnit, options?: CalendarFieldOptions) {
		if (!["day", "month", "year"].includes(unit)) {
			throw new TypeError(`Invalid unit: ${String(unit)}. Use "day", "month" or "year"`);
		}
		const values = normalizeDateArray(actual, 2);
		const calendar = resolveCalendar(options?.calendar, ...values);
		const dates = calendarDates(values, options?.timeZone, calendar).sort((left, right) =>
			getTemporal().PlainDate.compare(left, right),
		);
		const gap = dates.findIndex((date, index) => index > 0 && !isConsecutive(dates[index - 1], date, unit));
		return dateMatcherResult(this, {
			name: "toHaveConsecutiveDates",
			pass: gap === -1,
			subject: "dates",
			expectation: `be consecutive by ${unit}`,
			lines: () => [
				gap !== -1 && [`Gap found at index ${gap}`, `${dates[gap - 1].toString()} → ${dates[gap].toString()}`],
				["Received (sorted)", dates.map(String), "received"],
			],
			expected: unit,
			actual,
		});
	},

	toHaveDatesWithinRange(actual: DateInput[], startDate: DateInput, endDate: DateInput, options?: TimeZoneOptions) {
		const values = normalizeDateArray(actual, 1);
		const endValue = normalize(endDate, "end date");
		const [start, end, ...points] = alignPoints(
			[normalize(startDate, "start date"), endValue, ...values],
			["start date", "end date", ...indexLabels(values)],
			options?.timeZone,
		);
		assertRangeOrder(start, end);
		const range = rangeEnd(end, endValue);
		const outOfRange = points.filter((point) => !isInRange(point, start, range));
		return dateMatcherResult(this, {
			name: "toHaveDatesWithinRange",
			pass: outOfRange.length === 0,
			subject: "all dates",
			expectation: "be within range (inclusive)",
			lines: () => [
				["Start", start.display, "expected"],
				["End", end.display, "expected"],
				outOfRange.length > 0
					? [`Out of range dates (${outOfRange.length})`, displays(outOfRange), "received"]
					: ["Within range", `all ${points.length} dates`],
			],
			expected: { start: startDate, end: endDate },
			actual,
		});
	},

	toHaveUniqueDates(actual: DateInput[], options?: UniqueDatesOptions) {
		const values = normalizeDateArray(actual, 1);
		const keys = options?.ignoreTime
			? calendarDates(values, options.timeZone).map(String)
			: alignPoints(values, indexLabels(values), options?.timeZone).map(pointKey);
		const duplicates = values.filter((_, index) => keys.indexOf(keys[index]) !== index);
		return dateMatcherResult(this, {
			name: "toHaveUniqueDates",
			pass: duplicates.length === 0,
			subject: "all dates",
			expectation: `be unique${options?.ignoreTime ? " (ignoring time)" : ""}`,
			lines: () => [
				duplicates.length > 0
					? [`Found ${duplicates.length} duplicate(s)`, displays(duplicates), "received"]
					: ["Unique", `all ${values.length} dates`],
			],
			actual,
		});
	},

	toHaveDateGapsLargerThan(actual: DateInput[], minGap: DurationInput, options?: CalendarFieldOptions) {
		const gap = nonNegativeDuration(minGap, "minimum gap");
		const { points, calendar } = alignForDuration(actual, 2, gap, options);
		const sorted = sortPoints(points);
		const largeGaps = sorted
			.slice(1)
			.map((to, index) => ({ from: sorted[index], to }))
			.filter(({ from, to }) => comparePoints(to, addToPoint(from, gap, "minimum gap", calendar)) > 0);
		return dateMatcherResult(this, {
			name: "toHaveDateGapsLargerThan",
			pass: largeGaps.length > 0,
			subject: "dates",
			expectation: `have gaps larger than ${formatDuration(gap)}`,
			lines: () => [
				largeGaps.length > 0
					? [
							`Gaps found (${largeGaps.length})`,
							largeGaps.map(({ from, to }) => `${from.display} → ${to.display} (${formatGap(from, to)})`).join("; "),
						]
					: ["Gaps found", "none"],
			],
			expected: minGap,
			actual,
		});
	},

	toHaveMaximumDateGap(actual: DateInput[], maxGap: DurationInput, options?: CalendarFieldOptions) {
		const gap = nonNegativeDuration(maxGap, "maximum gap");
		const { points, calendar } = alignForDuration(actual, 2, gap, options);
		// Input order is preserved; each pair's gap is measured from its earlier to its later value.
		const offending = points.findIndex((point, index) => {
			if (index === 0) return false;
			const [earlier, later] =
				comparePoints(points[index - 1], point) <= 0 ? [points[index - 1], point] : [point, points[index - 1]];
			return comparePoints(later, addToPoint(earlier, gap, "maximum gap", calendar)) > 0;
		});
		return dateMatcherResult(this, {
			name: "toHaveMaximumDateGap",
			pass: offending === -1,
			subject: "consecutive dates",
			expectation: `be at most ${formatDuration(gap)} apart`,
			lines: () =>
				offending === -1
					? [["Pairs checked", points.length - 1]]
					: [
							[
								`Offending pair at index ${offending - 1} → ${offending}`,
								`${points[offending - 1].display} → ${points[offending].display}`,
								"received",
							],
							["Actual gap", formatDistance(points[offending - 1], points[offending])],
							["Maximum gap", formatDuration(gap), "expected"],
						],
			expected: maxGap,
			actual,
		});
	},
});
