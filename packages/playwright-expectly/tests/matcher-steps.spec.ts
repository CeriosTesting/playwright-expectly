import { spawnSync } from "node:child_process";
import path from "node:path";

import { expect, test } from "@playwright/test";

import type { ReportedStep, ReportedTest } from "../../../tests/common/return-stack/reporter";

function describeSteps(steps: ReportedStep[], depth = 0): string[] {
	return steps.flatMap((step) => [
		`${"  ".repeat(depth)}[${step.category}] ${step.title}`,
		...describeSteps(step.steps, depth + 1),
	]);
}

// Internal comparisons, polling and browser reads must not show up as steps of their own: reporters such as
// Allure would list them all (failed ones included) under every matcher. Every fixture targets a visible
// element, so the reads go through getters, which Playwright leaves out of reports.
test("matchers report a single step without nested steps", () => {
	const fixtureDir = path.resolve(__dirname, "../../../tests/common/matcher-steps");
	const result = spawnSync(
		process.execPath,
		[require.resolve("@playwright/test/cli"), "test", "--config", path.join(fixtureDir, "playwright.config.ts")],
		{
			encoding: "utf8",
			timeout: 60_000,
			env: { ...process.env, EXPECTLY_STEPS_OUTPUT: test.info().outputPath("child-results") },
		},
	);
	expect(result.error, result.stderr).toBeUndefined();
	const reports = JSON.parse(result.stdout) as ReportedTest[];
	expect(reports.map((report) => report.title)).toEqual([
		"toEqualPartially",
		"toBeAnyOf",
		"array order",
		"collections",
		"locator",
		"page",
		"fuzzy locator",
	]);
	for (const report of reports) {
		// Each test fails only through its deliberately failing soft assertions.
		expect(report.status, report.title).toBe("failed");
		const matcherSteps = report.steps.filter((step) => step.category === "expect");
		const failed = matcherSteps.filter((step) => step.error).length;
		expect(failed, report.title).toBe(report.errors.length);
		expect(matcherSteps.length - failed, report.title).toBeGreaterThan(0);
		for (const step of matcherSteps) {
			expect(describeSteps(step.steps), `${report.title}: ${step.title}`).toEqual([]);
		}
	}
});
