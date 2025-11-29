import { expect, test } from "@playwright/test";
import { expectAny } from "../src/expect-any-extensions";

test.describe("toBeAnyOf", () => {
	test("should pass when value matches first possibility", async () => {
		await expectAny(5).toBeAnyOf(5, 10, 15);
	});

	test("should pass when value matches middle possibility", async () => {
		await expectAny(10).toBeAnyOf(5, 10, 15);
	});

	test("should pass when value matches last possibility", async () => {
		await expectAny(15).toBeAnyOf(5, 10, 15);
	});

	test("should pass with string values", async () => {
		await expectAny("hello").toBeAnyOf("hello", "world", "test");
	});

	test("should pass with boolean values", async () => {
		await expectAny(true).toBeAnyOf(true, false);
	});

	test("should pass with null value", async () => {
		await expectAny(null).toBeAnyOf(null, undefined, 0);
	});

	test("should pass with undefined value", async () => {
		await expectAny(undefined).toBeAnyOf(null, undefined, 0);
	});

	test("should pass with zero", async () => {
		await expectAny(0).toBeAnyOf(0, 1, 2);
	});

	test("should pass with empty string", async () => {
		await expectAny("").toBeAnyOf("", "a", "b");
	});

	test("should pass with NaN", async () => {
		await expectAny(Number.NaN).toBeAnyOf(Number.NaN, 0, 1);
	});

	test("should pass with single possibility", async () => {
		await expectAny(42).toBeAnyOf(42);
	});

	test("should pass with mixed types in possibilities", async () => {
		await expectAny("5").toBeAnyOf(5, "5", true);
	});

	test("should pass with negative numbers", async () => {
		await expectAny(-10).toBeAnyOf(-10, -5, 0, 5, 10);
	});

	test("should pass with floating point numbers", async () => {
		await expectAny(3.14).toBeAnyOf(2.71, 3.14, 1.41);
	});

	test("should pass with object comparison", async () => {
		const obj = { id: 1, name: "test" };
		await expectAny(obj).toBeAnyOf({ id: 1, name: "test" }, { id: 2, name: "other" });
	});

	test("should pass with array comparison", async () => {
		const arr = [1, 2, 3];
		await expectAny(arr).toBeAnyOf([1, 2, 3], [4, 5, 6]);
	});

	test("should pass with nested objects", async () => {
		const obj = { user: { id: 1, name: "Alice" }, active: true };
		await expectAny(obj).toBeAnyOf(
			{ user: { id: 1, name: "Alice" }, active: true },
			{ user: { id: 2, name: "Bob" }, active: false }
		);
	});

	test("should fail when value doesn't match any possibility", async () => {
		let error: Error | undefined;
		try {
			await expectAny(20).toBeAnyOf(5, 10, 15);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toBeAnyOf");
		expect(error?.message).toContain("Expected value to be one of the provided possibilities");
		expect(error?.message).toContain("Received");
		expect(error?.message).toContain("Possibilities");
	});

	test("should fail when string doesn't match any possibility", async () => {
		let error: Error | undefined;
		try {
			await expectAny("foo").toBeAnyOf("bar", "baz", "qux");
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toBeAnyOf");
	});

	test("should fail with type mismatch", async () => {
		let error: Error | undefined;
		try {
			await expectAny("5").toBeAnyOf(5, 10, 15);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail when object doesn't match", async () => {
		let error: Error | undefined;
		try {
			await expectAny({ id: 3 }).toBeAnyOf({ id: 1 }, { id: 2 });
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail when array doesn't match", async () => {
		let error: Error | undefined;
		try {
			await expectAny([1, 2, 3]).toBeAnyOf([1, 2], [1, 2, 3, 4]);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not when value matches a possibility", async () => {
		let error: Error | undefined;
		try {
			await expectAny(10).not.toBeAnyOf(5, 10, 15);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
		expect(error?.message).toContain("Expected value to not be any of the provided possibilities");
	});

	test("should work with .not when value doesn't match any possibility", async () => {
		await expectAny(20).not.toBeAnyOf(5, 10, 15);
	});

	test("should handle empty possibilities array", async () => {
		let error: Error | undefined;
		try {
			await expectAny(5).toBeAnyOf();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should distinguish between null and undefined", async () => {
		let error: Error | undefined;
		try {
			await expectAny(null).toBeAnyOf(undefined);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should distinguish between 0 and false", async () => {
		let error: Error | undefined;
		try {
			await expectAny(0).toBeAnyOf(false);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should distinguish between empty string and false", async () => {
		let error: Error | undefined;
		try {
			await expectAny("").toBeAnyOf(false);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should handle symbols", async () => {
		const sym1 = Symbol("test");
		const sym2 = Symbol("test");
		await expectAny(sym1).toBeAnyOf(sym1, sym2);
	});

	test("should handle BigInt values", async () => {
		const bigInt = BigInt(9007199254740991);
		await expectAny(bigInt).toBeAnyOf(BigInt(123), bigInt, BigInt(456));
	});

	test("should handle Date objects", async () => {
		const date = new Date("2023-01-01");
		await expectAny(date).toBeAnyOf(date, new Date("2023-01-02"));
	});

	test("should handle RegExp objects", async () => {
		const regex = /test/i;
		await expectAny(regex).toBeAnyOf(/other/, regex);
	});

	test("should handle class instances", async () => {
		class Person {
			constructor(public name: string) {}
		}
		const person = new Person("Alice");
		await expectAny(person).toBeAnyOf(person, new Person("Bob"));
	});

	test("should handle functions", async () => {
		const fn1 = () => "test";
		const fn2 = () => "other";
		await expectAny(fn1).toBeAnyOf(fn1, fn2);
	});

	test("should handle complex nested structures", async () => {
		const complex = {
			users: [
				{ id: 1, name: "Alice", tags: ["admin", "user"] },
				{ id: 2, name: "Bob", tags: ["user"] },
			],
			metadata: { version: 1, timestamp: "2023-01-01" },
		};

		await expectAny(complex).toBeAnyOf(complex, { users: [], metadata: {} });
	});

	test("should handle multiple object possibilities", async () => {
		const obj = { status: "active", count: 5 };
		await expectAny(obj).toBeAnyOf(
			{ status: "inactive", count: 0 },
			{ status: "pending", count: 3 },
			{ status: "active", count: 5 }
		);
	});

	test("should work with large number of possibilities", async () => {
		const possibilities = Array.from({ length: 100 }, (_, i) => i);
		await expectAny(50).toBeAnyOf(...possibilities);
	});

	test("should handle Infinity values", async () => {
		await expectAny(Number.POSITIVE_INFINITY).toBeAnyOf(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0);
	});

	test("should handle negative Infinity values", async () => {
		await expectAny(Number.NEGATIVE_INFINITY).toBeAnyOf(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0);
	});

	test("should match objects with same structure and values", async () => {
		// JSON.stringify preserves insertion order, so these should be equal
		const obj1 = { a: 1, b: 2 };
		const obj2 = { a: 1, b: 2 };
		const obj3 = { c: 3 };
		await expectAny(obj1).toBeAnyOf(obj3, obj2, obj3);
	});

	test("should handle parsed JSON objects", async () => {
		// These have same serialization
		const obj1 = JSON.parse('{"a":1,"b":2}');
		const obj2 = JSON.parse('{"c":3}');
		const obj3 = JSON.parse('{"a":1,"b":2}');
		await (expectAny(obj1) as any).toBeAnyOf(obj2, obj3);
	});

	test("should provide clear error message with multiple types", async () => {
		let error: Error | undefined;
		try {
			await expectAny(100).toBeAnyOf("one", true, null, { value: 1 }, [1, 2, 3]);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("100");
	});

	test("should handle circular references by reference equality", async () => {
		const obj1: any = { name: "test" };
		obj1.self = obj1;

		const obj2 = { name: "different" };

		// This will use === comparison due to JSON.stringify throwing
		// Should pass because obj1 is the same reference
		await (expectAny(obj1) as any).toBeAnyOf(obj1, obj2);
	});
});

test.describe("toBeNullish", () => {
	test("should pass for null", async () => {
		await expectAny(null).toBeNullish();
	});

	test("should pass for undefined", async () => {
		await expectAny(undefined).toBeNullish();
	});

	test("should pass for explicitly undefined variable", async () => {
		let value: undefined;
		await expectAny(value).toBeNullish();
	});

	test("should fail for 0", async () => {
		let error: Error | undefined;
		try {
			await expectAny(0).toBeNullish();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to be nullish");
	});

	test("should fail for false", async () => {
		let error: Error | undefined;
		try {
			await expectAny(false).toBeNullish();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for empty string", async () => {
		let error: Error | undefined;
		try {
			await expectAny("").toBeNullish();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for NaN", async () => {
		let error: Error | undefined;
		try {
			await expectAny(Number.NaN).toBeNullish();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for empty object", async () => {
		let error: Error | undefined;
		try {
			await expectAny({}).toBeNullish();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for empty array", async () => {
		let error: Error | undefined;
		try {
			await expectAny([]).toBeNullish();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for non-nullish values", async () => {
		await expectAny(0).not.toBeNullish();
		await expectAny(false).not.toBeNullish();
		await expectAny("").not.toBeNullish();
		await expectAny({}).not.toBeNullish();
	});

	test("should fail with .not for null", async () => {
		let error: Error | undefined;
		try {
			await expectAny(null).not.toBeNullish();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to not be nullish");
	});

	test("should fail with .not for undefined", async () => {
		let error: Error | undefined;
		try {
			await expectAny(undefined).not.toBeNullish();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});
});

test.describe("toBeInteger", () => {
	test("should pass for positive integer", async () => {
		await expectAny(42).toBeInteger();
	});

	test("should pass for negative integer", async () => {
		await expectAny(-42).toBeInteger();
	});

	test("should pass for zero", async () => {
		await expectAny(0).toBeInteger();
	});

	test("should pass for large integer", async () => {
		await expectAny(9007199254740991).toBeInteger();
	});

	test("should fail for float", async () => {
		let error: Error | undefined;
		try {
			await expectAny(3.14).toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to be an integer");
	});

	test("should fail for negative float", async () => {
		let error: Error | undefined;
		try {
			await expectAny(-3.14).toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for string number", async () => {
		let error: Error | undefined;
		try {
			await expectAny("42").toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("string");
	});

	test("should fail for NaN", async () => {
		let error: Error | undefined;
		try {
			await expectAny(Number.NaN).toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for Infinity", async () => {
		let error: Error | undefined;
		try {
			await expectAny(Number.POSITIVE_INFINITY).toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for null", async () => {
		let error: Error | undefined;
		try {
			await expectAny(null).toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for floats", async () => {
		await expectAny(3.14).not.toBeInteger();
		await expectAny(0.1).not.toBeInteger();
	});

	test("should fail with .not for integers", async () => {
		let error: Error | undefined;
		try {
			await expectAny(42).not.toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to not be an integer");
	});
});

test.describe("toBeFloat", () => {
	test("should pass for positive float", async () => {
		await expectAny(3.14).toBeFloat();
	});

	test("should pass for negative float", async () => {
		await expectAny(-3.14).toBeFloat();
	});

	test("should pass for small decimal", async () => {
		await expectAny(0.1).toBeFloat();
	});

	test("should pass for result of division", async () => {
		await expectAny(1 / 3).toBeFloat();
	});

	test("should fail for integer", async () => {
		let error: Error | undefined;
		try {
			await expectAny(42).toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to be a float");
		expect(error?.message).toContain("value is an integer");
	});

	test("should fail for zero", async () => {
		let error: Error | undefined;
		try {
			await expectAny(0).toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for NaN", async () => {
		let error: Error | undefined;
		try {
			await expectAny(Number.NaN).toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("value is NaN");
	});

	test("should fail for string number", async () => {
		let error: Error | undefined;
		try {
			await expectAny("3.14").toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("type is string");
	});

	test("should fail for Infinity", async () => {
		let error: Error | undefined;
		try {
			await expectAny(Number.POSITIVE_INFINITY).toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for integers", async () => {
		await expectAny(42).not.toBeFloat();
		await expectAny(0).not.toBeFloat();
	});

	test("should fail with .not for floats", async () => {
		let error: Error | undefined;
		try {
			await expectAny(3.14).not.toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to not be a float");
	});
});

test.describe("toBePrimitive", () => {
	test("should pass for string", async () => {
		await expectAny("hello").toBePrimitive();
	});

	test("should pass for number", async () => {
		await expectAny(42).toBePrimitive();
	});

	test("should pass for boolean", async () => {
		await expectAny(true).toBePrimitive();
	});

	test("should pass for null", async () => {
		await expectAny(null).toBePrimitive();
	});

	test("should pass for undefined", async () => {
		await expectAny(undefined).toBePrimitive();
	});

	test("should pass for bigint", async () => {
		await expectAny(BigInt(123)).toBePrimitive();
	});

	test("should pass for symbol", async () => {
		await expectAny(Symbol("test")).toBePrimitive();
	});

	test("should fail for object", async () => {
		let error: Error | undefined;
		try {
			await expectAny({}).toBePrimitive();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to be a primitive type");
	});

	test("should fail for array", async () => {
		let error: Error | undefined;
		try {
			await expectAny([]).toBePrimitive();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for function", async () => {
		let error: Error | undefined;
		try {
			await expectAny(() => {}).toBePrimitive();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for Date", async () => {
		let error: Error | undefined;
		try {
			await expectAny(new Date()).toBePrimitive();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for objects", async () => {
		await expectAny({}).not.toBePrimitive();
		await expectAny([]).not.toBePrimitive();
		await expectAny(() => {}).not.toBePrimitive();
	});

	test("should fail with .not for primitives", async () => {
		let error: Error | undefined;
		try {
			await expectAny("string").not.toBePrimitive();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to not be a primitive type");
	});
});

test.describe("toBeArray", () => {
	test("should pass for empty array", async () => {
		await expectAny([]).toBeArray();
	});

	test("should pass for array with elements", async () => {
		await expectAny([1, 2, 3]).toBeArray();
	});

	test("should pass for array of objects", async () => {
		await expectAny([{ id: 1 }, { id: 2 }]).toBeArray();
	});

	test("should pass for nested arrays", async () => {
		await expectAny([
			[1, 2],
			[3, 4],
		]).toBeArray();
	});

	test("should fail for object", async () => {
		let error: Error | undefined;
		try {
			await expectAny({}).toBeArray();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to be an array");
	});

	test("should fail for string", async () => {
		let error: Error | undefined;
		try {
			await expectAny("array").toBeArray();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for null", async () => {
		let error: Error | undefined;
		try {
			await expectAny(null).toBeArray();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for non-arrays", async () => {
		await expectAny({}).not.toBeArray();
		await expectAny("string").not.toBeArray();
		await expectAny(123).not.toBeArray();
	});

	test("should fail with .not for arrays", async () => {
		let error: Error | undefined;
		try {
			await expectAny([1, 2, 3]).not.toBeArray();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to not be an array");
	});
});

test.describe("toBeObject", () => {
	test("should pass for plain object", async () => {
		await expectAny({}).toBeObject();
	});

	test("should pass for object with properties", async () => {
		await expectAny({ id: 1, name: "test" }).toBeObject();
	});

	test("should pass for nested objects", async () => {
		await expectAny({ user: { id: 1 } }).toBeObject();
	});

	test("should pass for class instance", async () => {
		class Person {
			constructor(public name: string) {}
		}
		await expectAny(new Person("Alice")).toBeObject();
	});

	test("should fail for array", async () => {
		let error: Error | undefined;
		try {
			await expectAny([]).toBeObject();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to be an object");
		expect(error?.message).toContain("array");
	});

	test("should fail for null", async () => {
		let error: Error | undefined;
		try {
			await expectAny(null).toBeObject();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("null");
	});

	test("should fail for string", async () => {
		let error: Error | undefined;
		try {
			await expectAny("object").toBeObject();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail for number", async () => {
		let error: Error | undefined;
		try {
			await expectAny(123).toBeObject();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for non-objects", async () => {
		await expectAny([]).not.toBeObject();
		await expectAny(null).not.toBeObject();
		await expectAny("string").not.toBeObject();
	});

	test("should fail with .not for objects", async () => {
		let error: Error | undefined;
		try {
			await expectAny({ id: 1 }).not.toBeObject();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to not be an object");
	});
});
