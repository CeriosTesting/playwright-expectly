import { expect, test } from "@playwright/test";

import { getRejectedErrorSync } from "../../../tests/common/assertion-utils";
import { expectly } from "../src/expectly";
import { expectlyAny } from "../src/expectly-any";
import { expectlyNumberArray } from "../src/expectly-number-array";
import { expectlyObjectArray } from "../src/expectly-object-array";
import { expectlyString } from "../src/expectly-string";
import { expectlyStringArray } from "../src/expectly-string-array";
import { isLowerCase, isTitleCase, isUpperCase, toTitleCase } from "../src/matchers/text-validation-utils";

test.describe("floating-point tolerance", () => {
	test("sums of more than two decimals match their exact decimal value", () => {
		expectlyNumberArray([0.01, 2.03, 1.2]).toHaveSum(3.24);
		expectlyNumberArray(Array.from({ length: 100 }, () => 0.1)).toHaveSum(10);
		expectlyNumberArray(Array.from({ length: 10 }, () => 0.1)).toHaveAverage(0.1);
	});

	test("range tolerates rounding", () => {
		expectlyNumberArray([0.1, 0.3]).toHaveRange(0.2);
	});

	test("real differences still fail", () => {
		expectlyNumberArray([0.01, 2.03, 1.2]).not.toHaveSum(3.25);
		expectlyNumberArray([1000000000000.1, 0.2]).not.toHaveSum(1000000000001);
	});

	test("an explicit tolerance overrides the default", () => {
		expectlyNumberArray([1, 2, 3]).toHaveSum(6.05, { tolerance: 0.1 });
		expectlyNumberArray([1, 2, 3]).not.toHaveSum(6.05, { tolerance: 0.01 });
		expectlyNumberArray([1, 2]).toHaveAverage(1.55, { tolerance: 0.1 });
		expect(() => expectlyNumberArray([1]).toHaveSum(1, { tolerance: -1 })).toThrow("tolerance");
	});

	test("an empty array has no average or median", () => {
		expectlyNumberArray([]).not.toHaveAverage(0);
		expectlyNumberArray([]).not.toHaveMedian(0);
		const error = getRejectedErrorSync(() => expectlyNumberArray([]).toHaveAverage(0));
		expect(error.message).toContain("empty array has no average");
		expectlyNumberArray([]).toHaveSum(0);
	});

	test("toBeAllBetween rejects an inverted range", () => {
		expect(() => expectlyNumberArray([5]).not.toBeAllBetween(10, 0)).toThrow("must not be greater than max");
	});
});

test.describe("received type guards", () => {
	test("array matchers explain a non-array receiver", () => {
		expect(() => expectly(5 as unknown as number[]).toHaveSum(5)).toThrow(
			"toHaveSum: received value must be a number array, got: number",
		);
		expect(() => expectlyNumberArray(["1"] as unknown as number[]).toHaveMin(1)).toThrow("array of string");
	});

	test("string matchers explain a non-string receiver", () => {
		expect(() => expectlyString(null as unknown as string).toStartWith("a")).toThrow(
			"toStartWith: received value must be a string, got: null",
		);
		expect(() => expectly(123 as unknown as string).toStartWith("1")).toThrow("got: number");
	});

	test("an object with an innerText property is not treated as a locator", () => {
		expect(() => expectly({ innerText: "x" } as unknown as string).toStartWith("x")).toThrow("got: Object");
	});

	test("toMatchPattern rejects a string pattern instead of matching everything", () => {
		expect(() => expectlyString("abc").toMatchPattern("xyz" as unknown as RegExp)).toThrow("Expected a RegExp");
	});
});

test.describe("toEqualPartially with non-plain objects", () => {
	class User {
		constructor(
			public id: number,
			public name: string,
		) {}
		get label(): string {
			return `${this.id}:${this.name}`;
		}
	}

	test("matches the fields of class instances", () => {
		expectlyAny(new User(1, "Ann")).toEqualPartially({ id: 1 });
		expectlyAny([new User(1, "Ann"), new User(2, "Bob")]).toEqualPartially([{ id: 2 }]);
		expectlyAny(new User(1, "Ann")).not.toEqualPartially({ id: 2 });
	});

	test("reads getters from the prototype", () => {
		expectlyAny(new User(1, "Ann")).toEqualPartially({ label: "1:Ann" });
	});

	test("matches errors and objects with a custom prototype", () => {
		expectlyAny(Object.assign(new Error("boom"), { code: "E1" })).toEqualPartially({ code: "E1", message: "boom" });
		const withPrototype = Object.assign(Object.create({ inherited: true }) as object, { own: 1, extra: 2 });
		expectlyAny(withPrototype).toEqualPartially({ own: 1 });
	});

	test("keeps comparing built-in values whole", () => {
		expectlyAny({ at: new Date(0) }).toEqualPartially({ at: new Date(0) });
		expectlyAny({ at: new Date(0) }).not.toEqualPartially({ at: new Date(1) });
	});

	test("does not treat Object.prototype members as present keys", () => {
		expectlyAny({}).toEqualPartially({ toString: undefined });
		expectlyAny({}).not.toEqualPartially({ toString: undefined }, { requireExplicitUndefinedKeyPresence: true });
	});

	test("matches symbol keys", () => {
		const key = Symbol("key");
		expectlyAny({ [key]: 1, other: 2 }).toEqualPartially({ [key]: 1 });
		expectlyAny({ [key]: 1, other: 2 }).not.toEqualPartially({ [key]: 2 });
	});
});

test.describe("sorting objects by a property", () => {
	test("throws for values that cannot be ordered instead of passing", () => {
		expect(() =>
			expectlyObjectArray([{ v: 3 }, { v: Number.NaN }, { v: 1 }]).toHaveObjectsInAscendingOrderBy("v"),
		).toThrow("NaN");
		expect(() =>
			expectlyObjectArray([{ v: new Date(5) }, { v: new Date("x") }]).toHaveObjectsInAscendingOrderBy("v"),
		).toThrow("Invalid Date");
		expect(() => expectlyObjectArray([{ v: { a: 2 } }, { v: { a: 1 } }]).toHaveObjectsInAscendingOrderBy("v")).toThrow(
			"cannot be ordered",
		);
	});

	test("orders valid dates by time", () => {
		expectlyObjectArray([{ v: new Date(1) }, { v: new Date(5) }]).toHaveObjectsInAscendingOrderBy("v");
		expectlyObjectArray([{ v: new Date(5) }, { v: new Date(1) }]).not.toHaveObjectsInAscendingOrderBy("v");
	});

	test("reads getters", () => {
		class Item {
			constructor(private readonly value: number) {}
			get rank(): number {
				return this.value;
			}
		}
		expectlyObjectArray([new Item(1), new Item(2)]).toHaveObjectsInAscendingOrderBy("rank");
	});
});

test.describe("validators", () => {
	test("UUIDs of all RFC 9562 versions, nil and max", () => {
		expectlyString("018f4a3c-7b2e-7c1d-9e3f-0a1b2c3d4e5f").toBeUUID();
		expectlyString("018f4a3c-7b2e-7c1d-9e3f-0a1b2c3d4e5f").toBeUUID(7);
		expectlyString("1ec9414c-232a-6b00-b3c8-9e6bdeced846").toBeUUID(6);
		expectlyString("00000000-0000-0000-0000-000000000000").toBeUUID();
		expectlyString("ffffffff-ffff-ffff-ffff-ffffffffffff").toBeUUID();
		expectlyString("018f4a3c-7b2e-9c1d-9e3f-0a1b2c3d4e5f").not.toBeUUID();
	});

	test("URLs need a web scheme and a host by default", () => {
		for (const text of [
			"localhost:3000",
			"C:\\Windows",
			"javascript:alert(1)",
			"a:",
			"http:/example.com",
			"http://-",
			"Note: hello",
		]) {
			expectlyString(text).not.toBeValidUrl();
		}
		for (const text of [
			"https://example.com",
			"http://localhost:3000",
			"http://192.168.1.1",
			"https://[::1]:8080/x",
			"https://münchen.de",
		]) {
			expectlyString(text).toBeValidUrl();
		}
	});

	test("URLs accept other schemes when asked", () => {
		expectlyString("mailto:user@example.com").toBeValidUrl({ protocols: ["mailto"] });
		expectlyString("ftp://files.example.com").toBeValidUrl({ protocols: ["ftp:"] });
		expectlyString("ftp://files.example.com").not.toBeValidUrl();
	});

	test("emails reject malformed dots and hyphens", () => {
		for (const text of ["a@b..c", "a@.b.c", "a@b.c.", ".a@b.com", "a.@b.com", "a..b@c.d", "a@-b.com", "a@b-.com"]) {
			expectlyString(text).not.toBeValidEmail();
		}
		expectlyString("first.last+tag@sub.example.co.uk").toBeValidEmail();
	});

	test("case checks are Unicode-aware", () => {
		for (const text of ["ÄÖÜ", "ПРИВЕТ", "HELLO 123"]) expect(isUpperCase(text), text).toBe(true);
		for (const text of ["ß", "привет", "hello 123"]) expect(isLowerCase(text), text).toBe(true);
		for (const text of ["Élan Vital", "Über Alles", "Jean-Luc Picard", "Hello McDonald", "Don't Stop", "OK Computer"]) {
			expect(isTitleCase(text), text).toBe(true);
		}
		for (const text of ["hello world", "HELLO WORLD", "Hello world", "élan Vital"]) {
			expect(isTitleCase(text), text).toBe(false);
		}
		expect(toTitleCase("HELLO wORLD")).toBe("Hello WORLD");
	});

	test("alphanumeric accepts Unicode letters when asked", () => {
		expectlyString("café").not.toBeAlphanumeric();
		expectlyString("café").toBeAlphanumeric({ unicode: true });
		expectlyString("café!").not.toBeAlphanumeric({ unicode: true });
	});
});

test.describe("toBeInteger", () => {
	test("accepts BigInt", () => {
		expectlyAny(5n).toBeInteger();
	});
});

test.describe("string ordering", () => {
	test("compares numerically or by locale when asked", () => {
		expectlyStringArray(["2", "10"]).not.toHaveAscendingOrder();
		expectlyStringArray(["2", "10"]).toHaveAscendingOrder({ numeric: true });
		expectlyStringArray(["9.99", "19.99"]).toHaveStrictlyAscendingOrder({ numeric: true });
		expectlyStringArray(["b", "A", "a"]).toHaveDescendingOrder({ locale: "en" });
		expectlyStringArray(["a", "A", "b"]).not.toHaveAscendingOrder();
		expectlyStringArray(["1", "2", "10"]).toBeMonotonic({ numeric: true });
	});

	test("the combined expectly prints numbers for number arrays", () => {
		const error = getRejectedErrorSync(() => expectly([1, 1]).toHaveStrictlyAscendingOrder());
		expect(error.message).not.toContain('"1"');
		expectly(["2", "10"]).toHaveAscendingOrder({ numeric: true });
	});
});
