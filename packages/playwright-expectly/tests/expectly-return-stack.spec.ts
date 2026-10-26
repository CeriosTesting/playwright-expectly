import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import type { ReportedStep, ReportedTest } from "../../../tests/common/return-stack/reporter";
import { withReturn } from "../src/expectly-return";

test("caught errors point to the matcher invocation and retain native details", async () => {
	const wrapped = withReturn(expect);
	const matcher = wrapped.pollAndReturn(() => 1, { timeout: 30, intervals: [1] }).toBe;
	const error = await matcher(2).catch((caught: unknown) => caught);
	expect(error).toBeInstanceOf(Error);
	const failure = error as Error & { matcherResult: unknown };
	expect(failure.stack).toContain("expectly-return-stack.spec.ts");
	expect(failure.stack).not.toContain("expectly-return.ts");
	expect(failure.message).toContain("Timeout 30ms");
	expect(failure.matcherResult).toBeDefined();
});

function allSteps(steps: ReportedStep[]): ReportedStep[] {
	return steps.flatMap((step) => [step, ...allSteps(step.steps)]);
}

test("reports failures and assertion boundaries at user call sites", () => {
	const testInfo = test.info();
	const fixtureDir = path.resolve(__dirname, "../../../tests/common/return-stack");
	const source = readFileSync(path.join(fixtureDir, "cases.ts"), "utf8").split("\n");
	const result = spawnSync(
		process.execPath,
		[require.resolve("@playwright/test/cli"), "test", "--config", path.join(fixtureDir, "playwright.config.ts")],
		{
			encoding: "utf8",
			timeout: 20_000,
			env: { ...process.env, EXPECTLY_STACK_OUTPUT: testInfo.outputPath("child-results") },
		},
	);
	expect(result.error, result.stderr).toBeUndefined();
	expect(result.status, result.stderr).toBe(1);
	const reports = JSON.parse(result.stdout) as ReportedTest[];
	expect(reports).toHaveLength(6);
	for (const report of reports) {
		const line = source.findIndex((text) => text.includes(`// call:${report.title}`)) + 1;
		expect(line).toBeGreaterThan(0);
		const boundary = report.steps.find(
			(step) => step.category === (report.title === "regular" ? "expect" : "test.step"),
		);
		expect(boundary?.location?.file).toBe(path.join(fixtureDir, "cases.ts"));
		expect(boundary?.location?.line).toBe(line);
		if (report.title === "success") {
			expect(report.status).toBe("passed");
			continue;
		}
		expect(report.status).toBe("failed");
		expect(report.errors[0].stack).toContain(`cases.ts:${line}:`);
		expect(report.errors[0].stack).not.toContain("expectly-return.ts");
		for (const step of allSteps(report.steps)) {
			if (step.error?.stack) expect(step.error.stack).not.toContain("expectly-return.ts");
		}
	}
});
