import { expect, test } from "@playwright/test";

import { expectlyAny } from "../src/expectly-any";

import { getRejectedErrorSync } from "./helpers/assertion-utils";

const getBigIntConstructor = (): ((value: number) => unknown) => {
	const globalObject = globalThis as unknown as { BigInt?: (value: number) => unknown };
	if (!globalObject.BigInt) {
		throw new Error("BigInt is not available in this runtime");
	}

	return globalObject.BigInt;
};

test.describe("toBeAnyOf", () => {
	test("should pass when value matches first possibility", () => {
		expectlyAny(5).toBeAnyOf(5, 10, 15);
	});

	test("should pass when value matches middle possibility", () => {
		expectlyAny(10).toBeAnyOf(5, 10, 15);
	});

	test("should pass when value matches last possibility", () => {
		expectlyAny(15).toBeAnyOf(5, 10, 15);
	});

	test("should pass with string values", () => {
		expectlyAny("hello").toBeAnyOf("hello", "world", "test");
	});

	test("should pass with boolean values", () => {
		expectlyAny(true).toBeAnyOf(true, false);
	});

	test("should pass with null value", () => {
		expectlyAny(null).toBeAnyOf(null, undefined, 0);
	});

	test("should pass with undefined value", () => {
		expectlyAny(undefined).toBeAnyOf(null, undefined, 0);
	});

	test("should pass with zero", () => {
		expectlyAny(0).toBeAnyOf(0, 1, 2);
	});

	test("should pass with empty string", () => {
		expectlyAny("").toBeAnyOf("", "a", "b");
	});

	test("should pass with NaN", () => {
		expectlyAny(Number.NaN).toBeAnyOf(Number.NaN, 0, 1);
	});

	test("should pass with single possibility", () => {
		expectlyAny(42).toBeAnyOf(42);
	});

	test("should pass with mixed types in possibilities", () => {
		expectlyAny("5").toBeAnyOf(5, "5", true);
	});

	test("should pass with negative numbers", () => {
		expectlyAny(-10).toBeAnyOf(-10, -5, 0, 5, 10);
	});

	test("should pass with floating point numbers", () => {
		expectlyAny(3.14).toBeAnyOf(2.71, 3.14, 1.41);
	});

	test("should pass with object comparison", () => {
		const obj = { id: 1, name: "test" };
		expectlyAny(obj).toBeAnyOf({ id: 1, name: "test" }, { id: 2, name: "other" });
	});

	test("should pass with array comparison", () => {
		const arr = [1, 2, 3];
		expectlyAny(arr).toBeAnyOf([1, 2, 3], [4, 5, 6]);
	});

	test("should pass with nested objects", () => {
		const obj = { user: { id: 1, name: "Alice" }, active: true };
		expectlyAny(obj).toBeAnyOf(
			{ user: { id: 1, name: "Alice" }, active: true },
			{ user: { id: 2, name: "Bob" }, active: false },
		);
	});

	test("should fail when value doesn't match any possibility", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny(20).toBeAnyOf(5, 10, 15);
		});
		expect(error.message).toContain("toBeAnyOf");
		expect(error.message).toContain("Expected value to be one of the provided possibilities");
		expect(error.message).toContain("Received");
		expect(error.message).toContain("Possibilities");
	});

	test("should fail when string doesn't match any possibility", () => {
		expect(() => {
			expectlyAny("foo").toBeAnyOf("bar", "baz", "qux");
		}).toThrow(/toBeAnyOf/);
	});

	test("should fail with type mismatch", () => {
		expect(() => {
			expectlyAny("5").toBeAnyOf(5, 10, 15);
		}).toThrow();
	});

	test("should fail when object doesn't match", () => {
		expect(() => {
			expectlyAny({ id: 3 }).toBeAnyOf({ id: 1 }, { id: 2 });
		}).toThrow();
	});

	test("should fail when array doesn't match", () => {
		expect(() => {
			expectlyAny([1, 2, 3]).toBeAnyOf([1, 2], [1, 2, 3, 4]);
		}).toThrow();
	});

	test("should work with .not when value matches a possibility", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny(10).not.toBeAnyOf(5, 10, 15);
		});
		expect(error.message).toContain("not");
		expect(error.message).toContain("Expected value to not be any of the provided possibilities");
	});

	test("should work with .not when value doesn't match any possibility", () => {
		expectlyAny(20).not.toBeAnyOf(5, 10, 15);
	});

	test("should handle empty possibilities array", () => {
		expect(() => {
			expectlyAny(5).toBeAnyOf();
		}).toThrow();
	});

	test("should distinguish between null and undefined", () => {
		expect(() => {
			expectlyAny(null).toBeAnyOf(undefined);
		}).toThrow();
	});

	test("should distinguish between 0 and false", () => {
		expect(() => {
			expectlyAny(0).toBeAnyOf(false);
		}).toThrow();
	});

	test("should distinguish between empty string and false", () => {
		expect(() => {
			expectlyAny("").toBeAnyOf(false);
		}).toThrow();
	});

	test("should handle symbols", () => {
		const sym1 = Symbol("test");
		const sym2 = Symbol("test");
		expectlyAny(sym1).toBeAnyOf(sym1, sym2);
	});

	test("should handle BigInt values", () => {
		const bigIntConstructor = getBigIntConstructor();

		const bigInt = bigIntConstructor(9007199254740991);
		expectlyAny(bigInt).toBeAnyOf(bigIntConstructor(123), bigInt, bigIntConstructor(456));
	});

	test("should handle Date objects", () => {
		const date = new Date("2023-01-01");
		expectlyAny(date).toBeAnyOf(date, new Date("2023-01-02"));
	});

	test("should handle RegExp objects", () => {
		const regex = /test/i;
		expectlyAny(regex).toBeAnyOf(/other/, regex);
	});

	test("should handle class instances", () => {
		class Person {
			constructor(public name: string) {}
		}
		const person = new Person("Alice");
		expectlyAny(person).toBeAnyOf(person, new Person("Bob"));
	});

	test("should handle functions", () => {
		const fn1 = (): string => "test";
		const fn2 = (): string => "other";
		expectlyAny(fn1).toBeAnyOf(fn1, fn2);
	});

	test("should handle complex nested structures", () => {
		const complex = {
			users: [
				{ id: 1, name: "Alice", tags: ["admin", "user"] },
				{ id: 2, name: "Bob", tags: ["user"] },
			],
			metadata: { version: 1, timestamp: "2023-01-01" },
		};

		expectlyAny(complex).toBeAnyOf(complex, { users: [], metadata: {} });
	});

	test("should handle multiple object possibilities", () => {
		const obj = { status: "active", count: 5 };
		expectlyAny(obj).toBeAnyOf(
			{ status: "inactive", count: 0 },
			{ status: "pending", count: 3 },
			{ status: "active", count: 5 },
		);
	});

	test("should work with large number of possibilities", () => {
		const possibilities = Array.from({ length: 100 }, (_, i) => i);
		expectlyAny(50).toBeAnyOf(...possibilities);
	});

	test("should handle Infinity values", () => {
		expectlyAny(Number.POSITIVE_INFINITY).toBeAnyOf(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0);
	});

	test("should handle negative Infinity values", () => {
		expectlyAny(Number.NEGATIVE_INFINITY).toBeAnyOf(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0);
	});

	test("should match objects with same structure and values", () => {
		// JSON.stringify preserves insertion order, so these should be equal
		const obj1 = { a: 1, b: 2 };
		const obj2 = { a: 1, b: 2 };
		const obj3 = { c: 3 };
		expectlyAny(obj1).toBeAnyOf(obj3, obj2, obj3);
	});

	test("should handle parsed JSON objects", () => {
		// These have same serialization
		const obj1: unknown = JSON.parse('{"a":1,"b":2}');
		const obj2: unknown = JSON.parse('{"c":3}');
		const obj3: unknown = JSON.parse('{"a":1,"b":2}');
		expectlyAny(obj1).toBeAnyOf(obj2, obj3);
	});

	test("should provide clear error message with multiple types", () => {
		expect(() => {
			expectlyAny(100).toBeAnyOf("one", true, null, { value: 1 }, [1, 2, 3]);
		}).toThrow(/100/);
	});

	test("should handle circular references by reference equality", () => {
		const obj1: { name: string; self?: unknown } = { name: "test" };
		obj1.self = obj1;

		const obj2 = { name: "different" };

		// This will use === comparison due to JSON.stringify throwing
		// Should pass because obj1 is the same reference
		expectlyAny(obj1).toBeAnyOf(obj1, obj2);
	});

	test("should fail when object possibility has explicit undefined key missing in received", () => {
		expect(() => {
			expectlyAny({ id: 1 }).toBeAnyOf({ id: 1, optional: undefined });
		}).toThrow(/toBeAnyOf/);
	});

	test("should pass when object possibility has explicit undefined key present in received", () => {
		expectlyAny({ id: 1, optional: undefined }).toBeAnyOf({ id: 1, optional: undefined });
	});
});

test.describe("toBeNullish", () => {
	test("should pass for null", () => {
		expectlyAny(null).toBeNullish();
	});

	test("should pass for undefined", () => {
		expectlyAny(undefined).toBeNullish();
	});

	test("should pass for explicitly undefined variable", () => {
		const value: undefined = undefined;
		expectlyAny(value).toBeNullish();
	});

	test("should fail for 0", () => {
		expect(() => {
			expectlyAny(0).toBeNullish();
		}).toThrow(/Expected value to be nullish/);
	});

	test("should fail for false", () => {
		expect(() => {
			expectlyAny(false).toBeNullish();
		}).toThrow();
	});

	test("should fail for empty string", () => {
		expect(() => {
			expectlyAny("").toBeNullish();
		}).toThrow();
	});

	test("should fail for NaN", () => {
		expect(() => {
			expectlyAny(Number.NaN).toBeNullish();
		}).toThrow();
	});

	test("should fail for empty object", () => {
		expect(() => {
			expectlyAny({}).toBeNullish();
		}).toThrow();
	});

	test("should fail for empty array", () => {
		expect(() => {
			expectlyAny([]).toBeNullish();
		}).toThrow();
	});

	test("should work with .not for non-nullish values", () => {
		expectlyAny(0).not.toBeNullish();
		expectlyAny(false).not.toBeNullish();
		expectlyAny("").not.toBeNullish();
		expectlyAny({}).not.toBeNullish();
	});

	test("should fail with .not for null", () => {
		expect(() => {
			expectlyAny(null).not.toBeNullish();
		}).toThrow(/Expected value to not be nullish/);
	});

	test("should fail with .not for undefined", () => {
		expect(() => {
			expectlyAny(undefined).not.toBeNullish();
		}).toThrow();
	});
});

test.describe("toBeInteger", () => {
	test("should pass for positive integer", () => {
		expectlyAny(42).toBeInteger();
	});

	test("should pass for negative integer", () => {
		expectlyAny(-42).toBeInteger();
	});

	test("should pass for zero", () => {
		expectlyAny(0).toBeInteger();
	});

	test("should pass for large integer", () => {
		expectlyAny(9007199254740991).toBeInteger();
	});

	test("should fail for float", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny(3.14).toBeInteger();
		});
		expect(error.message).toContain("Expected value to be an integer");
	});

	test("should fail for negative float", () => {
		expect(() => {
			expectlyAny(-3.14).toBeInteger();
		}).toThrow();
	});

	test("should fail for string number", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny("42").toBeInteger();
		});
		expect(error.message).toContain("string");
	});

	test("should fail for NaN", () => {
		expect(() => {
			expectlyAny(Number.NaN).toBeInteger();
		}).toThrow();
	});

	test("should fail for Infinity", () => {
		expect(() => {
			expectlyAny(Number.POSITIVE_INFINITY).toBeInteger();
		}).toThrow();
	});

	test("should fail for null", () => {
		expect(() => {
			expectlyAny(null).toBeInteger();
		}).toThrow();
	});

	test("should work with .not for floats", () => {
		expectlyAny(3.14).not.toBeInteger();
		expectlyAny(0.1).not.toBeInteger();
	});

	test("should fail with .not for integers", () => {
		expect(() => {
			expectlyAny(42).not.toBeInteger();
		}).toThrow(/Expected value to not be an integer/);
	});
});

test.describe("toBeFloat", () => {
	test("should pass for positive float", () => {
		expectlyAny(3.14).toBeFloat();
	});

	test("should pass for negative float", () => {
		expectlyAny(-3.14).toBeFloat();
	});

	test("should pass for small decimal", () => {
		expectlyAny(0.1).toBeFloat();
	});

	test("should pass for result of division", () => {
		expectlyAny(1 / 3).toBeFloat();
	});

	test("should fail for integer", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny(42).toBeFloat();
		});
		expect(error.message).toContain("Expected value to be a float");
		expect(error.message).toContain("value is an integer");
	});

	test("should fail for zero", () => {
		expect(() => {
			expectlyAny(0).toBeFloat();
		}).toThrow();
	});

	test("should fail for NaN", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny(Number.NaN).toBeFloat();
		});
		expect(error.message).toContain("value is NaN");
	});

	test("should fail for string number", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny("3.14").toBeFloat();
		});
		expect(error.message).toContain("type is string");
	});

	test("should fail for Infinity", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny(Number.POSITIVE_INFINITY).toBeFloat();
		});
		expect(error.message).toContain("Expected value to be a float");
	});

	test("should work with .not for integers", () => {
		expectlyAny(42).not.toBeFloat();
		expectlyAny(0).not.toBeFloat();
	});

	test("should fail with .not for floats", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny(3.14).not.toBeFloat();
		});
		expect(error.message).toContain("Expected value to not be a float");
	});
});

test.describe("toBePrimitive", () => {
	test("should pass for string", () => {
		expectlyAny("hello").toBePrimitive();
	});

	test("should pass for number", () => {
		expectlyAny(42).toBePrimitive();
	});

	test("should pass for boolean", () => {
		expectlyAny(true).toBePrimitive();
	});

	test("should pass for null", () => {
		expectlyAny(null).toBePrimitive();
	});

	test("should pass for undefined", () => {
		expectlyAny(undefined).toBePrimitive();
	});

	test("should pass for bigint", () => {
		const bigIntConstructor = getBigIntConstructor();

		expectlyAny(bigIntConstructor(123)).toBePrimitive();
	});

	test("should pass for symbol", () => {
		expectlyAny(Symbol("test")).toBePrimitive();
	});

	test("should fail for object", () => {
		expect(() => {
			expectlyAny({}).toBePrimitive();
		}).toThrow(/Expected value to be a primitive type/);
	});

	test("should fail for array", () => {
		expect(() => {
			expectlyAny([]).toBePrimitive();
		}).toThrow();
	});

	test("should fail for function", () => {
		expect(() => {
			expectlyAny(() => {}).toBePrimitive();
		}).toThrow();
	});

	test("should fail for Date", () => {
		expect(() => {
			expectlyAny(new Date()).toBePrimitive();
		}).toThrow();
	});

	test("should work with .not for objects", () => {
		expectlyAny({}).not.toBePrimitive();
		expectlyAny([]).not.toBePrimitive();
		expectlyAny(() => {}).not.toBePrimitive();
	});

	test("should fail with .not for primitives", () => {
		expect(() => {
			expectlyAny("string").not.toBePrimitive();
		}).toThrow(/Expected value to not be a primitive type/);
	});
});

test.describe("toBeArray", () => {
	test("should pass for empty array", () => {
		expectlyAny([]).toBeArray();
	});

	test("should pass for array with elements", () => {
		expectlyAny([1, 2, 3]).toBeArray();
	});

	test("should pass for array of objects", () => {
		expectlyAny([{ id: 1 }, { id: 2 }]).toBeArray();
	});

	test("should pass for nested arrays", () => {
		expectlyAny([
			[1, 2],
			[3, 4],
		]).toBeArray();
	});

	test("should fail for object", () => {
		expect(() => {
			expectlyAny({}).toBeArray();
		}).toThrow(/Expected value to be an array/);
	});

	test("should fail for string", () => {
		expect(() => {
			expectlyAny("array").toBeArray();
		}).toThrow();
	});

	test("should fail for null", () => {
		expect(() => {
			expectlyAny(null).toBeArray();
		}).toThrow();
	});

	test("should work with .not for non-arrays", () => {
		expectlyAny({}).not.toBeArray();
		expectlyAny("string").not.toBeArray();
		expectlyAny(123).not.toBeArray();
	});

	test("should fail with .not for arrays", () => {
		expect(() => {
			expectlyAny([1, 2, 3]).not.toBeArray();
		}).toThrow(/Expected value to not be an array/);
	});
});

test.describe("toBeObject", () => {
	test("should pass for plain object", () => {
		expectlyAny({}).toBeObject();
	});

	test("should pass for object with properties", () => {
		expectlyAny({ id: 1, name: "test" }).toBeObject();
	});

	test("should pass for nested objects", () => {
		expectlyAny({ user: { id: 1 } }).toBeObject();
	});

	test("should pass for class instance", () => {
		class Person {
			constructor(public name: string) {}
		}
		expectlyAny(new Person("Alice")).toBeObject();
	});

	test("should fail for array", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny([]).toBeObject();
		});
		expect(error.message).toContain("Expected value to be an object");
		expect(error.message).toContain("array");
	});

	test("should fail for null", () => {
		const error = getRejectedErrorSync(() => {
			expectlyAny(null).toBeObject();
		});
		expect(error.message).toContain("null");
	});

	test("should fail for string", () => {
		expect(() => {
			expectlyAny("object").toBeObject();
		}).toThrow();
	});

	test("should fail for number", () => {
		expect(() => {
			expectlyAny(123).toBeObject();
		}).toThrow();
	});

	test("should work with .not for non-objects", () => {
		expectlyAny([]).not.toBeObject();
		expectlyAny(null).not.toBeObject();
		expectlyAny("string").not.toBeObject();
	});

	test("should fail with .not for objects", () => {
		expect(() => {
			expectlyAny({ id: 1 }).not.toBeObject();
		}).toThrow(/Expected value to not be an object/);
	});
});
