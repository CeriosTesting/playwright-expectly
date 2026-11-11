import { defineConfig } from "tsdown";

// Subpaths too: declarations may reference "playwright/types/test", which must stay an import.
const neverBundle = [/^@playwright\/test(?:\/|$)/, /^playwright(?:\/|$)/, /^playwright-core(?:\/|$)/];

export default defineConfig([
	{
		entry: ["./src/index.ts"],
		format: ["cjs", "esm"],
		dts: true,
		sourcemap: true,
		clean: true,
		outDir: "dist",
		deps: {
			neverBundle,
			onlyBundle: false,
		},
	},
	{
		// The `playwright-expectly` command. CommonJS only: it relies on `require.main` and on
		// resolving Playwright from the project it runs in.
		entry: { cli: "./src/cli.ts" },
		format: ["cjs"],
		dts: false,
		sourcemap: true,
		clean: false,
		outDir: "dist",
		deps: {
			neverBundle,
			onlyBundle: false,
		},
	},
]);
