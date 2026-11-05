import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: ".",
	// Partly failing fixtures: only run when launched by matcher-steps.spec.ts, never on their own.
	testMatch: process.env.EXPECTLY_STEPS_OUTPUT ? "cases.ts" : [],
	workers: 1,
	retries: 0,
	outputDir: process.env.EXPECTLY_STEPS_OUTPUT,
	reporter: [["../return-stack/reporter.ts"]],
});
