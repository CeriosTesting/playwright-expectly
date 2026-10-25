import { expectly, isISOInstant, parseISODate, withReturn } from "@cerios/playwright-expectly";
import type { ISODateString, ISOInstantString } from "@cerios/playwright-expectly";
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";
import { expect, test } from "@playwright/test";

test("published matcher types and runtime", () => {
	expectly("abc").toStartWith("a");
	expectly([1, 2]).toHaveAscendingOrder();
	expectlyFuzzy("hello world").toMatchFuzzy("world hello");
	expect(() => expectly(new Date("invalid")).toBeDateCloseTo(new Date(), { days: 1 })).toThrow("Invalid actual date");
});

test("return-aware retries and typed extensions", async () => {
	const custom = withReturn(expect).extend({
		toExceed(received: number, minimum: number): { pass: boolean; message: () => string } {
			return { pass: received > minimum, message: () => "expected larger number" };
		},
	});
	const value: number = await custom.pollAndReturn(() => 2).toExceed(1);
	expect(value).toBe(2);
	expect(await custom.pollAndReturn(() => 2).not.toExceed(3)).toBe(2);
	expect(await custom(() => 42).toPassAndReturn({ timeout: 100 })).toBe(42);
	await expect(custom.pollAndReturn(() => 1, { timeout: 30, intervals: [1] }).toExceed(2)).rejects.toThrow();
});

test("browser matchers and locator failures", async ({ page }) => {
	await page.setContent('<div data-value="hello">hello world</div>');
	await expectly(page.locator("div")).toStartWith("hello");
	await expectly(page.locator("div")).toHaveCountVisible(1);
	await expectlyFuzzy(page.locator("div")).toMatchFuzzy("world hello");
	await expect(
		expectly(page.locator("div")).not.toHaveDataAttribute("value", /hello/g, { timeout: 50, intervals: [1] }),
	).rejects.toThrow();
	await page.setContent("<div>one</div><div>two</div>");
	const error = await expectly(page.locator("div"))
		.toStartWith("one", { timeout: 100 })
		.catch((failure: unknown) => failure);
	expect(error).toBeInstanceOf(Error);
	expect((error as Error).stack).toContain("consumer.spec.ts");
	expect((error as Error).stack).not.toMatch(/[/\\](?:src|dist)[/\\]/);
});

test("date and time matchers, ISO types and the Temporal polyfill", () => {
	const day = "2026-10-25" satisfies ISODateString;
	const createdAt: unknown = "2026-10-25T12:00:00Z";
	if (!isISOInstant(createdAt)) throw new Error("expected an ISO instant");
	const instant: ISOInstantString = createdAt;
	expectly(instant).toBeSameInstant("2026-10-25T13:00:00+01:00");
	expectly(instant).toBeWithinLast({ minutes: 5 }, { now: "2026-10-25T12:04:00Z" });
	expectly(parseISODate(day)).toBeSameDay(instant, { timeZone: "Europe/Amsterdam" });
	expectly("2026-10-25T02:30:00+02:00[Europe/Amsterdam]").toBeBefore("2026-10-25T02:30:00+01:00[Europe/Amsterdam]");
	expect(() => parseISODate(String("2026-02-30"))).toThrow(TypeError);
});
