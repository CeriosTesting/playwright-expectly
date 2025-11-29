import { expect, test } from "@playwright/test";
import { expectDate } from "../src/expect-date-extensions";

test.describe("toBeCloseTo", () => {
	test("should pass when dates are exactly the same", async () => {
		const date = new Date("2023-01-01T12:00:00Z");
		await expectDate(date).toBeCloseTo(date, { seconds: 0 });
	});

	test("should pass when dates are within seconds deviation", async () => {
		const actual = new Date("2023-01-01T12:00:05Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).toBeCloseTo(expected, { seconds: 10 });
	});

	test("should pass when dates are within minutes deviation", async () => {
		const actual = new Date("2023-01-01T12:03:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).toBeCloseTo(expected, { minutes: 5 });
	});

	test("should pass when dates are within hours deviation", async () => {
		const actual = new Date("2023-01-01T14:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).toBeCloseTo(expected, { hours: 3 });
	});

	test("should pass when dates are within days deviation", async () => {
		const actual = new Date("2023-01-03T12:00:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).toBeCloseTo(expected, { days: 2 });
	});

	test("should pass when dates are within combined deviation", async () => {
		const actual = new Date("2023-01-02T13:05:30Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).toBeCloseTo(expected, {
			days: 1,
			hours: 2,
			minutes: 10,
			seconds: 60,
		});
	});

	test("should pass with string dates within deviation", async () => {
		const actual = "2023-01-01T12:00:05Z";
		const expected = "2023-01-01T12:00:00Z";
		await expectDate(actual).toBeCloseTo(expected, { seconds: 10 });
	});

	test("should pass when actual is earlier than expected within deviation", async () => {
		const actual = new Date("2023-01-01T11:55:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).toBeCloseTo(expected, { minutes: 10 });
	});

	test("should pass when actual is later than expected within deviation", async () => {
		const actual = new Date("2023-01-01T12:05:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).toBeCloseTo(expected, { minutes: 10 });
	});

	test("should fail when dates are outside seconds deviation", async () => {
		const actual = new Date("2023-01-01T12:00:15Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			await expectDate(actual).toBeCloseTo(expected, { seconds: 10 });
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
			await expectDate(actual).toBeCloseTo(expected, { minutes: 5 });
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
			await expectDate(actual).toBeCloseTo(expected, { hours: 3 });
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
			await expectDate(actual).toBeCloseTo(expected, { days: 2 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toBeCloseTo");
	});

	test("should throw error for invalid actual date string", async () => {
		let error: Error | undefined;
		try {
			await expectDate("invalid-date").toBeCloseTo(new Date(), { seconds: 10 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Invalid actual date");
	});

	test("should throw error for invalid expected date string", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date()).toBeCloseTo("invalid-date", { seconds: 10 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Invalid expected date");
	});

	test("should work with .not for dates outside deviation", async () => {
		const actual = new Date("2023-01-01T12:00:15Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).not.toBeCloseTo(expected, { seconds: 10 });
	});

	test("should fail with .not for dates within deviation", async () => {
		const actual = new Date("2023-01-01T12:00:05Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			await expectDate(actual).not.toBeCloseTo(expected, { seconds: 10 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle millisecond precision", async () => {
		const actual = new Date("2023-01-01T12:00:00.500Z");
		const expected = new Date("2023-01-01T12:00:00.000Z");
		await expectDate(actual).toBeCloseTo(expected, { seconds: 1 });
	});

	test("should work with Date.now()", async () => {
		const now = Date.now();
		const actual = new Date(now);
		const expected = new Date(now - 1000);
		await expectDate(actual).toBeCloseTo(expected, { seconds: 2 });
	});

	test("should handle dates in different time zones", async () => {
		// Both represent the same instant in time
		const actual = new Date("2023-01-01T12:00:00+00:00");
		const expected = new Date("2023-01-01T07:00:00-05:00");
		await expectDate(actual).toBeCloseTo(expected, { seconds: 1 });
	});

	test("should pass when actual date is at the exact boundary of deviation", async () => {
		const actual = new Date("2023-01-01T12:00:10Z");
		const expected = new Date("2023-01-01T12:00:00Z");
		await expectDate(actual).toBeCloseTo(expected, { seconds: 10 });
	});

	test("should show clear error message with time difference", async () => {
		const actual = new Date("2023-01-01T12:05:00Z");
		const expected = new Date("2023-01-01T12:00:00Z");

		let error: Error | undefined;
		try {
			await expectDate(actual).toBeCloseTo(expected, { minutes: 2 });
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
		await expectDate(dates).toHaveDatesAscendingOrder();
	});

	test("should pass when string date array is in ascending order", async () => {
		const dates = ["2023-01-01", "2023-01-02", "2023-01-03"];
		await expectDate(dates).toHaveDatesAscendingOrder();
	});

	test("should pass for single date", async () => {
		await expectDate([new Date()]).toHaveDatesAscendingOrder();
	});

	test("should pass for empty array", async () => {
		await expectDate([]).toHaveDatesAscendingOrder();
	});

	test("should pass with duplicate dates", async () => {
		const dates = [new Date("2023-01-01T12:00:00Z"), new Date("2023-01-01T12:00:00Z"), new Date("2023-01-02")];
		await expectDate(dates).toHaveDatesAscendingOrder();
	});

	test("should pass with dates having different times on same day", async () => {
		const dates = [
			new Date("2023-01-01T08:00:00Z"),
			new Date("2023-01-01T12:00:00Z"),
			new Date("2023-01-01T18:00:00Z"),
		];
		await expectDate(dates).toHaveDatesAscendingOrder();
	});

	test("should fail when Date array is not in ascending order", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-01"), new Date("2023-01-02")];

		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDatesAscendingOrder");
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should fail when string date array is not in ascending order", async () => {
		const dates = ["2023-01-03", "2023-01-01", "2023-01-02"];

		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDatesAscendingOrder");
	});

	test("should fail when Date array is in descending order", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];

		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should throw error for invalid date string in array", async () => {
		const dates = ["2023-01-01", "invalid-date", "2023-01-03"];

		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Invalid date string");
	});

	test("should work with .not for descending arrays", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];
		await expectDate(dates).not.toHaveDatesAscendingOrder();
	});

	test("should fail with .not for ascending arrays", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];

		let error: Error | undefined;
		try {
			await expectDate(dates).not.toHaveDatesAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle dates spanning years", async () => {
		const dates = [new Date("2022-12-31"), new Date("2023-01-01"), new Date("2023-01-02")];
		await expectDate(dates).toHaveDatesAscendingOrder();
	});

	test("should handle ISO string dates with time zones", async () => {
		const dates = ["2023-01-01T00:00:00Z", "2023-01-01T12:00:00+00:00", "2023-01-02T00:00:00-05:00"];
		await expectDate(dates).toHaveDatesAscendingOrder();
	});

	test("should handle very old and future dates", async () => {
		const dates = [new Date("1900-01-01"), new Date("2023-01-01"), new Date("2100-01-01")];
		await expectDate(dates).toHaveDatesAscendingOrder();
	});
});

test.describe("toHaveDatesDescendingOrder", () => {
	test("should pass when Date array is in descending order", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];
		await expectDate(dates).toHaveDatesDescendingOrder();
	});

	test("should pass when string date array is in descending order", async () => {
		const dates = ["2023-01-03", "2023-01-02", "2023-01-01"];
		await expectDate(dates).toHaveDatesDescendingOrder();
	});

	test("should pass for single date", async () => {
		await expectDate([new Date()]).toHaveDatesDescendingOrder();
	});

	test("should pass for empty array", async () => {
		await expectDate([]).toHaveDatesDescendingOrder();
	});

	test("should pass with duplicate dates", async () => {
		const dates = [new Date("2023-01-02"), new Date("2023-01-01T12:00:00Z"), new Date("2023-01-01T12:00:00Z")];
		await expectDate(dates).toHaveDatesDescendingOrder();
	});

	test("should pass with dates having different times on same day", async () => {
		const dates = [
			new Date("2023-01-01T18:00:00Z"),
			new Date("2023-01-01T12:00:00Z"),
			new Date("2023-01-01T08:00:00Z"),
		];
		await expectDate(dates).toHaveDatesDescendingOrder();
	});

	test("should fail when Date array is not in descending order", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-03"), new Date("2023-01-02")];

		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDatesDescendingOrder");
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should fail when string date array is not in descending order", async () => {
		const dates = ["2023-01-01", "2023-01-03", "2023-01-02"];

		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDatesDescendingOrder");
	});

	test("should fail when Date array is in ascending order", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];

		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should throw error for invalid date string in array", async () => {
		const dates = ["2023-01-03", "invalid-date", "2023-01-01"];

		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Invalid date string");
	});

	test("should work with .not for ascending arrays", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-02"), new Date("2023-01-03")];
		await expectDate(dates).not.toHaveDatesDescendingOrder();
	});

	test("should fail with .not for descending arrays", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-02"), new Date("2023-01-01")];

		let error: Error | undefined;
		try {
			await expectDate(dates).not.toHaveDatesDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle dates spanning years", async () => {
		const dates = [new Date("2023-01-02"), new Date("2023-01-01"), new Date("2022-12-31")];
		await expectDate(dates).toHaveDatesDescendingOrder();
	});

	test("should handle ISO string dates with time zones", async () => {
		const dates = ["2023-01-02T00:00:00-05:00", "2023-01-01T12:00:00+00:00", "2023-01-01T00:00:00Z"];
		await expectDate(dates).toHaveDatesDescendingOrder();
	});

	test("should handle very old and future dates", async () => {
		const dates = [new Date("2100-01-01"), new Date("2023-01-01"), new Date("1900-01-01")];
		await expectDate(dates).toHaveDatesDescendingOrder();
	});

	test("should handle all same dates", async () => {
		const date = new Date("2023-01-01T12:00:00Z");
		const dates = [date, date, date];
		await expectDate(dates).toHaveDatesDescendingOrder();
	});
});

test.describe("toBeBefore", () => {
	test("should pass when actual date is before expected", async () => {
		const actual = new Date("2023-01-01");
		const expected = new Date("2023-01-02");
		await expectDate(actual).toBeBefore(expected);
	});

	test("should pass with string dates", async () => {
		await expectDate("2023-01-01").toBeBefore("2023-01-02");
	});

	test("should pass when dates differ by milliseconds", async () => {
		const actual = new Date("2023-01-01T12:00:00.000Z");
		const expected = new Date("2023-01-01T12:00:00.001Z");
		await expectDate(actual).toBeBefore(expected);
	});

	test("should fail when actual date is after expected", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-02")).toBeBefore(new Date("2023-01-01"));
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
			await expectDate(date).toBeBefore(date);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectDate(new Date("2023-01-02")).not.toBeBefore(new Date("2023-01-01"));
	});

	test("should fail with .not when actual is before", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-01")).not.toBeBefore(new Date("2023-01-02"));
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
		await expectDate(actual).toBeAfter(expected);
	});

	test("should pass with string dates", async () => {
		await expectDate("2023-01-02").toBeAfter("2023-01-01");
	});

	test("should pass when dates differ by milliseconds", async () => {
		const actual = new Date("2023-01-01T12:00:00.001Z");
		const expected = new Date("2023-01-01T12:00:00.000Z");
		await expectDate(actual).toBeAfter(expected);
	});

	test("should fail when actual date is before expected", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-01")).toBeAfter(new Date("2023-01-02"));
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
			await expectDate(date).toBeAfter(date);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectDate(new Date("2023-01-01")).not.toBeAfter(new Date("2023-01-02"));
	});

	test("should fail with .not when actual is after", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-02")).not.toBeAfter(new Date("2023-01-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to not be after");
	});
});

test.describe("toBeBetween", () => {
	test("should pass when date is between start and end", async () => {
		await expectDate(new Date("2023-01-15")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass with string dates", async () => {
		await expectDate("2023-01-15").toBeBetween("2023-01-01", "2023-01-31");
	});

	test("should pass when date equals start", async () => {
		await expectDate(new Date("2023-01-01")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass when date equals end", async () => {
		await expectDate(new Date("2023-01-31")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should fail when date is before start", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2022-12-31")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be between");
	});

	test("should fail when date is after end", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-02-01")).toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectDate(new Date("2023-02-15")).not.toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should fail with .not when date is between", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-15")).not.toBeBetween(new Date("2023-01-01"), new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to not be between");
	});
});

test.describe("toBeSameDay", () => {
	test("should pass when dates are on the same day", async () => {
		await expectDate(new Date("2023-01-15T08:00:00Z")).toBeSameDay(new Date("2023-01-15T20:00:00Z"));
	});

	test("should pass with string dates", async () => {
		await expectDate("2023-01-15T08:00:00Z").toBeSameDay("2023-01-15T20:00:00Z");
	});

	test("should pass when dates are identical", async () => {
		const date = new Date("2023-01-15T12:00:00Z");
		await expectDate(date).toBeSameDay(date);
	});

	test("should fail when dates are on different days", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-15")).toBeSameDay(new Date("2023-01-16"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to be the same day");
	});

	test("should fail when dates are in different months", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-31")).toBeSameDay(new Date("2023-02-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectDate(new Date("2023-01-15")).not.toBeSameDay(new Date("2023-01-16"));
	});

	test("should fail with .not when dates are same day", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-15T08:00:00Z")).not.toBeSameDay(new Date("2023-01-15T20:00:00Z"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to not be the same day");
	});
});

test.describe("toBeSameMonth", () => {
	test("should pass when dates are in the same month", async () => {
		await expectDate(new Date("2023-01-01")).toBeSameMonth(new Date("2023-01-31"));
	});

	test("should pass with string dates", async () => {
		await expectDate("2023-01-15").toBeSameMonth("2023-01-25");
	});

	test("should fail when dates are in different months", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-31")).toBeSameMonth(new Date("2023-02-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to be in the same month");
	});

	test("should fail when dates are in different years", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-15")).toBeSameMonth(new Date("2024-01-15"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectDate(new Date("2023-01-15")).not.toBeSameMonth(new Date("2023-02-15"));
	});

	test("should fail with .not when dates are same month", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-01")).not.toBeSameMonth(new Date("2023-01-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to not be in the same month");
	});
});

test.describe("toBeSameYear", () => {
	test("should pass when dates are in the same year", async () => {
		await expectDate(new Date("2023-01-01")).toBeSameYear(new Date("2023-12-31"));
	});

	test("should pass with string dates", async () => {
		await expectDate("2023-03-15").toBeSameYear("2023-09-25");
	});

	test("should fail when dates are in different years", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-12-31")).toBeSameYear(new Date("2024-01-01"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to be in the same year");
	});

	test("should work with .not", async () => {
		await expectDate(new Date("2023-01-15")).not.toBeSameYear(new Date("2024-01-15"));
	});

	test("should fail with .not when dates are same year", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-01")).not.toBeSameYear(new Date("2023-12-31"));
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected dates to not be in the same year");
	});
});

test.describe("toBeToday", () => {
	test("should pass when date is today", async () => {
		await expectDate(new Date()).toBeToday();
	});

	test("should pass with different times on same day", async () => {
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		await expectDate(today).toBeToday();
	});

	test("should fail when date is yesterday", async () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		let error: Error | undefined;
		try {
			await expectDate(yesterday).toBeToday();
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
			await expectDate(tomorrow).toBeToday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for past dates", async () => {
		await expectDate(new Date("2020-01-01")).not.toBeToday();
	});

	test("should fail with .not when date is today", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date()).not.toBeToday();
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
		await expectDate(yesterday).toBeYesterday();
	});

	test("should pass with different times on yesterday", async () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(23, 59, 59, 999);
		await expectDate(yesterday).toBeYesterday();
	});

	test("should fail when date is today", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date()).toBeYesterday();
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
			await expectDate(twoDaysAgo).toBeYesterday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for today", async () => {
		await expectDate(new Date()).not.toBeYesterday();
	});
});

test.describe("toBeTomorrow", () => {
	test("should pass when date is tomorrow", async () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		await expectDate(tomorrow).toBeTomorrow();
	});

	test("should pass with different times on tomorrow", async () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(23, 59, 59, 999);
		await expectDate(tomorrow).toBeTomorrow();
	});

	test("should fail when date is today", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date()).toBeTomorrow();
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
			await expectDate(twoDaysLater).toBeTomorrow();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for today", async () => {
		await expectDate(new Date()).not.toBeTomorrow();
	});
});

test.describe("toBeWeekday", () => {
	test("should pass for Monday", async () => {
		const monday = new Date("2023-01-02"); // A Monday
		await expectDate(monday).toBeWeekday();
	});

	test("should pass for Tuesday", async () => {
		const tuesday = new Date("2023-01-03");
		await expectDate(tuesday).toBeWeekday();
	});

	test("should pass for Wednesday", async () => {
		const wednesday = new Date("2023-01-04");
		await expectDate(wednesday).toBeWeekday();
	});

	test("should pass for Thursday", async () => {
		const thursday = new Date("2023-01-05");
		await expectDate(thursday).toBeWeekday();
	});

	test("should pass for Friday", async () => {
		const friday = new Date("2023-01-06");
		await expectDate(friday).toBeWeekday();
	});

	test("should fail for Saturday", async () => {
		const saturday = new Date("2023-01-07");
		let error: Error | undefined;
		try {
			await expectDate(saturday).toBeWeekday();
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
			await expectDate(sunday).toBeWeekday();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Sunday");
	});

	test("should work with .not for weekend", async () => {
		await expectDate(new Date("2023-01-07")).not.toBeWeekday(); // Saturday
	});
});

test.describe("toBeWeekend", () => {
	test("should pass for Saturday", async () => {
		const saturday = new Date("2023-01-07");
		await expectDate(saturday).toBeWeekend();
	});

	test("should pass for Sunday", async () => {
		const sunday = new Date("2023-01-01");
		await expectDate(sunday).toBeWeekend();
	});

	test("should fail for Monday", async () => {
		const monday = new Date("2023-01-02");
		let error: Error | undefined;
		try {
			await expectDate(monday).toBeWeekend();
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
			await expectDate(friday).toBeWeekend();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Friday");
	});

	test("should work with .not for weekday", async () => {
		await expectDate(new Date("2023-01-02")).not.toBeWeekend(); // Monday
	});
});

test.describe("toBeInThePast", () => {
	test("should pass for dates in the past", async () => {
		await expectDate(new Date("2020-01-01")).toBeInThePast();
	});

	test("should pass for one second ago", async () => {
		const oneSecondAgo = new Date(Date.now() - 1000);
		await expectDate(oneSecondAgo).toBeInThePast();
	});

	test("should fail for future dates", async () => {
		const future = new Date(Date.now() + 10000);
		let error: Error | undefined;
		try {
			await expectDate(future).toBeInThePast();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be in the past");
	});

	test("should work with .not for future dates", async () => {
		const future = new Date(Date.now() + 10000);
		await expectDate(future).not.toBeInThePast();
	});
});

test.describe("toBeInTheFuture", () => {
	test("should pass for dates in the future", async () => {
		const future = new Date(Date.now() + 10000);
		await expectDate(future).toBeInTheFuture();
	});

	test("should pass for one second from now", async () => {
		const oneSecondLater = new Date(Date.now() + 1000);
		await expectDate(oneSecondLater).toBeInTheFuture();
	});

	test("should fail for past dates", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2020-01-01")).toBeInTheFuture();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date to be in the future");
	});

	test("should work with .not for past dates", async () => {
		await expectDate(new Date("2020-01-01")).not.toBeInTheFuture();
	});
});

test.describe("toBeLeapYear", () => {
	test("should pass for leap year divisible by 4", async () => {
		await expectDate(new Date("2024-01-01")).toBeLeapYear();
	});

	test("should pass for leap year divisible by 400", async () => {
		await expectDate(new Date("2000-01-01")).toBeLeapYear();
	});

	test("should pass for 2020", async () => {
		await expectDate(new Date("2020-06-15")).toBeLeapYear();
	});

	test("should fail for non-leap year", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("2023-01-01")).toBeLeapYear();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected year to be a leap year");
	});

	test("should fail for year divisible by 100 but not 400", async () => {
		let error: Error | undefined;
		try {
			await expectDate(new Date("1900-01-01")).toBeLeapYear();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for non-leap year", async () => {
		await expectDate(new Date("2023-01-01")).not.toBeLeapYear();
	});
});

test.describe("toHaveDateRange", () => {
	test("should pass when array has expected day range", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-11")];
		await expectDate(dates).toHaveDateRange({ days: 10 });
	});

	test("should pass with month range", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-02-01")];
		await expectDate(dates).toHaveDateRange({ months: 1 });
	});

	test("should pass with year range", async () => {
		const dates = [new Date("2023-01-01"), new Date("2024-01-01")];
		await expectDate(dates).toHaveDateRange({ years: 1 });
	});

	test("should pass with combined range", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-02-11")];
		await expectDate(dates).toHaveDateRange({ months: 1, days: 10 });
	});

	test("should pass with unsorted dates", async () => {
		const dates = [new Date("2023-01-11"), new Date("2023-01-01"), new Date("2023-01-05")];
		await expectDate(dates).toHaveDateRange({ days: 10 });
	});

	test("should fail when range doesn't match", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-11")];
		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDateRange({ days: 20 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected date range to match");
	});

	test("should throw for empty array", async () => {
		let error: Error | undefined;
		try {
			await expectDate([]).toHaveDateRange({ days: 10 });
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
		await expectDate(dates).toHaveConsecutiveDates("day");
	});

	test("should pass for consecutive months", async () => {
		const dates = [new Date("2023-01-15"), new Date("2023-02-15"), new Date("2023-03-15")];
		await expectDate(dates).toHaveConsecutiveDates("month");
	});

	test("should pass for consecutive years", async () => {
		const dates = [new Date("2021-06-15"), new Date("2022-06-15"), new Date("2023-06-15")];
		await expectDate(dates).toHaveConsecutiveDates("year");
	});

	test("should pass with unsorted dates", async () => {
		const dates = [new Date("2023-01-03"), new Date("2023-01-01"), new Date("2023-01-02")];
		await expectDate(dates).toHaveConsecutiveDates("day");
	});

	test("should fail for non-consecutive days", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-03")];
		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveConsecutiveDates("day");
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
			await expectDate(dates).toHaveConsecutiveDates("month");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should throw for array with less than 2 dates", async () => {
		let error: Error | undefined;
		try {
			await expectDate([new Date()]).toHaveConsecutiveDates("day");
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
		await expectDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass with dates at boundaries", async () => {
		const dates = [new Date("2023-01-01"), new Date("2023-01-15"), new Date("2023-01-31")];
		await expectDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
	});

	test("should pass with string dates", async () => {
		const dates = ["2023-01-10", "2023-01-15", "2023-01-20"];
		await expectDate(dates).toHaveDatesWithinRange("2023-01-01", "2023-01-31");
	});

	test("should fail when some dates are out of range", async () => {
		const dates = [new Date("2022-12-31"), new Date("2023-01-15"), new Date("2023-02-01")];
		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
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
			await expectDate([]).toHaveDatesWithinRange(new Date("2023-01-01"), new Date("2023-01-31"));
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
		await expectDate(dates).toHaveUniqueDates();
	});

	test("should pass with unique dates ignoring time", async () => {
		const dates = [
			new Date("2023-01-01T08:00:00Z"),
			new Date("2023-01-02T12:00:00Z"),
			new Date("2023-01-03T18:00:00Z"),
		];
		await expectDate(dates).toHaveUniqueDates(true);
	});

	test("should fail when dates have duplicates", async () => {
		const date = new Date("2023-01-01T12:00:00Z");
		const dates = [date, new Date("2023-01-02"), date];
		let error: Error | undefined;
		try {
			await expectDate(dates).toHaveUniqueDates();
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
			await expectDate(dates).toHaveUniqueDates(true);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should pass when same day but different times without ignoreTime", async () => {
		const dates = [new Date("2023-01-01T08:00:00Z"), new Date("2023-01-01T12:00:00Z")];
		await expectDate(dates).toHaveUniqueDates(false);
	});

	test("should throw for empty array", async () => {
		let error: Error | undefined;
		try {
			await expectDate([]).toHaveUniqueDates();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Array must contain at least one date");
	});
});

test.describe("toBeValidISODate", () => {
	test("should pass for valid ISO date with milliseconds", async () => {
		await expectDate("2023-01-15T12:30:45.123Z").toBeValidISODate();
	});

	test("should pass for valid ISO date without milliseconds", async () => {
		await expectDate("2023-01-15T12:30:45Z").toBeValidISODate();
	});

	test("should pass for valid ISO date without Z", async () => {
		await expectDate("2023-01-15T12:30:45").toBeValidISODate();
	});

	test("should fail for invalid ISO format", async () => {
		let error: Error | undefined;
		try {
			await expectDate("2023-01-15").toBeValidISODate();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected string to be a valid ISO 8601 date");
	});

	test("should fail for invalid date values", async () => {
		let error: Error | undefined;
		try {
			await expectDate("2023-13-45T99:99:99Z").toBeValidISODate();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for non-ISO format", async () => {
		let error: Error | undefined;
		try {
			await expectDate("01/15/2023").toBeValidISODate();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for invalid format", async () => {
		await expectDate("not-a-date").not.toBeValidISODate();
	});

	test("should fail with .not for valid ISO date", async () => {
		let error: Error | undefined;
		try {
			await expectDate("2023-01-15T12:30:45.123Z").not.toBeValidISODate();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected string to not be a valid ISO 8601 date");
	});
});
