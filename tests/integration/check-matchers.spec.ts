import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { assertNoDuplicateMatchers, expectlyMatchers } from "@cerios/playwright-expectly";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";

import { expect, test } from "./support/expect";

/**
 * The canonical support module combines both packages. These checks guard it against matcher
 * names that would silently replace each other: in-process through the exported API, and through
 * the `playwright-expectly check-matchers` command pointed at the module itself.
 */
test.describe("Integration: check-matchers", () => {
	test("the merged expect has no duplicate matcher names", () => {
		const report = assertNoDuplicateMatchers({
			expectly: expectlyMatchers,
			fuzzy: expectlyFuzzyMatchers,
			merged: expect,
		});
		expect(report.duplicates).toEqual([]);
		expect(report.builtinOverrides).toEqual([]);
	});

	test("the command accepts the support module", () => {
		const cli = path.resolve(__dirname, "../../packages/playwright-expectly/dist/cli.cjs");
		test.skip(!existsSync(cli), "run npm run build first");
		test.slow();
		// The support module resolves the packages to their sources (tsconfig paths) while the command
		// loads the built packages; both count as the same implementation.
		const result = spawnSync(process.execPath, [cli, "check-matchers", "./support/expect.ts"], {
			cwd: __dirname,
			encoding: "utf8",
			timeout: 60_000,
		});
		expect(result.status, result.stderr).toBe(0);
		expect(result.stdout).toContain("@cerios/playwright-expectly#expectlyMatchers");
		expect(result.stdout).toContain("@cerios/playwright-expectly-fuzzy#expectlyFuzzyMatchers");
		expect(result.stdout).toContain("OK: no duplicate matcher names or built-in overrides.");
	});
});
