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

function callLine(source: string[], title: string): number {
	const line = source.findIndex((text) => text.includes(`// call:${title}`)) + 1;
	expect(line).toBeGreaterThan(0);
	return line;
}

/**
 * Type-narrowing assertions report exactly like a native matcher: the native step,
 * located at the test's line, and errors (soft ones too) that start at that line.
 */
function checkTypedAssertionReports(reports: ReportedTest[], source: string[], casesFile: string): void {
	const stepTitles: Record<string, string> = {
		typed: 'Expect "toBeDefined"',
		"typed-not": 'Expect "not toBeNull"',
		"typed-soft": 'Expect "soft toBeDefined"',
	};
	for (const [title, stepTitle] of Object.entries(stepTitles)) {
		const report = reports.find((candidate) => candidate.title === title);
		const line = callLine(source, title);
		expect(report?.status, title).toBe("failed");
		expect(report?.errors, title).toHaveLength(1);
		const steps = report?.steps.filter((step) => step.category === "expect") ?? [];
		expect(steps.map((step) => step.title)).toEqual([stepTitle]);
		expect(steps[0].location, title).toEqual(expect.objectContaining({ file: casesFile, line }));
		for (const stack of [report?.errors[0].stack, steps[0].error?.stack]) {
			expect(
				stack?.split("\n").find((text) => text.trimStart().startsWith("at ")),
				title,
			).toContain(`cases.ts:${line}:`);
			expect(stack, title).not.toContain("expectly-return.ts");
			expect(stack, title).not.toContain("expectly-typed-assertion");
		}
		if (title === "typed-soft") {
			expect(report?.annotations).toEqual([{ type: "continued", description: "yes" }]);
		}
	}
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
	expect(reports).toHaveLength(11);
	checkTypedAssertionReports(reports, source, path.join(fixtureDir, "cases.ts"));
	// Soft failures are recorded, the test continues, and the call resolves with what it has.
	const softReturns: Record<string, string> = { "soft-pass": "null", "soft-poll": "1" };
	for (const [title, returned] of Object.entries(softReturns)) {
		const report = reports.find((candidate) => candidate.title === title);
		expect(report?.errors, title).toHaveLength(1);
		expect(report?.annotations, title).toEqual([
			{ type: "returned", description: returned },
			{ type: "continued", description: "yes" },
		]);
	}
	for (const report of reports.filter((candidate) => !candidate.title.startsWith("typed"))) {
		const line = callLine(source, report.title);
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
