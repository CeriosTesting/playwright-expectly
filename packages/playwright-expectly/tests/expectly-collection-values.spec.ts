import { expect, test } from "@playwright/test";

import { getRejectedErrorSync, stripAnsi } from "../../../tests/common/assertion-utils";
import { expectly } from "../src/expectly";
import { expectlyCollection } from "../src/expectly-collection";

const order = { id: 7, status: "shipped", total: 19.5, customer: { name: "Ada" } };

test.describe("toContainValue", () => {
	test("finds a value with toEqual semantics", () => {
		expectlyCollection(order).toContainValue("shipped");
		expectlyCollection(order).toContainValue({ name: "Ada" });
		expectlyCollection(order).toContainValue(expect.any(Number));
		expectlyCollection(order).not.toContainValue("pending");
		expectly(order).toContainValue(7);
	});

	test("reads symbol keys and ignores inherited values", () => {
		const marker = Symbol("marker");
		const value = Object.assign(Object.create({ inherited: "yes" }) as object, { [marker]: "tagged" });
		expectlyCollection(value).toContainValue("tagged");
		expectlyCollection(value).not.toContainValue("yes");
	});

	test("rejects non-object receivers", () => {
		expect(() => expectlyCollection([1, 2]).toContainValue(1)).toThrow(/must be an object/);
	});
});

test.describe("toContainValues", () => {
	test("requires every value to occur", () => {
		expectlyCollection(order).toContainValues([7, "shipped"]);
		expectlyCollection({ a: 1 }).toContainValues([1, 1]);
		expectlyCollection(order).not.toContainValues([7, "pending"]);
	});

	test("lists the missing values", () => {
		const error = getRejectedErrorSync(() => expectlyCollection(order).toContainValues([7, "pending"]));
		expect(stripAnsi(error.message)).toContain('Missing values: ["pending"]');
	});
});

test.describe("toContainAllValues", () => {
	test("requires exactly these values in any order, counting repeats", () => {
		expectlyCollection({ a: 1, b: 2, c: 2 }).toContainAllValues([2, 1, 2]);
		expectlyCollection({ a: 1, b: 2, c: 2 }).not.toContainAllValues([1, 2]);
		expectlyCollection({ a: 1, b: 2 }).not.toContainAllValues([1, 2, 3]);
		expectlyCollection({}).toContainAllValues([]);
	});

	test("lists missing and unexpected values", () => {
		const error = getRejectedErrorSync(() => expectlyCollection({ a: 1, b: 2 }).toContainAllValues([1, 3]));
		const message = stripAnsi(error.message);
		expect(message).toContain("Missing values: [3]");
		expect(message).toContain("Unexpected values: [2]");
	});
});

test.describe("toContainAnyValues", () => {
	test("passes when at least one value occurs", () => {
		expectlyCollection(order).toContainAnyValues(["pending", "shipped"]);
		expectlyCollection(order).not.toContainAnyValues(["pending", "cancelled"]);
	});

	test("rejects an empty list", () => {
		expect(() => expectlyCollection(order).toContainAnyValues([])).toThrow(/values must not be empty/);
	});
});

test.describe("toContainAnyKeys", () => {
	test("passes when at least one own key exists", () => {
		const marker = Symbol("marker");
		expectlyCollection({ message: "x" }).toContainAnyKeys(["detail", "message"]);
		expectlyCollection({ [marker]: 1 }).toContainAnyKeys([marker]);
		expectlyCollection({ message: "x" }).not.toContainAnyKeys(["detail", "title"]);
	});

	test("reports the found keys", () => {
		const error = getRejectedErrorSync(() =>
			expectlyCollection({ message: "x" }).not.toContainAnyKeys(["detail", "message"]),
		);
		expect(stripAnsi(error.message)).toContain('Found keys: ["message"]');
	});

	test("rejects an empty list", () => {
		expect(() => expectlyCollection(order).toContainAnyKeys([])).toThrow(/keys must not be empty/);
	});
});

test.describe("toContainAnyEntries", () => {
	test("passes when at least one entry matches", () => {
		expectlyCollection({ role: "owner" }).toContainAnyEntries([
			["role", "admin"],
			["role", "owner"],
		]);
		expectlyCollection(order).toContainAnyEntries([["total", expect.any(Number)]]);
		expectlyCollection({ role: "viewer" }).not.toContainAnyEntries([
			["role", "admin"],
			["active", true],
		]);
	});

	test("rejects an empty list and malformed entries", () => {
		expect(() => expectlyCollection(order).toContainAnyEntries([])).toThrow(/entries must not be empty/);
		expect(() => expectlyCollection(order).toContainAnyEntries([["id"] as unknown as [PropertyKey, unknown]])).toThrow(
			/every entry must be a \[key, value\] pair/,
		);
	});
});
