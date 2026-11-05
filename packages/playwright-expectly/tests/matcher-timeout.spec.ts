import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { stripAnsi } from "../../../tests/common/assertion-utils";
import type { ReportedTest } from "../../../tests/common/return-stack/reporter";

// What each matcher must still say about the last value it saw, in fixture order.
const expectedText: Record<string, string> = {
	locator: 'Received: "one"',
	"locator not": 'Received: "one"',
	storage: "Received: (no such item)",
	cookie: "Received: (no such cookie)",
	"fuzzy locator": 'Received: "one"',
	stable: "Could not determine whether the locator content is stable",
};

// When the test times out before a matcher does, Playwright closes the page. The matcher must then report the
// last value it saw, next to the test timeout error, as Playwright's own matchers do, instead of leaving
// nothing but "Test timeout exceeded" in the report. A note says why polling stopped early, since reporters
// such as Allure show the matcher's error on its own.
test("matchers cut short by the test timeout still report what they received", () => {
	const fixtureDir = path.resolve(__dirname, "../../../tests/common/matcher-timeout");
	const source = readFileSync(path.join(fixtureDir, "cases.ts"), "utf8").split("\n");
	const result = spawnSync(
		process.execPath,
		[require.resolve("@playwright/test/cli"), "test", "--config", path.join(fixtureDir, "playwright.config.ts")],
		{
			encoding: "utf8",
			timeout: 60_000,
			env: { ...process.env, EXPECTLY_TIMEOUT_OUTPUT: test.info().outputPath("child-results") },
		},
	);
	expect(result.error, result.stderr).toBeUndefined();
	const reports = JSON.parse(result.stdout) as ReportedTest[];
	expect(reports.map((report) => report.title)).toEqual(Object.keys(expectedText));
	for (const report of reports) {
		const line = source.findIndex((text) => text.endsWith(`// call:${report.title}`)) + 1;
		expect(line, report.title).toBeGreaterThan(0);
		expect(report.status, report.title).toBe("timedOut");
		const messages = report.errors.map((error) => stripAnsi(error.message ?? ""));
		expect(messages, report.title).toHaveLength(2);
		expect(messages[0], report.title).toMatch(/^Test timeout of 1500ms exceeded\./);
		expect(messages[1], report.title).toMatch(/^Error: expect\(received\)/);
		expect(messages[1], report.title).toContain(expectedText[report.title]);
		expect(messages[1], report.title).toMatch(
			/Polling stopped after \d+ms of 10000ms: the (page|browser context) was closed because the test timeout of 1500ms was exceeded\./,
		);
		expect(messages[1], report.title).not.toMatch(/Target page/);
		const step = report.steps.find((candidate) => candidate.category === "expect");
		expect(step?.location?.line, report.title).toBe(line);
		expect(stripAnsi(step?.error?.message ?? ""), report.title).toContain(expectedText[report.title]);
	}
});
