import { defineConfig } from "@playwright/test";

// Short, since many tests wait for a matcher to time out. But a first read on a newly started browser can take over
// 100ms, and more on a busy machine, so a timeout of 200ms made passing assertions fail intermittently.
const EXPECT_TIMEOUT = 1000;

export default defineConfig({
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: undefined,
	use: {
		trace: "retain-on-failure",
	},
	reporter: [["line"]],
	projects: [
		{
			name: "expectly",
			testDir: "./packages/playwright-expectly/tests",
			expect: {
				timeout: EXPECT_TIMEOUT,
			},
		},
		{
			name: "expectly-fuzzy",
			testDir: "./packages/playwright-expectly-fuzzy/tests",
			expect: {
				timeout: EXPECT_TIMEOUT,
			},
		},
		{
			name: "integration",
			testDir: "./tests/integration",
			expect: {
				timeout: EXPECT_TIMEOUT,
			},
		},
	],
});
