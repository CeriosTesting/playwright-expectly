import { expect, test } from "@playwright/test";
import { expectlyDate } from "../src/expectly-date";

test.describe("toBeCloseTo", () => {
	test("should pass when dates are exactly the same", async () => {
		const date = new Date("2023-01-01T12:00:00Z");
		expectlyDate(date).toBeCloseTo(date, { seconds: 0 });
	});

	test("should pass when dates are within seconds deviation", async () => {
		const actual = new Date("2023-01-01T12:00:05Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 10 });
	});

	test("should pass when dates are within minutes deviation", async () => {
		const actual = new Date("2023-01-01T12:03:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { minutes: 5 });
	});

	test("should pass when dates are within hours deviation", async () => {
		const actual = new Date("2023-01-01T14:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { hours: 3 });
	});

	test("should pass when dates are within days deviation", async () => {
		const actual = new Date("2023-01-03T12:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { days: 2 });
	});

	test("should pass when dates are within combined deviation", async () => {
		const actual = new Date("2023-01-02T13:05:30Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, {
			days: 1,
			hours: 2,
			minutes: 10,
			seconds: 60,
		});
	});

	test("should pass when actual is earlier than expected within deviation", async () => {
		const actual = new Date("2023-01-01T11:55:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { minutes: 10 });
	});

	test("should pass when actual is later than expected within deviation", async () => {
		const actual = new Date("2023-01-01T12:05:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { minutes: 10 });
	});

	test("should fail when dates are outside seconds deviation", async () => {
		const actual = new Date("2023-01-01T12:00:15Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			expectlyDate(actual).toBeCloseTo(expected, { seconds: 10 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toBeCloseTo");
		expect(error?.message).toContain("Difference");
		expect(error?.message).toContain("Allowed deviation");
	});

	test("should fail when dates are outside minutes deviation", async () => {
		const actual = new Date("2023-01-01T12:10:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			expectlyDate(actual).toBeCloseTo(expected, { minutes: 5 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toBeCloseTo");
	});

	test("should fail when dates are outside hours deviation", async () => {
		const actual = new Date("2023-01-01T16:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			expectlyDate(actual).toBeCloseTo(expected, { hours: 3 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toBeCloseTo");
	});

	test("should fail when dates are outside days deviation", async () => {
		const actual = new Date("2023-01-05T12:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			expectlyDate(actual).toBeCloseTo(expected, { days: 2 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toBeCloseTo");
	});

	test("should work with .not for dates outside deviation", async () => {
		const actual = new Date("2023-01-01T12:00:15Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).not.toBeCloseTo(expected, { seconds: 10 });
	});

	test("should fail with .not for dates within deviation", async () => {
		const actual = new Date("2023-01-01T12:00:05Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			expectlyDate(actual).not.toBeCloseTo(expected, { seconds: 10 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle millisecond precision", async () => {
		const actual = new Date("2023-01-01T12:00:00.500Z");
		const expected = new Date("2023-01-01T12:00:00.000Z");
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 1 });
	});

	test("should work with Date.now()", async () => {
		const now = Date.now();
		const actual = new Date(now);
		const expected = new Date(now - 1000);
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 2 });
	});

	test("should handle dates in different time zones", async () => {
		// Both represent the same instant in time
		const actual = new Date("2023-01-01T12:00:00+00:00");
		const expected = new Date("2023-01-01T07:00:00-05:00");
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 1 });
	});

	test("should pass when actual date is at the exact boundary of deviation", async () => {
		const actual = new Date("2023-01-01T12:00:10Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		expectlyDate(actual).toBeCloseTo(expected, { seconds: 10 });
	});

	test("should show clear error message with time difference", async () => {
		const actual = new Date("2023-01-01T12:05:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			expectlyDate(actual).toBeCloseTo(expected, { minutes: 2 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("300.000 seconds");
		expect(error?.message).toContain("later");
		expect(error?.message).toContain("120.000 seconds");
	});
});

test.describe("toHaveDatesAscendingOrder", () => {
	test("should pass when Date array is in ascending order", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});

	test("should pass for single date", async () => {
		expectlyDate([new Date()]).toHaveDatesAscendingOrder();
	});

	test("should pass for empty array", async () => {
		expectlyDate([]).toHaveDatesAscendingOrder();
	});

	test("should pass with duplicate dates", async () => {
		const dates = [new Date("2023-01-01T12:00:00Z"), new Date("2023-01-01T12:00:00Z"), new Date("2023-01-02")];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});

	test("should pass with dates having different times on same day", async () => {
		const dates = [
			new Date("2023-01-01T08:00:00Z"),
			new Date("2023-01-01T12:00:00Z"),
			new Date("2023-01-01T18:00:00Z"),
		];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});

	test("should fail when Date array is not in ascending order", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-01"), new Date("2023-01-02")];

		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveDatesAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDatesAscendingOrder");
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should fail when Date array is in descending order", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];

		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveDatesAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for descending arrays", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];
		expectlyDate(dates).not.toHaveDatesAscendingOrder();
	});

	test("should fail with .not for ascending arrays", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];

		let error: Error | undefined;
		try {
			expectlyDate(dates).not.toHaveDatesAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle dates spanning years", async () => {
		const dates = [new Date("2022-12-31"), new Date("2023-01-01"), new Date("2023-01-02")];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});

	test("should handle very old and future dates", async () => {
		const dates = [new Date("1900-01-01"), new Date("2023-01-01"), new Date("2100-01-01")];
		expectlyDate(dates).toHaveDatesAscendingOrder();
	});
});

test.describe("toHaveDatesDescendingOrder", () => {
	test("should pass when Date array is in descending order", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should pass for single date", async () => {
		expectlyDate([new Date()]).toHaveDatesDescendingOrder();
	});

	test("should pass for empty array", async () => {
		expectlyDate([]).toHaveDatesDescendingOrder();
	});

	test("should pass with duplicate dates", async () => {
		const dates = [new Date("2023-01-02"), new Date("2023-01-01T12:00:00Z"), new Date("2023-01-01T12:00:00Z")];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should pass with dates having different times on same day", async () => {
		const dates = [
			new Date("2023-01-01T18:00:00Z"),
			new Date("2023-01-01T12:00:00Z"),
			new Date("2023-01-01T08:00:00Z"),
		];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should fail when Date array is not in descending order", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-03"), new Date("2023-01-02")];

		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveDatesDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDatesDescendingOrder");
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should fail when Date array is in ascending order", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];

		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveDatesDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for ascending arrays", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		expectlyDate(dates).not.toHaveDatesDescendingOrder();
	});

	test("should fail with .not for descending arrays", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];

		let error: Error | undefined;
		try {
			expectlyDate(dates).not.toHaveDatesDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle dates spanning years", async () => {
		const dates = [new Date("2023-01-02"), new Date("2023-01-01"), new Date("2022-12-31")];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should handle very old and future dates", async () => {
		const dates = [new Date("2100-01-01"), new Date("2023-01-01"), new Date("1900-01-01")];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});

	test("should handle all same dates", async () => {
		const date = new Date("2023-01-01T12:00:00Z");
		const dates = [date, date, date];
		expectlyDate(dates).toHaveDatesDescendingOrder();
	});
});

test.describe("toBeBefore", () => {
	test("should pass when actual date is before expected", async () => {
		const actual = new Date("2023-01-01");
		const expected = new Date("2023-01-02");
		expectlyDate(actual).toBeBefore(expected);
	});

	test("should pass when dates differ by milliseconds", async () => {
		const actual = new Date("2023-01-01T12:00:00.000Z");
		const expected = new Date("2023-01-01T12:00:00.001Z");
		expectlyDate(actual).toBeBefore(expected);
	});

	test("should fail when actual date is after expected", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-02")).toBeBefore(new Date("2023-01-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be before");
	});

	test("should fail when dates are equal", async () => {
		const date = new Date("2023-01-01T12:00:00Z");
		let error: Error | undefined;
		try {
			expectlyDate(date).toBeBefore(date);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		expectlyDate(new Date("2023-01-02")).not.toBeBefore(new Date("2023-01-01"));
	});

	test("should fail with .not when actual is before", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-01")).not.toBeBefore(new Date("2023-01-02"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to not be before");
	});
});

test.describe("toBeAfter", () => {
	test("should pass when actual date is after expected", async () => {
		const actual = new Date("2023-01-02");
		const expected = new Date("2023-01-01");
		expectlyDate(actual).toBeAfter(expected);
	});

	test("should pass when dates differ by milliseconds", async () => {
		const actual = new Date("2023-01-01T12:00:00.001Z");
		const expected = new Date("2023-01-01T12:00:00.000Z");
		expectlyDate(actual).toBeAfter(expected);
	});

	test("should fail when actual date is before expected", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-01")).toBeAfter(new Date("2023-01-02"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be after");
	});

	test("should fail when dates are equal", async () => {
		const date = new Date("2023-01-01T12:00:00Z");
		let error: Error | undefined;
		try {
			expectlyDate(date).toBeAfter(date);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		expectlyDate(new Date("2023-01-01")).not.toBeAfter(new Date("2023-01-02"));
	});

	test("should fail with .not when actual is after", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-02")).not.toBeAfter(new Date("2023-01-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to not be after");
	});
});

test.describe("toBeBetween", () => {
	test("should pass when date is between start and end", async () => {
		expectlyDate(new Date("2023-01-15")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass when date equals start", async () => {
		expectlyDate(new Date("2023-01-01")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass when date equals end", async () => {
		expectlyDate(new Date("2023-01-31")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should fail when date is before start", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2022-12-31")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be between");
	});

	test("should fail when date is after end", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-02-01")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		expectlyDate(new Date("2023-02-15")).not.toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should fail with .not when date is between", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-15")).not.toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to not be between");
	});
});

test.describe("toBeSameDay", () => {
	test("should pass when dates are on the same day", async () => {
		expectlyDate(new Date("2023-01-15T08:00:00Z")).toBeSameDay(new Date("2023-01-15T20:00:00Z"));
	});

	test("should pass when dates are identical", async () => {
		const date = new Date("2023-01-15T12:00:00Z");
		expectlyDate(date).toBeSameDay(date);
	});

	test("should fail when dates are on different days", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-15")).toBeSameDay(new Date("2023-01-16"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to be the same day");
	});

	test("should fail when dates are in different months", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-31")).toBeSameDay(new Date("2023-02-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		expectlyDate(new Date("2023-01-15")).not.toBeSameDay(new Date("2023-01-16"));
	});

	test("should fail with .not when dates are same day", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-15T08:00:00Z")).not.toBeSameDay(new Date("2023-01-15T20:00:00Z"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to not be the same day");
	});
});

test.describe("toBeSameMonth", () => {
	test("should pass when dates are in the same month", async () => {
		expectlyDate(new Date("2023-01-01")).toBeSameMonth(new Date("2023-01-31"));
	});

	test("should fail when dates are in different months", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-31")).toBeSameMonth(new Date("2023-02-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to be in the same month");
	});

	test("should fail when dates are in different years", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-15")).toBeSameMonth(new Date("2024-01-15"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		expectlyDate(new Date("2023-01-15")).not.toBeSameMonth(new Date("2023-02-15"));
	});

	test("should fail with .not when dates are same month", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-01")).not.toBeSameMonth(new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to not be in the same month");
	});
});

test.describe("toBeSameYear", () => {
	test("should pass when dates are in the same year", async () => {
		expectlyDate(new Date("2023-01-01")).toBeSameYear(new Date("2023-12-31"));
	});

	test("should fail when dates are in different years", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-12-31")).toBeSameYear(new Date("2024-01-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to be in the same year");
	});

	test("should work with .not", async () => {
		expectlyDate(new Date("2023-01-15")).not.toBeSameYear(new Date("2024-01-15"));
	});

	test("should fail with .not when dates are same year", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-01")).not.toBeSameYear(new Date("2023-12-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to not be in the same year");
	});
});

test.describe("toBeToday", () => {
	test("should pass when date is today", async () => {
		expectlyDate(new Date()).toBeToday();
	});

	test("should pass with different times on same day", async () => {
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		expectlyDate(today).toBeToday();
	});

	test("should fail when date is yesterday", async () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		let error: Error | undefined;
		try {
			expectlyDate(yesterday).toBeToday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be today");
	});

	test("should fail when date is tomorrow", async () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		let error: Error | undefined;
		try {
			expectlyDate(tomorrow).toBeToday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for past dates", async () => {
		expectlyDate(new Date("2020-01-01")).not.toBeToday();
	});

	test("should fail with .not when date is today", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date()).not.toBeToday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to not be today");
	});
});

test.describe("toBeYesterday", () => {
	test("should pass when date is yesterday", async () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expectlyDate(yesterday).toBeYesterday();
	});

	test("should pass with different times on yesterday", async () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(23, 59, 59, 999);
		expectlyDate(yesterday).toBeYesterday();
	});

	test("should fail when date is today", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date()).toBeYesterday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be yesterday");
	});

	test("should fail when date is two days ago", async () => {
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
		let error: Error | undefined;
		try {
			expectlyDate(twoDaysAgo).toBeYesterday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for today", async () => {
		expectlyDate(new Date()).not.toBeYesterday();
	});
});

test.describe("toBeTomorrow", () => {
	test("should pass when date is tomorrow", async () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		expectlyDate(tomorrow).toBeTomorrow();
	});

	test("should pass with different times on tomorrow", async () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(23, 59, 59, 999);
		expectlyDate(tomorrow).toBeTomorrow();
	});

	test("should fail when date is today", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date()).toBeTomorrow();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be tomorrow");
	});

	test("should fail when date is two days from now", async () => {
		const twoDaysLater = new Date();
		twoDaysLater.setDate(twoDaysLater.getDate() + 2);
		let error: Error | undefined;
		try {
			expectlyDate(twoDaysLater).toBeTomorrow();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for today", async () => {
		expectlyDate(new Date()).not.toBeTomorrow();
	});
});

test.describe("toBeWeekday", () => {
	test("should pass for Monday", async () => {
		const monday = new Date("2023-01-02"); // A Monday
		expectlyDate(monday).toBeWeekday();
	});

	test("should pass for Tuesday", async () => {
		const tuesday = new Date("2023-01-03");
		expectlyDate(tuesday).toBeWeekday();
	});

	test("should pass for Wednesday", async () => {
		const wednesday = new Date("2023-01-04");
		expectlyDate(wednesday).toBeWeekday();
	});

	test("should pass for Thursday", async () => {
		const thursday = new Date("2023-01-05");
		expectlyDate(thursday).toBeWeekday();
	});

	test("should pass for Friday", async () => {
		const friday = new Date("2023-01-06");
		expectlyDate(friday).toBeWeekday();
	});

	test("should fail for Saturday", async () => {
		const saturday = new Date("2023-01-07");
		let error: Error | undefined;
		try {
			expectlyDate(saturday).toBeWeekday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be a weekday (Monday-Friday)");
		expect(error?.message).toContain("Saturday");
	});

	test("should fail for Sunday", async () => {
		const sunday = new Date("2023-01-01");
		let error: Error | undefined;
		try {
			expectlyDate(sunday).toBeWeekday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Sunday");
	});

	test("should work with .not for weekend", async () => {
		expectlyDate(new Date("2023-01-07")).not.toBeWeekday(); // Saturday
	});
});

test.describe("toBeWeekend", () => {
	test("should pass for Saturday", async () => {
		const saturday = new Date("2023-01-07");
		expectlyDate(saturday).toBeWeekend();
	});

	test("should pass for Sunday", async () => {
		const sunday = new Date("2023-01-01");
		expectlyDate(sunday).toBeWeekend();
	});

	test("should fail for Monday", async () => {
		const monday = new Date("2023-01-02");
		let error: Error | undefined;
		try {
			expectlyDate(monday).toBeWeekend();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be a weekend (Saturday-Sunday)");
		expect(error?.message).toContain("Monday");
	});

	test("should fail for Friday", async () => {
		const friday = new Date("2023-01-06");
		let error: Error | undefined;
		try {
			expectlyDate(friday).toBeWeekend();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Friday");
	});

	test("should work with .not for weekday", async () => {
		expectlyDate(new Date("2023-01-02")).not.toBeWeekend(); // Monday
	});
});

test.describe("toBeInThePast", () => {
	test("should pass for dates in the past", async () => {
		expectlyDate(new Date("2020-01-01")).toBeInThePast();
	});

	test("should pass for one second ago", async () => {
		const oneSecondAgo = new Date(Date.now() - 1000);
		expectlyDate(oneSecondAgo).toBeInThePast();
	});

	test("should fail for future dates", async () => {
		const future = new Date(Date.now() + 10000);
		let error: Error | undefined;
		try {
			expectlyDate(future).toBeInThePast();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be in the past");
	});

	test("should work with .not for future dates", async () => {
		const future = new Date(Date.now() + 10000);
		expectlyDate(future).not.toBeInThePast();
	});
});

test.describe("toBeInTheFuture", () => {
	test("should pass for dates in the future", async () => {
		const future = new Date(Date.now() + 10000);
		expectlyDate(future).toBeInTheFuture();
	});

	test("should pass for one second from now", async () => {
		const oneSecondLater = new Date(Date.now() + 1000);
		expectlyDate(oneSecondLater).toBeInTheFuture();
	});

	test("should fail for past dates", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2020-01-01")).toBeInTheFuture();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be in the future");
	});

	test("should work with .not for past dates", async () => {
		expectlyDate(new Date("2020-01-01")).not.toBeInTheFuture();
	});
});

test.describe("toBeLeapYear", () => {
	test("should pass for leap year divisible by 4", async () => {
		expectlyDate(new Date("2024-01-01")).toBeLeapYear();
	});

	test("should pass for leap year divisible by 400", async () => {
		expectlyDate(new Date("2000-01-01")).toBeLeapYear();
	});

	test("should pass for 2020", async () => {
		expectlyDate(new Date("2020-06-15")).toBeLeapYear();
	});

	test("should fail for non-leap year", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("2023-01-01")).toBeLeapYear();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected year to be a leap year");
	});

	test("should fail for year divisible by 100 but not 400", async () => {
		let error: Error | undefined;
		try {
			expectlyDate(new Date("1900-01-01")).toBeLeapYear();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for non-leap year", async () => {
		expectlyDate(new Date("2023-01-01")).not.toBeLeapYear();
	});
});

test.describe("toHaveDateRange", () => {
	test("should pass when array has expected day range", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-11")];
		expectlyDate(dates).toHaveDateRange({ days: 10 });
	});

	test("should pass with month range", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-02-01")];
		expectlyDate(dates).toHaveDateRange({ months: 1 });
	});

	test("should pass with year range", async () => {
		const dates = [new Date("2023-01-01"), new Date("2024-01-01")];
		expectlyDate(dates).toHaveDateRange({ years: 1 });
	});

	test("should pass with combined range", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-02-11")];
		expectlyDate(dates).toHaveDateRange({ months: 1, days: 10 });
	});

	test("should pass with unsorted dates", async () => {
		const dates = [new Date("2023-01-11"), new Date("2023-01-01"), new Date("2023-01-05")];
		expectlyDate(dates).toHaveDateRange({ days: 10 });
	});

	test("should fail when range doesn't match", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-11")];
		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveDateRange({ days: 20 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date range to match");
	});

	test("should throw for empty array", async () => {
		let error: Error | undefined;
		try {
			expectlyDate([]).toHaveDateRange({ days: 10 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Array must contain at least one date");
	});
});

test.describe("toHaveConsecutiveDates", () => {
	test("should pass for consecutive days", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		expectlyDate(dates).toHaveConsecutiveDates("day");
	});

	test("should pass for consecutive months", async () => {
		const dates = [new Date("2023-01-15"), new Date("2023-02-15"), new Date("2023-03-15")];
		expectlyDate(dates).toHaveConsecutiveDates("month");
	});

	test("should pass for consecutive years", async () => {
		const dates = [new Date("2021-06-15"), new Date("2022-06-15"), new Date("2023-06-15")];
		expectlyDate(dates).toHaveConsecutiveDates("year");
	});

	test("should pass with unsorted dates", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-01"), new Date("2023-01-02")];
		expectlyDate(dates).toHaveConsecutiveDates("day");
	});

	test("should fail for non-consecutive days", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-03")];
		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveConsecutiveDates("day");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to be consecutive by day");
		expect(error?.message).toContain("Gap found at index");
	});

	test("should fail for non-consecutive months", async () => {
		const dates = [new Date("2023-01-15"), new Date("2023-03-15")];
		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveConsecutiveDates("month");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should throw for array with less than 2 dates", async () => {
		let error: Error | undefined;
		try {
			expectlyDate([new Date()]).toHaveConsecutiveDates("day");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Array must contain at least two dates");
	});
});

test.describe("toHaveDatesWithinRange", () => {
	test("should pass when all dates are within range", async () => {
		const dates = [new Date("2023-01-10"), new Date("2023-01-15"), new Date("2023-01-20")];
		expectlyDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass with dates at boundaries", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-15"), new Date("2023-01-31")];
		expectlyDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should fail when some dates are out of range", async () => {
		const dates = [new Date("2022-12-31"), new Date("2023-01-15"), new Date("2023-02-01")];
		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected all dates to be within range");
		expect(error?.message).toContain("Out of range dates");
	});

	test("should throw for empty array", async () => {
		let error: Error | undefined;
		try {
			expectlyDate([]).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Array must contain at least one date");
	});
});

test.describe("toHaveUniqueDates", () => {
	test("should pass when all dates are unique", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		expectlyDate(dates).toHaveUniqueDates();
	});

	test("should pass with unique dates ignoring time", async () => {
		const dates = [
			new Date("2023-01-01T08:00:00Z"),
			new Date("2023-01-02T12:00:00Z"),
			new Date("2023-01-03T18:00:00Z"),
		];
		expectlyDate(dates).toHaveUniqueDates(true);
	});

	test("should fail when dates have duplicates", async () => {
		const date = new Date("2023-01-01T12:00:00Z");
		const dates = [date, new Date("2023-01-02"), date];
		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveUniqueDates();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected all dates to be unique");
		expect(error?.message).toContain("duplicate");
	});

	test("should fail when same day but different times with ignoreTime", async () => {
		const dates = [new Date("2023-01-01T08:00:00Z"), new Date("2023-01-01T12:00:00Z")];
		let error: Error | undefined;
		try {
			expectlyDate(dates).toHaveUniqueDates(true);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should pass when same day but different times without ignoreTime", async () => {
		const dates = [new Date("2023-01-01T08:00:00Z"), new Date("2023-01-01T12:00:00Z")];
		expectlyDate(dates).toHaveUniqueDates(false);
	});

	test("should throw for empty array", async () => {
		let error: Error | undefined;
		try {
			expectlyDate([]).toHaveUniqueDates();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Array must contain at least one date");
	});
});

test.describe("toBeValidISODate", () => {
	test("should pass for valid ISO date with milliseconds", async () => {
		expectlyDate("2023-01-15T12:30:45.123Z").toBeValidISODate();
	});

	test("should pass for valid ISO date without milliseconds", async () => {
		expectlyDate("2023-01-15T12:30:45Z").toBeValidISODate();
	});

	test("should pass for valid ISO date without Z", async () => {
		expectlyDate("2023-01-15T12:30:45").toBeValidISODate();
	});

	test("should fail for invalid ISO format", async () => {
		let error: Error | undefined;
		try {
			expectlyDate("2023-01-15").toBeValidISODate();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected string to be a valid ISO 8601 date");
	});

	test("should fail for invalid date values", async () => {
		let error: Error | undefined;
		try {
			expectlyDate("2023-13-45T99:99:99Z").toBeValidISODate();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for non-ISO format", async () => {
		let error: Error | undefined;
		try {
			expectlyDate("01/15/2023").toBeValidISODate();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for invalid format", async () => {
		expectlyDate("not-a-date").not.toBeValidISODate();
	});

	test("should fail with .not for valid ISO date", async () => {
		let error: Error | undefined;
		try {
			expectlyDate("2023-01-15T12:30:45.123Z").not.toBeValidISODate();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected string to not be a valid ISO 8601 date");
	});
});

test.describe("toMatchTimeZone", () => {
	test("should pass when date matches timezone offset (numeric)", async () => {
		const date = new Date("2024-06-15T12:00:00Z");
		// Date objects always use the local timezone of the machine running the test
		expectlyDate(date).toMatchTimeZone(-date.getTimezoneOffset());
	});

	test("should pass with UTC string when in UTC timezone", async () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		if (localOffset === 0) {
			expectlyDate(date).toMatchTimeZone("UTC");
		} else {
			// Skip if not in UTC - dates always use local timezone
			expectlyDate(date).not.toMatchTimeZone("UTC");
		}
	});

	test("should pass with positive offset string matching local", async () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const offsetMinutes = -date.getTimezoneOffset();
		const sign = offsetMinutes >= 0 ? "+" : "-";
		const absOffset = Math.abs(offsetMinutes);
		const hours = Math.floor(absOffset / 60);
		const minutes = absOffset % 60;
		const offsetString = `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
		expectlyDate(date).toMatchTimeZone(offsetString);
	});

	test("should fail when date does not match timezone offset (numeric)", async () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		// Test with an offset that's definitely different from local
		const wrongOffset = localOffset === 330 ? 0 : 330;
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(date).toMatchTimeZone(wrongOffset);
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});

	test("should fail with wrong string offset", async () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		// Test with an offset that's different from local
		const wrongOffset = localOffset === 330 ? "+00:00" : "+05:30";
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(date).toMatchTimeZone(wrongOffset);
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});

	test("should work with negation (numeric)", async () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		const wrongOffset = localOffset === 330 ? 0 : 330;
		expectlyDate(date).not.toMatchTimeZone(wrongOffset);
	});

	test("should work with negation (string)", async () => {
		const date = new Date("2024-06-15T12:00:00Z");
		const localOffset = -date.getTimezoneOffset();
		const wrongOffset = localOffset === 330 ? "+00:00" : "+05:30";
		expectlyDate(date).not.toMatchTimeZone(wrongOffset);
	});

	test("should throw for invalid offset format", async () => {
		const date = new Date("2024-06-15T12:00:00Z");
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(date).toMatchTimeZone("invalid");
				throw new Error("Expected error to be thrown");
			} catch (error: any) {
				if (error.message === "Expected error to be thrown") throw error;
			}
		});
	});
});

test.describe("toBeStartOfMonth", () => {
	test("should pass for first day of month", async () => {
		expectlyDate(new Date("2024-01-01")).toBeStartOfMonth();
		expectlyDate(new Date("2024-02-01T15:30:00Z")).toBeStartOfMonth();
		expectlyDate(new Date("2024-12-01")).toBeStartOfMonth();
	});

	test("should fail for non-first day of month", async () => {
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(new Date("2024-01-15")).toBeStartOfMonth();
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});

	test("should work with negation", async () => {
		expectlyDate(new Date("2024-01-15")).not.toBeStartOfMonth();
		expectlyDate(new Date("2024-01-31")).not.toBeStartOfMonth();
	});
});

test.describe("toBeEndOfMonth", () => {
	test("should pass for last day of month", async () => {
		expectlyDate(new Date("2024-01-31")).toBeEndOfMonth();
		expectlyDate(new Date("2024-02-29")).toBeEndOfMonth(); // Leap year
		expectlyDate(new Date("2024-04-30")).toBeEndOfMonth();
		expectlyDate(new Date("2024-12-31")).toBeEndOfMonth();
	});

	test("should fail for non-last day of month", async () => {
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(new Date("2024-01-15")).toBeEndOfMonth();
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});

	test("should handle February in non-leap year", async () => {
		expectlyDate(new Date("2023-02-28")).toBeEndOfMonth();
		expectlyDate(new Date("2023-02-27")).not.toBeEndOfMonth();
	});

	test("should work with negation", async () => {
		expectlyDate(new Date("2024-01-15")).not.toBeEndOfMonth();
		expectlyDate(new Date("2024-01-01")).not.toBeEndOfMonth();
	});
});

test.describe("toHaveDateGapsLargerThan", () => {
	test("should pass when gaps exist larger than specified duration", async () => {
		const dates = [
			new Date("2024-01-01"),
			new Date("2024-01-02"),
			new Date("2024-01-10"), // 8 day gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ days: 7 });
	});

	test("should fail when no gaps larger than specified duration", async () => {
		const dates = [new Date("2024-01-01"), new Date("2024-01-02"), new Date("2024-01-03")];
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(dates).toHaveDateGapsLargerThan({ days: 7 });
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});

	test("should work with hours", async () => {
		const dates = [
			new Date("2024-01-01T10:00:00Z"),
			new Date("2024-01-01T11:00:00Z"),
			new Date("2024-01-01T14:00:00Z"), // 3 hour gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ hours: 2 });
	});

	test("should work with multiple time units", async () => {
		const dates = [
			new Date("2024-01-01T10:00:00Z"),
			new Date("2024-01-01T11:00:00Z"),
			new Date("2024-01-03T12:30:00Z"), // ~2 days 1.5 hours gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ days: 2, hours: 1 });
	});

	test("should work with negation", async () => {
		const dates = [new Date("2024-01-01"), new Date("2024-01-02"), new Date("2024-01-03")];
		expectlyDate(dates).not.toHaveDateGapsLargerThan({ days: 7 });
	});

	test("should handle unsorted dates", async () => {
		const dates = [new Date("2024-01-10"), new Date("2024-01-01"), new Date("2024-01-02")];
		expectlyDate(dates).toHaveDateGapsLargerThan({ days: 7 });
	});

	test("should work with months", async () => {
		const dates = [
			new Date("2024-01-01"),
			new Date("2024-02-01"),
			new Date("2024-05-01"), // 3 month gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ months: 2 });
	});

	test("should work with years", async () => {
		const dates = [
			new Date("2020-01-01"),
			new Date("2021-01-01"),
			new Date("2023-01-01"), // 2 year gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ years: 1 });
	});

	test("should work with mixed units including months and years", async () => {
		const dates = [
			new Date("2020-01-01"),
			new Date("2020-06-01"),
			new Date("2022-01-01"), // ~1.5 year gap
		];
		expectlyDate(dates).toHaveDateGapsLargerThan({ years: 1, months: 3 });
	});

	test("should fail when no gaps match months criteria", async () => {
		const dates = [new Date("2024-01-01"), new Date("2024-01-15"), new Date("2024-02-01")];
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(dates).toHaveDateGapsLargerThan({ months: 2 });
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});
});

test.describe("toBeInQuarter", () => {
	test("should pass for Q1 dates (Jan-Mar)", async () => {
		expectlyDate(new Date("2024-01-15")).toBeInQuarter(1);
		expectlyDate(new Date("2024-02-01")).toBeInQuarter(1);
		expectlyDate(new Date("2024-03-31")).toBeInQuarter(1);
	});

	test("should pass for Q2 dates (Apr-Jun)", async () => {
		expectlyDate(new Date("2024-04-01")).toBeInQuarter(2);
		expectlyDate(new Date("2024-05-15")).toBeInQuarter(2);
		expectlyDate(new Date("2024-06-30")).toBeInQuarter(2);
	});

	test("should pass for Q3 dates (Jul-Sep)", async () => {
		expectlyDate(new Date("2024-07-01")).toBeInQuarter(3);
		expectlyDate(new Date("2024-08-15")).toBeInQuarter(3);
		expectlyDate(new Date("2024-09-30")).toBeInQuarter(3);
	});

	test("should pass for Q4 dates (Oct-Dec)", async () => {
		expectlyDate(new Date("2024-10-01")).toBeInQuarter(4);
		expectlyDate(new Date("2024-11-15")).toBeInQuarter(4);
		expectlyDate(new Date("2024-12-31")).toBeInQuarter(4);
	});

	test("should fail for wrong quarter", async () => {
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(new Date("2024-01-15")).toBeInQuarter(2);
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});

	test("should work with negation", async () => {
		expectlyDate(new Date("2024-01-15")).not.toBeInQuarter(2);
		expectlyDate(new Date("2024-01-15")).not.toBeInQuarter(3);
		expectlyDate(new Date("2024-01-15")).not.toBeInQuarter(4);
	});
});

test.describe("toBeSpecificDayOfWeek", () => {
	test("should pass with day name", async () => {
		// 2024-01-01 is Monday
		expectlyDate(new Date("2024-01-01")).toBeSpecificDayOfWeek("Monday");
		expectlyDate(new Date("2024-01-02")).toBeSpecificDayOfWeek("Tuesday");
		expectlyDate(new Date("2024-01-06")).toBeSpecificDayOfWeek("Saturday");
		expectlyDate(new Date("2024-01-07")).toBeSpecificDayOfWeek("Sunday");
	});

	test("should pass with day number", async () => {
		// 2024-01-01 is Monday (1)
		expectlyDate(new Date("2024-01-01")).toBeSpecificDayOfWeek(1);
		expectlyDate(new Date("2024-01-02")).toBeSpecificDayOfWeek(2);
		expectlyDate(new Date("2024-01-06")).toBeSpecificDayOfWeek(6);
		expectlyDate(new Date("2024-01-07")).toBeSpecificDayOfWeek(0); // Sunday
	});

	test("should fail for wrong day", async () => {
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(new Date("2024-01-01")).toBeSpecificDayOfWeek("Tuesday");
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});

	test("should work with negation", async () => {
		expectlyDate(new Date("2024-01-01")).not.toBeSpecificDayOfWeek("Tuesday");
		expectlyDate(new Date("2024-01-01")).not.toBeSpecificDayOfWeek(2);
	});

	test("should throw for invalid day number", async () => {
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(new Date("2024-01-01")).toBeSpecificDayOfWeek(7);
				throw new Error("Expected error to be thrown");
			} catch (error: any) {
				if (error.message === "Expected error to be thrown") throw error;
			}
		});
	});
});

test.describe("toBeInMonth", () => {
	test("should pass with month name", async () => {
		expectlyDate(new Date("2024-01-15")).toBeInMonth("January");
		expectlyDate(new Date("2024-02-15")).toBeInMonth("February");
		expectlyDate(new Date("2024-12-31")).toBeInMonth("December");
	});

	test("should pass with month number", async () => {
		expectlyDate(new Date("2024-01-15")).toBeInMonth(1);
		expectlyDate(new Date("2024-02-15")).toBeInMonth(2);
		expectlyDate(new Date("2024-12-31")).toBeInMonth(12);
	});

	test("should fail for wrong month", async () => {
		await test.step("expect to throw", async () => {
			try {
				expectlyDate(new Date("2024-01-15")).toBeInMonth("February");
				throw new Error("Expected assertion to fail");
			} catch (error: any) {
				if (error.message === "Expected assertion to fail") throw error;
			}
		});
	});

	test("should work with negation", async () => {
		expectlyDate(new Date("2024-01-15")).not.toBeInMonth("February");
		expectlyDate(new Date("2024-01-15")).not.toBeInMonth(2);
	});

	test("should throw for invalid month number", async () => {
		await test.step("expect to throw for 0", async () => {
			try {
				expectlyDate(new Date("2024-01-01")).toBeInMonth(0);
				throw new Error("Expected error to be thrown");
			} catch (error: any) {
				if (error.message === "Expected error to be thrown") throw error;
			}
		});

		await test.step("expect to throw for 13", async () => {
			try {
				expectlyDate(new Date("2024-01-01")).toBeInMonth(13);
				throw new Error("Expected error to be thrown");
			} catch (error: any) {
				if (error.message === "Expected error to be thrown") throw error;
			}
		});
	});
});
