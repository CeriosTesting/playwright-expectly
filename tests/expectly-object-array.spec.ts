import { expect, test } from "@playwright/test";

import { expectlyObjectArray } from "../src/expectly-object-array";

test.describe("toHaveOnlyUniqueObjects", () => {
	test("should pass when array contains only unique objects", () => {
		const uniqueArray = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 3, name: "Charlie" },
		];

		expectlyObjectArray(uniqueArray).toHaveOnlyUniqueObjects();
	});

	test("should pass for empty array", () => {
		expectlyObjectArray([]).toHaveOnlyUniqueObjects();
	});

	test("should pass for array with single object", () => {
		const singleObject = [{ id: 1, name: "Alice" }];

		expectlyObjectArray(singleObject).toHaveOnlyUniqueObjects();
	});

	test("should fail when array contains duplicate objects", () => {
		const duplicateArray = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 1, name: "Alice" },
		];

		expect(() => {
			expectlyObjectArray(duplicateArray).toHaveOnlyUniqueObjects();
		}).toThrow(/duplicate/);
	});

	test("should fail when array contains multiple duplicates", () => {
		const multipleDuplicates = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 3, name: "Charlie" },
		];

		expect(() => {
			expectlyObjectArray(multipleDuplicates).toHaveOnlyUniqueObjects();
		}).toThrow(/duplicate/);
	});

	test("should treat objects with different property orders as equal", () => {
		// Objects with same properties but different order should be considered duplicates
		const array = [
			{ name: "Alice", id: 1 },
			{ id: 1, name: "Alice" },
		];

		// These ARE considered duplicates since we normalize property order
		expect(() => {
			expectlyObjectArray(array).toHaveOnlyUniqueObjects();
		}).toThrow(/duplicate/);
	});

	test("should detect duplicates with same property order", () => {
		const array = [
			{ id: 1, name: "Alice" },
			{ id: 1, name: "Alice" },
		];

		expect(() => {
			expectlyObjectArray(array).toHaveOnlyUniqueObjects();
		}).toThrow(/duplicate/);
	});

	test("should handle nested objects", () => {
		const uniqueNested = [
			{ id: 1, details: { age: 25, city: "NYC" } },
			{ id: 2, details: { age: 30, city: "LA" } },
			{ id: 3, details: { age: 25, city: "NYC" } },
		];

		expectlyObjectArray(uniqueNested).toHaveOnlyUniqueObjects();
	});

	test("should detect duplicate nested objects", () => {
		const duplicateNested = [
			{ id: 1, details: { age: 25, city: "NYC" } },
			{ id: 2, details: { age: 30, city: "LA" } },
			{ id: 1, details: { age: 25, city: "NYC" } },
		];

		expect(() => {
			expectlyObjectArray(duplicateNested).toHaveOnlyUniqueObjects();
		}).toThrow(/duplicate/);
	});

	test("should handle objects with null values", () => {
		const arrayWithNulls = [
			{ id: 1, value: null },
			{ id: 2, value: null },
			{ id: 3, value: "something" },
		];

		expectlyObjectArray(arrayWithNulls).toHaveOnlyUniqueObjects();
	});

	test("should handle objects with undefined values", () => {
		const arrayWithUndefined = [
			{ id: 1, value: undefined },
			{ id: 2, value: undefined },
			{ id: 3, value: "something" },
		];

		expectlyObjectArray(arrayWithUndefined).toHaveOnlyUniqueObjects();
	});

	test("should handle objects with array properties", () => {
		const arrayWithArrays = [
			{ id: 1, tags: ["a", "b"] },
			{ id: 2, tags: ["c", "d"] },
			{ id: 3, tags: ["a", "b"] },
		];

		expectlyObjectArray(arrayWithArrays).toHaveOnlyUniqueObjects();
	});

	test("should detect duplicate objects with array properties", () => {
		const duplicateWithArrays = [
			{ id: 1, tags: ["a", "b"] },
			{ id: 2, tags: ["c", "d"] },
			{ id: 1, tags: ["a", "b"] },
		];

		expect(() => {
			expectlyObjectArray(duplicateWithArrays).toHaveOnlyUniqueObjects();
		}).toThrow(/duplicate/);
	});

	test("should handle complex objects with mixed types", () => {
		const complexArray = [
			{
				id: 1,
				name: "Alice",
				age: 25,
				active: true,
				tags: ["user", "admin"],
				metadata: { created: "2023-01-01", updated: null },
			},
			{
				id: 2,
				name: "Bob",
				age: 30,
				active: false,
				tags: ["user"],
				metadata: { created: "2023-01-02", updated: "2023-06-01" },
			},
		];

		expectlyObjectArray(complexArray).toHaveOnlyUniqueObjects();
	});

	test("should work with .not for unique arrays", () => {
		const uniqueArray = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
		];

		expect(() => {
			expectlyObjectArray(uniqueArray).not.toHaveOnlyUniqueObjects();
		}).toThrow(/Expected to contain duplicate objects/);
	});

	test("should work with .not for arrays with duplicates", () => {
		const duplicateArray = [
			{ id: 1, name: "Alice" },
			{ id: 1, name: "Alice" },
		];

		expectlyObjectArray(duplicateArray).not.toHaveOnlyUniqueObjects();
	});

	test("should handle circular references without throwing", () => {
		const obj1: any = { id: 1, name: "Alice" };
		obj1.self = obj1;

		const obj2: any = { id: 2, name: "Bob" };
		obj2.self = obj2;

		const arrayWithCircular = [obj1, obj2];

		// Should not throw an error due to circular references
		expectlyObjectArray(arrayWithCircular).toHaveOnlyUniqueObjects();
	});

	test("should detect duplicate circular references", () => {
		const obj1: any = { id: 1, name: "Alice" };
		obj1.self = obj1;

		const arrayWithDuplicateCircular = [obj1, obj1];

		expect(() => {
			expectlyObjectArray(arrayWithDuplicateCircular).toHaveOnlyUniqueObjects();
		}).toThrow(/duplicate/);
	});
});

test.describe("toHaveObjectsInAscendingOrderBy", () => {
	test("should pass for array sorted in ascending order by numeric property", () => {
		const sortedArray = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

		expectlyObjectArray(sortedArray).toHaveObjectsInAscendingOrderBy("id");
	});

	test("should pass for array sorted in ascending order by string property", () => {
		const sortedArray = [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }];

		expectlyObjectArray(sortedArray).toHaveObjectsInAscendingOrderBy("name");
	});

	test("should pass for array with equal consecutive values", () => {
		const sortedArray = [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 3 }];

		expectlyObjectArray(sortedArray).toHaveObjectsInAscendingOrderBy("score");
	});

	test("should pass for empty array", () => {
		expectlyObjectArray([]).toHaveObjectsInAscendingOrderBy("id");
	});

	test("should pass for single element array", () => {
		expectlyObjectArray([{ id: 1 }]).toHaveObjectsInAscendingOrderBy("id");
	});

	test("should fail for array not sorted in ascending order", () => {
		const unsortedArray = [{ id: 1 }, { id: 3 }, { id: 2 }, { id: 4 }];

		expect(() => {
			expectlyObjectArray(unsortedArray).toHaveObjectsInAscendingOrderBy("id");
		}).toThrow(/out of order/);
	});

	test("should fail for array sorted in descending order", () => {
		const descendingArray = [{ id: 4 }, { id: 3 }, { id: 2 }, { id: 1 }];

		expect(() => {
			expectlyObjectArray(descendingArray).toHaveObjectsInAscendingOrderBy("id");
		}).toThrow(/out of order/);
	});

	test("should fail when property does not exist", () => {
		const array = [{ id: 1 }, { id: 2 }];

		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInAscendingOrderBy("name");
		}).toThrow(/not found/);
	});

	test("should fail when property is null", () => {
		const array = [{ id: null }, { id: 2 }];

		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInAscendingOrderBy("id");
		}).toThrow(/null/);
	});

	test("should fail when property is undefined", () => {
		const array = [{ id: undefined }, { id: 2 }];

		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInAscendingOrderBy("id");
		}).toThrow(/undefined/);
	});

	test("should fail when property types are inconsistent", () => {
		const array = [{ value: 1 }, { value: "two" }];

		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInAscendingOrderBy("value");
		}).toThrow(/Type mismatch/);
	});

	test("should work with nested property access", () => {
		const array = [{ user: { age: 25 } }, { user: { age: 30 } }, { user: { age: 35 } }];

		// Note: This tests direct property name, not dot notation
		// For nested properties, users would need to pass "age" and ensure objects are structured accordingly
		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInAscendingOrderBy("age");
		}).toThrow(/not found/);
	});

	test("should work with date strings", () => {
		const array = [{ date: "2023-01-01" }, { date: "2023-06-15" }, { date: "2023-12-31" }];

		expectlyObjectArray(array).toHaveObjectsInAscendingOrderBy("date");
	});

	test("should work with .not for unsorted arrays", () => {
		const unsortedArray = [{ id: 3 }, { id: 1 }, { id: 2 }];

		expectlyObjectArray(unsortedArray).not.toHaveObjectsInAscendingOrderBy("id");
	});

	test("should fail with .not for sorted arrays", () => {
		const sortedArray = [{ id: 1 }, { id: 2 }, { id: 3 }];

		expect(() => {
			expectlyObjectArray(sortedArray).not.toHaveObjectsInAscendingOrderBy("id");
		}).toThrow(/not be sorted in ascending order/);
	});
});

test.describe("toHaveObjectsInDescendingOrderBy", () => {
	test("should pass for array sorted in descending order by numeric property", () => {
		const sortedArray = [{ id: 4 }, { id: 3 }, { id: 2 }, { id: 1 }];

		expectlyObjectArray(sortedArray).toHaveObjectsInDescendingOrderBy("id");
	});

	test("should pass for array sorted in descending order by string property", () => {
		const sortedArray = [{ name: "Charlie" }, { name: "Bob" }, { name: "Alice" }];

		expectlyObjectArray(sortedArray).toHaveObjectsInDescendingOrderBy("name");
	});

	test("should pass for array with equal consecutive values", () => {
		const sortedArray = [{ score: 3 }, { score: 2 }, { score: 2 }, { score: 1 }];

		expectlyObjectArray(sortedArray).toHaveObjectsInDescendingOrderBy("score");
	});

	test("should pass for empty array", () => {
		expectlyObjectArray([]).toHaveObjectsInDescendingOrderBy("id");
	});

	test("should pass for single element array", () => {
		expectlyObjectArray([{ id: 1 }]).toHaveObjectsInDescendingOrderBy("id");
	});

	test("should fail for array not sorted in descending order", () => {
		const unsortedArray = [{ id: 4 }, { id: 2 }, { id: 3 }, { id: 1 }];

		expect(() => {
			expectlyObjectArray(unsortedArray).toHaveObjectsInDescendingOrderBy("id");
		}).toThrow(/out of order/);
	});

	test("should fail for array sorted in ascending order", () => {
		const ascendingArray = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

		expect(() => {
			expectlyObjectArray(ascendingArray).toHaveObjectsInDescendingOrderBy("id");
		}).toThrow(/out of order/);
	});

	test("should fail when property does not exist", () => {
		const array = [{ id: 1 }, { id: 2 }];

		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInDescendingOrderBy("name");
		}).toThrow(/not found/);
	});

	test("should fail when property is null", () => {
		const array = [{ id: 2 }, { id: null }];

		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInDescendingOrderBy("id");
		}).toThrow(/null/);
	});

	test("should fail when property is undefined", () => {
		const array = [{ id: 2 }, { id: undefined }];

		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInDescendingOrderBy("id");
		}).toThrow(/undefined/);
	});

	test("should fail when property types are inconsistent", () => {
		const array = [{ value: "two" }, { value: 1 }];

		expect(() => {
			expectlyObjectArray(array).toHaveObjectsInDescendingOrderBy("value");
		}).toThrow(/Type mismatch/);
	});

	test("should work with date strings", () => {
		const array = [{ date: "2023-12-31" }, { date: "2023-06-15" }, { date: "2023-01-01" }];

		expectlyObjectArray(array).toHaveObjectsInDescendingOrderBy("date");
	});

	test("should work with .not for unsorted arrays", () => {
		const unsortedArray = [{ id: 3 }, { id: 1 }, { id: 2 }];

		expectlyObjectArray(unsortedArray).not.toHaveObjectsInDescendingOrderBy("id");
	});

	test("should fail with .not for sorted arrays", () => {
		const sortedArray = [{ id: 3 }, { id: 2 }, { id: 1 }];

		expect(() => {
			expectlyObjectArray(sortedArray).not.toHaveObjectsInDescendingOrderBy("id");
		}).toThrow(/not be sorted in descending order/);
	});
});
