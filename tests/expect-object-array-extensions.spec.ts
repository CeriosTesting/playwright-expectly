import { expect, test } from "@playwright/test";
import { expectObjectArray } from "../src/expect-object-array-extensions";

test.describe("toHaveOnlyUniqueObjects", () => {
	test("should pass when array contains only unique objects", async () => {
		const uniqueArray = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 3, name: "Charlie" },
		];

		await expectObjectArray(uniqueArray).toHaveOnlyUniqueObjects();
	});

	test("should pass for empty array", async () => {
		await expectObjectArray([]).toHaveOnlyUniqueObjects();
	});

	test("should pass for array with single object", async () => {
		const singleObject = [{ id: 1, name: "Alice" }];

		await expectObjectArray(singleObject).toHaveOnlyUniqueObjects();
	});

	test("should fail when array contains duplicate objects", async () => {
		const duplicateArray = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 1, name: "Alice" },
		];

		let error: Error | undefined;
		try {
			await expectObjectArray(duplicateArray).toHaveOnlyUniqueObjects();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("duplicate");
	});

	test("should fail when array contains multiple duplicates", async () => {
		const multipleDuplicates = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 3, name: "Charlie" },
		];

		let error: Error | undefined;
		try {
			await expectObjectArray(multipleDuplicates).toHaveOnlyUniqueObjects();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("duplicate");
	});

	test("should treat objects with different property orders as equal", async () => {
		// Objects with same properties but different order should be considered duplicates
		const array = [
			{ name: "Alice", id: 1 },
			{ id: 1, name: "Alice" },
		];

		// These ARE considered duplicates since we normalize property order
		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveOnlyUniqueObjects();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("duplicate");
	});

	test("should detect duplicates with same property order", async () => {
		const array = [
			{ id: 1, name: "Alice" },
			{ id: 1, name: "Alice" },
		];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveOnlyUniqueObjects();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("duplicate");
	});

	test("should handle nested objects", async () => {
		const uniqueNested = [
			{ id: 1, details: { age: 25, city: "NYC" } },
			{ id: 2, details: { age: 30, city: "LA" } },
			{ id: 3, details: { age: 25, city: "NYC" } },
		];

		await expectObjectArray(uniqueNested).toHaveOnlyUniqueObjects();
	});

	test("should detect duplicate nested objects", async () => {
		const duplicateNested = [
			{ id: 1, details: { age: 25, city: "NYC" } },
			{ id: 2, details: { age: 30, city: "LA" } },
			{ id: 1, details: { age: 25, city: "NYC" } },
		];

		let error: Error | undefined;
		try {
			await expectObjectArray(duplicateNested).toHaveOnlyUniqueObjects();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("duplicate");
	});

	test("should handle objects with null values", async () => {
		const arrayWithNulls = [
			{ id: 1, value: null },
			{ id: 2, value: null },
			{ id: 3, value: "something" },
		];

		await expectObjectArray(arrayWithNulls).toHaveOnlyUniqueObjects();
	});

	test("should handle objects with undefined values", async () => {
		const arrayWithUndefined = [
			{ id: 1, value: undefined },
			{ id: 2, value: undefined },
			{ id: 3, value: "something" },
		];

		await expectObjectArray(arrayWithUndefined).toHaveOnlyUniqueObjects();
	});

	test("should handle objects with array properties", async () => {
		const arrayWithArrays = [
			{ id: 1, tags: ["a", "b"] },
			{ id: 2, tags: ["c", "d"] },
			{ id: 3, tags: ["a", "b"] },
		];

		await expectObjectArray(arrayWithArrays).toHaveOnlyUniqueObjects();
	});

	test("should detect duplicate objects with array properties", async () => {
		const duplicateWithArrays = [
			{ id: 1, tags: ["a", "b"] },
			{ id: 2, tags: ["c", "d"] },
			{ id: 1, tags: ["a", "b"] },
		];

		let error: Error | undefined;
		try {
			await expectObjectArray(duplicateWithArrays).toHaveOnlyUniqueObjects();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("duplicate");
	});

	test("should handle complex objects with mixed types", async () => {
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

		await expectObjectArray(complexArray).toHaveOnlyUniqueObjects();
	});

	test("should work with .not for unique arrays", async () => {
		const uniqueArray = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
		];

		let error: Error | undefined;
		try {
			await expectObjectArray(uniqueArray).not.toHaveOnlyUniqueObjects();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected to contain duplicate objects");
	});

	test("should work with .not for arrays with duplicates", async () => {
		const duplicateArray = [
			{ id: 1, name: "Alice" },
			{ id: 1, name: "Alice" },
		];

		await expectObjectArray(duplicateArray).not.toHaveOnlyUniqueObjects();
	});

	test("should handle circular references without throwing", async () => {
		const obj1: any = { id: 1, name: "Alice" };
		obj1.self = obj1;

		const obj2: any = { id: 2, name: "Bob" };
		obj2.self = obj2;

		const arrayWithCircular = [obj1, obj2];

		// Should not throw an error due to circular references
		await expectObjectArray(arrayWithCircular).toHaveOnlyUniqueObjects();
	});

	test("should detect duplicate circular references", async () => {
		const obj1: any = { id: 1, name: "Alice" };
		obj1.self = obj1;

		const arrayWithDuplicateCircular = [obj1, obj1];

		let error: Error | undefined;
		try {
			await expectObjectArray(arrayWithDuplicateCircular).toHaveOnlyUniqueObjects();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("duplicate");
	});
});

test.describe("toHaveObjectsInAscendingOrderBy", () => {
	test("should pass for array sorted in ascending order by numeric property", async () => {
		const sortedArray = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

		await expectObjectArray(sortedArray).toHaveObjectsInAscendingOrderBy("id");
	});

	test("should pass for array sorted in ascending order by string property", async () => {
		const sortedArray = [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }];

		await expectObjectArray(sortedArray).toHaveObjectsInAscendingOrderBy("name");
	});

	test("should pass for array with equal consecutive values", async () => {
		const sortedArray = [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 3 }];

		await expectObjectArray(sortedArray).toHaveObjectsInAscendingOrderBy("score");
	});

	test("should pass for empty array", async () => {
		await expectObjectArray([]).toHaveObjectsInAscendingOrderBy("id");
	});

	test("should pass for single element array", async () => {
		await expectObjectArray([{ id: 1 }]).toHaveObjectsInAscendingOrderBy("id");
	});

	test("should fail for array not sorted in ascending order", async () => {
		const unsortedArray = [{ id: 1 }, { id: 3 }, { id: 2 }, { id: 4 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(unsortedArray).toHaveObjectsInAscendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("out of order");
	});

	test("should fail for array sorted in descending order", async () => {
		const descendingArray = [{ id: 4 }, { id: 3 }, { id: 2 }, { id: 1 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(descendingArray).toHaveObjectsInAscendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("out of order");
	});

	test("should fail when property does not exist", async () => {
		const array = [{ id: 1 }, { id: 2 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInAscendingOrderBy("name");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not found");
	});

	test("should fail when property is null", async () => {
		const array = [{ id: null }, { id: 2 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInAscendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("null");
	});

	test("should fail when property is undefined", async () => {
		const array = [{ id: undefined }, { id: 2 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInAscendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("undefined");
	});

	test("should fail when property types are inconsistent", async () => {
		const array = [{ value: 1 }, { value: "two" }];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInAscendingOrderBy("value");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Type mismatch");
	});

	test("should work with nested property access", async () => {
		const array = [{ user: { age: 25 } }, { user: { age: 30 } }, { user: { age: 35 } }];

		// Note: This tests direct property name, not dot notation
		// For nested properties, users would need to pass "age" and ensure objects are structured accordingly
		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInAscendingOrderBy("age");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not found");
	});

	test("should work with date strings", async () => {
		const array = [{ date: "2023-01-01" }, { date: "2023-06-15" }, { date: "2023-12-31" }];

		await expectObjectArray(array).toHaveObjectsInAscendingOrderBy("date");
	});

	test("should work with .not for unsorted arrays", async () => {
		const unsortedArray = [{ id: 3 }, { id: 1 }, { id: 2 }];

		await expectObjectArray(unsortedArray).not.toHaveObjectsInAscendingOrderBy("id");
	});

	test("should fail with .not for sorted arrays", async () => {
		const sortedArray = [{ id: 1 }, { id: 2 }, { id: 3 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(sortedArray).not.toHaveObjectsInAscendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not be sorted in ascending order");
	});
});

test.describe("toHaveObjectsInDescendingOrderBy", () => {
	test("should pass for array sorted in descending order by numeric property", async () => {
		const sortedArray = [{ id: 4 }, { id: 3 }, { id: 2 }, { id: 1 }];

		await expectObjectArray(sortedArray).toHaveObjectsInDescendingOrderBy("id");
	});

	test("should pass for array sorted in descending order by string property", async () => {
		const sortedArray = [{ name: "Charlie" }, { name: "Bob" }, { name: "Alice" }];

		await expectObjectArray(sortedArray).toHaveObjectsInDescendingOrderBy("name");
	});

	test("should pass for array with equal consecutive values", async () => {
		const sortedArray = [{ score: 3 }, { score: 2 }, { score: 2 }, { score: 1 }];

		await expectObjectArray(sortedArray).toHaveObjectsInDescendingOrderBy("score");
	});

	test("should pass for empty array", async () => {
		await expectObjectArray([]).toHaveObjectsInDescendingOrderBy("id");
	});

	test("should pass for single element array", async () => {
		await expectObjectArray([{ id: 1 }]).toHaveObjectsInDescendingOrderBy("id");
	});

	test("should fail for array not sorted in descending order", async () => {
		const unsortedArray = [{ id: 4 }, { id: 2 }, { id: 3 }, { id: 1 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(unsortedArray).toHaveObjectsInDescendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("out of order");
	});

	test("should fail for array sorted in ascending order", async () => {
		const ascendingArray = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(ascendingArray).toHaveObjectsInDescendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("out of order");
	});

	test("should fail when property does not exist", async () => {
		const array = [{ id: 1 }, { id: 2 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInDescendingOrderBy("name");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not found");
	});

	test("should fail when property is null", async () => {
		const array = [{ id: 2 }, { id: null }];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInDescendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("null");
	});

	test("should fail when property is undefined", async () => {
		const array = [{ id: 2 }, { id: undefined }];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInDescendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("undefined");
	});

	test("should fail when property types are inconsistent", async () => {
		const array = [{ value: "two" }, { value: 1 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(array).toHaveObjectsInDescendingOrderBy("value");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Type mismatch");
	});

	test("should work with date strings", async () => {
		const array = [{ date: "2023-12-31" }, { date: "2023-06-15" }, { date: "2023-01-01" }];

		await expectObjectArray(array).toHaveObjectsInDescendingOrderBy("date");
	});

	test("should work with .not for unsorted arrays", async () => {
		const unsortedArray = [{ id: 3 }, { id: 1 }, { id: 2 }];

		await expectObjectArray(unsortedArray).not.toHaveObjectsInDescendingOrderBy("id");
	});

	test("should fail with .not for sorted arrays", async () => {
		const sortedArray = [{ id: 3 }, { id: 2 }, { id: 1 }];

		let error: Error | undefined;
		try {
			await expectObjectArray(sortedArray).not.toHaveObjectsInDescendingOrderBy("id");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not be sorted in descending order");
	});
});
