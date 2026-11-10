// Runs the check-matchers CLI from its TypeScript source in a fresh process, through Playwright's own
// loader, so the CLI tests do not need a build. Relies on the Playwright version pinned in this repo.
const path = require("node:path");
const { transform } = require("playwright/lib/common");

const cliSource = path.resolve(__dirname, "../../../packages/playwright-expectly/src/cli.ts");

transform
	.requireOrImport(cliSource)
	.then((cli) => cli.runCheckMatchersCli(process.argv.slice(2), { stdout: console.log, stderr: console.error }))
	.then((code) => {
		process.exitCode = code;
	})
	.catch((error) => {
		console.error(error);
		process.exitCode = 2;
	});
