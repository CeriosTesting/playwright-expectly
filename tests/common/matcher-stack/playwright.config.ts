import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: ".",
	// Deliberately failing fixtures: only run when launched by matcher-stack.spec.ts, never on their own.
	testMatch: process.env.EXPECTLY_STACK_OUTPUT ? "cases.ts" : [],
	workers: 1,
	retries: 0,
	outputDir: process.env.EXPECTLY_STACK_OUTPUT,
	reporter: [["../return-stack/reporter.ts"]],
	use: { trace: "on", actionTimeout: 100 },
});
