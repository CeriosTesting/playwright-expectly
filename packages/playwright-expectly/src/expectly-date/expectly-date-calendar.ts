import { withMatcherState } from "@cerios/playwright-expectly-core";

import type { NormalizedDateTime } from "../date-time/inputs";
import { normalize } from "../date-time/inputs";
import type { PlainDate } from "../date-time/temporal";
import type { DateInput, RelativeTimeOptions, TimeZoneOptions } from "../date-time/types";
import { calendarDate, currentInstant, resolveTimeZone } from "../date-time/zones";
import type { DayOfWeek, MonthName } from "../types/matcher-types";

import type { MessageLine } from "./date-matcher-utils";
import { dateMatcherResult, zoneLine } from "./date-matcher-utils";

const MONTH_NAMES: readonly MonthName[] = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/** Index 0 is Sunday, matching `Date#getDay()` and the numeric day argument of toBeSpecificDayOfWeek. */
const DAY_NAMES: readonly DayOfWeek[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const QUARTER_MONTHS: Record<1 | 2 | 3 | 4, string> = { 1: "Jan-Mar", 2: "Apr-Jun", 3: "Jul-Sep", 4: "Oct-Dec" };

interface CalendarValue {
	value: NormalizedDateTime;
	date: PlainDate;
	timeZone: string;
}

function onCalendar(actual: unknown, timeZone: string | undefined): CalendarValue {
	const value = normalize(actual, "actual date");
	const zone = resolveTimeZone(timeZone, value);
	return { value, date: calendarDate(value, zone, "actual date"), timeZone: zone };
}

function onSameCalendar(
	actual: unknown,
	expected: unknown,
	timeZone: string | undefined,
): [CalendarValue, CalendarValue] {
	const received = normalize(actual, "actual date");
	const target = normalize(expected, "expected date");
	const zone = resolveTimeZone(timeZone, received, target);
	return [
		{ value: received, date: calendarDate(received, zone, "actual date"), timeZone: zone },
		{ value: target, date: calendarDate(target, zone, "expected date"), timeZone: zone },
	];
}

/** Temporal numbers days 1 (Monday) to 7 (Sunday); this returns 0 (Sunday) to 6 (Saturday). */
function dayIndex(date: PlainDate): number {
	return date.dayOfWeek % 7;
}

function quarterOf(date: PlainDate): 1 | 2 | 3 | 4 {
	return Math.ceil(date.month / 3) as 1 | 2 | 3 | 4;
}

function describeDate(calendar: CalendarValue): string {
	return `${calendar.date.toString()} (${DAY_NAMES[dayIndex(calendar.date)]})`;
}

function calendarLines(received: CalendarValue, target?: CalendarValue): () => readonly (MessageLine | undefined)[] {
	return () => [
		target && ["Expected", target.value.display, "expected"],
		["Received", received.value.display, "received"],
		target && ["Expected date", describeDate(target)],
		["Received date", describeDate(received)],
		zoneLine(received.timeZone, received.value, ...(target ? [target.value] : [])),
	];
}

function parseMonth(expectedMonth: MonthName | number): number {
	if (typeof expectedMonth === "string") {
		const index = MONTH_NAMES.indexOf(expectedMonth);
		if (index === -1) throw new Error(`Invalid month name: ${expectedMonth}`);
		return index + 1;
	}
	if (!Number.isInteger(expectedMonth) || expectedMonth < 1 || expectedMonth > 12) {
		throw new Error(`Invalid month number: ${expectedMonth}. Must be between 1 and 12`);
	}
	return expectedMonth;
}

function parseDay(expectedDay: DayOfWeek | number): number {
	if (typeof expectedDay === "string") {
		const index = DAY_NAMES.indexOf(expectedDay);
		if (index === -1) throw new Error(`Invalid day name: ${expectedDay}`);
		return index;
	}
	if (!Number.isInteger(expectedDay) || expectedDay < 0 || expectedDay > 6) {
		throw new Error(`Invalid day number: ${expectedDay}. Must be between 0 (Sunday) and 6 (Saturday)`);
	}
	return expectedDay;
}

function relativeDay(
	actual: unknown,
	options: RelativeTimeOptions | undefined,
	offsetDays: number,
): [CalendarValue, PlainDate] {
	const received = onCalendar(actual, options?.timeZone);
	const today = currentInstant(options?.now).toZonedDateTimeISO(received.timeZone).toPlainDate();
	return [received, today.add({ days: offsetDays })];
}

/**
 * Calendar matchers. Absolute timestamps are placed on the calendar of one zone per assertion:
 * the `timeZone` option, else a ZonedDateTime's zone, else an ISO string's offset, else the machine zone.
 */
export const expectlyDateCalendarMatchers = withMatcherState({
	toBeSameDay(actual: DateInput, expected: DateInput, options?: TimeZoneOptions) {
		const [received, target] = onSameCalendar(actual, expected, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeSameDay",
			pass: received.date.equals(target.date),
			subject: "dates",
			expectation: "be the same day",
			lines: calendarLines(received, target),
			expected,
			actual,
		});
	},

	toBeSameMonth(actual: DateInput, expected: DateInput, options?: TimeZoneOptions) {
		const [received, target] = onSameCalendar(actual, expected, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeSameMonth",
			pass: received.date.year === target.date.year && received.date.month === target.date.month,
			subject: "dates",
			expectation: "be in the same month",
			lines: calendarLines(received, target),
			expected,
			actual,
		});
	},

	toBeSameYear(actual: DateInput, expected: DateInput, options?: TimeZoneOptions) {
		const [received, target] = onSameCalendar(actual, expected, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeSameYear",
			pass: received.date.year === target.date.year,
			subject: "dates",
			expectation: "be in the same year",
			lines: calendarLines(received, target),
			expected,
			actual,
		});
	},

	toBeToday(actual: DateInput, options?: RelativeTimeOptions) {
		const [received, today] = relativeDay(actual, options, 0);
		return dateMatcherResult(this, {
			name: "toBeToday",
			pass: received.date.equals(today),
			expectation: "be today",
			lines: () => [["Today", today.toString(), "expected"], ...calendarLines(received)()],
			actual,
		});
	},

	toBeYesterday(actual: DateInput, options?: RelativeTimeOptions) {
		const [received, yesterday] = relativeDay(actual, options, -1);
		return dateMatcherResult(this, {
			name: "toBeYesterday",
			pass: received.date.equals(yesterday),
			expectation: "be yesterday",
			lines: () => [["Yesterday", yesterday.toString(), "expected"], ...calendarLines(received)()],
			actual,
		});
	},

	toBeTomorrow(actual: DateInput, options?: RelativeTimeOptions) {
		const [received, tomorrow] = relativeDay(actual, options, 1);
		return dateMatcherResult(this, {
			name: "toBeTomorrow",
			pass: received.date.equals(tomorrow),
			expectation: "be tomorrow",
			lines: () => [["Tomorrow", tomorrow.toString(), "expected"], ...calendarLines(received)()],
			actual,
		});
	},

	toBeWeekday(actual: DateInput, options?: TimeZoneOptions) {
		const received = onCalendar(actual, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeWeekday",
			pass: received.date.dayOfWeek <= 5,
			expectation: "be a weekday (Monday-Friday)",
			lines: calendarLines(received),
			actual,
		});
	},

	toBeWeekend(actual: DateInput, options?: TimeZoneOptions) {
		const received = onCalendar(actual, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeWeekend",
			pass: received.date.dayOfWeek >= 6,
			expectation: "be a weekend (Saturday-Sunday)",
			lines: calendarLines(received),
			actual,
		});
	},

	toBeLeapYear(actual: DateInput, options?: TimeZoneOptions) {
		const received = onCalendar(actual, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeLeapYear",
			pass: received.date.inLeapYear,
			subject: "year",
			expectation: "be a leap year",
			lines: () => [["Year", received.date.year, "received"], ...calendarLines(received)()],
			actual,
		});
	},

	toBeInQuarter(actual: DateInput, expectedQuarter: 1 | 2 | 3 | 4, options?: TimeZoneOptions) {
		if (!([1, 2, 3, 4] as const).includes(expectedQuarter)) {
			throw new Error(`Invalid quarter: ${String(expectedQuarter)}. Must be 1, 2, 3 or 4`);
		}
		const received = onCalendar(actual, options?.timeZone);
		const actualQuarter = quarterOf(received.date);
		return dateMatcherResult(this, {
			name: "toBeInQuarter",
			pass: actualQuarter === expectedQuarter,
			expectation: `be in Q${expectedQuarter} (${QUARTER_MONTHS[expectedQuarter]})`,
			lines: () => [
				["Received quarter", `Q${actualQuarter} (${QUARTER_MONTHS[actualQuarter]})`, "received"],
				...calendarLines(received)(),
			],
			expected: expectedQuarter,
			actual: actualQuarter,
		});
	},

	toBeInMonth(actual: DateInput, expectedMonth: MonthName | number, options?: TimeZoneOptions) {
		const month = parseMonth(expectedMonth);
		const received = onCalendar(actual, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeInMonth",
			pass: received.date.month === month,
			expectation: `be in ${MONTH_NAMES[month - 1]}`,
			lines: () => [["Received month", MONTH_NAMES[received.date.month - 1], "received"], ...calendarLines(received)()],
			expected: month,
			actual: received.date.month,
		});
	},

	toBeSpecificDayOfWeek(actual: DateInput, expectedDay: DayOfWeek | number, options?: TimeZoneOptions) {
		const day = parseDay(expectedDay);
		const received = onCalendar(actual, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeSpecificDayOfWeek",
			pass: dayIndex(received.date) === day,
			expectation: `be a ${DAY_NAMES[day]}`,
			lines: calendarLines(received),
			expected: day,
			actual: dayIndex(received.date),
		});
	},

	toBeStartOfMonth(actual: DateInput, options?: TimeZoneOptions) {
		const received = onCalendar(actual, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeStartOfMonth",
			pass: received.date.day === 1,
			expectation: "be the start of the month (day 1)",
			lines: calendarLines(received),
			actual,
		});
	},

	toBeEndOfMonth(actual: DateInput, options?: TimeZoneOptions) {
		const received = onCalendar(actual, options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeEndOfMonth",
			pass: received.date.day === received.date.daysInMonth,
			expectation: `be the end of the month (day ${received.date.daysInMonth})`,
			lines: calendarLines(received),
			actual,
		});
	},
});
