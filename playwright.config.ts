import { defineConfig } from "@playwright/test";

import { setupExpectlyFuzzy } from "./packages/playwright-expectly-fuzzy/src/playwright-setup";
import { setupExpectly } from "./packages/playwright-expectly/src/playwright-setup";

setupExpectly();
setupExpectlyFuzzy();

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
				timeout: 200,
			},
		},
		{
			name: "expectly-fuzzy",
			testDir: "./packages/playwright-expectly-fuzzy/tests",
			expect: {
				timeout: 200,
			},
		},
		{
			name: "integration",
			testDir: "./tests/integration",
			expect: {
				timeout: 200,
			},
		},
	],
});
