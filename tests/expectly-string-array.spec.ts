import { expect, test } from "@playwright/test";
import { expectlyStringArray } from "../src/expectly-string-array";

test.describe("toHaveAscendingOrder", () => {
	test("should pass when string array is in ascending order", async () => {
		const ascendingStrings = ["apple", "banana", "cherry", "date"];
		expectlyStringArray(ascendingStrings).toHaveAscendingOrder();
	});

	test("should pass for single element array", async () => {
		expectlyStringArray(["apple"]).toHaveAscendingOrder();
	});

	test("should pass for empty array", async () => {
		expectlyStringArray([]).toHaveAscendingOrder();
	});

	test("should pass for array with duplicate values", async () => {
		const withDuplicates = ["apple", "banana", "banana", "cherry"];
		expectlyStringArray(withDuplicates).toHaveAscendingOrder();
	});

	test("should pass for string array with case-sensitive ordering", async () => {
		const strings = ["A", "B", "C", "a", "b", "c"];
		expectlyStringArray(strings).toHaveAscendingOrder();
	});

	test("should fail when string array is not in ascending order", async () => {
		const unorderedStrings = ["cherry", "apple", "date", "banana"];

		let error: Error | undefined;
		try {
			expectlyStringArray(unorderedStrings).toHaveAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveAscendingOrder");
	});

	test("should fail when string array is in descending order", async () => {
		const descending = ["date", "cherry", "banana", "apple"];

		let error: Error | undefined;
		try {
			expectlyStringArray(descending).toHaveAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should work with .not for descending arrays", async () => {
		const descending = ["date", "cherry", "banana", "apple"];
		expectlyStringArray(descending).not.toHaveAscendingOrder();
	});

	test("should fail with .not for ascending arrays", async () => {
		const ascending = ["apple", "banana", "cherry", "date"];

		let error: Error | undefined;
		try {
			expectlyStringArray(ascending).not.toHaveAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle large arrays", async () => {
		const largeArray = Array.from({ length: 1000 }, (_, i) => String.fromCharCode(65 + (i % 26)));
		expectlyStringArray(largeArray.sort()).toHaveAscendingOrder();
	});

	test("should handle all same values", async () => {
		const sameValues = ["apple", "apple", "apple", "apple"];
		expectlyStringArray(sameValues).toHaveAscendingOrder();
	});
});

test.describe("toHaveDescendingOrder", () => {
	test("should pass when string array is in descending order", async () => {
		const descendingStrings = ["date", "cherry", "banana", "apple"];
		expectlyStringArray(descendingStrings).toHaveDescendingOrder();
	});

	test("should pass for single element array", async () => {
		expectlyStringArray(["apple"]).toHaveDescendingOrder();
	});

	test("should pass for empty array", async () => {
		expectlyStringArray([]).toHaveDescendingOrder();
	});

	test("should pass for array with duplicate values", async () => {
		const withDuplicates = ["date", "cherry", "cherry", "banana", "apple"];
		expectlyStringArray(withDuplicates).toHaveDescendingOrder();
	});

	test("should pass for string array with case-sensitive ordering", async () => {
		const strings = ["c", "b", "a", "C", "B", "A"];
		expectlyStringArray(strings).toHaveDescendingOrder();
	});

	test("should fail when string array is not in descending order", async () => {
		const unorderedStrings = ["cherry", "apple", "date", "banana"];

		let error: Error | undefined;
		try {
			expectlyStringArray(unorderedStrings).toHaveDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toHaveDescendingOrder");
	});

	test("should fail when string array is in ascending order", async () => {
		const ascending = ["apple", "banana", "cherry", "date"];

		let error: Error | undefined;
		try {
			expectlyStringArray(ascending).toHaveDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected");
		expect(error?.message).toContain("Received");
	});

	test("should work with .not for ascending arrays", async () => {
		const ascending = ["apple", "banana", "cherry", "date"];
		expectlyStringArray(ascending).not.toHaveDescendingOrder();
	});

	test("should fail with .not for descending arrays", async () => {
		const descending = ["date", "cherry", "banana", "apple"];

		let error: Error | undefined;
		try {
			expectlyStringArray(descending).not.toHaveDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
	});

	test("should handle large arrays", async () => {
		const largeArray = Array.from({ length: 1000 }, (_, i) => String.fromCharCode(90 - (i % 26)));
		expectlyStringArray(largeArray.sort().reverse()).toHaveDescendingOrder();
	});

	test("should handle all same values", async () => {
		const sameValues = ["apple", "apple", "apple", "apple"];
		expectlyStringArray(sameValues).toHaveDescendingOrder();
	});

	test("should handle mixed case strings", async () => {
		const mixed = ["Zebra", "apple", "Cherry", "BANANA"];
		// This should fail since the order is not descending
		let error: Error | undefined;
		try {
			expectlyStringArray(mixed).toHaveDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});
});

test.describe("toHaveStrictlyAscendingOrder", () => {
	test("should pass for strictly ascending array", async () => {
		const versions = ["v1.0", "v1.1", "v2.0", "v3.0"];
		expectlyStringArray(versions).toHaveStrictlyAscendingOrder();
	});

	test("should pass for alphabetical strings", async () => {
		expectlyStringArray(["a", "b", "c", "d"]).toHaveStrictlyAscendingOrder();
	});

	test("should fail for equal consecutive values", async () => {
		let error: Error | undefined;
		try {
			expectlyStringArray(["a", "b", "b", "c"]).toHaveStrictlyAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("violation");
	});

	test("should fail for descending order", async () => {
		let error: Error | undefined;
		try {
			expectlyStringArray(["c", "b", "a"]).toHaveStrictlyAscendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		expectlyStringArray(["a", "b", "b", "c"]).not.toHaveStrictlyAscendingOrder();
	});
});

test.describe("toHaveStrictlyDescendingOrder", () => {
	test("should pass for strictly descending array", async () => {
		const priorities = ["z", "y", "x", "w"];
		expectlyStringArray(priorities).toHaveStrictlyDescendingOrder();
	});

	test("should pass for reverse alphabetical", async () => {
		expectlyStringArray(["d", "c", "b", "a"]).toHaveStrictlyDescendingOrder();
	});

	test("should fail for equal consecutive values", async () => {
		let error: Error | undefined;
		try {
			expectlyStringArray(["z", "y", "y", "x"]).toHaveStrictlyDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("violation");
	});

	test("should fail for ascending order", async () => {
		let error: Error | undefined;
		try {
			expectlyStringArray(["a", "b", "c"]).toHaveStrictlyDescendingOrder();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		expectlyStringArray(["z", "y", "y", "x"]).not.toHaveStrictlyDescendingOrder();
	});
});

test.describe("toBeMonotonic", () => {
	test("should pass for ascending array", async () => {
		expectlyStringArray(["a", "b", "c", "d"]).toBeMonotonic();
	});

	test("should pass for descending array", async () => {
		expectlyStringArray(["d", "c", "b", "a"]).toBeMonotonic();
	});

	test("should pass for array with equal values ascending", async () => {
		expectlyStringArray(["a", "b", "b", "c", "d"]).toBeMonotonic();
	});

	test("should pass for array with equal values descending", async () => {
		expectlyStringArray(["z", "y", "x", "x", "w"]).toBeMonotonic();
	});

	test("should pass for all same values", async () => {
		expectlyStringArray(["same", "same", "same"]).toBeMonotonic();
	});

	test("should pass for empty array", async () => {
		expectlyStringArray([]).toBeMonotonic();
	});

	test("should pass for single element", async () => {
		expectlyStringArray(["single"]).toBeMonotonic();
	});

	test("should fail for mixed ordering", async () => {
		let error: Error | undefined;
		try {
			expectlyStringArray(["a", "c", "b", "d"]).toBeMonotonic();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("mixed ordering");
	});

	test("should work with .not", async () => {
		expectlyStringArray(["a", "c", "b", "d"]).not.toBeMonotonic();
	});
});

test.describe("toHaveUniqueValues", () => {
	test("should pass for array with unique values", async () => {
		expectlyStringArray(["apple", "banana", "cherry", "date"]).toHaveUniqueValues();
	});

	test("should pass for single element", async () => {
		expectlyStringArray(["single"]).toHaveUniqueValues();
	});

	test("should pass for empty array", async () => {
		expectlyStringArray([]).toHaveUniqueValues();
	});

	test("should fail for array with duplicates", async () => {
		let error: Error | undefined;
		try {
			expectlyStringArray(["a", "b", "b", "c"]).toHaveUniqueValues();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Duplicate values");
	});

	test("should fail for multiple duplicates", async () => {
		let error: Error | undefined;
		try {
			expectlyStringArray(["a", "b", "b", "c", "c", "d"]).toHaveUniqueValues();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not", async () => {
		expectlyStringArray(["a", "b", "b", "c"]).not.toHaveUniqueValues();
	});
});
