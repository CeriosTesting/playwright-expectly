import { setupExpectly } from "@cerios/playwright-expectly";
import { setupExpectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";
import { defineConfig } from "@playwright/test";

setupExpectly();
setupExpectlyFuzzy();

export default defineConfig({
	testDir: ".",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: undefined,
	reporter: "html",
});
