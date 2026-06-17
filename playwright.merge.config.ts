import { defineConfig } from "@playwright/test";

export default defineConfig({
	// Normalize test discovery path across all packages when merging blob reports.
	testDir: ".",
});
