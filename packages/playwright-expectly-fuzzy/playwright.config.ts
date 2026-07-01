import { defineConfig, devices } from "@playwright/test";

import { setupExpectlyFuzzy } from "./src/playwright-setup";

setupExpectlyFuzzy();

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: undefined,
	reporter: [["blob", { outputFile: "./../../blob-reports/test-results-fuzzy.zip" }]],
	use: {
		trace: "retain-on-failure",
	},
	expect: {
		timeout: 200,
	},
	projects: [
		{
			name: "non-locator",
			testMatch: /^(?!.*locator).*\.spec\.ts$/,
		},
		{
			name: "locator",
			testMatch: /.*locator.*\.spec\.ts$/,
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
