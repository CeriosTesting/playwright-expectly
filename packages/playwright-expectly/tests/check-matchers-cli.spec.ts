import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { runCheckMatchersCli, USAGE } from "../src/cli";
import type { DuplicateMatcherReport } from "../src/matcher-duplicates";
import { readExpectUserMatchers } from "../src/matcher-duplicates-check";

const repoRoot = path.resolve(__dirname, "../../..");
const fixtures = "tests/common/matcher-duplicates";
const distCli = path.resolve(__dirname, "../dist/cli.cjs");
const distIndex = path.resolve(__dirname, "../dist/index.cjs");
const exposesUserMatchers = readExpectUserMatchers(expect) !== undefined;

type Run = { code: number; stdout: string; stderr: string };
type JsonReport = DuplicateMatcherReport & { ok: boolean; playwrightVersion: string; loader: string; notes: string[] };

async function run(...argv: string[]): Promise<Run> {
	const stdout: string[] = [];
	const stderr: string[] = [];
	const code = await runCheckMatchersCli(argv, {
		cwd: repoRoot,
		stdout: (line) => stdout.push(line),
		stderr: (line) => stderr.push(line),
	});
	return { code, stdout: stdout.join("\n"), stderr: stderr.join("\n") };
}

// Fixture runs do not need the built packages.
const check = (...args: string[]): Promise<Run> => run("check-matchers", "--no-packages", ...args);

test.describe("check-matchers arguments", () => {
	test("prints usage", async () => {
		const help = await run("--help");
		expect(help.code).toBe(0);
		expect(help.stdout).toBe(USAGE);
		expect((await run("check-matchers", "--help")).code).toBe(0);
		expect((await run()).code).toBe(2);
	});

	test("rejects unknown commands and options", async () => {
		const command = await run("frobnicate");
		expect(command.code).toBe(2);
		expect(command.stderr).toContain('Unknown command "frobnicate"');
		const option = await run("check-matchers", "--bogus");
		expect(option.code).toBe(2);
		expect(option.stderr).toContain('Unknown option "--bogus"');
	});

	test("reports modules and exports that cannot be used", async () => {
		const missing = await check(`${fixtures}/missing.ts`);
		expect(missing.code).toBe(2);
		expect(missing.stderr).toContain("Cannot find");
		const unknownExport = await check(`${fixtures}/clashing-sources.ts#nope`);
		expect(unknownExport.code).toBe(2);
		expect(unknownExport.stderr).toContain('Export "nope"');
		const notASource = await check(`${fixtures}/clashing-sources.ts#answer`);
		expect(notASource.code).toBe(2);
		expect(notASource.stderr).toContain("neither an object of matcher functions nor an expect instance");
		const broken = await check(`${fixtures}/throws-on-load.ts`);
		expect(broken.code).toBe(2);
		expect(broken.stderr).toContain(`Cannot load ${fixtures}/throws-on-load.ts`);
		expect(broken.stderr).toContain("boom: this module cannot be loaded");
	});
});

test.describe("check-matchers reports", () => {
	test("duplicates between the exports of a module", async () => {
		const result = await check(`${fixtures}/clashing-sources.ts`);
		expect(result.code).toBe(1);
		expect(result.stdout).toContain("loader: playwright");
		expect(result.stdout).toMatch(/toBeThing: .*clashing-sources\.ts#alpha, .*clashing-sources\.ts#beta/);
		expect(result.stdout).toContain(`${fixtures}/clashing-sources.ts#clean (dictionary, 1 matchers)`);
		expect(result.stdout).not.toContain("#answer");
		expect(result.stdout).toContain("FAIL: 1 duplicate matcher name, 0 built-in overrides.");
		if (exposesUserMatchers) {
			// The expect instance shares alpha's functions, so it adds no duplicate of its own.
			expect(result.stdout).toContain(`${fixtures}/clashing-sources.ts#expect (expect,`);
		} else {
			expect(result.stdout).toContain("Not inspectable");
		}
	});

	test("a single selected export", async () => {
		const result = await check(`${fixtures}/clashing-sources.ts#clean`);
		expect(result.code).toBe(0);
		expect(result.stdout).toContain("Only one source could be compared");
		expect(result.stdout).toContain("OK: no duplicate matcher names or built-in overrides.");
	});

	test("JSON", async () => {
		const result = await check(`${fixtures}/clashing-sources.ts`, "--json");
		expect(result.code).toBe(1);
		const report = JSON.parse(result.stdout) as JsonReport;
		expect(report.ok).toBe(false);
		expect(report.loader).toBe("playwright");
		expect(report.playwrightVersion).toMatch(/^\d+\.\d+\.\d+/);
		expect(report.duplicates.map((conflict) => conflict.name)).toEqual(["toBeThing"]);
		expect(report.builtinOverrides).toEqual([]);
		expect(Array.isArray(report.notes)).toBe(true);
	});

	test("overrides of Playwright built-ins", async () => {
		const result = await check(`${fixtures}/builtin-override.ts`);
		expect(result.code).toBe(1);
		expect(result.stdout).toContain(`toBeVisible: ${fixtures}/builtin-override.ts#overrides`);
		expect(result.stdout).toContain("FAIL: 0 duplicate matcher names, 1 built-in override.");
	});

	test("modules that use tsconfig paths and imports without a file extension", async () => {
		const result = await check(`${fixtures}/alias/entry.ts`);
		expect(result.code).toBe(1);
		expect(result.stdout).toContain(`toBeAliased: ${fixtures}/alias/entry.ts#common, ${fixtures}/alias/entry.ts#local`);
	});

	test("several modules at once", async () => {
		const result = await check(`${fixtures}/clashing-sources.ts#clean`, `${fixtures}/builtin-override.ts`, "--json");
		expect(result.code).toBe(1);
		const report = JSON.parse(result.stdout) as JsonReport;
		expect(report.sources.map((source) => source.name)).toEqual([
			`${fixtures}/clashing-sources.ts#clean`,
			`${fixtures}/builtin-override.ts#overrides`,
		]);
	});
});

test.describe("check-matchers with the installed packages", () => {
	test("compares expectly and fuzzy when no module is given", async () => {
		test.skip(!existsSync(distIndex), "run npm run build first");
		const result = await run("check-matchers");
		expect(result.code, result.stderr).toBe(0);
		expect(result.stdout).toContain("@cerios/playwright-expectly#expectlyMatchers (dictionary,");
		expect(result.stdout).toContain("@cerios/playwright-expectly-fuzzy#expectlyFuzzyMatchers (dictionary, 1 matchers)");
		expect(result.stdout).toContain("Only the installed packages were compared");
	});

	test("reports a project matcher that replaces an Expectly matcher", async () => {
		test.skip(!existsSync(distIndex), "run npm run build first");
		// The fixture loads the package source while the CLI loads the built package: the origin
		// tags make those the same implementation, so only the project's own clash is reported.
		const result = await run("check-matchers", `${fixtures}/clashes-with-expectly.ts`);
		expect(result.code, result.stderr).toBe(1);
		expect(result.stdout).toContain("toBeValidEmail: @cerios/playwright-expectly#expectlyMatchers, ");
		expect(result.stdout).toMatch(new RegExp("toBeValidEmail: .*clashes-with-expectly[.]ts#myMatchers"));
		expect(result.stdout).toContain("FAIL: 1 duplicate matcher name, 0 built-in overrides.");
	});
});

test.describe("check-matchers in a fresh process", () => {
	const runner = path.join(repoRoot, fixtures, "run-cli-from-source.cjs");

	function spawn(entry: string, ...args: string[]): { status: number | null; stdout: string; stderr: string } {
		return spawnSync(process.execPath, [entry, ...args], { cwd: repoRoot, encoding: "utf8", timeout: 60_000 });
	}

	test("runs from source through Playwright's loader", () => {
		test.slow();
		const result = spawn(runner, "check-matchers", "--no-packages", `${fixtures}/clashing-sources.ts`);
		expect(result.status, result.stderr).toBe(1);
		expect(result.stdout).toContain("toBeThing");
		expect(result.stdout).toContain("loader: playwright");
	});

	test("loads ES modules", () => {
		test.slow();
		const result = spawn(runner, "check-matchers", "--no-packages", `${fixtures}/esm/esm-sources.ts`);
		expect(result.status, result.stderr).toBe(1);
		expect(result.stdout).toContain(
			`toBeSame: ${fixtures}/esm/esm-sources.ts#left, ${fixtures}/esm/esm-sources.ts#right`,
		);
	});

	test("prints only JSON on stdout", () => {
		test.slow();
		const result = spawn(runner, "check-matchers", "--no-packages", "--json", `${fixtures}/clashing-sources.ts`);
		expect(result.status, result.stderr).toBe(1);
		const report = JSON.parse(result.stdout) as JsonReport;
		expect(report.ok).toBe(false);
	});

	test("runs the built command", () => {
		test.skip(!existsSync(distCli), "run npm run build first");
		test.slow();
		expect(readFileSync(distCli, "utf8").split("\n")[0]).toBe("#!/usr/bin/env node");
		const result = spawn(distCli, "check-matchers", `${fixtures}/clashing-sources.ts`);
		expect(result.status, result.stderr).toBe(1);
		expect(result.stdout).toContain("toBeThing");
		expect(result.stdout).toContain("@cerios/playwright-expectly#expectlyMatchers");
	});
});
