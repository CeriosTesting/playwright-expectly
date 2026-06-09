import { defineConfig } from "@playwright/test";

import { setupExpectlyFuzzy } from "./src/playwright-setup";

setupExpectlyFuzzy();

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: undefined,
	reporter: "html",
	use: {
		trace: "retain-on-failure",
	},
	projects: [
		{
			name: "non-locator",
			testMatch: /^(?!.*locator).*\.spec\.ts$/,
		},
	],
});
