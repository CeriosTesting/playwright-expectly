import { defineConfig, devices } from "@playwright/test";

import { setupExpectly } from "./src/playwright-setup";

setupExpectly();

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: undefined,
	reporter: [["blob", { outputFile: "./../../blob-reports/test-results-expectly.zip" }]],
	use: {
		trace: "retain-on-failure",
	},
	projects: [
		{
			name: "locator",
			use: { ...devices["Desktop Chrome"] },
			testMatch: /.*locator.*\.spec\.ts$/,
		},
		{
			name: "non-locator",
			testMatch: /^(?!.*locator).*\.spec\.ts$/,
		},
	],
});
