import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: ".",
	// Deliberately timing-out fixtures: only run when launched by matcher-timeout.spec.ts, never on their own.
	testMatch: process.env.EXPECTLY_TIMEOUT_OUTPUT ? "cases.ts" : [],
	workers: 1,
	retries: 0,
	timeout: 1500,
	outputDir: process.env.EXPECTLY_TIMEOUT_OUTPUT,
	reporter: [["../return-stack/reporter.ts"]],
});
