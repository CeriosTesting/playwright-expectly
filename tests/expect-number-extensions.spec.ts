import { expect, test } from "@playwright/test";
import { expectNumber } from "../src/expect-number-extensions";

test.describe("toHaveAscendingOrder", () => {
	test("should pass when number array is in ascending order", async () => {
		const ascendingNumbers = [1, 2, 3, 4, 5];
		await expectNumber(ascendingNumbers).toHaveAscendingOrder();
	});

	test("should pass for single element array", async () => {
		await expectNumber([42]).toHaveAscendingOrder();
	});

	test("should pass for empty array", async () => {
		await expectNumber([]).toHaveAscendingOrder();
	});

	test("should pass for array with duplicate values", async () => {
		const withDuplicates = [1, 2, 2, 3, 4, 4, 5];
		await expectNumber(withDuplicates).toHaveAscendingOrder();
	});

	test("should pass for negative numbers in ascending order", async () => {
		const negativeNumbers = [-10, -5, 0, 5, 10];
		await expectNumber(negativeNumbers).toHaveAscendingOrder();
	});

	test("should pass for decimal numbers in ascending order", async () => {
		const decimals = [1.1, 2.5, 3.7, 4.9];
		await expectNumber(decimals).toHaveAscendingOrder();
	});

	test("should fail when number array is not in ascending order", async () => {
		const unordered = [3, 1, 4, 2, 5];

		let error: Error | undefined;
		try {
			await expectNumber(unordered).toHaveAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveAscendingOrder");
	});

	test("should fail when number array is in descending order", async () => {
		const descending = [5, 4, 3, 2, 1];

		let error: Error | undefined;
		try {
			await expectNumber(descending).toHaveAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should pass when string array is in ascending order", async () => {
		const ascendingStrings = ["apple", "banana", "cherry", "date"];
		await expectNumber(ascendingStrings).toHaveAscendingOrder();
	});

	test("should pass for string array with case-sensitive ordering", async () => {
		const strings = ["A", "B", "C", "a", "b", "c"];
		await expectNumber(strings).toHaveAscendingOrder();
	});

	test("should fail when string array is not in ascending order", async () => {
		const unorderedStrings = ["cherry", "apple", "date", "banana"];

		let error: Error | undefined;
		try {
			await expectNumber(unorderedStrings).toHaveAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveAscendingOrder");
	});

	test("should work with .not for descending arrays", async () => {
		const descending = [5, 4, 3, 2, 1];
		await expectNumber(descending).not.toHaveAscendingOrder();
	});

	test("should fail with .not for ascending arrays", async () => {
		const ascending = [1, 2, 3, 4, 5];

		let error: Error | undefined;
		try {
			await expectNumber(ascending).not.toHaveAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle large arrays", async () => {
		const largeArray = Array.from({ length: 1000 }, (_, i) => i);
		await expectNumber(largeArray).toHaveAscendingOrder();
	});

	test("should handle all same values", async () => {
		const sameValues = [5, 5, 5, 5, 5];
		await expectNumber(sameValues).toHaveAscendingOrder();
	});
});

test.describe("toHaveDescendingOrder", () => {
	test("should pass when number array is in descending order", async () => {
		const descendingNumbers = [5, 4, 3, 2, 1];
		await expectNumber(descendingNumbers).toHaveDescendingOrder();
	});

	test("should pass for single element array", async () => {
		await expectNumber([42]).toHaveDescendingOrder();
	});

	test("should pass for empty array", async () => {
		await expectNumber([]).toHaveDescendingOrder();
	});

	test("should pass for array with duplicate values", async () => {
		const withDuplicates = [5, 4, 4, 3, 2, 2, 1];
		await expectNumber(withDuplicates).toHaveDescendingOrder();
	});

	test("should pass for negative numbers in descending order", async () => {
		const negativeNumbers = [10, 5, 0, -5, -10];
		await expectNumber(negativeNumbers).toHaveDescendingOrder();
	});

	test("should pass for decimal numbers in descending order", async () => {
		const decimals = [4.9, 3.7, 2.5, 1.1];
		await expectNumber(decimals).toHaveDescendingOrder();
	});

	test("should fail when number array is not in descending order", async () => {
		const unordered = [3, 5, 1, 4, 2];

		let error: Error | undefined;
		try {
			await expectNumber(unordered).toHaveDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDescendingOrder");
	});

	test("should fail when number array is in ascending order", async () => {
		const ascending = [1, 2, 3, 4, 5];

		let error: Error | undefined;
		try {
			await expectNumber(ascending).toHaveDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should pass when string array is in descending order", async () => {
		const descendingStrings = ["date", "cherry", "banana", "apple"];
		await expectNumber(descendingStrings).toHaveDescendingOrder();
	});

	test("should pass for string array with case-sensitive ordering", async () => {
		const strings = ["c", "b", "a", "C", "B", "A"];
		await expectNumber(strings).toHaveDescendingOrder();
	});

	test("should fail when string array is not in descending order", async () => {
		const unorderedStrings = ["cherry", "apple", "date", "banana"];

		let error: Error | undefined;
		try {
			await expectNumber(unorderedStrings).toHaveDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDescendingOrder");
	});

	test("should work with .not for ascending arrays", async () => {
		const ascending = [1, 2, 3, 4, 5];
		await expectNumber(ascending).not.toHaveDescendingOrder();
	});

	test("should fail with .not for descending arrays", async () => {
		const descending = [5, 4, 3, 2, 1];

		let error: Error | undefined;
		try {
			await expectNumber(descending).not.toHaveDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle large arrays", async () => {
		const largeArray = Array.from({ length: 1000 }, (_, i) => 1000 - i);
		await expectNumber(largeArray).toHaveDescendingOrder();
	});

	test("should handle all same values", async () => {
		const sameValues = [5, 5, 5, 5, 5];
		await expectNumber(sameValues).toHaveDescendingOrder();
	});

	test("should handle mixed positive and negative", async () => {
		const mixed = [100, 50, 0, -50, -100];
		await expectNumber(mixed).toHaveDescendingOrder();
	});
});

test.describe("toHaveSum", () => {
	test("should pass when sum equals expected value", async () => {
		await expectNumber([1, 2, 3, 4]).toHaveSum(10);
	});

	test("should pass for negative numbers", async () => {
		await expectNumber([-5, -3, -2]).toHaveSum(-10);
	});

	test("should pass for mixed positive and negative", async () => {
		await expectNumber([10, -5, 3, -2]).toHaveSum(6);
	});

	test("should pass for empty array", async () => {
		await expectNumber([]).toHaveSum(0);
	});

	test("should pass for single element", async () => {
		await expectNumber([42]).toHaveSum(42);
	});

	test("should pass for decimal numbers", async () => {
		await expectNumber([1.5, 2.5, 3.0]).toHaveSum(7);
	});

	test("should fail when sum does not match", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 3]).toHaveSum(10);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected sum");
	});

	test("should work with .not", async () => {
		await expectNumber([1, 2, 3]).not.toHaveSum(10);
	});
});

test.describe("toHaveAverage", () => {
	test("should pass when average equals expected value", async () => {
		await expectNumber([2, 4, 6, 8]).toHaveAverage(5);
	});

	test("should pass for single element", async () => {
		await expectNumber([42]).toHaveAverage(42);
	});

	test("should pass for negative numbers", async () => {
		await expectNumber([-10, -5, 0]).toHaveAverage(-5);
	});

	test("should pass for decimals", async () => {
		await expectNumber([1.5, 2.5, 3.5]).toHaveAverage(2.5);
	});

	test("should fail when average does not match", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 3]).toHaveAverage(10);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected average");
	});

	test("should work with .not", async () => {
		await expectNumber([1, 2, 3]).not.toHaveAverage(10);
	});
});

test.describe("toHaveMedian", () => {
	test("should pass for odd-length array", async () => {
		await expectNumber([1, 2, 3, 4, 5]).toHaveMedian(3);
	});

	test("should pass for even-length array", async () => {
		await expectNumber([1, 2, 3, 4]).toHaveMedian(2.5);
	});

	test("should pass for unsorted array", async () => {
		await expectNumber([5, 1, 3, 2, 4]).toHaveMedian(3);
	});

	test("should pass for single element", async () => {
		await expectNumber([42]).toHaveMedian(42);
	});

	test("should pass for negative numbers", async () => {
		await expectNumber([-5, -3, -1]).toHaveMedian(-3);
	});

	test("should fail when median does not match", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 3]).toHaveMedian(10);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected median");
	});

	test("should work with .not", async () => {
		await expectNumber([1, 2, 3]).not.toHaveMedian(10);
	});
});

test.describe("toHaveMin", () => {
	test("should pass when minimum equals expected value", async () => {
		await expectNumber([5, 2, 8, 1, 9]).toHaveMin(1);
	});

	test("should pass for negative numbers", async () => {
		await expectNumber([5, -3, 0, 2]).toHaveMin(-3);
	});

	test("should pass for single element", async () => {
		await expectNumber([42]).toHaveMin(42);
	});

	test("should fail when minimum does not match", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([5, 2, 8]).toHaveMin(1);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected minimum");
	});

	test("should work with .not", async () => {
		await expectNumber([5, 2, 8]).not.toHaveMin(1);
	});
});

test.describe("toHaveMax", () => {
	test("should pass when maximum equals expected value", async () => {
		await expectNumber([5, 2, 8, 1, 9]).toHaveMax(9);
	});

	test("should pass for negative numbers", async () => {
		await expectNumber([-5, -3, -10, -2]).toHaveMax(-2);
	});

	test("should pass for single element", async () => {
		await expectNumber([42]).toHaveMax(42);
	});

	test("should fail when maximum does not match", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([5, 2, 8]).toHaveMax(20);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected maximum");
	});

	test("should work with .not", async () => {
		await expectNumber([5, 2, 8]).not.toHaveMax(20);
	});
});

test.describe("toHaveRange", () => {
	test("should pass when range equals expected value", async () => {
		await expectNumber([1, 5, 3, 9, 2]).toHaveRange(8);
	});

	test("should pass for negative numbers", async () => {
		await expectNumber([-10, -5, 0, 5]).toHaveRange(15);
	});

	test("should pass for single element (range 0)", async () => {
		await expectNumber([42]).toHaveRange(0);
	});

	test("should pass for all same values", async () => {
		await expectNumber([5, 5, 5, 5]).toHaveRange(0);
	});

	test("should fail when range does not match", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 5, 9]).toHaveRange(10);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected range");
	});

	test("should work with .not", async () => {
		await expectNumber([1, 5, 9]).not.toHaveRange(10);
	});
});

test.describe("toBeAllBetween", () => {
	test("should pass when all values are within range", async () => {
		await expectNumber([2, 3, 4, 5]).toBeAllBetween(1, 6);
	});

	test("should pass with inclusive bounds", async () => {
		await expectNumber([1, 2, 3, 4, 5]).toBeAllBetween(1, 5);
	});

	test("should pass for single element", async () => {
		await expectNumber([3]).toBeAllBetween(1, 5);
	});

	test("should fail when value is below minimum", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([0, 2, 3]).toBeAllBetween(1, 5);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Out of range");
	});

	test("should fail when value is above maximum", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([2, 3, 6]).toBeAllBetween(1, 5);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Out of range");
	});

	test("should work with .not", async () => {
		await expectNumber([0, 2, 6]).not.toBeAllBetween(1, 5);
	});
});

test.describe("toBeAllPositive", () => {
	test("should pass when all values are positive", async () => {
		await expectNumber([1, 2, 3, 4, 5]).toBeAllPositive();
	});

	test("should pass for decimals", async () => {
		await expectNumber([0.1, 1.5, 2.7]).toBeAllPositive();
	});

	test("should fail for zero", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 0, 2]).toBeAllPositive();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Non-positive");
	});

	test("should fail for negative values", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, -1]).toBeAllPositive();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectNumber([1, 0, -1]).not.toBeAllPositive();
	});
});

test.describe("toBeAllNegative", () => {
	test("should pass when all values are negative", async () => {
		await expectNumber([-1, -2, -3, -4, -5]).toBeAllNegative();
	});

	test("should pass for negative decimals", async () => {
		await expectNumber([-0.1, -1.5, -2.7]).toBeAllNegative();
	});

	test("should fail for zero", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([-1, 0, -2]).toBeAllNegative();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Non-negative");
	});

	test("should fail for positive values", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([-1, -2, 1]).toBeAllNegative();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectNumber([-1, 0, 1]).not.toBeAllNegative();
	});
});

test.describe("toBeAllIntegers", () => {
	test("should pass when all values are integers", async () => {
		await expectNumber([1, 2, 3, 4, 5]).toBeAllIntegers();
	});

	test("should pass for negative integers", async () => {
		await expectNumber([-5, -3, 0, 2, 4]).toBeAllIntegers();
	});

	test("should pass for zero", async () => {
		await expectNumber([0]).toBeAllIntegers();
	});

	test("should fail for decimals", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2.5, 3]).toBeAllIntegers();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Non-integer");
	});

	test("should work with .not", async () => {
		await expectNumber([1.5, 2.7, 3.9]).not.toBeAllIntegers();
	});
});

test.describe("toBeAllGreaterThan", () => {
	test("should pass when all values are greater than threshold", async () => {
		await expectNumber([5, 6, 7, 8]).toBeAllGreaterThan(4);
	});

	test("should fail when value equals threshold", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([5, 6, 7]).toBeAllGreaterThan(5);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not greater than");
	});

	test("should fail when value is less than threshold", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([5, 6, 3]).toBeAllGreaterThan(4);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectNumber([1, 2, 3]).not.toBeAllGreaterThan(5);
	});
});

test.describe("toBeAllLessThan", () => {
	test("should pass when all values are less than threshold", async () => {
		await expectNumber([1, 2, 3, 4]).toBeAllLessThan(5);
	});

	test("should fail when value equals threshold", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([3, 4, 5]).toBeAllLessThan(5);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not less than");
	});

	test("should fail when value is greater than threshold", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([3, 4, 6]).toBeAllLessThan(5);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectNumber([6, 7, 8]).not.toBeAllLessThan(5);
	});
});

test.describe("toHaveStrictlyAscendingOrder", () => {
	test("should pass for strictly ascending array", async () => {
		await expectNumber([1, 2, 3, 4, 5]).toHaveStrictlyAscendingOrder();
	});

	test("should pass for negative numbers", async () => {
		await expectNumber([-10, -5, 0, 5, 10]).toHaveStrictlyAscendingOrder();
	});

	test("should pass for decimals", async () => {
		await expectNumber([1.1, 2.2, 3.3]).toHaveStrictlyAscendingOrder();
	});

	test("should fail for equal consecutive values", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 2, 3]).toHaveStrictlyAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("violation");
	});

	test("should fail for descending order", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([5, 4, 3]).toHaveStrictlyAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectNumber([1, 2, 2, 3]).not.toHaveStrictlyAscendingOrder();
	});
});

test.describe("toHaveStrictlyDescendingOrder", () => {
	test("should pass for strictly descending array", async () => {
		await expectNumber([5, 4, 3, 2, 1]).toHaveStrictlyDescendingOrder();
	});

	test("should pass for negative numbers", async () => {
		await expectNumber([10, 5, 0, -5, -10]).toHaveStrictlyDescendingOrder();
	});

	test("should pass for decimals", async () => {
		await expectNumber([3.3, 2.2, 1.1]).toHaveStrictlyDescendingOrder();
	});

	test("should fail for equal consecutive values", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([3, 2, 2, 1]).toHaveStrictlyDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("violation");
	});

	test("should fail for ascending order", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 3]).toHaveStrictlyDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectNumber([3, 2, 2, 1]).not.toHaveStrictlyDescendingOrder();
	});
});

test.describe("toBeMonotonic", () => {
	test("should pass for ascending array", async () => {
		await expectNumber([1, 2, 3, 4, 5]).toBeMonotonic();
	});

	test("should pass for descending array", async () => {
		await expectNumber([5, 4, 3, 2, 1]).toBeMonotonic();
	});

	test("should pass for array with equal values ascending", async () => {
		await expectNumber([1, 2, 2, 3]).toBeMonotonic();
	});

	test("should pass for array with equal values descending", async () => {
		await expectNumber([3, 2, 2, 1]).toBeMonotonic();
	});

	test("should pass for all same values", async () => {
		await expectNumber([5, 5, 5, 5]).toBeMonotonic();
	});

	test("should pass for empty array", async () => {
		await expectNumber([]).toBeMonotonic();
	});

	test("should pass for single element", async () => {
		await expectNumber([42]).toBeMonotonic();
	});

	test("should fail for mixed ordering", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 3, 2, 4]).toBeMonotonic();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("mixed ordering");
	});

	test("should work with .not", async () => {
		await expectNumber([1, 3, 2, 4]).not.toBeMonotonic();
	});
});

test.describe("toHaveUniqueValues", () => {
	test("should pass for array with unique values", async () => {
		await expectNumber([1, 2, 3, 4, 5]).toHaveUniqueValues();
	});

	test("should pass for single element", async () => {
		await expectNumber([42]).toHaveUniqueValues();
	});

	test("should pass for empty array", async () => {
		await expectNumber([]).toHaveUniqueValues();
	});

	test("should fail for array with duplicates", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 2, 3]).toHaveUniqueValues();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Duplicate values");
	});

	test("should fail for multiple duplicates", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 2, 3, 3, 4]).toHaveUniqueValues();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectNumber([1, 2, 2, 3]).not.toHaveUniqueValues();
	});
});

test.describe("toHaveConsecutiveIntegers", () => {
	test("should pass for consecutive integers in order", async () => {
		await expectNumber([1, 2, 3, 4, 5]).toHaveConsecutiveIntegers();
	});

	test("should pass for consecutive integers unordered", async () => {
		await expectNumber([3, 1, 4, 2, 5]).toHaveConsecutiveIntegers();
	});

	test("should pass for negative consecutive integers", async () => {
		await expectNumber([-2, -1, 0, 1, 2]).toHaveConsecutiveIntegers();
	});

	test("should pass for single element", async () => {
		await expectNumber([42]).toHaveConsecutiveIntegers();
	});

	test("should fail for gap in sequence", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 4, 5]).toHaveConsecutiveIntegers();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Found gap");
	});

	test("should fail for non-integers", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1.5, 2.5, 3.5]).toHaveConsecutiveIntegers();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("only integers");
	});

	test("should fail for duplicates", async () => {
		let error: Error | undefined;
		try {
			await expectNumber([1, 2, 2, 3]).toHaveConsecutiveIntegers();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		await expectNumber([1, 2, 4, 5]).not.toHaveConsecutiveIntegers();
	});
});
