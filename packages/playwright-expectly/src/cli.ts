#!/usr/bin/env node
import { existsSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { DuplicateMatcherReport, ExpectLike, MatcherSource } from "./matcher-duplicates-check";
import {
	findDuplicateMatchers,
	formatDuplicateMatcherReport,
	isExpectLike,
	isMatcherDictionary,
	playwrightBuiltinMatcherNames,
} from "./matcher-duplicates-check";

export type CheckMatchersIo = {
	/** The project to check; defaults to `process.cwd()`. */
	cwd?: string;
	stdout: (line: string) => void;
	stderr: (line: string) => void;
};

type ModuleArgument = { specifier: string; exportName?: string };
type CheckArguments = { kind: "check"; modules: ModuleArgument[]; json: boolean; packages: boolean };
type ParsedArguments = CheckArguments | { kind: "help"; exitCode: number } | { kind: "error"; message: string };
type NamedSource = { label: string; source: MatcherSource };
type SourcesResult = { sources: NamedSource[] } | { error: string };
type ProjectRequire = ReturnType<typeof createRequire>;
type ModuleLoader = { kind: "playwright" | "native"; load: (file: string) => Promise<Record<string, unknown>> };
type PlaywrightContext = { projectRequire: ProjectRequire; version: string; builtinNames: string[] };
type RequireOrImport = (file: string) => Promise<unknown>;

const PACKAGE_SOURCES = [
	{ packageName: "@cerios/playwright-expectly", exportName: "expectlyMatchers" },
	{ packageName: "@cerios/playwright-expectly-fuzzy", exportName: "expectlyFuzzyMatchers" },
];
const MODULE_EXTENSIONS = ["", ".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"];
const NATIVE_LOADER_NOTE =
	"Playwright's module loader was not found, so modules were loaded with Node's own loader: tsconfig paths and TypeScript imports without a file extension are not supported.";

export const USAGE = `Usage: playwright-expectly check-matchers [module[#export] ...] [--json] [--no-packages]

Reports matcher names that are defined by more than one source with a different implementation,
and names that override a Playwright built-in matcher.

  module       A file (./tests/support/expect.ts) or package to load the way Playwright loads
               test files. Every exported object of matcher functions and every exported expect
               instance is a source; "#export" selects a single export.
  --json       Print the report as JSON.
  --no-packages
               Do not add the installed @cerios/playwright-expectly and
               @cerios/playwright-expectly-fuzzy matchers as sources.

Exit codes: 0 no problems, 1 duplicates or built-in overrides found, 2 usage or load error.`;

function describeError(error: unknown): string {
	return error instanceof Error ? (error.stack ?? error.message) : String(error);
}

const DRIVE_LETTER = /^[A-Za-z]:/;

/**
 * Resolves a path to its real location, spelled as the file system reports it. Node caches modules by path
 * string, so two spellings of one drive letter would load @playwright/test twice, which Playwright refuses;
 * symlinked packages (workspaces, pnpm, npm link) always resolve to the real spelling.
 */
function normalizePath(file: string): string {
	const resolved = path.resolve(file);
	try {
		return realpathSync.native(resolved);
	} catch {
		return resolved;
	}
}

function samePath(left: string, right: string): boolean {
	const [first, second] = [normalizePath(left), normalizePath(right)];
	return process.platform === "win32" ? first.toLowerCase() === second.toLowerCase() : first === second;
}

function parseModuleArgument(argument: string): ModuleArgument {
	const hash = argument.lastIndexOf("#");
	if (hash <= 0) return { specifier: argument };
	return { specifier: argument.slice(0, hash), exportName: argument.slice(hash + 1) };
}

function parseArguments(argv: string[]): ParsedArguments {
	const [command, ...rest] = argv;
	if (command === undefined) return { kind: "help", exitCode: 2 };
	if (command === "--help" || command === "-h" || command === "help") return { kind: "help", exitCode: 0 };
	if (command !== "check-matchers") return { kind: "error", message: `Unknown command "${command}".` };
	const parsed: CheckArguments = { kind: "check", modules: [], json: false, packages: true };
	for (const argument of rest) {
		if (argument === "--help" || argument === "-h") return { kind: "help", exitCode: 0 };
		if (argument === "--json") parsed.json = true;
		else if (argument === "--no-packages") parsed.packages = false;
		else if (argument.startsWith("-")) return { kind: "error", message: `Unknown option "${argument}".` };
		else parsed.modules.push(parseModuleArgument(argument));
	}
	return parsed;
}

function resolvePlaywright(cwd: string): PlaywrightContext | { error: string } {
	const projectRequire = createRequire(path.join(cwd, "noop.js"));
	let projectCopy: string;
	try {
		projectCopy = projectRequire.resolve("@playwright/test");
	} catch {
		return { error: `Cannot find @playwright/test from ${cwd}. Run this command inside the project to check.` };
	}
	let ownCopy: string | undefined;
	try {
		ownCopy = require.resolve("@playwright/test");
	} catch {
		ownCopy = undefined;
	}
	if (ownCopy !== undefined && !samePath(ownCopy, projectCopy)) {
		return {
			error: `@playwright/test resolves to two different copies: ${projectCopy} (project) and ${ownCopy} (@cerios/playwright-expectly). Run this command from the project where @cerios/playwright-expectly is installed.`,
		};
	}
	const { expect } = projectRequire("@playwright/test") as { expect: ExpectLike };
	const { version } = projectRequire("@playwright/test/package.json") as { version: string };
	// Taken before anything else loads, so the list is exact on every Playwright version.
	return { projectRequire, version, builtinNames: playwrightBuiltinMatcherNames(expect) };
}

function findRequireOrImport(projectRequire: ProjectRequire): RequireOrImport | undefined {
	let playwrightDir: string;
	try {
		playwrightDir = path.dirname(projectRequire.resolve("playwright/package.json"));
	} catch {
		return undefined;
	}
	// Required by absolute path: the file is not in the package's "exports" map on every version.
	const candidates: Array<{ file: string; pick: (loaded: unknown) => unknown }> = [
		{
			file: path.join(playwrightDir, "lib", "common", "index.js"), // Playwright 1.60+
			pick: (loaded) => (loaded as { transform?: { requireOrImport?: unknown } }).transform?.requireOrImport,
		},
		{
			file: path.join(playwrightDir, "lib", "transform", "transform.js"), // Playwright 1.40 - 1.59
			pick: (loaded) => (loaded as { requireOrImport?: unknown }).requireOrImport,
		},
	];
	for (const candidate of candidates) {
		if (!existsSync(candidate.file)) continue;
		const picked = candidate.pick(projectRequire(candidate.file));
		if (typeof picked === "function") return picked as RequireOrImport;
	}
	return undefined;
}

function createModuleLoader(projectRequire: ProjectRequire): ModuleLoader {
	const requireOrImport = findRequireOrImport(projectRequire);
	if (requireOrImport !== undefined) {
		return { kind: "playwright", load: async (file) => (await requireOrImport(file)) as Record<string, unknown> };
	}
	return { kind: "native", load: async (file) => (await import(pathToFileURL(file).href)) as Record<string, unknown> };
}

function isSource(value: unknown): value is MatcherSource {
	return isExpectLike(value) || (isMatcherDictionary(value) && Object.keys(value).length > 0);
}

function sourcesFromNamespace(namespace: Record<string, unknown>, label: string, exportName?: string): SourcesResult {
	if (exportName === undefined) {
		const sources = Object.entries(namespace)
			.filter((entry): entry is [string, MatcherSource] => isSource(entry[1]))
			.map(([name, source]) => ({ label: `${label}#${name}`, source }));
		return { sources };
	}
	const value = namespace[exportName];
	if (!isSource(value)) {
		const reason =
			value === undefined ? "is not exported" : "is neither an object of matcher functions nor an expect instance";
		return { error: `Export "${exportName}" of ${label} ${reason}.` };
	}
	return { sources: [{ label: `${label}#${exportName}`, source: value }] };
}

function packageSources(projectRequire: ProjectRequire, notes: string[]): NamedSource[] {
	const sources: NamedSource[] = [];
	for (const { packageName, exportName } of PACKAGE_SOURCES) {
		let resolved: string;
		try {
			resolved = projectRequire.resolve(packageName);
		} catch {
			notes.push(`${packageName} is not installed in this project and was skipped.`);
			continue;
		}
		const namespace = projectRequire(resolved) as Record<string, unknown>;
		const value = namespace[exportName];
		if (isSource(value)) sources.push({ label: `${packageName}#${exportName}`, source: value });
	}
	return sources;
}

function findModuleFile(cwd: string, specifier: string): string | undefined {
	const base = path.resolve(cwd, specifier);
	return MODULE_EXTENSIONS.map((extension) => base + extension).find(
		(candidate) => existsSync(candidate) && statSync(candidate).isFile(),
	);
}

/** A file relative to the project first (with or without its extension), otherwise a package specifier. */
function resolveModuleFile(
	cwd: string,
	projectRequire: ProjectRequire,
	specifier: string,
): { file: string; label: string } | { error: string } {
	const found = findModuleFile(cwd, specifier);
	if (found !== undefined) {
		const file = normalizePath(found);
		return { file, label: path.relative(cwd, file).split(path.sep).join("/") };
	}
	const looksLikePath = specifier.startsWith(".") || path.isAbsolute(specifier) || DRIVE_LETTER.test(specifier);
	if (looksLikePath) return { error: `Cannot find ${path.resolve(cwd, specifier)}.` };
	try {
		return { file: normalizePath(projectRequire.resolve(specifier)), label: specifier };
	} catch (error) {
		return { error: `Cannot resolve "${specifier}" from ${cwd}: ${describeError(error)}` };
	}
}

async function loadModuleSources(
	cwd: string,
	context: PlaywrightContext,
	loader: ModuleLoader,
	argument: ModuleArgument,
): Promise<SourcesResult> {
	const resolved = resolveModuleFile(cwd, context.projectRequire, argument.specifier);
	if ("error" in resolved) return resolved;
	let namespace: Record<string, unknown>;
	try {
		namespace = await loader.load(resolved.file);
	} catch (error) {
		return { error: `Cannot load ${resolved.label}:\n${describeError(error)}` };
	}
	return sourcesFromNamespace(namespace, resolved.label, argument.exportName);
}

async function gatherSources(
	cwd: string,
	context: PlaywrightContext,
	loader: ModuleLoader,
	parsed: CheckArguments,
	notes: string[],
): Promise<SourcesResult> {
	const sources: NamedSource[] = parsed.packages ? packageSources(context.projectRequire, notes) : [];
	for (const argument of parsed.modules) {
		const loaded = await loadModuleSources(cwd, context, loader, argument);
		if ("error" in loaded) return loaded;
		sources.push(...loaded.sources);
	}
	if (parsed.modules.length === 0) {
		notes.push(
			"Only the installed packages were compared. Pass the module that builds your expect to check your own setup, for example: playwright-expectly check-matchers ./tests/support/expect.ts",
		);
	}
	return { sources };
}

function reportNotes(report: DuplicateMatcherReport, version: string, notes: string[]): void {
	if (report.sources.length === 1)
		notes.push("Only one source could be compared; duplicates need two or more sources.");
	if (report.uninspectable.length > 0) {
		notes.push(
			`Playwright ${version} does not expose the matchers of an expect instance (1.60 and newer do). Export the matcher objects that build it so they can be compared.`,
		);
	}
}

function count(amount: number, noun: string): string {
	return `${amount} ${noun}${amount === 1 ? "" : "s"}`;
}

function printReport(
	io: CheckMatchersIo,
	parsed: CheckArguments,
	context: PlaywrightContext,
	loader: ModuleLoader,
	report: DuplicateMatcherReport,
	notes: string[],
): number {
	const failed = report.duplicates.length > 0 || report.builtinOverrides.length > 0;
	if (parsed.json) {
		const json = { ok: !failed, playwrightVersion: context.version, loader: loader.kind, ...report, notes };
		io.stdout(JSON.stringify(json, null, 2));
		return failed ? 1 : 0;
	}
	io.stdout(`Playwright ${context.version}, loader: ${loader.kind}`);
	io.stdout("");
	io.stdout(formatDuplicateMatcherReport(report));
	for (const note of notes) {
		io.stdout("");
		io.stdout(`Note: ${note}`);
	}
	io.stdout("");
	io.stdout(
		failed
			? `FAIL: ${count(report.duplicates.length, "duplicate matcher name")}, ${count(report.builtinOverrides.length, "built-in override")}.`
			: "OK: no duplicate matcher names or built-in overrides.",
	);
	return failed ? 1 : 0;
}

/** Runs `playwright-expectly check-matchers` and resolves with its exit code. */
export async function runCheckMatchersCli(argv: string[], io: CheckMatchersIo): Promise<number> {
	const parsed = parseArguments(argv);
	if (parsed.kind === "help") {
		io.stdout(USAGE);
		return parsed.exitCode;
	}
	if (parsed.kind === "error") {
		io.stderr(`${parsed.message}\n\n${USAGE}`);
		return 2;
	}
	const cwd = normalizePath(io.cwd ?? process.cwd());
	const context = resolvePlaywright(cwd);
	if ("error" in context) {
		io.stderr(context.error);
		return 2;
	}
	const notes: string[] = [];
	const loader = createModuleLoader(context.projectRequire);
	if (loader.kind === "native") notes.push(NATIVE_LOADER_NOTE);
	const gathered = await gatherSources(cwd, context, loader, parsed, notes);
	if ("error" in gathered) {
		io.stderr(gathered.error);
		return 2;
	}
	const sources = Object.fromEntries(gathered.sources.map((named) => [named.label, named.source]));
	const report = findDuplicateMatchers(sources, { builtinNames: context.builtinNames });
	if (report.sources.length === 0) {
		io.stderr(
			"No matcher objects or expect instances could be compared. Export them from the given modules, or select one with module#export.",
		);
		return 2;
	}
	reportNotes(report, context.version, notes);
	return printReport(io, parsed, context, loader, report, notes);
}

if (require.main === module) {
	runCheckMatchersCli(process.argv.slice(2), {
		stdout: (line) => console.log(line),
		stderr: (line) => console.error(line),
	})
		.then((code) => {
			process.exitCode = code;
		})
		.catch((error: unknown) => {
			console.error(describeError(error));
			process.exitCode = 2;
		});
}
