import { expect, test } from "@playwright/test";

import { expectlyStringArray } from "../src/expectly-string-array";

import { getRejectedErrorSync } from "./helpers/assertion-utils";

test.describe("toHaveAscendingOrder", () => {
	test("should pass when string array is in ascending order", () => {
		const ascendingStrings = ["apple", "banana", "cherry", "date"];
		expectlyStringArray(ascendingStrings).toHaveAscendingOrder();
	});

	test("should pass for single element array", () => {
		expectlyStringArray(["apple"]).toHaveAscendingOrder();
	});

	test("should pass for empty array", () => {
		expectlyStringArray([]).toHaveAscendingOrder();
	});

	test("should pass for array with duplicate values", () => {
		const withDuplicates = ["apple", "banana", "banana", "cherry"];
		expectlyStringArray(withDuplicates).toHaveAscendingOrder();
	});

	test("should pass for string array with case-sensitive ordering", () => {
		const strings = ["A", "B", "C", "a", "b", "c"];
		expectlyStringArray(strings).toHaveAscendingOrder();
	});

	test("should fail when string array is not in ascending order", () => {
		const unorderedStrings = ["cherry", "apple", "date", "banana"];

		const error = getRejectedErrorSync(() => {
			expectlyStringArray(unorderedStrings).toHaveAscendingOrder();
		});
		expect(error.message).toContain("toHaveAscendingOrder");
	});

	test("should fail when string array is in descending order", () => {
		const descending = ["date", "cherry", "banana", "apple"];

		const error = getRejectedErrorSync(() => {
			expectlyStringArray(descending).toHaveAscendingOrder();
		});
		expect(error.message).toContain("Expected");
		expect(error.message).toContain("Received");
	});

	test("should work with .not for descending arrays", () => {
		const descending = ["date", "cherry", "banana", "apple"];
		expectlyStringArray(descending).not.toHaveAscendingOrder();
	});

	test("should fail with .not for ascending arrays", () => {
		const ascending = ["apple", "banana", "cherry", "date"];
		expect(() => {
			expectlyStringArray(ascending).not.toHaveAscendingOrder();
		}).toThrow(/not/);
	});

	test("should handle large arrays", () => {
		const largeArray = Array.from({ length: 1000 }, (_, i) => String.fromCharCode(65 + (i % 26)));
		expectlyStringArray(largeArray.sort()).toHaveAscendingOrder();
	});

	test("should handle all same values", () => {
		const sameValues = ["apple", "apple", "apple", "apple"];
		expectlyStringArray(sameValues).toHaveAscendingOrder();
	});
});

test.describe("toHaveDescendingOrder", () => {
	test("should pass when string array is in descending order", () => {
		const descendingStrings = ["date", "cherry", "banana", "apple"];
		expectlyStringArray(descendingStrings).toHaveDescendingOrder();
	});

	test("should pass for single element array", () => {
		expectlyStringArray(["apple"]).toHaveDescendingOrder();
	});

	test("should pass for empty array", () => {
		expectlyStringArray([]).toHaveDescendingOrder();
	});

	test("should pass for array with duplicate values", () => {
		const withDuplicates = ["date", "cherry", "cherry", "banana", "apple"];
		expectlyStringArray(withDuplicates).toHaveDescendingOrder();
	});

	test("should pass for string array with case-sensitive ordering", () => {
		const strings = ["c", "b", "a", "C", "B", "A"];
		expectlyStringArray(strings).toHaveDescendingOrder();
	});

	test("should fail when string array is not in descending order", () => {
		const unorderedStrings = ["cherry", "apple", "date", "banana"];

		const error = getRejectedErrorSync(() => {
			expectlyStringArray(unorderedStrings).toHaveDescendingOrder();
		});
		expect(error.message).toContain("toHaveDescendingOrder");
	});

	test("should fail when string array is in ascending order", () => {
		const ascending = ["apple", "banana", "cherry", "date"];

		const error = getRejectedErrorSync(() => {
			expectlyStringArray(ascending).toHaveDescendingOrder();
		});
		expect(error.message).toContain("Expected");
		expect(error.message).toContain("Received");
	});

	test("should work with .not for ascending arrays", () => {
		const ascending = ["apple", "banana", "cherry", "date"];
		expectlyStringArray(ascending).not.toHaveDescendingOrder();
	});

	test("should fail with .not for descending arrays", () => {
		const descending = ["date", "cherry", "banana", "apple"];
		expect(() => {
			expectlyStringArray(descending).not.toHaveDescendingOrder();
		}).toThrow(/not/);
	});

	test("should handle large arrays", () => {
		const largeArray = Array.from({ length: 1000 }, (_, i) => String.fromCharCode(90 - (i % 26)));
		expectlyStringArray(largeArray.sort().reverse()).toHaveDescendingOrder();
	});

	test("should handle all same values", () => {
		const sameValues = ["apple", "apple", "apple", "apple"];
		expectlyStringArray(sameValues).toHaveDescendingOrder();
	});

	test("should handle mixed case strings", () => {
		const mixed = ["Zebra", "apple", "Cherry", "BANANA"];
		// This should fail since the order is not descending
		expect(() => {
			expectlyStringArray(mixed).toHaveDescendingOrder();
		}).toThrow();
	});
});

test.describe("toHaveStrictlyAscendingOrder", () => {
	test("should pass for strictly ascending array", () => {
		const versions = ["v1.0", "v1.1", "v2.0", "v3.0"];
		expectlyStringArray(versions).toHaveStrictlyAscendingOrder();
	});

	test("should pass for alphabetical strings", () => {
		expectlyStringArray(["a", "b", "c", "d"]).toHaveStrictlyAscendingOrder();
	});

	test("should fail for equal consecutive values", () => {
		const error = getRejectedErrorSync(() => {
			expectlyStringArray(["a", "b", "b", "c"]).toHaveStrictlyAscendingOrder();
		});
		expect(error.message).toContain("violation");
	});

	test("should fail for descending order", () => {
		expect(() => {
			expectlyStringArray(["c", "b", "a"]).toHaveStrictlyAscendingOrder();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyStringArray(["a", "b", "b", "c"]).not.toHaveStrictlyAscendingOrder();
	});
});

test.describe("toHaveStrictlyDescendingOrder", () => {
	test("should pass for strictly descending array", () => {
		const priorities = ["z", "y", "x", "w"];
		expectlyStringArray(priorities).toHaveStrictlyDescendingOrder();
	});

	test("should pass for reverse alphabetical", () => {
		expectlyStringArray(["d", "c", "b", "a"]).toHaveStrictlyDescendingOrder();
	});

	test("should fail for equal consecutive values", () => {
		const error = getRejectedErrorSync(() => {
			expectlyStringArray(["z", "y", "y", "x"]).toHaveStrictlyDescendingOrder();
		});
		expect(error.message).toContain("violation");
	});

	test("should fail for ascending order", () => {
		expect(() => {
			expectlyStringArray(["a", "b", "c"]).toHaveStrictlyDescendingOrder();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyStringArray(["z", "y", "y", "x"]).not.toHaveStrictlyDescendingOrder();
	});
});

test.describe("toBeMonotonic", () => {
	test("should pass for ascending array", () => {
		expectlyStringArray(["a", "b", "c", "d"]).toBeMonotonic();
	});

	test("should pass for descending array", () => {
		expectlyStringArray(["d", "c", "b", "a"]).toBeMonotonic();
	});

	test("should pass for array with equal values ascending", () => {
		expectlyStringArray(["a", "b", "b", "c", "d"]).toBeMonotonic();
	});

	test("should pass for array with equal values descending", () => {
		expectlyStringArray(["z", "y", "x", "x", "w"]).toBeMonotonic();
	});

	test("should pass for all same values", () => {
		expectlyStringArray(["same", "same", "same"]).toBeMonotonic();
	});

	test("should pass for empty array", () => {
		expectlyStringArray([]).toBeMonotonic();
	});

	test("should pass for single element", () => {
		expectlyStringArray(["single"]).toBeMonotonic();
	});

	test("should fail for mixed ordering", () => {
		const error = getRejectedErrorSync(() => {
			expectlyStringArray(["a", "c", "b", "d"]).toBeMonotonic();
		});
		expect(error.message).toContain("mixed ordering");
	});

	test("should work with .not", () => {
		expectlyStringArray(["a", "c", "b", "d"]).not.toBeMonotonic();
	});
});

test.describe("toHaveUniqueValues", () => {
	test("should pass for array with unique values", () => {
		expectlyStringArray(["apple", "banana", "cherry", "date"]).toHaveUniqueValues();
	});

	test("should pass for single element", () => {
		expectlyStringArray(["single"]).toHaveUniqueValues();
	});

	test("should pass for empty array", () => {
		expectlyStringArray([]).toHaveUniqueValues();
	});

	test("should fail for array with duplicates", () => {
		const error = getRejectedErrorSync(() => {
			expectlyStringArray(["a", "b", "b", "c"]).toHaveUniqueValues();
		});
		expect(error.message).toContain("Duplicate values");
	});

	test("should fail for multiple duplicates", () => {
		expect(() => {
			expectlyStringArray(["a", "b", "b", "c", "c", "d"]).toHaveUniqueValues();
		}).toThrow();
	});

	test("should work with .not", () => {
		expectlyStringArray(["a", "b", "b", "c"]).not.toHaveUniqueValues();
	});
});
