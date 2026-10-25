import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: ".",
	testMatch: "cases.ts",
	workers: 1,
	retries: 0,
	outputDir: process.env.EXPECTLY_STACK_OUTPUT,
	reporter: [["./reporter.ts"]],
	use: { trace: "on" },
});
