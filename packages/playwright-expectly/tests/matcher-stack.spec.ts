import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import type { ReportedTest } from "../../../tests/common/return-stack/reporter";
import { withMatcherState } from "../../playwright-expectly-core/src/matchers/matcher-state-utils";

test("matcher wrappers preserve synchronous throws, error identity, and causes", () => {
	const cause = new Error("cause");
	const error = Object.assign(new TypeError("invalid argument"), { cause, detail: 42 });
	const wrapped = expect.extend(
		withMatcherState({
			toFail(): never {
				throw error;
			},
		}),
	);
	let caught: unknown;
	try {
		wrapped(1).toFail();
	} catch (failure) {
		caught = failure;
	}
	expect(caught).toBe(error);
	expect(error.cause).toBe(cause);
	expect(error.detail).toBe(42);
	expect(error.stack).toContain("matcher-stack.spec.ts");
	expect(error.stack).not.toContain("matcher-state-utils");
});

test("matcher wrappers preserve asynchronous rejections and frozen errors", async () => {
	const error = new Error("async failure");
	const frozen = Object.freeze(new Error("frozen failure"));
	const wrapped = expect.extend(
		withMatcherState({
			toFailAsync(): Promise<never> {
				return Promise.reject(error);
			},
			toFailFrozen(): never {
				throw frozen;
			},
			toThrowValue(): never {
				throw "non-error rejection";
			},
		}),
	);
	await expect(wrapped(1).toFailAsync()).rejects.toBe(error);
	expect(error.stack).not.toContain("matcher-state-utils");
	for (const [invoke, expected] of [
		[
			(): void =>
				withMatcherState({
					fail(): never {
						throw frozen;
					},
				}).fail(),
			frozen,
		],
		[(): void => wrapped(1).toThrowValue(), "non-error rejection"],
	] as const) {
		let caught: unknown;
		try {
			invoke();
		} catch (failure) {
			caught = failure;
		}
		expect(caught).toBe(expected);
	}
});

test("matcher validation and real browser failures report user call sites", () => {
	const fixtureDir = path.resolve(__dirname, "../../../tests/common/matcher-stack");
	const source = readFileSync(path.join(fixtureDir, "cases.ts"), "utf8").split("\n");
	const result = spawnSync(
		process.execPath,
		[require.resolve("@playwright/test/cli"), "test", "--config", path.join(fixtureDir, "playwright.config.ts")],
		{
			encoding: "utf8",
			timeout: 25_000,
			env: { ...process.env, EXPECTLY_STACK_OUTPUT: test.info().outputPath("child-results") },
		},
	);
	expect(result.error, result.stderr).toBeUndefined();
	expect(result.status, result.stderr).toBe(1);
	const reports = JSON.parse(result.stdout) as ReportedTest[];
	expect(reports).toHaveLength(9);
	for (const report of reports) {
		const line = source.findIndex((text) => text.endsWith(`// call:${report.title}`)) + 1;
		expect(line).toBeGreaterThan(0);
		expect(report.status).toBe("failed");
		expect(report.errors[0].stack, report.errors[0].message).toContain(`cases.ts:${line}:`);
		expect(report.errors[0].stack).not.toMatch(/[/\\](?:src|dist)[/\\]/);
		const step = report.steps.find((candidate) => candidate.category === "expect");
		expect(step?.location?.file).toBe(path.join(fixtureDir, "cases.ts"));
		expect(step?.location?.line).toBe(line);
		expect(step?.error?.stack).toContain(`cases.ts:${line}:`);
	}
});
