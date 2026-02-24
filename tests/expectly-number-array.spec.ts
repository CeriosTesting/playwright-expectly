import { expect, test } from "@playwright/test";

import { expectlyNumberArray } from "../src/expectly-number-array";

test.describe("toHaveAscendingOrder", () => {
	test("should pass when number array is in ascending order", () => {
		const ascendingNumbers = [1, 2, 3, 4, 5];
		expectlyNumberArray(ascendingNumbers).toHaveAscendingOrder();
	});

	test("should pass for single element array", () => {
		expectlyNumberArray([42]).toHaveAscendingOrder();
	});

	test("should pass for empty array", () => {
		expectlyNumberArray([]).toHaveAscendingOrder();
	});

	test("should pass for array with duplicate values", () => {
		const withDuplicates = [1, 2, 2, 3, 4, 4, 5];
		expectlyNumberArray(withDuplicates).toHaveAscendingOrder();
	});

	test("should pass for negative numbers in ascending order", () => {
		const negativeNumbers = [-10, -5, 0, 5, 10];
		expectlyNumberArray(negativeNumbers).toHaveAscendingOrder();
	});

	test("should pass for decimal numbers in ascending order", () => {
		const decimals = [1.1, 2.5, 3.7, 4.9];
		expectlyNumberArray(decimals).toHaveAscendingOrder();
	});

	test("should fail when number array is not in ascending order", () => {
		const unordered = [3, 1, 4, 2, 5];

		let error: Error | undefined;
		try {
			expectlyNumberArray(unordered).toHaveAscendingOrder();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveAscendingOrder");
	});

	test("should fail when number array is in descending order", () => {
		const descending = [5, 4, 3, 2, 1];

		let error: Error | undefined;
		try {
			expectlyNumberArray(descending).toHaveAscendingOrder();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should work with .not for descending arrays", () => {
		const descending = [5, 4, 3, 2, 1];
		expectlyNumberArray(descending).not.toHaveAscendingOrder();
	});

	test("should fail with .not for ascending arrays", () => {
		const ascending = [1, 2, 3, 4, 5];
		expect(() => {
			expectlyNumberArray(ascending).not.toHaveAscendingOrder();
		}).toThrow(/not/);
	});

	test("should handle large arrays", () => {
		const largeArray = Array.from({ length: 1000 }, (_, i) => i);
		expectlyNumberArray(largeArray).toHaveAscendingOrder();
	});

	test("should handle all same values", () => {
		const sameValues = [5, 5, 5, 5, 5];
		expectlyNumberArray(sameValues).toHaveAscendingOrder();
	});
});

test.describe("toHaveDescendingOrder", () => {
	test("should pass when number array is in descending order", () => {
		const descendingNumbers = [5, 4, 3, 2, 1];
		expectlyNumberArray(descendingNumbers).toHaveDescendingOrder();
	});

	test("should pass for single element array", () => {
		expectlyNumberArray([42]).toHaveDescendingOrder();
	});

	test("should pass for empty array", () => {
		expectlyNumberArray([]).toHaveDescendingOrder();
	});

	test("should pass for array with duplicate values", () => {
		const withDuplicates = [5, 4, 4, 3, 2, 2, 1];
		expectlyNumberArray(withDuplicates).toHaveDescendingOrder();
	});

	test("should pass for negative numbers in descending order", () => {
		const negativeNumbers = [10, 5, 0, -5, -10];
		expectlyNumberArray(negativeNumbers).toHaveDescendingOrder();
	});

	test("should pass for decimal numbers in descending order", () => {
		const decimals = [4.9, 3.7, 2.5, 1.1];
		expectlyNumberArray(decimals).toHaveDescendingOrder();
	});

	test("should fail when number array is not in descending order", () => {
		const unordered = [3, 5, 1, 4, 2];

		let error: Error | undefined;
		try {
			expectlyNumberArray(unordered).toHaveDescendingOrder();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDescendingOrder");
	});

	test("should fail when number array is in ascending order", () => {
		const ascending = [1, 2, 3, 4, 5];

		let error: Error | undefined;
		try {
			expectlyNumberArray(ascending).toHaveDescendingOrder();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should work with .not for ascending arrays", () => {
		const ascending = [1, 2, 3, 4, 5];
		expectlyNumberArray(ascending).not.toHaveDescendingOrder();
	});

	test("should fail with .not for descending arrays", () => {
		const descending = [5, 4, 3, 2, 1];
		expect(() => {
			expectlyNumberArray(descending).not.toHaveDescendingOrder();
		}).toThrow(/not/);
	});

	test("should handle large arrays", () => {
		const largeArray = Array.from({ length: 1000 }, (_, i) => 1000 - i);
		expectlyNumberArray(largeArray).toHaveDescendingOrder();
	});

	test("should handle all same values", () => {
		const sameValues = [5, 5, 5, 5, 5];
		expectlyNumberArray(sameValues).toHaveDescendingOrder();
	});

	test("should handle mixed positive and negative", () => {
		const mixed = [100, 50, 0, -50, -100];
		expectlyNumberArray(mixed).toHaveDescendingOrder();
	});
});

test.describe("toHaveSum", () => {
	test("should pass when sum equals expected value", () => {
		expectlyNumberArray([1, 2, 3, 4]).toHaveSum(10);
	});

	test("should pass for negative numbers", () => {
		expectlyNumberArray([-5, -3, -2]).toHaveSum(-10);
	});

	test("should pass for mixed positive and negative", () => {
		expectlyNumberArray([10, -5, 3, -2]).toHaveSum(6);
	});

	test("should pass for empty array", () => {
		expectlyNumberArray([]).toHaveSum(0);
	});

	test("should pass for single element", () => {
		expectlyNumberArray([42]).toHaveSum(42);
	});

	test("should pass for decimal numbers", () => {
		expectlyNumberArray([1.5, 2.5, 3.0]).toHaveSum(7);
	});

	test("should fail when sum does not match", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 2, 3]).toHaveSum(10);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected sum");
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 2, 3]).not.toHaveSum(10);
	});
});

test.describe("toHaveAverage", () => {
	test("should pass when average equals expected value", () => {
		expectlyNumberArray([2, 4, 6, 8]).toHaveAverage(5);
	});

	test("should pass for single element", () => {
		expectlyNumberArray([42]).toHaveAverage(42);
	});

	test("should pass for negative numbers", () => {
		expectlyNumberArray([-10, -5, 0]).toHaveAverage(-5);
	});

	test("should pass for decimals", () => {
		expectlyNumberArray([1.5, 2.5, 3.5]).toHaveAverage(2.5);
	});

	test("should fail when average does not match", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 2, 3]).toHaveAverage(10);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected average");
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 2, 3]).not.toHaveAverage(10);
	});
});

test.describe("toHaveMedian", () => {
	test("should pass for odd-length array", () => {
		expectlyNumberArray([1, 2, 3, 4, 5]).toHaveMedian(3);
	});

	test("should pass for even-length array", () => {
		expectlyNumberArray([1, 2, 3, 4]).toHaveMedian(2.5);
	});

	test("should pass for unsorted array", () => {
		expectlyNumberArray([5, 1, 3, 2, 4]).toHaveMedian(3);
	});

	test("should pass for single element", () => {
		expectlyNumberArray([42]).toHaveMedian(42);
	});

	test("should pass for negative numbers", () => {
		expectlyNumberArray([-5, -3, -1]).toHaveMedian(-3);
	});

	test("should fail when median does not match", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 2, 3]).toHaveMedian(10);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected median");
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 2, 3]).not.toHaveMedian(10);
	});
});

test.describe("toHaveMin", () => {
	test("should pass when minimum equals expected value", () => {
		expectlyNumberArray([5, 2, 8, 1, 9]).toHaveMin(1);
	});

	test("should pass for negative numbers", () => {
		expectlyNumberArray([5, -3, 0, 2]).toHaveMin(-3);
	});

	test("should pass for single element", () => {
		expectlyNumberArray([42]).toHaveMin(42);
	});

	test("should fail when minimum does not match", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([5, 2, 8]).toHaveMin(1);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected minimum");
	});

	test("should work with .not", () => {
		expectlyNumberArray([5, 2, 8]).not.toHaveMin(1);
	});
});

test.describe("toHaveMax", () => {
	test("should pass when maximum equals expected value", () => {
		expectlyNumberArray([5, 2, 8, 1, 9]).toHaveMax(9);
	});

	test("should pass for negative numbers", () => {
		expectlyNumberArray([-5, -3, -10, -2]).toHaveMax(-2);
	});

	test("should pass for single element", () => {
		expectlyNumberArray([42]).toHaveMax(42);
	});

	test("should fail when maximum does not match", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([5, 2, 8]).toHaveMax(20);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected maximum");
	});

	test("should work with .not", () => {
		expectlyNumberArray([5, 2, 8]).not.toHaveMax(20);
	});
});

test.describe("toHaveRange", () => {
	test("should pass when range equals expected value", () => {
		expectlyNumberArray([1, 5, 3, 9, 2]).toHaveRange(8);
	});

	test("should pass for negative numbers", () => {
		expectlyNumberArray([-10, -5, 0, 5]).toHaveRange(15);
	});

	test("should pass for single element (range 0)", () => {
		expectlyNumberArray([42]).toHaveRange(0);
	});

	test("should pass for all same values", () => {
		expectlyNumberArray([5, 5, 5, 5]).toHaveRange(0);
	});

	test("should fail when range does not match", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 5, 9]).toHaveRange(10);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected range");
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 5, 9]).not.toHaveRange(10);
	});
});

test.describe("toBeAllBetween", () => {
	test("should pass when all values are within range", () => {
		expectlyNumberArray([2, 3, 4, 5]).toBeAllBetween(1, 6);
	});

	test("should pass with inclusive bounds", () => {
		expectlyNumberArray([1, 2, 3, 4, 5]).toBeAllBetween(1, 5);
	});

	test("should pass for single element", () => {
		expectlyNumberArray([3]).toBeAllBetween(1, 5);
	});

	test("should fail when value is below minimum", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([0, 2, 3]).toBeAllBetween(1, 5);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Out of range");
	});

	test("should fail when value is above maximum", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([2, 3, 6]).toBeAllBetween(1, 5);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Out of range");
	});

	test("should work with .not", () => {
		expectlyNumberArray([0, 2, 6]).not.toBeAllBetween(1, 5);
	});
});

test.describe("toBeAllPositive", () => {
	test("should pass when all values are positive", () => {
		expectlyNumberArray([1, 2, 3, 4, 5]).toBeAllPositive();
	});

	test("should pass for decimals", () => {
		expectlyNumberArray([0.1, 1.5, 2.7]).toBeAllPositive();
	});

	test("should fail for zero", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 0, 2]).toBeAllPositive();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Non-positive");
	});

	test("should fail for negative values", () => {
		expect(() => {
			expectlyNumberArray([1, 2, -1]).toBeAllPositive();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 0, -1]).not.toBeAllPositive();
	});
});

test.describe("toBeAllNegative", () => {
	test("should pass when all values are negative", () => {
		expectlyNumberArray([-1, -2, -3, -4, -5]).toBeAllNegative();
	});

	test("should pass for negative decimals", () => {
		expectlyNumberArray([-0.1, -1.5, -2.7]).toBeAllNegative();
	});

	test("should fail for zero", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([-1, 0, -2]).toBeAllNegative();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Non-negative");
	});

	test("should fail for positive values", () => {
		expect(() => {
			expectlyNumberArray([-1, -2, 1]).toBeAllNegative();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyNumberArray([-1, 0, 1]).not.toBeAllNegative();
	});
});

test.describe("toBeAllIntegers", () => {
	test("should pass when all values are integers", () => {
		expectlyNumberArray([1, 2, 3, 4, 5]).toBeAllIntegers();
	});

	test("should pass for negative integers", () => {
		expectlyNumberArray([-5, -3, 0, 2, 4]).toBeAllIntegers();
	});

	test("should pass for zero", () => {
		expectlyNumberArray([0]).toBeAllIntegers();
	});

	test("should fail for decimals", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 2.5, 3]).toBeAllIntegers();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Non-integer");
	});

	test("should work with .not", () => {
		expectlyNumberArray([1.5, 2.7, 3.9]).not.toBeAllIntegers();
	});
});

test.describe("toBeAllGreaterThan", () => {
	test("should pass when all values are greater than threshold", () => {
		expectlyNumberArray([5, 6, 7, 8]).toBeAllGreaterThan(4);
	});

	test("should fail when value equals threshold", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([5, 6, 7]).toBeAllGreaterThan(5);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not greater than");
	});

	test("should fail when value is less than threshold", () => {
		expect(() => {
			expectlyNumberArray([5, 6, 3]).toBeAllGreaterThan(4);
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 2, 3]).not.toBeAllGreaterThan(5);
	});
});

test.describe("toBeAllLessThan", () => {
	test("should pass when all values are less than threshold", () => {
		expectlyNumberArray([1, 2, 3, 4]).toBeAllLessThan(5);
	});

	test("should fail when value equals threshold", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([3, 4, 5]).toBeAllLessThan(5);
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not less than");
	});

	test("should fail when value is greater than threshold", () => {
		expect(() => {
			expectlyNumberArray([3, 4, 6]).toBeAllLessThan(5);
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyNumberArray([6, 7, 8]).not.toBeAllLessThan(5);
	});
});

test.describe("toHaveStrictlyAscendingOrder", () => {
	test("should pass for strictly ascending array", () => {
		expectlyNumberArray([1, 2, 3, 4, 5]).toHaveStrictlyAscendingOrder();
	});

	test("should pass for negative numbers", () => {
		expectlyNumberArray([-10, -5, 0, 5, 10]).toHaveStrictlyAscendingOrder();
	});

	test("should pass for decimals", () => {
		expectlyNumberArray([1.1, 2.2, 3.3]).toHaveStrictlyAscendingOrder();
	});

	test("should fail for equal consecutive values", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 2, 2, 3]).toHaveStrictlyAscendingOrder();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("violation");
	});

	test("should fail for descending order", () => {
		expect(() => {
			expectlyNumberArray([5, 4, 3]).toHaveStrictlyAscendingOrder();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 2, 2, 3]).not.toHaveStrictlyAscendingOrder();
	});
});

test.describe("toHaveStrictlyDescendingOrder", () => {
	test("should pass for strictly descending array", () => {
		expectlyNumberArray([5, 4, 3, 2, 1]).toHaveStrictlyDescendingOrder();
	});

	test("should pass for negative numbers", () => {
		expectlyNumberArray([10, 5, 0, -5, -10]).toHaveStrictlyDescendingOrder();
	});

	test("should pass for decimals", () => {
		expectlyNumberArray([3.3, 2.2, 1.1]).toHaveStrictlyDescendingOrder();
	});

	test("should fail for equal consecutive values", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([3, 2, 2, 1]).toHaveStrictlyDescendingOrder();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("violation");
	});

	test("should fail for ascending order", () => {
		expect(() => {
			expectlyNumberArray([1, 2, 3]).toHaveStrictlyDescendingOrder();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyNumberArray([3, 2, 2, 1]).not.toHaveStrictlyDescendingOrder();
	});
});

test.describe("toBeMonotonic", () => {
	test("should pass for ascending array", () => {
		expectlyNumberArray([1, 2, 3, 4, 5]).toBeMonotonic();
	});

	test("should pass for descending array", () => {
		expectlyNumberArray([5, 4, 3, 2, 1]).toBeMonotonic();
	});

	test("should pass for array with equal values ascending", () => {
		expectlyNumberArray([1, 2, 2, 3]).toBeMonotonic();
	});

	test("should pass for array with equal values descending", () => {
		expectlyNumberArray([3, 2, 2, 1]).toBeMonotonic();
	});

	test("should pass for all same values", () => {
		expectlyNumberArray([5, 5, 5, 5]).toBeMonotonic();
	});

	test("should pass for empty array", () => {
		expectlyNumberArray([]).toBeMonotonic();
	});

	test("should pass for single element", () => {
		expectlyNumberArray([42]).toBeMonotonic();
	});

	test("should fail for mixed ordering", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 3, 2, 4]).toBeMonotonic();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("mixed ordering");
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 3, 2, 4]).not.toBeMonotonic();
	});
});

test.describe("toHaveUniqueValues", () => {
	test("should pass for array with unique values", () => {
		expectlyNumberArray([1, 2, 3, 4, 5]).toHaveUniqueValues();
	});

	test("should pass for single element", () => {
		expectlyNumberArray([42]).toHaveUniqueValues();
	});

	test("should pass for empty array", () => {
		expectlyNumberArray([]).toHaveUniqueValues();
	});

	test("should fail for array with duplicates", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 2, 2, 3]).toHaveUniqueValues();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Duplicate values");
	});

	test("should fail for multiple duplicates", () => {
		expect(() => {
			expectlyNumberArray([1, 2, 2, 3, 3, 4]).toHaveUniqueValues();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 2, 2, 3]).not.toHaveUniqueValues();
	});
});

test.describe("toHaveConsecutiveIntegers", () => {
	test("should pass for consecutive integers in order", () => {
		expectlyNumberArray([1, 2, 3, 4, 5]).toHaveConsecutiveIntegers();
	});

	test("should pass for consecutive integers unordered", () => {
		expectlyNumberArray([3, 1, 4, 2, 5]).toHaveConsecutiveIntegers();
	});

	test("should pass for negative consecutive integers", () => {
		expectlyNumberArray([-2, -1, 0, 1, 2]).toHaveConsecutiveIntegers();
	});

	test("should pass for single element", () => {
		expectlyNumberArray([42]).toHaveConsecutiveIntegers();
	});

	test("should fail for gap in sequence", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1, 2, 4, 5]).toHaveConsecutiveIntegers();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Found gap");
	});

	test("should fail for non-integers", () => {
		let error: Error | undefined;
		try {
			expectlyNumberArray([1.5, 2.5, 3.5]).toHaveConsecutiveIntegers();
		} catch (e: unknown) {
			error = e instanceof Error ? e : new Error(String(e));
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("only integers");
	});

	test("should fail for duplicates", () => {
		expect(() => {
			expectlyNumberArray([1, 2, 2, 3]).toHaveConsecutiveIntegers();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyNumberArray([1, 2, 4, 5]).not.toHaveConsecutiveIntegers();
	});
});
