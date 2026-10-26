import { expect, test } from "@playwright/test";

import { getRejectedError, getRejectedErrorSync, stripAnsi } from "../../../tests/common/assertion-utils";
import { expectly } from "../src/expectly";
import { expectlyAny } from "../src/expectly-any";
import { expectlyCollection } from "../src/expectly-collection";
import { expectlyFunction } from "../src/expectly-function";
import { expectlyString } from "../src/expectly-string";

test.describe("predicates", () => {
	test("toSatisfy, toSatisfyAll and toSatisfyAny", () => {
		expectlyAny(5).toSatisfy((value) => value > 3);
		expectlyAny(5).not.toSatisfy((value) => value > 10);
		expectlyCollection([2, 4, 6]).toSatisfyAll((value) => value % 2 === 0);
		expectlyCollection([1, 4]).not.toSatisfyAll((value) => value % 2 === 0);
		expectlyCollection([1, 4]).toSatisfyAny((value) => value % 2 === 0);
		expectlyCollection([1, 3]).not.toSatisfyAny((value) => value % 2 === 0);
	});

	test("reports failing indexes", () => {
		const error = getRejectedErrorSync(() => expectlyCollection([2, 3, 4, 5]).toSatisfyAll((value) => value % 2 === 0));
		expect(error.message).toContain("Failing indexes: 1, 3");
	});

	test("the combined expectly types the element", () => {
		expectly([{ active: true }]).toSatisfyAll((user) => user.active);
	});
});

test.describe("members", () => {
	test("toIncludeSameMembers ignores order but not counts", () => {
		expectlyCollection([1, 2, 3]).toIncludeSameMembers([3, 1, 2]);
		expectlyCollection([{ id: 1 }, { id: 2 }]).toIncludeSameMembers([{ id: 2 }, { id: 1 }]);
		expectlyCollection([1, 1, 2]).not.toIncludeSameMembers([1, 2, 2]);
		expectlyCollection([1, 2]).not.toIncludeSameMembers([1, 2, 3]);
	});

	test("toIncludeAllMembers and toIncludeAnyMembers", () => {
		expectlyCollection(["read", "write", "admin"]).toIncludeAllMembers(["write", "read"]);
		expectlyCollection(["read"]).not.toIncludeAllMembers(["read", "write"]);
		expectlyCollection(["ok", "failed"]).toIncludeAnyMembers(["failed", "error"]);
		expectlyCollection(["ok"]).not.toIncludeAnyMembers(["failed", "error"]);
	});

	test("members can be asymmetric matchers", () => {
		expectlyCollection([{ id: 7, name: "x" }]).toIncludeAllMembers([expect.objectContaining({ id: 7 })]);
		expectlyCollection([1, "a"]).toIncludeSameMembers([expect.any(String), expect.any(Number)]);
	});

	test("reports missing and unexpected members", () => {
		const error = getRejectedErrorSync(() => expectlyCollection([1, 2, 4]).toIncludeSameMembers([1, 2, 3]));
		const message = stripAnsi(error.message);
		expect(message).toContain("Missing: [3]");
		expect(message).toContain("Unexpected: [4]");
	});
});

test.describe("keys and entries", () => {
	const user = { id: 1, email: "a@b.c", role: "admin" };

	test("toContainKey, toContainKeys and toContainAllKeys", () => {
		expectlyCollection(user).toContainKey("id");
		expectlyCollection(user).not.toContainKey("toString");
		expectlyCollection(user).toContainKeys(["id", "email"]);
		expectlyCollection(user).not.toContainKeys(["id", "phone"]);
		expectlyCollection(user).toContainAllKeys(["role", "id", "email"]);
		expectlyCollection(user).not.toContainAllKeys(["id", "email"]);
	});

	test("toContainEntry and toContainEntries", () => {
		expectlyCollection(user).toContainEntry(["role", "admin"]);
		expectlyCollection(user).not.toContainEntry(["role", "user"]);
		expectlyCollection({ nested: { a: 1 } }).toContainEntry(["nested", { a: 1 }]);
		expectlyCollection(user).toContainEntries([
			["id", 1],
			["role", "admin"],
		]);
		expectlyCollection(user).not.toContainEntries([
			["id", 1],
			["role", "user"],
		]);
	});

	test("toBeEmptyObject", () => {
		expectlyCollection({}).toBeEmptyObject();
		expectlyCollection({ a: 1 }).not.toBeEmptyObject();
		expectlyCollection([]).not.toBeEmptyObject();
		expectlyCollection(null).not.toBeEmptyObject();
	});

	test("rejects non-object receivers for key matchers", () => {
		expect(() => expectlyCollection([1]).toContainKey("0")).toThrow("received value must be an object, got: array");
	});
});

test.describe("strings", () => {
	test("toEqualCaseInsensitive folds case without a locale", () => {
		expectlyString("Hello World").toEqualCaseInsensitive("hello world");
		expectlyString("Straße").toEqualCaseInsensitive("STRASSE");
		expectlyString("Hello").not.toEqualCaseInsensitive("Help");
	});

	test("toEqualIgnoringWhitespace", () => {
		expectlyString("1 234 567\n").toEqualIgnoringWhitespace("1234567");
		expectlyString("a b").not.toEqualIgnoringWhitespace("ab c");
	});

	test("toBeHexadecimal", () => {
		expectlyString("0x1F").toBeHexadecimal();
		expectlyString("deadBEEF").toBeHexadecimal();
		expectlyString("0x1F").not.toBeHexadecimal({ prefix: "forbidden" });
		expectlyString("1F").not.toBeHexadecimal({ prefix: "required" });
		expectlyString("0x").not.toBeHexadecimal();
		expectlyString("xyz").not.toBeHexadecimal();
	});
});

test.describe("numbers", () => {
	test("toBeEven, toBeOdd and toBeFinite", () => {
		expectlyAny(4).toBeEven();
		expectlyAny(-3).toBeOdd();
		expectlyAny(10n).toBeEven();
		expectlyAny(2.5).not.toBeEven();
		expectlyAny(2.5).not.toBeOdd();
		expectlyAny("4").not.toBeEven();
		expectlyAny(1.5).toBeFinite();
		expectlyAny(Number.NaN).not.toBeFinite();
		expectlyAny(Infinity).not.toBeFinite();
		expectlyAny("1").not.toBeFinite();
	});
});

test.describe("promises and functions", () => {
	test("toResolve and toReject accept promises and functions", async () => {
		await expectlyFunction(Promise.resolve(1)).toResolve();
		await expectlyFunction(() => Promise.reject(new Error("x"))).toReject();
		await expectlyFunction(Promise.resolve(1)).not.toReject();
		await expectlyFunction(() => {
			throw new Error("sync");
		}).toReject();
	});

	test("toResolve reports the rejection reason", async () => {
		const error = await getRejectedError(expectlyFunction(Promise.reject(new TypeError("boom"))).toResolve());
		expect(error.message).toContain("Rejected with: TypeError: boom");
	});

	test("toThrowWithMessage checks type and message", () => {
		const parse = (): never => {
			throw new TypeError("Input must not be empty");
		};
		expectlyFunction(parse).toThrowWithMessage(TypeError, "Input must not be empty");
		expectlyFunction(parse).toThrowWithMessage(Error, /must not/);
		expectlyFunction(parse).not.toThrowWithMessage(RangeError, "Input must not be empty");
		expectlyFunction(parse).not.toThrowWithMessage(TypeError, "Input must not");
		expectlyFunction(() => 1).not.toThrowWithMessage(Error, "x");
	});

	test("toThrowWithMessage awaits async functions", async () => {
		await expectlyFunction(() => Promise.reject(new RangeError("timeout after 5s"))).toThrowWithMessage(
			RangeError,
			/timeout/,
		);
	});
});
