import { expect, test } from "@playwright/test";
import { expectlyAny } from "../src/expectly-any";

test.describe("toBeAnyOf", () => {
	test("should pass when value matches first possibility", async () => {
		expectlyAny(5).toBeAnyOf(5, 10, 15);
	});

	test("should pass when value matches middle possibility", async () => {
		expectlyAny(10).toBeAnyOf(5, 10, 15);
	});

	test("should pass when value matches last possibility", async () => {
		expectlyAny(15).toBeAnyOf(5, 10, 15);
	});

	test("should pass with string values", async () => {
		expectlyAny("hello").toBeAnyOf("hello", "world", "test");
	});

	test("should pass with boolean values", async () => {
		expectlyAny(true).toBeAnyOf(true, false);
	});

	test("should pass with null value", async () => {
		expectlyAny(null).toBeAnyOf(null, undefined, 0);
	});

	test("should pass with undefined value", async () => {
		expectlyAny(undefined).toBeAnyOf(null, undefined, 0);
	});

	test("should pass with zero", async () => {
		expectlyAny(0).toBeAnyOf(0, 1, 2);
	});

	test("should pass with empty string", async () => {
		expectlyAny("").toBeAnyOf("", "a", "b");
	});

	test("should pass with NaN", async () => {
		expectlyAny(Number.NaN).toBeAnyOf(Number.NaN, 0, 1);
	});

	test("should pass with single possibility", async () => {
		expectlyAny(42).toBeAnyOf(42);
	});

	test("should pass with mixed types in possibilities", async () => {
		expectlyAny("5").toBeAnyOf(5, "5", true);
	});

	test("should pass with negative numbers", async () => {
		expectlyAny(-10).toBeAnyOf(-10, -5, 0, 5, 10);
	});

	test("should pass with floating point numbers", async () => {
		expectlyAny(3.14).toBeAnyOf(2.71, 3.14, 1.41);
	});

	test("should pass with object comparison", async () => {
		const obj = { id: 1, name: "test" };
		expectlyAny(obj).toBeAnyOf({ id: 1, name: "test" }, { id: 2, name: "other" });
	});

	test("should pass with array comparison", async () => {
		const arr = [1, 2, 3];
		expectlyAny(arr).toBeAnyOf([1, 2, 3], [4, 5, 6]);
	});

	test("should pass with nested objects", async () => {
		const obj = { user: { id: 1, name: "Alice" }, active: true };
		expectlyAny(obj).toBeAnyOf(
			{ user: { id: 1, name: "Alice" }, active: true },
			{ user: { id: 2, name: "Bob" }, active: false }
		);
	});

	test("should fail when value doesn't match any possibility", async () => {
		let error: Error | undefined;
		try {
			expectlyAny(20).toBeAnyOf(5, 10, 15);
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
		expect(() => expectlyAny("foo").toBeAnyOf("bar", "baz", "qux")).toThrow(/toBeAnyOf/);
	});

	test("should fail with type mismatch", async () => {
		expect(() => expectlyAny("5").toBeAnyOf(5, 10, 15)).toThrow();
	});

	test("should fail when object doesn't match", async () => {
		expect(() => expectlyAny({ id: 3 }).toBeAnyOf({ id: 1 }, { id: 2 })).toThrow();
	});

	test("should fail when array doesn't match", async () => {
		expect(() => expectlyAny([1, 2, 3]).toBeAnyOf([1, 2], [1, 2, 3, 4])).toThrow();
	});

	test("should work with .not when value matches a possibility", async () => {
		let error: Error | undefined;
		try {
			expectlyAny(10).not.toBeAnyOf(5, 10, 15);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not");
		expect(error?.message).toContain("Expected value to not be any of the provided possibilities");
	});

	test("should work with .not when value doesn't match any possibility", async () => {
		expectlyAny(20).not.toBeAnyOf(5, 10, 15);
	});

	test("should handle empty possibilities array", async () => {
		expect(() => expectlyAny(5).toBeAnyOf()).toThrow();
	});

	test("should distinguish between null and undefined", async () => {
		expect(() => expectlyAny(null).toBeAnyOf(undefined)).toThrow();
	});

	test("should distinguish between 0 and false", async () => {
		expect(() => expectlyAny(0).toBeAnyOf(false)).toThrow();
	});

	test("should distinguish between empty string and false", async () => {
		expect(() => expectlyAny("").toBeAnyOf(false)).toThrow();
	});

	test("should handle symbols", async () => {
		const sym1 = Symbol("test");
		const sym2 = Symbol("test");
		expectlyAny(sym1).toBeAnyOf(sym1, sym2);
	});

	test("should handle BigInt values", async () => {
		const bigInt = BigInt(9007199254740991);
		expectlyAny(bigInt).toBeAnyOf(BigInt(123), bigInt, BigInt(456));
	});

	test("should handle Date objects", async () => {
		const date = new Date("2023-01-01");
		expectlyAny(date).toBeAnyOf(date, new Date("2023-01-02"));
	});

	test("should handle RegExp objects", async () => {
		const regex = /test/i;
		expectlyAny(regex).toBeAnyOf(/other/, regex);
	});

	test("should handle class instances", async () => {
		class Person {
			constructor(public name: string) {}
		}
		const person = new Person("Alice");
		expectlyAny(person).toBeAnyOf(person, new Person("Bob"));
	});

	test("should handle functions", async () => {
		const fn1 = () => "test";
		const fn2 = () => "other";
		expectlyAny(fn1).toBeAnyOf(fn1, fn2);
	});

	test("should handle complex nested structures", async () => {
		const complex = {
			users: [
				{ id: 1, name: "Alice", tags: ["admin", "user"] },
				{ id: 2, name: "Bob", tags: ["user"] },
			],
			metadata: { version: 1, timestamp: "2023-01-01" },
		};

		expectlyAny(complex).toBeAnyOf(complex, { users: [], metadata: {} });
	});

	test("should handle multiple object possibilities", async () => {
		const obj = { status: "active", count: 5 };
		expectlyAny(obj).toBeAnyOf(
			{ status: "inactive", count: 0 },
			{ status: "pending", count: 3 },
			{ status: "active", count: 5 }
		);
	});

	test("should work with large number of possibilities", async () => {
		const possibilities = Array.from({ length: 100 }, (_, i) => i);
		expectlyAny(50).toBeAnyOf(...possibilities);
	});

	test("should handle Infinity values", async () => {
		expectlyAny(Number.POSITIVE_INFINITY).toBeAnyOf(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0);
	});

	test("should handle negative Infinity values", async () => {
		expectlyAny(Number.NEGATIVE_INFINITY).toBeAnyOf(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0);
	});

	test("should match objects with same structure and values", async () => {
		// JSON.stringify preserves insertion order, so these should be equal
		const obj1 = { a: 1, b: 2 };
		const obj2 = { a: 1, b: 2 };
		const obj3 = { c: 3 };
		expectlyAny(obj1).toBeAnyOf(obj3, obj2, obj3);
	});

	test("should handle parsed JSON objects", async () => {
		// These have same serialization
		const obj1 = JSON.parse('{"a":1,"b":2}');
		const obj2 = JSON.parse('{"c":3}');
		const obj3 = JSON.parse('{"a":1,"b":2}');
		(expectlyAny(obj1) as any).toBeAnyOf(obj2, obj3);
	});

	test("should provide clear error message with multiple types", async () => {
		expect(() => expectlyAny(100).toBeAnyOf("one", true, null, { value: 1 }, [1, 2, 3])).toThrow(/100/);
	});

	test("should handle circular references by reference equality", async () => {
		const obj1: any = { name: "test" };
		obj1.self = obj1;

		const obj2 = { name: "different" };

		// This will use === comparison due to JSON.stringify throwing
		// Should pass because obj1 is the same reference
		(expectlyAny(obj1) as any).toBeAnyOf(obj1, obj2);
	});
});

test.describe("toBeNullish", () => {
	test("should pass for null", async () => {
		expectlyAny(null).toBeNullish();
	});

	test("should pass for undefined", async () => {
		expectlyAny(undefined).toBeNullish();
	});

	test("should pass for explicitly undefined variable", async () => {
		let value: undefined;
		expectlyAny(value).toBeNullish();
	});

	test("should fail for 0", async () => {
		expect(() => expectlyAny(0).toBeNullish()).toThrow(/Expected value to be nullish/);
	});

	test("should fail for false", async () => {
		expect(() => expectlyAny(false).toBeNullish()).toThrow();
	});

	test("should fail for empty string", async () => {
		expect(() => expectlyAny("").toBeNullish()).toThrow();
	});

	test("should fail for NaN", async () => {
		expect(() => expectlyAny(Number.NaN).toBeNullish()).toThrow();
	});

	test("should fail for empty object", async () => {
		expect(() => expectlyAny({}).toBeNullish()).toThrow();
	});

	test("should fail for empty array", async () => {
		expect(() => expectlyAny([]).toBeNullish()).toThrow();
	});

	test("should work with .not for non-nullish values", async () => {
		expectlyAny(0).not.toBeNullish();
		expectlyAny(false).not.toBeNullish();
		expectlyAny("").not.toBeNullish();
		expectlyAny({}).not.toBeNullish();
	});

	test("should fail with .not for null", async () => {
		expect(() => expectlyAny(null).not.toBeNullish()).toThrow(/Expected value to not be nullish/);
	});

	test("should fail with .not for undefined", async () => {
		expect(() => expectlyAny(undefined).not.toBeNullish()).toThrow();
	});
});

test.describe("toBeInteger", () => {
	test("should pass for positive integer", async () => {
		expectlyAny(42).toBeInteger();
	});

	test("should pass for negative integer", async () => {
		expectlyAny(-42).toBeInteger();
	});

	test("should pass for zero", async () => {
		expectlyAny(0).toBeInteger();
	});

	test("should pass for large integer", async () => {
		expectlyAny(9007199254740991).toBeInteger();
	});

	test("should fail for float", async () => {
		let error: Error | undefined;
		try {
			expectlyAny(3.14).toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to be an integer");
	});

	test("should fail for negative float", async () => {
		expect(() => expectlyAny(-3.14).toBeInteger()).toThrow();
	});

	test("should fail for string number", async () => {
		let error: Error | undefined;
		try {
			expectlyAny("42").toBeInteger();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("string");
	});

	test("should fail for NaN", async () => {
		expect(() => expectlyAny(Number.NaN).toBeInteger()).toThrow();
	});

	test("should fail for Infinity", async () => {
		expect(() => expectlyAny(Number.POSITIVE_INFINITY).toBeInteger()).toThrow();
	});

	test("should fail for null", async () => {
		expect(() => expectlyAny(null).toBeInteger()).toThrow();
	});

	test("should work with .not for floats", async () => {
		expectlyAny(3.14).not.toBeInteger();
		expectlyAny(0.1).not.toBeInteger();
	});

	test("should fail with .not for integers", async () => {
		expect(() => expectlyAny(42).not.toBeInteger()).toThrow(/Expected value to not be an integer/);
	});
});

test.describe("toBeFloat", () => {
	test("should pass for positive float", async () => {
		expectlyAny(3.14).toBeFloat();
	});

	test("should pass for negative float", async () => {
		expectlyAny(-3.14).toBeFloat();
	});

	test("should pass for small decimal", async () => {
		expectlyAny(0.1).toBeFloat();
	});

	test("should pass for result of division", async () => {
		expectlyAny(1 / 3).toBeFloat();
	});

	test("should fail for integer", async () => {
		let error: Error | undefined;
		try {
			expectlyAny(42).toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to be a float");
		expect(error?.message).toContain("value is an integer");
	});

	test("should fail for zero", async () => {
		expect(() => expectlyAny(0).toBeFloat()).toThrow();
	});

	test("should fail for NaN", async () => {
		let error: Error | undefined;
		try {
			expectlyAny(Number.NaN).toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("value is NaN");
	});

	test("should fail for string number", async () => {
		let error: Error | undefined;
		try {
			expectlyAny("3.14").toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("type is string");
	});

	test("should fail for Infinity", async () => {
		let error: Error | undefined;
		try {
			expectlyAny(Number.POSITIVE_INFINITY).toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for integers", async () => {
		expectlyAny(42).not.toBeFloat();
		expectlyAny(0).not.toBeFloat();
	});

	test("should fail with .not for floats", async () => {
		let error: Error | undefined;
		try {
			expectlyAny(3.14).not.toBeFloat();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("Expected value to not be a float");
	});
});

test.describe("toBePrimitive", () => {
	test("should pass for string", async () => {
		expectlyAny("hello").toBePrimitive();
	});

	test("should pass for number", async () => {
		expectlyAny(42).toBePrimitive();
	});

	test("should pass for boolean", async () => {
		expectlyAny(true).toBePrimitive();
	});

	test("should pass for null", async () => {
		expectlyAny(null).toBePrimitive();
	});

	test("should pass for undefined", async () => {
		expectlyAny(undefined).toBePrimitive();
	});

	test("should pass for bigint", async () => {
		expectlyAny(BigInt(123)).toBePrimitive();
	});

	test("should pass for symbol", async () => {
		expectlyAny(Symbol("test")).toBePrimitive();
	});

	test("should fail for object", async () => {
		expect(() => expectlyAny({}).toBePrimitive()).toThrow(/Expected value to be a primitive type/);
	});

	test("should fail for array", async () => {
		expect(() => expectlyAny([]).toBePrimitive()).toThrow();
	});

	test("should fail for function", async () => {
		expect(() => expectlyAny(() => {}).toBePrimitive()).toThrow();
	});

	test("should fail for Date", async () => {
		expect(() => expectlyAny(new Date()).toBePrimitive()).toThrow();
	});

	test("should work with .not for objects", async () => {
		expectlyAny({}).not.toBePrimitive();
		expectlyAny([]).not.toBePrimitive();
		expectlyAny(() => {}).not.toBePrimitive();
	});

	test("should fail with .not for primitives", async () => {
		expect(() => expectlyAny("string").not.toBePrimitive()).toThrow(/Expected value to not be a primitive type/);
	});
});

test.describe("toBeArray", () => {
	test("should pass for empty array", async () => {
		expectlyAny([]).toBeArray();
	});

	test("should pass for array with elements", async () => {
		expectlyAny([1, 2, 3]).toBeArray();
	});

	test("should pass for array of objects", async () => {
		expectlyAny([{ id: 1 }, { id: 2 }]).toBeArray();
	});

	test("should pass for nested arrays", async () => {
		expectlyAny([
			[1, 2],
			[3, 4],
		]).toBeArray();
	});

	test("should fail for object", async () => {
		expect(() => expectlyAny({}).toBeArray()).toThrow(/Expected value to be an array/);
	});

	test("should fail for string", async () => {
		expect(() => expectlyAny("array").toBeArray()).toThrow();
	});

	test("should fail for null", async () => {
		expect(() => expectlyAny(null).toBeArray()).toThrow();
	});

	test("should work with .not for non-arrays", async () => {
		expectlyAny({}).not.toBeArray();
		expectlyAny("string").not.toBeArray();
		expectlyAny(123).not.toBeArray();
	});

	test("should fail with .not for arrays", async () => {
		expect(() => expectlyAny([1, 2, 3]).not.toBeArray()).toThrow(/Expected value to not be an array/);
	});
});

test.describe("toBeObject", () => {
	test("should pass for plain object", async () => {
		expectlyAny({}).toBeObject();
	});

	test("should pass for object with properties", async () => {
		expectlyAny({ id: 1, name: "test" }).toBeObject();
	});

	test("should pass for nested objects", async () => {
		expectlyAny({ user: { id: 1 } }).toBeObject();
	});

	test("should pass for class instance", async () => {
		class Person {
			constructor(public name: string) {}
		}
		expectlyAny(new Person("Alice")).toBeObject();
	});

	test("should fail for array", async () => {
		let error: Error | undefined;
		try {
			expectlyAny([]).toBeObject();
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
			expectlyAny(null).toBeObject();
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("null");
	});

	test("should fail for string", async () => {
		expect(() => expectlyAny("object").toBeObject()).toThrow();
	});

	test("should fail for number", async () => {
		expect(() => expectlyAny(123).toBeObject()).toThrow();
	});

	test("should work with .not for non-objects", async () => {
		expectlyAny([]).not.toBeObject();
		expectlyAny(null).not.toBeObject();
		expectlyAny("string").not.toBeObject();
	});

	test("should fail with .not for objects", async () => {
		expect(() => expectlyAny({ id: 1 }).not.toBeObject()).toThrow(/Expected value to not be an object/);
	});
});
