import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: ".",
	testMatch: "consumer.spec.ts",
	workers: 1,
	use: {
		launchOptions: process.env.EXPECTLY_COMPAT_BROWSER ? { executablePath: process.env.EXPECTLY_COMPAT_BROWSER } : {},
	},
});
