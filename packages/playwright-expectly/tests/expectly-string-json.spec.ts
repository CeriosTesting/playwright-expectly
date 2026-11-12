import { expect, test } from "@playwright/test";

import { getRejectedErrorSync, stripAnsi } from "../../../tests/common/assertion-utils";
import { expectly } from "../src/expectly";
import { expectlyString } from "../src/expectly-string";

test.describe("toBeValidJSON", () => {
	test("accepts any JSON value", () => {
		expectlyString('{"theme":"dark"}').toBeValidJSON();
		expectlyString("[1, 2, 3]").toBeValidJSON();
		expectlyString('"text"').toBeValidJSON();
		expectlyString("null").toBeValidJSON();
		expectlyString(" 42 ").toBeValidJSON();
	});

	test("rejects invalid JSON", () => {
		expectlyString("{theme: 'dark'}").not.toBeValidJSON();
		expectlyString("").not.toBeValidJSON();
		expectlyString('{"a":1,}').not.toBeValidJSON();
	});

	test("compares the parsed value with toEqual semantics", () => {
		const settings = '{"theme":"dark","fontSize":14}';
		expectlyString(settings).toBeValidJSON({ theme: "dark", fontSize: 14 });
		expectlyString(settings).toBeValidJSON(expect.objectContaining({ theme: "dark" }));
		expectlyString(settings).not.toBeValidJSON({ theme: "dark" });
		expectlyString("null").toBeValidJSON(null);
		expectlyString(settings).not.toBeValidJSON(null);
		expectly("[1,2]").toBeValidJSON([1, 2]);
	});

	test("shows the parse error for invalid JSON", () => {
		const error = getRejectedErrorSync(() => expectlyString("{theme: 'dark'}").toBeValidJSON());
		const message = stripAnsi(error.message);
		expect(message).toContain("Expected string to be valid JSON");
		expect(message).toMatch(/Parse error: .+/);
	});

	test("shows the parsed value when it differs", () => {
		const error = getRejectedErrorSync(() => expectlyString('{"theme":"light"}').toBeValidJSON({ theme: "dark" }));
		const message = stripAnsi(error.message);
		expect(message).toContain('be valid JSON equal to {"theme": "dark"}');
		expect(message).toContain('Parsed: {"theme": "light"}');
	});

	test("throws for non-string receivers, like the other string matchers", () => {
		expect(() => expectlyString(42 as unknown as string).not.toBeValidJSON()).toThrow(
			/toBeValidJSON: received value must be a string, got: number/,
		);
		// A missing localStorage item is null, not a string.
		expect(() => expectlyString(null as unknown as string).toBeValidJSON()).toThrow(/must be a string, got: null/);
	});
});
