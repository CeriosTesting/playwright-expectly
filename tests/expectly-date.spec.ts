import { expect, test } from "@playwright/test";

import { expectlyDate } from "../src/expectly-date";

import { getRejectedErrorSync } from "./helpers/assertion-utils";

test.describe("toBeCloseTo", () => {
	test("should pass when dates are exactly the same", () => {
		const date = new Date("2023-01-01T12:00:00Z");
		expectlyDate(date).toBeCloseTo(date, { seconds: 0 });
	});

	test("should pass when dates are within seconds deviation", () => {
		const actual = new Date("2023-01-01T12:00:05Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 10 });
	});

	test("should pass when dates are within minutes deviation", () => {
		const actual = new Date("2023-01-01T12:03:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { minutes: 5 });
	});

	test("should pass when dates are within hours deviation", () => {
		const actual = new Date("2023-01-01T14:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { hours: 3 });
	});

	test("should pass when dates are within days deviation", () => {
		const actual = new Date("2023-01-03T12:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { days: 2 });
	});

	test("should pass when dates are within combined deviation", () => {
		const actual = new Date("2023-01-02T13:05:30Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, {
			days: 1,
			hours: 2,
			minutes: 10,
			seconds: 60,
		});
	});

	test("should pass when actual is earlier than expected within deviation", () => {
		const actual = new Date("2023-01-01T11:55:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { minutes: 10 });
	});

	test("should pass when actual is later than expected within deviation", () => {
		const actual = new Date("2023-01-01T12:05:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { minutes: 10 });
	});

	test("should fail when dates are outside seconds deviation", () => {
		const actual = new Date("2023-01-01T12:00:15Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		const error = getRejectedErrorSync(() => {
			expectlyDate(actual).toBeCloseTo(expected, { seconds: 10 });
		});
		expect(error.message).toContain("toBeCloseTo");
		expect(error.message).toContain("Difference");
		expect(error.message).toContain("Allowed deviation");
	});

	test("should fail when dates are outside minutes deviation", () => {
		const actual = new Date("2023-01-01T12:10:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		expect(() => {
			expectlyDate(actual).toBeCloseTo(expected, { minutes: 5 });
		}).toThrow(/toBeCloseTo/);
	});

	test("should fail when dates are outside hours deviation", () => {
		const actual = new Date("2023-01-01T16:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		expect(() => {
			expectlyDate(actual).toBeCloseTo(expected, { hours: 3 });
		}).toThrow(/toBeCloseTo/);
	});

	test("should fail when dates are outside days deviation", () => {
		const actual = new Date("2023-01-05T12:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		expect(() => {
			expectlyDate(actual).toBeCloseTo(expected, { days: 2 });
		}).toThrow(/toBeCloseTo/);
	});

	test("should work with .not for dates outside deviation", () => {
		const actual = new Date("2023-01-01T12:00:15Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).not.toBeCloseTo(expected, { seconds: 10 });
	});

	test("should fail with .not for dates within deviation", () => {
		const actual = new Date("2023-01-01T12:00:05Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		expect(() => {
			expectlyDate(actual).not.toBeCloseTo(expected, { seconds: 10 });
		}).toThrow(/not/);
	});

	test("should handle millisecond precision", () => {
		const actual = new Date("2023-01-01T12:00:00.500Z");
		const expected = new Date("2023-01-01T12:00:00.000Z");
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 1 });
	});

	test("should work with Date.now()", () => {
		const now = Date.now();
		const actual = new Date(now);
		const expected = new Date(now - 1000);
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 2 });
	});

	test("should handle dates in different time zones", () => {
		// Both represent the same instant in time
		const actual = new Date("2023-01-01T12:00:00+00:00");
		const expected = new Date("2023-01-01T07:00:00-05:00");
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 1 });
	});

	test("should pass when actual date is at the exact boundary of deviation", () => {
		const actual = new Date("2023-01-01T12:00:10Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 10 });
	});

	test("should show clear error message with time difference", () => {
		const actual = new Date("2023-01-01T12:05:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		const error = getRejectedErrorSync(() => {
			expectlyDate(actual).toBeCloseTo(expected, { minutes: 2 });
		});
		expect(error.message).toContain("300.000 seconds");
		expect(error.message).toContain("later");
		expect(error.message).toContain("120.000 seconds");
	});
});

test.describe("toHaveDatesAscendingOrder", () => {
	test("should pass when Date array is in ascending order", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});

	test("should pass for single date", () => {
		expectlyDate([new Date()]).toHaveDatesAscendingOrder();
	});

	test("should pass for empty array", () => {
		expectlyDate([]).toHaveDatesAscendingOrder();
	});

	test("should pass with duplicate dates", () => {
		const dates = [new Date("2023-01-01T12:00:00Z"), new Date("2023-01-01T12:00:00Z"), new Date("2023-01-02")];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});

	test("should pass with dates having different times on same day", () => {
		const dates = [
			new Date("2023-01-01T08:00:00Z"),
			new Date("2023-01-01T12:00:00Z"),
			new Date("2023-01-01T18:00:00Z"),
		];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});

	test("should fail when Date array is not in ascending order", () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-01"), new Date("2023-01-02")];

		const error = getRejectedErrorSync(() => {
			expectlyDate(dates).toHaveDatesAscendingOrder();
		});
		expect(error.message).toContain("toHaveDatesAscendingOrder");
		expect(error.message).toContain("Expected");
		expect(error.message).toContain("Received");
	});

	test("should fail when Date array is in descending order", () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];

		expect(() => {
			expectlyDate(dates).toHaveDatesAscendingOrder();
		}).toThrow();
	});

	test("should work with .not for descending arrays", () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];
		expectlyDate(dates).not.toHaveDatesAscendingOrder();
	});

	test("should fail with .not for ascending arrays", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];

		expect(() => {
			expectlyDate(dates).not.toHaveDatesAscendingOrder();
		}).toThrow(/not/);
	});

	test("should handle dates spanning years", () => {
		const dates = [new Date("2022-12-31"), new Date("2023-01-01"), new Date("2023-01-02")];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});

	test("should handle very old and future dates", () => {
		const dates = [new Date("1900-01-01"), new Date("2023-01-01"), new Date("2100-01-01")];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});
});

test.describe("toHaveDatesDescendingOrder", () => {
	test("should pass when Date array is in descending order", () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should pass for single date", () => {
		expectlyDate([new Date()]).toHaveDatesDescendingOrder();
	});

	test("should pass for empty array", () => {
		expectlyDate([]).toHaveDatesDescendingOrder();
	});

	test("should pass with duplicate dates", () => {
		const dates = [new Date("2023-01-02"), new Date("2023-01-01T12:00:00Z"), new Date("2023-01-01T12:00:00Z")];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should pass with dates having different times on same day", () => {
		const dates = [
			new Date("2023-01-01T18:00:00Z"),
			new Date("2023-01-01T12:00:00Z"),
			new Date("2023-01-01T08:00:00Z"),
		];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should fail when Date array is not in descending order", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-03"), new Date("2023-01-02")];

		const error = getRejectedErrorSync(() => {
			expectlyDate(dates).toHaveDatesDescendingOrder();
		});
		expect(error.message).toContain("toHaveDatesDescendingOrder");
		expect(error.message).toContain("Expected");
		expect(error.message).toContain("Received");
	});

	test("should fail when Date array is in ascending order", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];

		expect(() => {
			expectlyDate(dates).toHaveDatesDescendingOrder();
		}).toThrow();
	});

	test("should work with .not for ascending arrays", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		expectlyDate(dates).not.toHaveDatesDescendingOrder();
	});

	test("should fail with .not for descending arrays", () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];

		expect(() => {
			expectlyDate(dates).not.toHaveDatesDescendingOrder();
		}).toThrow(/not/);
	});

	test("should handle dates spanning years", () => {
		const dates = [new Date("2023-01-02"), new Date("2023-01-01"), new Date("2022-12-31")];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should handle very old and future dates", () => {
		const dates = [new Date("2100-01-01"), new Date("2023-01-01"), new Date("1900-01-01")];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should handle all same dates", () => {
		const date = new Date("2023-01-01T12:00:00Z");
		const dates = [date, date, date];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});
});

test.describe("toBeBefore", () => {
	test("should pass when actual date is before expected", () => {
		const actual = new Date("2023-01-01");
		const expected = new Date("2023-01-02");
		expectlyDate(actual).toBeBefore(expected);
	});

	test("should pass when dates differ by milliseconds", () => {
		const actual = new Date("2023-01-01T12:00:00.000Z");
		const expected = new Date("2023-01-01T12:00:00.001Z");
		expectlyDate(actual).toBeBefore(expected);
	});

	test("should fail when actual date is after expected", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-02")).toBeBefore(new Date("2023-01-01"));
		}).toThrow(/Expected date to be before/);
	});

	test("should fail when dates are equal", () => {
		const date = new Date("2023-01-01T12:00:00Z");
		expect(() => {
			expectlyDate(date).toBeBefore(date);
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyDate(new Date("2023-01-02")).not.toBeBefore(new Date("2023-01-01"));
	});

	test("should fail with .not when actual is before", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-01")).not.toBeBefore(new Date("2023-01-02"));
		}).toThrow(/Expected date to not be before/);
	});
});

test.describe("toBeAfter", () => {
	test("should pass when actual date is after expected", () => {
		const actual = new Date("2023-01-02");
		const expected = new Date("2023-01-01");
		expectlyDate(actual).toBeAfter(expected);
	});

	test("should pass when dates differ by milliseconds", () => {
		const actual = new Date("2023-01-01T12:00:00.001Z");
		const expected = new Date("2023-01-01T12:00:00.000Z");
		expectlyDate(actual).toBeAfter(expected);
	});

	test("should fail when actual date is before expected", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-01")).toBeAfter(new Date("2023-01-02"));
		}).toThrow(/Expected date to be after/);
	});

	test("should fail when dates are equal", () => {
		const date = new Date("2023-01-01T12:00:00Z");
		expect(() => {
			expectlyDate(date).toBeAfter(date);
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyDate(new Date("2023-01-01")).not.toBeAfter(new Date("2023-01-02"));
	});

	test("should fail with .not when actual is after", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-02")).not.toBeAfter(new Date("2023-01-01"));
		}).toThrow(/Expected date to not be after/);
	});
});

test.describe("toBeBetween", () => {
	test("should pass when date is between start and end", () => {
		expectlyDate(new Date("2023-01-15")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass when date equals start", () => {
		expectlyDate(new Date("2023-01-01")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass when date equals end", () => {
		expectlyDate(new Date("2023-01-31")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should fail when date is before start", () => {
		expect(() => {
			expectlyDate(new Date("2022-12-31")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		}).toThrow(/Expected date to be between/);
	});

	test("should fail when date is after end", () => {
		expect(() => {
			expectlyDate(new Date("2023-02-01")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyDate(new Date("2023-02-15")).not.toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should fail with .not when date is between", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-15")).not.toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		}).toThrow(/Expected date to not be between/);
	});
});

test.describe("toBeSameDay", () => {
	test("should pass when dates are on the same day", () => {
		expectlyDate(new Date("2023-01-15T08:00:00Z")).toBeSameDay(new Date("2023-01-15T20:00:00Z"));
	});

	test("should pass when dates are identical", () => {
		const date = new Date("2023-01-15T12:00:00Z");
		expectlyDate(date).toBeSameDay(date);
	});

	test("should fail when dates are on different days", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-15")).toBeSameDay(new Date("2023-01-16"));
		}).toThrow(/Expected dates to be the same day/);
	});

	test("should fail when dates are in different months", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-31")).toBeSameDay(new Date("2023-02-01"));
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyDate(new Date("2023-01-15")).not.toBeSameDay(new Date("2023-01-16"));
	});

	test("should fail with .not when dates are same day", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-15T08:00:00Z")).not.toBeSameDay(new Date("2023-01-15T20:00:00Z"));
		}).toThrow(/Expected dates to not be the same day/);
	});
});

test.describe("toBeSameMonth", () => {
	test("should pass when dates are in the same month", () => {
		expectlyDate(new Date("2023-01-01")).toBeSameMonth(new Date("2023-01-31"));
	});

	test("should fail when dates are in different months", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-31")).toBeSameMonth(new Date("2023-02-01"));
		}).toThrow(/Expected dates to be in the same month/);
	});

	test("should fail when dates are in different years", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-15")).toBeSameMonth(new Date("2024-01-15"));
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyDate(new Date("2023-01-15")).not.toBeSameMonth(new Date("2023-02-15"));
	});

	test("should fail with .not when dates are same month", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-01")).not.toBeSameMonth(new Date("2023-01-31"));
		}).toThrow(/Expected dates to not be in the same month/);
	});
});

test.describe("toBeSameYear", () => {
	test("should pass when dates are in the same year", () => {
		expectlyDate(new Date("2023-01-01")).toBeSameYear(new Date("2023-12-31"));
	});

	test("should fail when dates are in different years", () => {
		expect(() => {
			expectlyDate(new Date("2023-12-31")).toBeSameYear(new Date("2024-01-01"));
		}).toThrow(/Expected dates to be in the same year/);
	});

	test("should work with .not", () => {
		expectlyDate(new Date("2023-01-15")).not.toBeSameYear(new Date("2024-01-15"));
	});

	test("should fail with .not when dates are same year", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-01")).not.toBeSameYear(new Date("2023-12-31"));
		}).toThrow(/Expected dates to not be in the same year/);
	});
});

test.describe("toBeToday", () => {
	test("should pass when date is today", () => {
		expectlyDate(new Date()).toBeToday();
	});

	test("should pass with different times on same day", () => {
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		expectlyDate(today).toBeToday();
	});

	test("should fail when date is yesterday", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expect(() => {
			expectlyDate(yesterday).toBeToday();
		}).toThrow(/Expected date to be today/);
	});

	test("should fail when date is tomorrow", () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		expect(() => {
			expectlyDate(tomorrow).toBeToday();
		}).toThrow();
	});

	test("should work with .not for past dates", () => {
		expectlyDate(new Date("2020-01-01")).not.toBeToday();
	});

	test("should fail with .not when date is today", () => {
		expect(() => {
			expectlyDate(new Date()).not.toBeToday();
		}).toThrow(/Expected date to not be today/);
	});
});

test.describe("toBeYesterday", () => {
	test("should pass when date is yesterday", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expectlyDate(yesterday).toBeYesterday();
	});

	test("should pass with different times on yesterday", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(23, 59, 59, 999);
		expectlyDate(yesterday).toBeYesterday();
	});

	test("should fail when date is today", () => {
		expect(() => {
			expectlyDate(new Date()).toBeYesterday();
		}).toThrow(/Expected date to be yesterday/);
	});

	test("should fail when date is two days ago", () => {
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
		expect(() => {
			expectlyDate(twoDaysAgo).toBeYesterday();
		}).toThrow();
	});

	test("should work with .not for today", () => {
		expectlyDate(new Date()).not.toBeYesterday();
	});
});

test.describe("toBeTomorrow", () => {
	test("should pass when date is tomorrow", () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		expectlyDate(tomorrow).toBeTomorrow();
	});

	test("should pass with different times on tomorrow", () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(23, 59, 59, 999);
		expectlyDate(tomorrow).toBeTomorrow();
	});

	test("should fail when date is today", () => {
		expect(() => {
			expectlyDate(new Date()).toBeTomorrow();
		}).toThrow(/Expected date to be tomorrow/);
	});

	test("should fail when date is two days from now", () => {
		const twoDaysLater = new Date();
		twoDaysLater.setDate(twoDaysLater.getDate() + 2);
		expect(() => {
			expectlyDate(twoDaysLater).toBeTomorrow();
		}).toThrow();
	});

	test("should work with .not for today", () => {
		expectlyDate(new Date()).not.toBeTomorrow();
	});
});

test.describe("toBeWeekday", () => {
	test("should pass for Monday", () => {
		const monday = new Date("2023-01-02"); // A Monday
		expectlyDate(monday).toBeWeekday();
	});

	test("should pass for Tuesday", () => {
		const tuesday = new Date("2023-01-03");
		expectlyDate(tuesday).toBeWeekday();
	});

	test("should pass for Wednesday", () => {
		const wednesday = new Date("2023-01-04");
		expectlyDate(wednesday).toBeWeekday();
	});

	test("should pass for Thursday", () => {
		const thursday = new Date("2023-01-05");
		expectlyDate(thursday).toBeWeekday();
	});

	test("should pass for Friday", () => {
		const friday = new Date("2023-01-06");
		expectlyDate(friday).toBeWeekday();
	});

	test("should fail for Saturday", () => {
		const saturday = new Date("2023-01-07");
		const error = getRejectedErrorSync(() => {
			expectlyDate(saturday).toBeWeekday();
		});
		expect(error.message).toContain("Expected date to be a weekday (Monday-Friday)");
		expect(error.message).toContain("Saturday");
	});

	test("should fail for Sunday", () => {
		const sunday = new Date("2023-01-01");
		const error = getRejectedErrorSync(() => {
			expectlyDate(sunday).toBeWeekday();
		});
		expect(error.message).toContain("Sunday");
	});

	test("should work with .not for weekend", () => {
		expectlyDate(new Date("2023-01-07")).not.toBeWeekday(); // Saturday
	});
});

test.describe("toBeWeekend", () => {
	test("should pass for Saturday", () => {
		const saturday = new Date("2023-01-07");
		expectlyDate(saturday).toBeWeekend();
	});

	test("should pass for Sunday", () => {
		const sunday = new Date("2023-01-01");
		expectlyDate(sunday).toBeWeekend();
	});

	test("should fail for Monday", () => {
		const monday = new Date("2023-01-02");
		const error = getRejectedErrorSync(() => {
			expectlyDate(monday).toBeWeekend();
		});
		expect(error.message).toContain("Expected date to be a weekend (Saturday-Sunday)");
		expect(error.message).toContain("Monday");
	});

	test("should fail for Friday", () => {
		const friday = new Date("2023-01-06");
		const error = getRejectedErrorSync(() => {
			expectlyDate(friday).toBeWeekend();
		});
		expect(error.message).toContain("Friday");
	});

	test("should work with .not for weekday", () => {
		expectlyDate(new Date("2023-01-02")).not.toBeWeekend(); // Monday
	});
});

test.describe("toBeInThePast", () => {
	test("should pass for dates in the past", () => {
		expectlyDate(new Date("2020-01-01")).toBeInThePast();
	});

	test("should pass for one second ago", () => {
		const oneSecondAgo = new Date(Date.now() - 1000);
		expectlyDate(oneSecondAgo).toBeInThePast();
	});

	test("should fail for future dates", () => {
		const future = new Date(Date.now() + 10000);
		expect(() => {
			expectlyDate(future).toBeInThePast();
		}).toThrow(/Expected date to be in the past/);
	});

	test("should work with .not for future dates", () => {
		const future = new Date(Date.now() + 10000);
		expectlyDate(future).not.toBeInThePast();
	});
});

test.describe("toBeInTheFuture", () => {
	test("should pass for dates in the future", () => {
		const future = new Date(Date.now() + 10000);
		expectlyDate(future).toBeInTheFuture();
	});

	test("should pass for one second from now", () => {
		const oneSecondLater = new Date(Date.now() + 1000);
		expectlyDate(oneSecondLater).toBeInTheFuture();
	});

	test("should fail for past dates", () => {
		expect(() => {
			expectlyDate(new Date("2020-01-01")).toBeInTheFuture();
		}).toThrow(/Expected date to be in the future/);
	});

	test("should work with .not for past dates", () => {
		expectlyDate(new Date("2020-01-01")).not.toBeInTheFuture();
	});
});

test.describe("toBeLeapYear", () => {
	test("should pass for leap year divisible by 4", () => {
		expectlyDate(new Date("2024-01-01")).toBeLeapYear();
	});

	test("should pass for leap year divisible by 400", () => {
		expectlyDate(new Date("2000-01-01")).toBeLeapYear();
	});

	test("should pass for 2020", () => {
		expectlyDate(new Date("2020-06-15")).toBeLeapYear();
	});

	test("should fail for non-leap year", () => {
		expect(() => {
			expectlyDate(new Date("2023-01-01")).toBeLeapYear();
		}).toThrow(/Expected year to be a leap year/);
	});

	test("should fail for year divisible by 100 but not 400", () => {
		expect(() => {
			expectlyDate(new Date("1900-01-01")).toBeLeapYear();
		}).toThrow();
	});

	test("should work with .not for non-leap year", () => {
		expectlyDate(new Date("2023-01-01")).not.toBeLeapYear();
	});
});

test.describe("toHaveDateRange", () => {
	test("should pass when array has expected day range", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-11")];
		expectlyDate(dates).toHaveDateRange({ days: 10 });
	});

	test("should pass with month range", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-02-01")];
		expectlyDate(dates).toHaveDateRange({ months: 1 });
	});

	test("should pass with year range", () => {
		const dates = [new Date("2023-01-01"), new Date("2024-01-01")];
		expectlyDate(dates).toHaveDateRange({ years: 1 });
	});

	test("should pass with combined range", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-02-11")];
		expectlyDate(dates).toHaveDateRange({ months: 1, days: 10 });
	});

	test("should pass with unsorted dates", () => {
		const dates = [new Date("2023-01-11"), new Date("2023-01-01"), new Date("2023-01-05")];
		expectlyDate(dates).toHaveDateRange({ days: 10 });
	});

	test("should fail when range doesn't match", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-11")];
		expect(() => {
			expectlyDate(dates).toHaveDateRange({ days: 20 });
		}).toThrow(/Expected date range to match/);
	});

	test("should throw for empty array", () => {
		expect(() => {
			expectlyDate([]).toHaveDateRange({ days: 10 });
		}).toThrow(/Array must contain at least one date/);
	});
});

test.describe("toHaveConsecutiveDates", () => {
	test("should pass for consecutive days", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		expectlyDate(dates).toHaveConsecutiveDates("day");
	});

	test("should pass for consecutive months", () => {
		const dates = [new Date("2023-01-15"), new Date("2023-02-15"), new Date("2023-03-15")];
		expectlyDate(dates).toHaveConsecutiveDates("month");
	});

	test("should pass for consecutive years", () => {
		const dates = [new Date("2021-06-15"), new Date("2022-06-15"), new Date("2023-06-15")];
		expectlyDate(dates).toHaveConsecutiveDates("year");
	});

	test("should pass with unsorted dates", () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-01"), new Date("2023-01-02")];
		expectlyDate(dates).toHaveConsecutiveDates("day");
	});

	test("should fail for non-consecutive days", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-03")];
		const error = getRejectedErrorSync(() => {
			expectlyDate(dates).toHaveConsecutiveDates("day");
		});
		expect(error.message).toContain("Expected dates to be consecutive by day");
		expect(error.message).toContain("Gap found at index");
	});

	test("should fail for non-consecutive months", () => {
		const dates = [new Date("2023-01-15"), new Date("2023-03-15")];
		expect(() => {
			expectlyDate(dates).toHaveConsecutiveDates("month");
		}).toThrow();
	});

	test("should throw for array with less than 2 dates", () => {
		expect(() => {
			expectlyDate([new Date()]).toHaveConsecutiveDates("day");
		}).toThrow(/Array must contain at least two dates/);
	});
});

test.describe("toHaveDatesWithinRange", () => {
	test("should pass when all dates are within range", () => {
		const dates = [new Date("2023-01-10"), new Date("2023-01-15"), new Date("2023-01-20")];
		expectlyDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass with dates at boundaries", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-15"), new Date("2023-01-31")];
		expectlyDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should fail when some dates are out of range", () => {
		const dates = [new Date("2022-12-31"), new Date("2023-01-15"), new Date("2023-02-01")];
		const error = getRejectedErrorSync(() => {
			expectlyDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
		});
		expect(error.message).toContain("Expected all dates to be within range");
		expect(error.message).toContain("Out of range dates");
	});

	test("should throw for empty array", () => {
		expect(() => {
			expectlyDate([]).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
		}).toThrow(/Array must contain at least one date/);
	});
});

test.describe("toHaveUniqueDates", () => {
	test("should pass when all dates are unique", () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		expectlyDate(dates).toHaveUniqueDates();
	});

	test("should pass with unique dates ignoring time", () => {
		const dates = [
			new Date("2023-01-01T08:00:00Z"),
			new Date("2023-01-02T12:00:00Z"),
			new Date("2023-01-03T18:00:00Z"),
		];
		expectlyDate(dates).toHaveUniqueDates(true);
	});

	test("should fail when dates have duplicates", () => {
		const date = new Date("2023-01-01T12:00:00Z");
		const dates = [date, new Date("2023-01-02"), date];
		const error = getRejectedErrorSync(() => {
			expectlyDate(dates).toHaveUniqueDates();
		});
		expect(error.message).toContain("Expected all dates to be unique");
		expect(error.message).toContain("duplicate");
	});

	test("should fail when same day but different times with ignoreTime", () => {
		const dates = [new Date("2023-01-01T08:00:00Z"), new Date("2023-01-01T12:00:00Z")];
		expect(() => {
			expectlyDate(dates).toHaveUniqueDates(true);
		}).toThrow();
	});

	test("should pass when same day but different times without ignoreTime", () => {
		const dates = [new Date("2023-01-01T08:00:00Z"), new Date("2023-01-01T12:00:00Z")];
		expectlyDate(dates).toHaveUniqueDates(false);
	});

	test("should throw for empty array", () => {
		expect(() => {
			expectlyDate([]).toHaveUniqueDates();
		}).toThrow(/Array must contain at least one date/);
	});
});

test.describe("toBeValidISODate", () => {
	test("should pass for valid ISO date with milliseconds", () => {
		expectlyDate("2023-01-15T12:30:45.123Z").toBeValidISODate();
	});

	test("should pass for valid ISO date without milliseconds", () => {
		expectlyDate("2023-01-15T12:30:45Z").toBeValidISODate();
	});

	test("should pass for valid ISO date without Z", () => {
		expectlyDate("2023-01-15T12:30:45").toBeValidISODate();
	});

	test("should fail for invalid ISO format", () => {
		expect(() => {
			expectlyDate("2023-01-15").toBeValidISODate();
		}).toThrow(/Expected string to be a valid ISO 8601 date/);
	});

	test("should fail for invalid date values", () => {
		expect(() => {
			expectlyDate("2023-13-45T99:99:99Z").toBeValidISODate();
		}).toThrow();
	});

	test("should fail for non-ISO format", () => {
		expect(() => {
			expectlyDate("01/15/2023").toBeValidISODate();
		}).toThrow();
	});

	test("should work with .not for invalid format", () => {
		expectlyDate("not-a-date").not.toBeValidISODate();
	});

	test("should fail with .not for valid ISO date", () => {
		expect(() => {
			expectlyDate("2023-01-15T12:30:45.123Z").not.toBeValidISODate();
		}).toThrow(/Expected string to not be a valid ISO 8601 date/);
	});
});

test.describe("toMatchTimeZone", () => {
	test("should pass when date matches timezone offset (numeric)", () => {
		const date = new Date("2024-06-15T12:00:00Z");
		// Date objects always use the local timezone of the machine running the test
		expectlyDate(date).toMatchTimeZone(-date.getTimezoneOffset());
	});

	test("should pass with UTC string when in UTC timezone", () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		if (localOffset === 0) {
			expectlyDate(date).toMatchTimeZone("UTC");
		} else {
			// Skip if not in UTC - dates always use local timezone
			expectlyDate(date).not.toMatchTimeZone("UTC");
		}
	});

	test("should pass with positive offset string matching local", () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const offsetMinutes = -date.getTimezoneOffset();
		const sign = offsetMinutes >= 0 ? "+" : "-";
		const absOffset = Math.abs(offsetMinutes);
		const hours = Math.floor(absOffset / 60);
		const minutes = absOffset % 60;
		const offsetString = `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
		expectlyDate(date).toMatchTimeZone(offsetString);
	});

	test("should fail when date does not match timezone offset (numeric)", () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		// Test with an offset that's definitely different from local
		const wrongOffset = localOffset === 330 ? 0 : 330;
		expect(() => {
			expectlyDate(date).toMatchTimeZone(wrongOffset);
		}).toThrow(/Expected date to match timezone offset/);
	});

	test("should fail with wrong string offset", () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		// Test with an offset that's different from local
		const wrongOffset = localOffset === 330 ? "+00:00" : "+05:30";
		expect(() => {
			expectlyDate(date).toMatchTimeZone(wrongOffset);
		}).toThrow(/Expected date to match timezone offset/);
	});

	test("should work with negation (numeric)", () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		const wrongOffset = localOffset === 330 ? 0 : 330;
		expectlyDate(date).not.toMatchTimeZone(wrongOffset);
	});

	test("should work with negation (string)", () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		const wrongOffset = localOffset === 330 ? "+00:00" : "+05:30";
		expectlyDate(date).not.toMatchTimeZone(wrongOffset);
	});

	test("should throw for invalid offset format", () => {
		const date = new Date("2024-06-15T12:00:00Z");
		expect(() => {
			expectlyDate(date).toMatchTimeZone("invalid");
		}).toThrow(/Invalid timezone offset format/);
	});
});

test.describe("toBeStartOfMonth", () => {
	test("should pass for first day of month", () => {
		expectlyDate(new Date("2024-01-01")).toBeStartOfMonth();
		expectlyDate(new Date("2024-02-01T15:30:00Z")).toBeStartOfMonth();
		expectlyDate(new Date("2024-12-01")).toBeStartOfMonth();
	});

	test("should fail for non-first day of month", () => {
		expect(() => {
			expectlyDate(new Date("2024-01-15")).toBeStartOfMonth();
		}).toThrow(/Expected date to be the start of the month/);
	});

	test("should work with negation", () => {
		expectlyDate(new Date("2024-01-15")).not.toBeStartOfMonth();
		expectlyDate(new Date("2024-01-31")).not.toBeStartOfMonth();
	});
});

test.describe("toBeEndOfMonth", () => {
	test("should pass for last day of month", () => {
		expectlyDate(new Date("2024-01-31")).toBeEndOfMonth();
		expectlyDate(new Date("2024-02-29")).toBeEndOfMonth(); // Leap year
		expectlyDate(new Date("2024-04-30")).toBeEndOfMonth();
		expectlyDate(new Date("2024-12-31")).toBeEndOfMonth();
	});

	test("should fail for non-last day of month", () => {
		expect(() => {
			expectlyDate(new Date("2024-01-15")).toBeEndOfMonth();
		}).toThrow(/Expected date to be the end of the month/);
	});

	test("should handle February in non-leap year", () => {
		expectlyDate(new Date("2023-02-28")).toBeEndOfMonth();
		expectlyDate(new Date("2023-02-27")).not.toBeEndOfMonth();
	});

	test("should work with negation", () => {
		expectlyDate(new Date("2024-01-15")).not.toBeEndOfMonth();
		expectlyDate(new Date("2024-01-01")).not.toBeEndOfMonth();
	});
});

test.describe("toHaveDateGapsLargerThan", () => {
	test("should pass when gaps exist larger than specified duration", () => {
		const dates = [
			new Date("2024-01-01"),
			new Date("2024-01-02"),
			new Date("2024-01-10"), // 8 day gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ days: 7 });
	});

	test("should fail when no gaps larger than specified duration", () => {
		const dates = [new Date("2024-01-01"), new Date("2024-01-02"), new Date("2024-01-03")];
		expect(() => {
			expectlyDate(dates).toHaveDateGapsLargerThan({ days: 7 });
		}).toThrow(/Expected dates to have gaps larger than/);
	});

	test("should work with hours", () => {
		const dates = [
			new Date("2024-01-01T10:00:00Z"),
			new Date("2024-01-01T11:00:00Z"),
			new Date("2024-01-01T14:00:00Z"), // 3 hour gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ hours: 2 });
	});

	test("should work with multiple time units", () => {
		const dates = [
			new Date("2024-01-01T10:00:00Z"),
			new Date("2024-01-01T11:00:00Z"),
			new Date("2024-01-03T12:30:00Z"), // ~2 days 1.5 hours gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ days: 2, hours: 1 });
	});

	test("should work with negation", () => {
		const dates = [new Date("2024-01-01"), new Date("2024-01-02"), new Date("2024-01-03")];
		expectlyDate(dates).not.toHaveDateGapsLargerThan({ days: 7 });
	});

	test("should handle unsorted dates", () => {
		const dates = [new Date("2024-01-10"), new Date("2024-01-01"), new Date("2024-01-02")];
		expectlyDate(dates).toHaveDateGapsLargerThan({ days: 7 });
	});

	test("should work with months", () => {
		const dates = [
			new Date("2024-01-01"),
			new Date("2024-02-01"),
			new Date("2024-05-01"), // 3 month gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ months: 2 });
	});

	test("should work with years", () => {
		const dates = [
			new Date("2020-01-01"),
			new Date("2021-01-01"),
			new Date("2023-01-01"), // 2 year gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ years: 1 });
	});

	test("should work with mixed units including months and years", () => {
		const dates = [
			new Date("2020-01-01"),
			new Date("2020-06-01"),
			new Date("2022-01-01"), // ~1.5 year gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ years: 1, months: 3 });
	});

	test("should fail when no gaps match months criteria", () => {
		const dates = [new Date("2024-01-01"), new Date("2024-01-15"), new Date("2024-02-01")];
		expect(() => {
			expectlyDate(dates).toHaveDateGapsLargerThan({ months: 2 });
		}).toThrow(/Expected dates to have gaps larger than/);
	});
});

test.describe("toBeInQuarter", () => {
	test("should pass for Q1 dates (Jan-Mar)", () => {
		expectlyDate(new Date("2024-01-15")).toBeInQuarter(1);
		expectlyDate(new Date("2024-02-01")).toBeInQuarter(1);
		expectlyDate(new Date("2024-03-31")).toBeInQuarter(1);
	});

	test("should pass for Q2 dates (Apr-Jun)", () => {
		expectlyDate(new Date("2024-04-01")).toBeInQuarter(2);
		expectlyDate(new Date("2024-05-15")).toBeInQuarter(2);
		expectlyDate(new Date("2024-06-30")).toBeInQuarter(2);
	});

	test("should pass for Q3 dates (Jul-Sep)", () => {
		expectlyDate(new Date("2024-07-01")).toBeInQuarter(3);
		expectlyDate(new Date("2024-08-15")).toBeInQuarter(3);
		expectlyDate(new Date("2024-09-30")).toBeInQuarter(3);
	});

	test("should pass for Q4 dates (Oct-Dec)", () => {
		expectlyDate(new Date("2024-10-01")).toBeInQuarter(4);
		expectlyDate(new Date("2024-11-15")).toBeInQuarter(4);
		expectlyDate(new Date("2024-12-31")).toBeInQuarter(4);
	});

	test("should fail for wrong quarter", () => {
		expect(() => {
			expectlyDate(new Date("2024-01-15")).toBeInQuarter(2);
		}).toThrow(/Expected date to be in Q/);
	});

	test("should work with negation", () => {
		expectlyDate(new Date("2024-01-15")).not.toBeInQuarter(2);
		expectlyDate(new Date("2024-01-15")).not.toBeInQuarter(3);
		expectlyDate(new Date("2024-01-15")).not.toBeInQuarter(4);
	});
});

test.describe("toBeSpecificDayOfWeek", () => {
	test("should pass with day name", () => {
		// 2024-01-01 is Monday
		expectlyDate(new Date("2024-01-01")).toBeSpecificDayOfWeek("Monday");
		expectlyDate(new Date("2024-01-02")).toBeSpecificDayOfWeek("Tuesday");
		expectlyDate(new Date("2024-01-06")).toBeSpecificDayOfWeek("Saturday");
		expectlyDate(new Date("2024-01-07")).toBeSpecificDayOfWeek("Sunday");
	});

	test("should pass with day number", () => {
		// 2024-01-01 is Monday (1)
		expectlyDate(new Date("2024-01-01")).toBeSpecificDayOfWeek(1);
		expectlyDate(new Date("2024-01-02")).toBeSpecificDayOfWeek(2);
		expectlyDate(new Date("2024-01-06")).toBeSpecificDayOfWeek(6);
		expectlyDate(new Date("2024-01-07")).toBeSpecificDayOfWeek(0); // Sunday
	});

	test("should fail for wrong day", () => {
		expect(() => {
			expectlyDate(new Date("2024-01-01")).toBeSpecificDayOfWeek("Tuesday");
		}).toThrow(/Expected date to be/);
	});

	test("should work with negation", () => {
		expectlyDate(new Date("2024-01-01")).not.toBeSpecificDayOfWeek("Tuesday");
		expectlyDate(new Date("2024-01-01")).not.toBeSpecificDayOfWeek(2);
	});

	test("should throw for invalid day number", () => {
		expect(() => {
			expectlyDate(new Date("2024-01-01")).toBeSpecificDayOfWeek(7);
		}).toThrow(/Invalid day/);
	});
});

test.describe("toBeInMonth", () => {
	test("should pass with month name", () => {
		expectlyDate(new Date("2024-01-15")).toBeInMonth("January");
		expectlyDate(new Date("2024-02-15")).toBeInMonth("February");
		expectlyDate(new Date("2024-12-31")).toBeInMonth("December");
	});

	test("should pass with month number", () => {
		expectlyDate(new Date("2024-01-15")).toBeInMonth(1);
		expectlyDate(new Date("2024-02-15")).toBeInMonth(2);
		expectlyDate(new Date("2024-12-31")).toBeInMonth(12);
	});

	test("should fail for wrong month", () => {
		expect(() => {
			expectlyDate(new Date("2024-01-15")).toBeInMonth("February");
		}).toThrow(/Expected date to be in/);
	});

	test("should work with negation", () => {
		expectlyDate(new Date("2024-01-15")).not.toBeInMonth("February");
		expectlyDate(new Date("2024-01-15")).not.toBeInMonth(2);
	});

	test("should throw for invalid month number", () => {
		expect(() => {
			expectlyDate(new Date("2024-01-01")).toBeInMonth(0);
		}).toThrow(/Invalid month/);
		expect(() => {
			expectlyDate(new Date("2024-01-01")).toBeInMonth(13);
		}).toThrow(/Invalid month/);
	});
});
