import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.ts"],
	format: ["cjs", "esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	outDir: "dist",
	deps: {
		// Subpaths too: declarations may reference "playwright/types/test", which must stay an import.
		neverBundle: [/^@playwright\/test(?:\/|$)/, /^playwright(?:\/|$)/, /^playwright-core(?:\/|$)/],
		onlyBundle: false,
	},
});
