// The duplicate-matcher check without a runtime dependency on @playwright/test, so the CLI can decide
// itself which copy of Playwright to load. `matcher-duplicates.ts` adds the defaults for library users.
import { matcherOrigin } from "./matcher-origin";

export type MatcherFunction = (...args: never[]) => unknown;
/** A plain object of matcher functions, such as `expectlyMatchers` or your own `{ toBeThing() {} }`. */
export type MatcherDictionary = Record<string, MatcherFunction>;
/** Any Playwright expect: the base `expect`, or the result of `.extend()`, `mergeExpects()`, `.configure()` or `withReturn()`. */
export type ExpectLike = ((...args: never[]) => unknown) & {
	extend: (...args: never[]) => unknown;
	poll: (...args: never[]) => unknown;
};
export type MatcherSource = MatcherDictionary | ExpectLike;
export type MatcherNameConflict = { name: string; sources: string[] };
export type MatcherSourceSummary = { name: string; kind: "dictionary" | "expect"; matcherCount: number };
export type DuplicateMatcherReport = {
	/** The sources that could be inspected, in the order given. */
	sources: MatcherSourceSummary[];
	/** Names defined by two or more sources with a different implementation. */
	duplicates: MatcherNameConflict[];
	/** Names that replace a Playwright built-in matcher. */
	builtinOverrides: MatcherNameConflict[];
	/** Expect instances whose matchers cannot be read (Playwright before 1.60). */
	uninspectable: string[];
};
export type FindDuplicateMatchersOptions = {
	/** Playwright's built-in matcher names. Defaults to the names read from `expect`. */
	builtinNames?: Iterable<string>;
	/** The expect to read the built-in names from when `builtinNames` is not given. Defaults to Playwright's `expect`. */
	expect?: ExpectLike;
};

type Identity = string | MatcherFunction;
type IdentitiesByName = Map<string, Map<string, Identity>>;

const EXPECT_META_INFO = "expectMetaInfo";
const NON_MATCHER_KEYS = new Set(["not", "resolves", "rejects"]);

export function isMatcherDictionary(value: unknown): value is MatcherDictionary {
	if (typeof value !== "object" || value === null) return false;
	const prototype: unknown = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) return false;
	return Object.values(value).every((entry) => typeof entry === "function");
}

export function isExpectLike(value: unknown): value is ExpectLike {
	if (typeof value !== "function") return false;
	const { extend, poll } = value as { extend?: unknown; poll?: unknown };
	return typeof extend === "function" && typeof poll === "function";
}

/**
 * The custom matchers registered on an expect instance, or `undefined` when Playwright does not expose
 * them. Playwright 1.60 and newer keep them on the instance; earlier versions keep them private.
 */
export function readExpectUserMatchers(expectLike: ExpectLike): MatcherDictionary | undefined {
	const symbol = Object.getOwnPropertySymbols(expectLike).find(
		(candidate) => candidate.description === EXPECT_META_INFO,
	);
	if (symbol === undefined) return undefined;
	const info: unknown = (expectLike as unknown as Record<symbol, unknown>)[symbol];
	if (typeof info !== "object" || info === null) return undefined;
	const { userMatchers } = info as { userMatchers?: unknown };
	if (typeof userMatchers !== "object" || userMatchers === null) return undefined;
	return Object.fromEntries(
		Object.entries(userMatchers).filter((entry): entry is [string, MatcherFunction] => typeof entry[1] === "function"),
	);
}

/**
 * The names of Playwright's built-in matchers, read from an expect instance. Before Playwright 1.60,
 * custom matchers registered with `expect.extend()` are listed next to the built-ins and cannot be told
 * apart; pass `builtinNames` to `findDuplicateMatchers()` explicitly when that matters.
 */
export function playwrightBuiltinMatcherNames(expectLike: ExpectLike): string[] {
	const matchers = (expectLike as unknown as (actual: unknown) => object)(undefined);
	const userMatcherNames = new Set(Object.keys(readExpectUserMatchers(expectLike) ?? {}));
	return Object.keys(matchers).filter((name) => !NON_MATCHER_KEYS.has(name) && !userMatcherNames.has(name));
}

function inspectSource(
	name: string,
	source: MatcherSource,
): { kind: "dictionary" | "expect"; matchers?: MatcherDictionary } {
	if (isExpectLike(source)) return { kind: "expect", matchers: readExpectUserMatchers(source) };
	if (isMatcherDictionary(source)) return { kind: "dictionary", matchers: source };
	throw new TypeError(`Matcher source "${name}" is neither an object of matcher functions nor an expect instance.`);
}

function collectIdentities(
	sources: Record<string, MatcherSource>,
	report: Pick<DuplicateMatcherReport, "sources" | "uninspectable">,
): IdentitiesByName {
	const identities: IdentitiesByName = new Map();
	for (const [sourceName, source] of Object.entries(sources)) {
		const { kind, matchers } = inspectSource(sourceName, source);
		if (matchers === undefined) {
			report.uninspectable.push(sourceName);
			continue;
		}
		report.sources.push({ name: sourceName, kind, matcherCount: Object.keys(matchers).length });
		for (const [matcherName, matcher] of Object.entries(matchers)) {
			const bySource = identities.get(matcherName) ?? new Map<string, Identity>();
			bySource.set(sourceName, matcherOrigin(matcher) ?? matcher);
			identities.set(matcherName, bySource);
		}
	}
	return identities;
}

function resolveBuiltinNames(options: FindDuplicateMatchersOptions, sourceMatcherNames: Iterable<string>): Set<string> {
	if (options.builtinNames !== undefined) return new Set(options.builtinNames);
	if (options.expect === undefined) {
		throw new Error("findDuplicateMatchers: pass `builtinNames` or the `expect` to read them from.");
	}
	const names = new Set(playwrightBuiltinMatcherNames(options.expect));
	if (readExpectUserMatchers(options.expect) === undefined) {
		// Playwright before 1.60 lists every registered custom matcher next to the built-ins, so the names
		// that the given sources define are taken to be custom matchers rather than built-ins.
		for (const name of sourceMatcherNames) names.delete(name);
	}
	return names;
}

/**
 * Compares matcher sources by name. A name counts as a duplicate when two or more sources define it with
 * a different implementation; the same function in several sources (or the same package loaded twice) is
 * fine. Names that replace a Playwright built-in matcher are reported separately.
 */
export function findDuplicateMatchers(
	sources: Record<string, MatcherSource>,
	options: FindDuplicateMatchersOptions = {},
): DuplicateMatcherReport {
	const report: DuplicateMatcherReport = { sources: [], duplicates: [], builtinOverrides: [], uninspectable: [] };
	const identities = collectIdentities(sources, report);
	const builtinNames = resolveBuiltinNames(options, identities.keys());
	for (const matcherName of [...identities.keys()].sort()) {
		const bySource = identities.get(matcherName) ?? new Map<string, Identity>();
		const conflict = { name: matcherName, sources: [...bySource.keys()] };
		if (new Set(bySource.values()).size > 1) report.duplicates.push(conflict);
		if (builtinNames.has(matcherName)) report.builtinOverrides.push(conflict);
	}
	return report;
}

function appendSection(lines: string[], heading: string, items: string[]): void {
	if (items.length === 0) return;
	if (lines.length > 0) lines.push("");
	lines.push(heading, ...items.map((item) => `  - ${item}`));
}

export function formatDuplicateMatcherReport(report: DuplicateMatcherReport): string {
	const lines: string[] = [];
	appendSection(
		lines,
		"Sources:",
		report.sources.map((source) => `${source.name} (${source.kind}, ${source.matcherCount} matchers)`),
	);
	appendSection(
		lines,
		"Duplicate matcher names (same name, different implementation):",
		report.duplicates.map((conflict) => `${conflict.name}: ${conflict.sources.join(", ")}`),
	);
	appendSection(
		lines,
		"Playwright built-in matchers overridden:",
		report.builtinOverrides.map((conflict) => `${conflict.name}: ${conflict.sources.join(", ")}`),
	);
	appendSection(
		lines,
		"Not inspectable (this Playwright version does not expose the matchers of an expect instance; pass the matcher objects instead):",
		report.uninspectable,
	);
	if (report.duplicates.length === 0 && report.builtinOverrides.length === 0) {
		if (lines.length > 0) lines.push("");
		lines.push("No duplicate matcher names found.");
	}
	return lines.join("\n");
}

export class DuplicateMatcherError extends Error {
	readonly report: DuplicateMatcherReport;

	constructor(report: DuplicateMatcherReport) {
		super(formatDuplicateMatcherReport(report));
		this.name = "DuplicateMatcherError";
		this.report = report;
	}
}

/**
 * Like `findDuplicateMatchers()`, but throws a `DuplicateMatcherError` that lists the duplicates and
 * built-in overrides, so a single test or global setup can guard the project's expect.
 */
export function assertNoDuplicateMatchers(
	sources: Record<string, MatcherSource>,
	options?: FindDuplicateMatchersOptions,
): DuplicateMatcherReport {
	const report = findDuplicateMatchers(sources, options);
	if (report.duplicates.length > 0 || report.builtinOverrides.length > 0) throw new DuplicateMatcherError(report);
	return report;
}
