import { withMatcherState } from "@cerios/playwright-expectly-core";

import type { NormalizedDateTime } from "../date-time/inputs";
import { normalize } from "../date-time/inputs";
import type { PlainDate } from "../date-time/temporal";
import { ISO_CALENDAR } from "../date-time/temporal";
import type { CalendarFieldOptions, DateInput, RelativeTimeOptions, TimeZoneOptions } from "../date-time/types";
import { calendarDate, currentInstant, inCalendar, resolveCalendar, resolveTimeZone } from "../date-time/zones";
import type { DayOfWeek, MonthCode, MonthName } from "../types/matcher-types";

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

/** Calendars whose months are the ISO months, so month names and quarter labels apply. */
const GREGORIAN_MONTH_CALENDARS: ReadonlySet<string> = new Set([
	ISO_CALENDAR,
	"gregory",
	"japanese",
	"buddhist",
	"roc",
]);

const MONTH_CODE = /^M\d{2}L?$/;

interface CalendarValue {
	value: NormalizedDateTime;
	/** ISO calendar: used for equality and weekdays, which no calendar changes. */
	date: PlainDate;
	/** The same day with its year, month and day fields in the resolved calendar. */
	fields: PlainDate;
	timeZone: string;
}

function ownCalendar(value: NormalizedDateTime): string {
	return "calendar" in value && value.calendar !== undefined ? value.calendar : ISO_CALENDAR;
}

/**
 * Places values on the calendar. Only matchers that read year, month or day fields (`readsFields`)
 * resolve one shared calendar; the others display each value in its own calendar.
 */
function onCalendars(
	inputs: readonly [unknown, string][],
	options: CalendarFieldOptions | undefined,
	readsFields: boolean,
): CalendarValue[] {
	const values = inputs.map(([input, label]) => normalize(input, label));
	const zone = resolveTimeZone(options?.timeZone, ...values);
	const shared = readsFields ? resolveCalendar(options?.calendar, ...values) : undefined;
	return values.map((value, index) => {
		const date = calendarDate(value, zone, inputs[index][1]);
		return { value, date, fields: inCalendar(date, shared ?? ownCalendar(value)), timeZone: zone };
	});
}

function onCalendar(actual: unknown, options: CalendarFieldOptions | undefined, readsFields = false): CalendarValue {
	return onCalendars([[actual, "actual date"]], options, readsFields)[0];
}

function onSameCalendar(
	actual: unknown,
	expected: unknown,
	options: CalendarFieldOptions | undefined,
	readsFields = false,
): [CalendarValue, CalendarValue] {
	const [received, target] = onCalendars(
		[
			[actual, "actual date"],
			[expected, "expected date"],
		],
		options,
		readsFields,
	);
	return [received, target];
}

function hasGregorianMonths(date: PlainDate): boolean {
	return GREGORIAN_MONTH_CALENDARS.has(date.calendarId);
}

/** Temporal numbers days 1 (Monday) to 7 (Sunday); this returns 0 (Sunday) to 6 (Saturday). */
function dayIndex(date: PlainDate): number {
	return date.dayOfWeek % 7;
}

function quarterOf(fields: PlainDate): 1 | 2 | 3 | 4 {
	if (fields.monthsInYear !== 12) {
		throw new Error(
			`Quarters are undefined in the "${fields.calendarId}" calendar: year ${fields.year} has ${fields.monthsInYear} months`,
		);
	}
	return Math.ceil(fields.month / 3) as 1 | 2 | 3 | 4;
}

function describeQuarter(quarter: 1 | 2 | 3 | 4, fields: PlainDate): string {
	return hasGregorianMonths(fields) ? QUARTER_MONTHS[quarter] : `months ${quarter * 3 - 2}-${quarter * 3}`;
}

function describeMonth(fields: PlainDate): string {
	return hasGregorianMonths(fields) ? MONTH_NAMES[fields.month - 1] : `month ${fields.month} (${fields.monthCode})`;
}

function describeDate(calendar: CalendarValue): string {
	const { date, fields } = calendar;
	const iso = `${date.toString()} (${DAY_NAMES[dayIndex(date)]})`;
	if (fields.calendarId === ISO_CALENDAR) return iso;
	return `${iso}, ${fields.calendarId} ${fields.year}-${fields.monthCode}-${String(fields.day).padStart(2, "0")}`;
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

/** Matches a month by ordinal (`month`) or, for a month code, by `monthCode` (e.g. `"M05L"`, Adar I). */
function parseMonth(
	expectedMonth: MonthName | MonthCode | number,
	fields: PlainDate,
): { field: "month" | "monthCode"; value: number | string; label: string } {
	const gregorian = hasGregorianMonths(fields);
	if (typeof expectedMonth === "string") {
		if (MONTH_CODE.test(expectedMonth)) return { field: "monthCode", value: expectedMonth, label: expectedMonth };
		const index = MONTH_NAMES.indexOf(expectedMonth as MonthName);
		if (index === -1) throw new Error(`Invalid month name: ${expectedMonth}`);
		if (!gregorian) {
			throw new Error(
				`Month names only apply to Gregorian-based calendars, not "${fields.calendarId}". Pass a month number or code (e.g. "M05L")`,
			);
		}
		return { field: "month", value: index + 1, label: expectedMonth };
	}
	const maximum = gregorian ? 12 : 13;
	if (!Number.isInteger(expectedMonth) || expectedMonth < 1 || expectedMonth > maximum) {
		throw new Error(`Invalid month number: ${expectedMonth}. Must be between 1 and ${maximum}`);
	}
	return {
		field: "month",
		value: expectedMonth,
		label: gregorian ? MONTH_NAMES[expectedMonth - 1] : `month ${expectedMonth}`,
	};
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
	const received = onCalendar(actual, options);
	const today = currentInstant(options?.now).toZonedDateTimeISO(received.timeZone).toPlainDate();
	return [received, today.add({ days: offsetDays })];
}

/**
 * Calendar matchers. Absolute timestamps are placed on the calendar of one zone per assertion:
 * the `timeZone` option, else a ZonedDateTime's zone, else an ISO string's offset, else the machine zone.
 * Matchers that read years, months or month days use one calendar: the `calendar` option, else the
 * values' own non-ISO calendar, else ISO 8601. Days and weekdays are the same in every calendar.
 */
export const expectlyDateCalendarMatchers = withMatcherState({
	toBeSameDay(actual: DateInput, expected: DateInput, options?: TimeZoneOptions) {
		const [received, target] = onSameCalendar(actual, expected, options);
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

	toBeSameMonth(actual: DateInput, expected: DateInput, options?: CalendarFieldOptions) {
		const [received, target] = onSameCalendar(actual, expected, options, true);
		return dateMatcherResult(this, {
			name: "toBeSameMonth",
			pass: received.fields.year === target.fields.year && received.fields.monthCode === target.fields.monthCode,
			subject: "dates",
			expectation: "be in the same month",
			lines: calendarLines(received, target),
			expected,
			actual,
		});
	},

	toBeSameYear(actual: DateInput, expected: DateInput, options?: CalendarFieldOptions) {
		const [received, target] = onSameCalendar(actual, expected, options, true);
		return dateMatcherResult(this, {
			name: "toBeSameYear",
			pass: received.fields.year === target.fields.year,
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
		const received = onCalendar(actual, options);
		return dateMatcherResult(this, {
			name: "toBeWeekday",
			pass: received.date.dayOfWeek <= 5,
			expectation: "be a weekday (Monday-Friday)",
			lines: calendarLines(received),
			actual,
		});
	},

	toBeWeekend(actual: DateInput, options?: TimeZoneOptions) {
		const received = onCalendar(actual, options);
		return dateMatcherResult(this, {
			name: "toBeWeekend",
			pass: received.date.dayOfWeek >= 6,
			expectation: "be a weekend (Saturday-Sunday)",
			lines: calendarLines(received),
			actual,
		});
	},

	toBeLeapYear(actual: DateInput, options?: CalendarFieldOptions) {
		const received = onCalendar(actual, options, true);
		return dateMatcherResult(this, {
			name: "toBeLeapYear",
			pass: received.fields.inLeapYear,
			subject: "year",
			expectation: "be a leap year",
			lines: () => [["Year", received.fields.year, "received"], ...calendarLines(received)()],
			actual,
		});
	},

	toBeInQuarter(actual: DateInput, expectedQuarter: 1 | 2 | 3 | 4, options?: CalendarFieldOptions) {
		if (!([1, 2, 3, 4] as const).includes(expectedQuarter)) {
			throw new Error(`Invalid quarter: ${String(expectedQuarter)}. Must be 1, 2, 3 or 4`);
		}
		const received = onCalendar(actual, options, true);
		const actualQuarter = quarterOf(received.fields);
		return dateMatcherResult(this, {
			name: "toBeInQuarter",
			pass: actualQuarter === expectedQuarter,
			expectation: `be in Q${expectedQuarter} (${describeQuarter(expectedQuarter, received.fields)})`,
			lines: () => [
				["Received quarter", `Q${actualQuarter} (${describeQuarter(actualQuarter, received.fields)})`, "received"],
				...calendarLines(received)(),
			],
			expected: expectedQuarter,
			actual: actualQuarter,
		});
	},

	toBeInMonth(actual: DateInput, expectedMonth: MonthName | MonthCode | number, options?: CalendarFieldOptions) {
		const received = onCalendar(actual, options, true);
		const month = parseMonth(expectedMonth, received.fields);
		return dateMatcherResult(this, {
			name: "toBeInMonth",
			pass: received.fields[month.field] === month.value,
			expectation: `be in ${month.label}`,
			lines: () => [["Received month", describeMonth(received.fields), "received"], ...calendarLines(received)()],
			expected: month.value,
			actual: received.fields[month.field],
		});
	},

	toBeSpecificDayOfWeek(actual: DateInput, expectedDay: DayOfWeek | number, options?: TimeZoneOptions) {
		const day = parseDay(expectedDay);
		const received = onCalendar(actual, options);
		return dateMatcherResult(this, {
			name: "toBeSpecificDayOfWeek",
			pass: dayIndex(received.date) === day,
			expectation: `be a ${DAY_NAMES[day]}`,
			lines: calendarLines(received),
			expected: day,
			actual: dayIndex(received.date),
		});
	},

	toBeStartOfMonth(actual: DateInput, options?: CalendarFieldOptions) {
		const received = onCalendar(actual, options, true);
		return dateMatcherResult(this, {
			name: "toBeStartOfMonth",
			pass: received.fields.day === 1,
			expectation: "be the start of the month (day 1)",
			lines: calendarLines(received),
			actual,
		});
	},

	toBeEndOfMonth(actual: DateInput, options?: CalendarFieldOptions) {
		const received = onCalendar(actual, options, true);
		return dateMatcherResult(this, {
			name: "toBeEndOfMonth",
			pass: received.fields.day === received.fields.daysInMonth,
			expectation: `be the end of the month (day ${received.fields.daysInMonth})`,
			lines: calendarLines(received),
			actual,
		});
	},
});
