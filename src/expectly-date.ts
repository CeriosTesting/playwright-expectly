import { expect as baseExpect } from "@playwright/test";

import { formatDatesForDisplay, isValidDate, sortedDates, validateDate } from "./matchers/common-utils";
import { withMatcherState } from "./matchers/matcher-state-utils";

const MONTH_NAMES = {
	January: 0,
	February: 1,
	March: 2,
	April: 3,
	May: 4,
	June: 5,
	July: 6,
	August: 7,
	September: 8,
	October: 9,
	November: 10,
	December: 11,
} as const;

const DAY_NAMES = {
	Sunday: 0,
	Monday: 1,
	Tuesday: 2,
	Wednesday: 3,
	Thursday: 4,
	Friday: 5,
	Saturday: 6,
} as const;

/**
 * Expextly Custom matchers for date validations.
 */
export const expectlyDateMatchers = withMatcherState({
	toBeCloseTo(
		actualDate: Date,
		expectedDate: Date,
		deviation: { seconds?: number; minutes?: number; hours?: number; days?: number }
	) {
		const assertionName = "toBeCloseTo";

		// Validate dates
		validateDate(actualDate, "actual date");
		validateDate(expectedDate, "expected date");

		// Calculate deviation in milliseconds
		const deviationMs =
			(deviation.days ?? 0) * 24 * 60 * 60 * 1000 +
			(deviation.hours ?? 0) * 60 * 60 * 1000 +
			(deviation.minutes ?? 0) * 60 * 1000 +
			(deviation.seconds ?? 0) * 1000;

		const expectedMin = expectedDate.getTime() - deviationMs;
		const expectedMax = expectedDate.getTime() + deviationMs;
		const actualTime = actualDate.getTime();

		const pass = actualTime >= expectedMin && actualTime <= expectedMax;
		const timeDiff = actualTime - expectedDate.getTime();
		const timeDiffSeconds = Math.abs(timeDiff / 1000);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be close to the expected date\n\n` +
					`Expected: ${this.utils.printExpected(expectedDate.toISOString())}\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())}\n` +
					`Difference: ${timeDiffSeconds.toFixed(3)} seconds\n` +
					`Allowed deviation: ±${(deviationMs / 1000).toFixed(3)} seconds`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be close to the expected date within the allowed deviation\n\n` +
					`Expected: ${this.utils.printExpected(expectedDate.toISOString())}\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())}\n` +
					`Difference: ${timeDiffSeconds.toFixed(3)} seconds (${timeDiff > 0 ? "later" : "earlier"})\n` +
					`Allowed deviation: ±${(deviationMs / 1000).toFixed(3)} seconds`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedDate,
			actual: actualDate,
		};
	},
	toHaveDatesAscendingOrder(actual: Date[]) {
		const assertionName = "toHaveDatesAscendingOrder";
		let pass: boolean;

		const expected: Date[] = sortedDates(actual, "ascending");
		try {
			baseExpect(actual).toEqual(expected);
			pass = true;
		} catch {
			pass = false;
		}

		const message = () =>
			this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			}) +
			"\n\n" +
			`Expected date array to ${this.isNot ? "not " : ""}be in ascending order\n\n` +
			`Expected: ${this.utils.printExpected(formatDatesForDisplay(expected))}\n` +
			`Received: ${this.utils.printReceived(formatDatesForDisplay(actual))}`;

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual,
		};
	},
	toHaveDatesDescendingOrder(actual: Date[]) {
		const assertionName = "toHaveDatesDescendingOrder";
		let pass: boolean;

		const expected: Date[] = sortedDates(actual, "descending");
		try {
			baseExpect(actual).toEqual(expected);
			pass = true;
		} catch {
			pass = false;
		}

		const message = () =>
			this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			}) +
			"\n\n" +
			`Expected date array to ${this.isNot ? "not " : ""}be in descending order\n\n` +
			`Expected: ${this.utils.printExpected(formatDatesForDisplay(expected))}\n` +
			`Received: ${this.utils.printReceived(formatDatesForDisplay(actual))}`;

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual,
		};
	},
	toBeBefore(actualDate: Date, expectedDate: Date) {
		const assertionName = "toBeBefore";

		validateDate(actualDate, "actual date");
		validateDate(expectedDate, "expected date");

		const pass = actualDate.getTime() < expectedDate.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be before\n\n` +
					`Expected: ${this.utils.printExpected(expectedDate.toISOString())}\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be before\n\n` +
					`Expected: ${this.utils.printExpected(expectedDate.toISOString())}\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedDate,
			actual: actualDate,
		};
	},
	toBeAfter(actualDate: Date, expectedDate: Date) {
		const assertionName = "toBeAfter";
		const parsedActual = actualDate;
		const parsedExpected = expectedDate;

		validateDate(parsedActual, "actual date");
		validateDate(parsedExpected, "expected date");

		const pass = parsedActual.getTime() > parsedExpected.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be after\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be after\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	toBeBetween(actualDate: Date, startDate: Date, endDate: Date) {
		const assertionName = "toBeBetween";
		const parsedActual = actualDate;
		const parsedStart = startDate;
		const parsedEnd = endDate;

		validateDate(parsedActual, "actual date");
		validateDate(parsedStart, "start date");
		validateDate(parsedEnd, "end date");

		const actualTime = parsedActual.getTime();
		const pass = actualTime >= parsedStart.getTime() && actualTime <= parsedEnd.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be between\n\n` +
					`Start: ${this.utils.printExpected(parsedStart.toISOString())}\n` +
					`End: ${this.utils.printExpected(parsedEnd.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be between\n\n` +
					`Start: ${this.utils.printExpected(parsedStart.toISOString())}\n` +
					`End: ${this.utils.printExpected(parsedEnd.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: { start: parsedStart, end: parsedEnd },
			actual: parsedActual,
		};
	},
	toBeSameDay(actualDate: Date, expectedDate: Date) {
		const assertionName = "toBeSameDay";
		const parsedActual = actualDate;
		const parsedExpected = expectedDate;

		validateDate(parsedActual, "actual date");
		validateDate(parsedExpected, "expected date");

		const pass =
			parsedActual.getFullYear() === parsedExpected.getFullYear() &&
			parsedActual.getMonth() === parsedExpected.getMonth() &&
			parsedActual.getDate() === parsedExpected.getDate();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not be the same day\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to be the same day\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	toBeSameMonth(actualDate: Date, expectedDate: Date) {
		const assertionName = "toBeSameMonth";
		const parsedActual = actualDate;
		const parsedExpected = expectedDate;

		validateDate(parsedActual, "actual date");
		validateDate(parsedExpected, "expected date");

		const pass =
			parsedActual.getFullYear() === parsedExpected.getFullYear() &&
			parsedActual.getMonth() === parsedExpected.getMonth();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not be in the same month\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to be in the same month\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	toBeSameYear(actualDate: Date, expectedDate: Date) {
		const assertionName = "toBeSameYear";
		const parsedActual = actualDate;
		const parsedExpected = expectedDate;

		validateDate(parsedActual, "actual date");
		validateDate(parsedExpected, "expected date");

		const pass = parsedActual.getFullYear() === parsedExpected.getFullYear();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not be in the same year\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to be in the same year\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	toBeToday(actualDate: Date) {
		const assertionName = "toBeToday";
		const parsedActual = actualDate;

		validateDate(parsedActual, "actual date");

		const today = new Date();
		const pass =
			parsedActual.getFullYear() === today.getFullYear() &&
			parsedActual.getMonth() === today.getMonth() &&
			parsedActual.getDate() === today.getDate();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be today\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be today\n\n` +
					`Today: ${this.utils.printExpected(today.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	toBeYesterday(actualDate: Date) {
		const assertionName = "toBeYesterday";
		const parsedActual = actualDate;

		validateDate(parsedActual, "actual date");

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const pass =
			parsedActual.getFullYear() === yesterday.getFullYear() &&
			parsedActual.getMonth() === yesterday.getMonth() &&
			parsedActual.getDate() === yesterday.getDate();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be yesterday\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be yesterday\n\n` +
					`Yesterday: ${this.utils.printExpected(yesterday.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	toBeTomorrow(actualDate: Date) {
		const assertionName = "toBeTomorrow";
		const parsedActual = actualDate;

		validateDate(parsedActual, "actual date");

		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const pass =
			parsedActual.getFullYear() === tomorrow.getFullYear() &&
			parsedActual.getMonth() === tomorrow.getMonth() &&
			parsedActual.getDate() === tomorrow.getDate();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be tomorrow\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be tomorrow\n\n` +
					`Tomorrow: ${this.utils.printExpected(tomorrow.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	toBeWeekday(actualDate: Date) {
		const assertionName = "toBeWeekday";
		const parsedActual = actualDate;

		validateDate(parsedActual, "actual date");

		const dayOfWeek = parsedActual.getDay();
		const pass = dayOfWeek >= 1 && dayOfWeek <= 5;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be a weekday\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())} (${dayNames[dayOfWeek]})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be a weekday (Monday-Friday)\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())} (${dayNames[dayOfWeek]})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	toBeWeekend(actualDate: Date) {
		const assertionName = "toBeWeekend";
		const parsedActual = actualDate;

		validateDate(parsedActual, "actual date");

		const dayOfWeek = parsedActual.getDay();
		const pass = dayOfWeek === 0 || dayOfWeek === 6;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be a weekend\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())} (${dayNames[dayOfWeek]})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be a weekend (Saturday-Sunday)\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())} (${dayNames[dayOfWeek]})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	toBeInThePast(actualDate: Date) {
		const assertionName = "toBeInThePast";
		const parsedActual = actualDate;

		validateDate(parsedActual, "actual date");

		const now = new Date();
		const pass = parsedActual.getTime() < now.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be in the past\n\n` +
					`Now: ${this.utils.printExpected(now.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be in the past\n\n` +
					`Now: ${this.utils.printExpected(now.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	toBeInTheFuture(actualDate: Date) {
		const assertionName = "toBeInTheFuture";
		const parsedActual = actualDate;

		validateDate(parsedActual, "actual date");

		const now = new Date();
		const pass = parsedActual.getTime() > now.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be in the future\n\n` +
					`Now: ${this.utils.printExpected(now.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be in the future\n\n` +
					`Now: ${this.utils.printExpected(now.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	toBeLeapYear(actualDate: Date) {
		const assertionName = "toBeLeapYear";
		const parsedActual = actualDate;

		validateDate(parsedActual, "actual date");

		const year = parsedActual.getFullYear();
		const pass = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected year to not be a leap year\n\nYear: ${this.utils.printReceived(year)}`;
			}

			if (!pass && !this.isNot) {
				return `${hint}\n\nExpected year to be a leap year\n\nYear: ${this.utils.printReceived(year)}`;
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	toHaveDateRange(actual: Date[], expectedRange: { days?: number; months?: number; years?: number }) {
		const assertionName = "toHaveDateRange";

		if (actual.length === 0) {
			throw new Error("Array must contain at least one date");
		}

		for (const date of actual) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${String(date)}`);
			}
		}

		const sortedDates = [...actual].sort((a, b) => a.getTime() - b.getTime());
		const firstDate = sortedDates[0];
		const lastDate = sortedDates[sortedDates.length - 1];

		const diffMs = lastDate.getTime() - firstDate.getTime();
		const diffDays = diffMs / (1000 * 60 * 60 * 24);

		let expectedDays = 0;
		if (expectedRange.days) expectedDays += expectedRange.days;
		if (expectedRange.months) expectedDays += expectedRange.months * 30.44; // Average month length
		if (expectedRange.years) expectedDays += expectedRange.years * 365.25; // Average year length

		const pass = Math.abs(diffDays - expectedDays) < 1; // Allow 1 day tolerance

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date range to not match\n\n` +
					`Expected range: ${this.utils.printExpected(expectedRange)}\n` +
					`Actual range: ${this.utils.printReceived(diffDays.toFixed(1))} days\n` +
					`First date: ${firstDate.toISOString()}\n` +
					`Last date: ${lastDate.toISOString()}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date range to match\n\n` +
					`Expected range: ${this.utils.printExpected(expectedRange)} (~${expectedDays.toFixed(1)} days)\n` +
					`Actual range: ${this.utils.printReceived(diffDays.toFixed(1))} days\n` +
					`First date: ${firstDate.toISOString()}\n` +
					`Last date: ${lastDate.toISOString()}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedRange,
			actual: { days: diffDays, firstDate, lastDate },
		};
	},
	toHaveConsecutiveDates(actual: Date[], unit: "day" | "month" | "year") {
		const assertionName = "toHaveConsecutiveDates";

		if (actual.length < 2) {
			throw new Error("Array must contain at least two dates");
		}

		for (const date of actual) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${String(date)}`);
			}
		}

		const sortedDates = [...actual].sort((a, b) => a.getTime() - b.getTime());
		let pass = true;
		let failIndex = -1;

		for (let i = 1; i < sortedDates.length; i++) {
			const prev = sortedDates[i - 1];
			const curr = sortedDates[i];

			if (unit === "day") {
				const expected = new Date(prev);
				expected.setDate(expected.getDate() + 1);
				if (
					curr.getFullYear() !== expected.getFullYear() ||
					curr.getMonth() !== expected.getMonth() ||
					curr.getDate() !== expected.getDate()
				) {
					pass = false;
					failIndex = i;
					break;
				}
			} else if (unit === "month") {
				const expected = new Date(prev);
				expected.setMonth(expected.getMonth() + 1);
				if (curr.getFullYear() !== expected.getFullYear() || curr.getMonth() !== expected.getMonth()) {
					pass = false;
					failIndex = i;
					break;
				}
			} else if (unit === "year") {
				if (curr.getFullYear() !== prev.getFullYear() + 1) {
					pass = false;
					failIndex = i;
					break;
				}
			}
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not be consecutive by ${unit}\n\n` +
					`Received: ${this.utils.printReceived(formatDatesForDisplay(sortedDates))}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to be consecutive by ${unit}\n\n` +
					`Gap found at index ${failIndex}:\n` +
					`Previous: ${sortedDates[failIndex - 1].toISOString()}\n` +
					`Current: ${sortedDates[failIndex].toISOString()}\n\n` +
					`Full array: ${this.utils.printReceived(formatDatesForDisplay(sortedDates))}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: unit,
			actual: sortedDates,
		};
	},
	toHaveDatesWithinRange(actual: Date[], startDate: Date, endDate: Date) {
		const assertionName = "toHaveDatesWithinRange";

		if (actual.length === 0) {
			throw new Error("Array must contain at least one date");
		}

		for (const date of actual) {
			validateDate(date, "date in array");
		}
		validateDate(startDate, "start date");
		validateDate(endDate, "end date");

		const startTime = startDate.getTime();
		const endTime = endDate.getTime();

		const outOfRangeDates = actual.filter(date => {
			const time = date.getTime();
			return time < startTime || time > endTime;
		});

		const pass = outOfRangeDates.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not all be within range\n\n` +
					`Start: ${this.utils.printExpected(startDate.toISOString())}\n` +
					`End: ${this.utils.printExpected(endDate.toISOString())}\n` +
					`All ${actual.length} dates were within range`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all dates to be within range\n\n` +
					`Start: ${this.utils.printExpected(startDate.toISOString())}\n` +
					`End: ${this.utils.printExpected(endDate.toISOString())}\n` +
					`Out of range dates (${outOfRangeDates.length}):\n${this.utils.printReceived(formatDatesForDisplay(outOfRangeDates))}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: { start: startDate, end: endDate },
			actual: outOfRangeDates,
		};
	},
	toHaveUniqueDates(actual: Date[], ignoreTime = false) {
		const assertionName = "toHaveUniqueDates";

		if (actual.length === 0) {
			throw new Error("Array must contain at least one date");
		}

		for (const date of actual) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${String(date)}`);
			}
		}

		const seen = new Set<string>();
		const duplicates: Date[] = [];

		for (const date of actual) {
			let key: string;
			if (ignoreTime) {
				key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
			} else {
				key = date.getTime().toString();
			}

			if (seen.has(key)) {
				duplicates.push(date);
			} else {
				seen.add(key);
			}
		}

		const pass = duplicates.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not all be unique${ignoreTime ? " (ignoring time)" : ""}\n\n` +
					`All ${actual.length} dates were unique`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all dates to be unique${ignoreTime ? " (ignoring time)" : ""}\n\n` +
					`Found ${duplicates.length} duplicate(s):\n${this.utils.printReceived(formatDatesForDisplay(duplicates))}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: duplicates,
		};
	},
	toBeValidISODate(actual: string) {
		const assertionName = "toBeValidISODate";

		const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
		const matchesPattern = isoPattern.test(actual);

		let isValid = false;
		if (matchesPattern) {
			const date = new Date(actual);
			isValid = isValidDate(date);
		}

		const pass = matchesPattern && isValid;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not be a valid ISO 8601 date\n\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to be a valid ISO 8601 date\n\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Expected format: YYYY-MM-DDTHH:mm:ss.sssZ`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual,
		};
	},
	toMatchTimeZone(actualDate: Date, expectedOffset: number | string) {
		const assertionName = "toMatchTimeZone";

		validateDate(actualDate, "actual date");

		// Parse expectedOffset to minutes
		let expectedOffsetMinutes: number;
		if (typeof expectedOffset === "string") {
			if (expectedOffset.toUpperCase() === "UTC") {
				expectedOffsetMinutes = 0;
			} else {
				// Parse format like '+05:00' or '-05:30'
				const match = expectedOffset.match(/^([+-])(\d{2}):(\d{2})$/);
				if (!match) {
					throw new Error(
						`Invalid timezone offset format: ${expectedOffset}. Expected format: '+HH:MM', '-HH:MM', or 'UTC'`
					);
				}
				const sign = match[1] === "+" ? 1 : -1;
				const hours = Number.parseInt(match[2], 10);
				const minutes = Number.parseInt(match[3], 10);
				expectedOffsetMinutes = sign * (hours * 60 + minutes);
			}
		} else {
			expectedOffsetMinutes = expectedOffset;
		}

		const actualOffset = -actualDate.getTimezoneOffset();
		const pass = actualOffset === expectedOffsetMinutes;

		const formatOffset = (offset: number): string => {
			if (offset === 0) return "UTC (+00:00)";
			const sign = offset >= 0 ? "+" : "-";
			const absOffset = Math.abs(offset);
			const hours = Math.floor(absOffset / 60);
			const minutes = absOffset % 60;
			return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
		};

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not match timezone offset\n\n` +
					`Expected offset: ${this.utils.printExpected(formatOffset(expectedOffsetMinutes))}\n` +
					`Received offset: ${this.utils.printReceived(formatOffset(actualOffset))}\n` +
					`Date: ${actualDate.toISOString()}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to match timezone offset\n\n` +
					`Expected offset: ${this.utils.printExpected(formatOffset(expectedOffsetMinutes))}\n` +
					`Received offset: ${this.utils.printReceived(formatOffset(actualOffset))}\n` +
					`Date: ${actualDate.toISOString()}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedOffsetMinutes,
			actual: actualOffset,
		};
	},
	toBeStartOfMonth(actualDate: Date) {
		const assertionName = "toBeStartOfMonth";

		validateDate(actualDate, "actual date");

		const pass = actualDate.getDate() === 1;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be the start of the month\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (day ${actualDate.getDate()})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be the start of the month (day 1)\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (day ${actualDate.getDate()})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: actualDate,
		};
	},
	toBeEndOfMonth(actualDate: Date) {
		const assertionName = "toBeEndOfMonth";

		validateDate(actualDate, "actual date");

		const lastDayOfMonth = new Date(actualDate.getFullYear(), actualDate.getMonth() + 1, 0).getDate();
		const pass = actualDate.getDate() === lastDayOfMonth;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be the end of the month\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (day ${actualDate.getDate()}/${lastDayOfMonth})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be the end of the month (day ${lastDayOfMonth})\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (day ${actualDate.getDate()})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: actualDate,
		};
	},
	toHaveDateGapsLargerThan(
		actual: Date[],
		minGap: { seconds?: number; minutes?: number; hours?: number; days?: number; months?: number; years?: number }
	) {
		const assertionName = "toHaveDateGapsLargerThan";

		if (actual.length < 2) {
			throw new Error("Array must contain at least two dates");
		}

		for (const date of actual) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${String(date)}`);
			}
		}

		const minGapMs =
			(minGap.years ?? 0) * 365.25 * 24 * 60 * 60 * 1000 +
			(minGap.months ?? 0) * 30.44 * 24 * 60 * 60 * 1000 +
			(minGap.days ?? 0) * 24 * 60 * 60 * 1000 +
			(minGap.hours ?? 0) * 60 * 60 * 1000 +
			(minGap.minutes ?? 0) * 60 * 1000 +
			(minGap.seconds ?? 0) * 1000;

		const sortedDates = [...actual].sort((a, b) => a.getTime() - b.getTime());
		const largeGaps: Array<{ from: Date; to: Date; gapMs: number }> = [];

		for (let i = 1; i < sortedDates.length; i++) {
			const gapMs = sortedDates[i].getTime() - sortedDates[i - 1].getTime();
			if (gapMs > minGapMs) {
				largeGaps.push({
					from: sortedDates[i - 1],
					to: sortedDates[i],
					gapMs,
				});
			}
		}

		const pass = largeGaps.length > 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			const formatGap = (gapMs: number): string => {
				const years = Math.floor(gapMs / (365.25 * 24 * 60 * 60 * 1000));
				const remainingAfterYears = gapMs % (365.25 * 24 * 60 * 60 * 1000);
				const months = Math.floor(remainingAfterYears / (30.44 * 24 * 60 * 60 * 1000));
				const remainingAfterMonths = remainingAfterYears % (30.44 * 24 * 60 * 60 * 1000);
				const days = Math.floor(remainingAfterMonths / (24 * 60 * 60 * 1000));
				const hours = Math.floor((remainingAfterMonths % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
				const minutes = Math.floor((remainingAfterMonths % (60 * 60 * 1000)) / (60 * 1000));
				const seconds = Math.floor((remainingAfterMonths % (60 * 1000)) / 1000);

				const parts: string[] = [];
				if (years > 0) parts.push(`${years}y`);
				if (months > 0) parts.push(`${months}mo`);
				if (days > 0) parts.push(`${days}d`);
				if (hours > 0) parts.push(`${hours}h`);
				if (minutes > 0) parts.push(`${minutes}m`);
				if (seconds > 0) parts.push(`${seconds}s`);

				return parts.join(" ") || "0s";
			};

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not have gaps larger than ${formatGap(minGapMs)}\n\n` +
					`Found ${largeGaps.length} gap(s):\n` +
					largeGaps
						.map(gap => `  ${gap.from.toISOString()} -> ${gap.to.toISOString()} (${formatGap(gap.gapMs)})`)
						.join("\n")
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to have gaps larger than ${formatGap(minGapMs)}\n\n` +
					`No gaps larger than ${formatGap(minGapMs)} were found`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: minGap,
			actual: largeGaps,
		};
	},
	toBeInQuarter(actualDate: Date, expectedQuarter: 1 | 2 | 3 | 4) {
		const assertionName = "toBeInQuarter";

		validateDate(actualDate, "actual date");

		const month = actualDate.getMonth(); // 0-11
		const getQuarterFromMonth = (value: number): 1 | 2 | 3 | 4 => {
			if (value < 3) return 1;
			if (value < 6) return 2;
			if (value < 9) return 3;
			return 4;
		};
		const actualQuarter = getQuarterFromMonth(month);
		const pass = actualQuarter === expectedQuarter;

		const getQuarterMonths = (q: 1 | 2 | 3 | 4): string => {
			const quarters: Record<1 | 2 | 3 | 4, string> = {
				1: "Jan-Mar",
				2: "Apr-Jun",
				3: "Jul-Sep",
				4: "Oct-Dec",
			};
			return quarters[q];
		};

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be in Q${expectedQuarter}\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (Q${actualQuarter}: ${getQuarterMonths(actualQuarter)})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be in Q${expectedQuarter} (${getQuarterMonths(expectedQuarter)})\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (Q${actualQuarter}: ${getQuarterMonths(actualQuarter)})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedQuarter,
			actual: actualQuarter,
		};
	},
	toBeSpecificDayOfWeek(actualDate: Date, expectedDay: keyof typeof DAY_NAMES | number) {
		const assertionName = "toBeSpecificDayOfWeek";

		validateDate(actualDate, "actual date");

		let expectedDayNumber: number;

		if (typeof expectedDay === "string") {
			expectedDayNumber = DAY_NAMES[expectedDay];
		} else if (typeof expectedDay === "number") {
			if (expectedDay < 0 || expectedDay > 6) {
				throw new Error(`Invalid day number: ${expectedDay}. Must be between 0 (Sunday) and 6 (Saturday)`);
			}
			expectedDayNumber = expectedDay;
		} else {
			throw new Error("expectedDay must be a string (day name) or number (0-6)");
		}

		const actualDayNumber = actualDate.getDay();
		const pass = actualDayNumber === expectedDayNumber;

		const dayNamesArray = Object.keys(DAY_NAMES);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be a ${dayNamesArray[expectedDayNumber]}\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (${dayNamesArray[actualDayNumber]})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be a ${dayNamesArray[expectedDayNumber]}\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (${dayNamesArray[actualDayNumber]})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedDayNumber,
			actual: actualDayNumber,
		};
	},
	toBeInMonth(actualDate: Date, expectedMonth: keyof typeof MONTH_NAMES | number) {
		const assertionName = "toBeInMonth";

		validateDate(actualDate, "actual date");

		let expectedMonthNumber: number;

		if (typeof expectedMonth === "string") {
			expectedMonthNumber = MONTH_NAMES[expectedMonth];
		} else if (typeof expectedMonth === "number") {
			if (expectedMonth < 1 || expectedMonth > 12) {
				throw new Error(`Invalid month number: ${expectedMonth}. Must be between 1 and 12`);
			}
			expectedMonthNumber = expectedMonth - 1; // Convert to 0-based index
		} else {
			throw new Error("expectedMonth must be a string (month name) or number (1-12)");
		}

		const actualMonthNumber = actualDate.getMonth();
		const pass = actualMonthNumber === expectedMonthNumber;

		const monthNamesArray = Object.keys(MONTH_NAMES);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be in ${monthNamesArray[expectedMonthNumber]}\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (${monthNamesArray[actualMonthNumber]})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be in ${monthNamesArray[expectedMonthNumber]}\n\n` +
					`Received: ${this.utils.printReceived(actualDate.toISOString())} (${monthNamesArray[actualMonthNumber]})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedMonthNumber,
			actual: actualMonthNumber,
		};
	},
});

export const expectlyDate = baseExpect.extend(expectlyDateMatchers);
