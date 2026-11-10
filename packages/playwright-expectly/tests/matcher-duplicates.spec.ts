import { existsSync } from "node:fs";
import path from "node:path";

import { expect, mergeExpects, test } from "@playwright/test";

import { expectlyFuzzyMatchers } from "../../playwright-expectly-fuzzy/src/expectly-fuzzy";
import { expectlyMatchers } from "../src/expectly";
import { withReturn } from "../src/expectly-return";
import {
	assertNoDuplicateMatchers,
	DuplicateMatcherError,
	findDuplicateMatchers,
	formatDuplicateMatcherReport,
	playwrightBuiltinMatcherNames,
} from "../src/matcher-duplicates";
import type { MatcherFunction, MatcherSource } from "../src/matcher-duplicates";
import { readExpectUserMatchers } from "../src/matcher-duplicates-check";
import { matcherOrigin, tagMatcherOrigin } from "../src/matcher-origin";

type MatcherResult = { pass: boolean; message: () => string };

const pass = (): MatcherResult => ({ pass: true, message: () => "" });
// Playwright 1.60 and newer expose the custom matchers of an expect instance.
const exposesUserMatchers = readExpectUserMatchers(expect) !== undefined;

test.describe("findDuplicateMatchers", () => {
	test("reports a name that two sources define with different implementations", () => {
		const report = findDuplicateMatchers({
			first: { toBeThing: pass, toBeFirst: pass },
			second: { toBeThing: (): MatcherResult => pass(), toBeZebra: pass, toBeApple: (): MatcherResult => pass() },
			third: { toBeApple: pass },
		});
		expect(report.sources).toEqual([
			{ name: "first", kind: "dictionary", matcherCount: 2 },
			{ name: "second", kind: "dictionary", matcherCount: 3 },
			{ name: "third", kind: "dictionary", matcherCount: 1 },
		]);
		// Sorted by name; sources in the order given.
		expect(report.duplicates).toEqual([
			{ name: "toBeApple", sources: ["second", "third"] },
			{ name: "toBeThing", sources: ["first", "second"] },
		]);
		expect(report.builtinOverrides).toEqual([]);
		expect(report.uninspectable).toEqual([]);
	});

	test("accepts the same function, or the same origin tag, in several sources", () => {
		const shared = { toBeShared: pass };
		const tagged = tagMatcherOrigin({ toBeTagged: (): MatcherResult => pass() }, "@example/matchers");
		const taggedAgain = tagMatcherOrigin({ toBeTagged: (): MatcherResult => pass() }, "@example/matchers");
		const report = findDuplicateMatchers({ a: { ...shared, ...tagged }, b: { ...shared, ...taggedAgain } });
		expect(report.duplicates).toEqual([]);

		const otherOrigin = tagMatcherOrigin({ toBeTagged: (): MatcherResult => pass() }, "@other/matchers");
		expect(findDuplicateMatchers({ a: tagged, b: otherOrigin }).duplicates).toEqual([
			{ name: "toBeTagged", sources: ["a", "b"] },
		]);
	});

	test("reports names that override the given Playwright built-ins", () => {
		const report = findDuplicateMatchers(
			{ mine: { toBeVisible: pass, toBeNullish: pass } },
			{ builtinNames: ["toBeVisible", "toBe"] },
		);
		expect(report.builtinOverrides).toEqual([{ name: "toBeVisible", sources: ["mine"] }]);
		expect(report.duplicates).toEqual([]);
	});

	test("reads the built-in names from the installed Playwright by default", () => {
		const builtins = playwrightBuiltinMatcherNames();
		expect(builtins).toEqual(
			expect.arrayContaining([
				"toBe",
				"toEqual",
				"toBeCloseTo",
				"toBeVisible",
				"toHaveText",
				"toPass",
				"toMatchSnapshot",
			]),
		);
		expect(builtins).not.toContain("not");
		expect(builtins).not.toContain("resolves");
		expect(builtins).not.toContain("rejects");

		test.skip(!exposesUserMatchers, "Playwright before 1.60 lists registered custom matchers next to the built-ins");
		// Importing expectly registers its matchers on the base expect; they are not built-ins.
		expect(builtins).not.toContain("toBeNullish");
		const report = findDuplicateMatchers({ mine: { toBeVisible: pass, toBeNullish: pass } });
		expect(report.builtinOverrides).toEqual([{ name: "toBeVisible", sources: ["mine"] }]);
	});

	test("reads the matchers of expect instances, including withReturn and mergeExpects results", () => {
		test.skip(!exposesUserMatchers, "Playwright before 1.60 does not expose the matchers of an expect instance");
		const original = { toBeMine: pass };
		const clashing = { toBeMine: (): MatcherResult => pass() };
		const extended = expect.extend(original);
		const wrapped = withReturn(expect.extend(clashing));
		const merged = mergeExpects(expect, extended, wrapped);

		const report = findDuplicateMatchers({ original, extended, wrapped, merged, expectly: expectlyMatchers });
		expect(report.uninspectable).toEqual([]);
		expect(report.sources.map((source) => source.kind)).toEqual([
			"dictionary",
			"expect",
			"expect",
			"expect",
			"dictionary",
		]);
		// The instances also carry the expectly matchers (by reference), which is not a duplicate.
		expect(report.duplicates).toEqual([{ name: "toBeMine", sources: ["original", "extended", "wrapped", "merged"] }]);
		expect(report.builtinOverrides).toEqual([]);
	});

	test("lists expect instances whose matchers cannot be read", () => {
		const opaque = Object.assign((): void => undefined, { extend: (): void => undefined, poll: (): void => undefined });
		const report = findDuplicateMatchers({ opaque, mine: { toBeMine: pass } });
		expect(report.uninspectable).toEqual(["opaque"]);
		expect(report.sources).toEqual([{ name: "mine", kind: "dictionary", matcherCount: 1 }]);
		expect(report.duplicates).toEqual([]);
	});

	test("rejects values that are neither matcher objects nor expect instances", () => {
		expect(() => findDuplicateMatchers({ bad: 42 as unknown as MatcherSource })).toThrow('Matcher source "bad"');
		expect(() => findDuplicateMatchers({ bad: { toBeThing: "no" } as unknown as MatcherSource })).toThrow(
			'Matcher source "bad"',
		);
	});
});

test.describe("assertNoDuplicateMatchers", () => {
	test("returns the report when nothing is wrong", () => {
		const report = assertNoDuplicateMatchers({ a: { toBeA: pass }, b: { toBeB: pass } });
		expect(report.duplicates).toEqual([]);
		expect(report.sources).toHaveLength(2);
	});

	test("throws a DuplicateMatcherError whose message is the formatted report", () => {
		const sources = { a: { toBeThing: pass }, b: { toBeThing: (): MatcherResult => pass() } };
		let caught: unknown;
		try {
			assertNoDuplicateMatchers(sources);
		} catch (error) {
			caught = error;
		}
		expect(caught).toBeInstanceOf(DuplicateMatcherError);
		const failure = caught as DuplicateMatcherError;
		expect(failure.name).toBe("DuplicateMatcherError");
		expect(failure.message).toBe(formatDuplicateMatcherReport(failure.report));
		expect(failure.message).toContain("toBeThing: a, b");
	});

	test("throws for built-in overrides", () => {
		expect(() => assertNoDuplicateMatchers({ mine: { toBeVisible: pass } }, { builtinNames: ["toBeVisible"] })).toThrow(
			"Playwright built-in matchers overridden:\n  - toBeVisible: mine",
		);
	});
});

test.describe("formatDuplicateMatcherReport", () => {
	test("prints a section per finding", () => {
		const text = formatDuplicateMatcherReport({
			sources: [
				{ name: "a", kind: "dictionary", matcherCount: 2 },
				{ name: "b", kind: "expect", matcherCount: 1 },
			],
			duplicates: [{ name: "toBeThing", sources: ["a", "b"] }],
			builtinOverrides: [{ name: "toBeVisible", sources: ["a"] }],
			uninspectable: ["c"],
		});
		expect(text).toBe(
			[
				"Sources:",
				"  - a (dictionary, 2 matchers)",
				"  - b (expect, 1 matchers)",
				"",
				"Duplicate matcher names (same name, different implementation):",
				"  - toBeThing: a, b",
				"",
				"Playwright built-in matchers overridden:",
				"  - toBeVisible: a",
				"",
				"Not inspectable (this Playwright version does not expose the matchers of an expect instance; pass the matcher objects instead):",
				"  - c",
			].join("\n"),
		);
	});

	test("says when nothing was found", () => {
		expect(formatDuplicateMatcherReport({ sources: [], duplicates: [], builtinOverrides: [], uninspectable: [] })).toBe(
			"No duplicate matcher names found.",
		);
		const text = formatDuplicateMatcherReport({
			sources: [{ name: "a", kind: "dictionary", matcherCount: 1 }],
			duplicates: [],
			builtinOverrides: [],
			uninspectable: [],
		});
		expect(text).toBe("Sources:\n  - a (dictionary, 1 matchers)\n\nNo duplicate matcher names found.");
	});
});

test.describe("Expectly packages", () => {
	test("expectly and fuzzy matchers neither overlap nor override Playwright built-ins", () => {
		const report = assertNoDuplicateMatchers({ expectly: expectlyMatchers, fuzzy: expectlyFuzzyMatchers });
		expect(report.sources.map((source) => source.matcherCount)).toEqual([Object.keys(expectlyMatchers).length, 1]);
	});

	test("every matcher carries an origin tag", () => {
		for (const [name, matcher] of Object.entries(expectlyMatchers)) {
			expect(matcherOrigin(matcher), name).toBe(`@cerios/playwright-expectly#${name}`);
		}
		for (const [name, matcher] of Object.entries(expectlyFuzzyMatchers)) {
			expect(matcherOrigin(matcher), name).toBe(`@cerios/playwright-expectly-fuzzy#${name}`);
		}
	});

	test("the built package counts as the same implementation as the source", () => {
		const dist = path.resolve(__dirname, "../dist/index.cjs");
		test.skip(!existsSync(dist), "run npm run build first");
		// A second copy of the package, as an ESM project gets next to the CLI's CommonJS copy.
		const built = require(dist) as { expectlyMatchers: Record<string, MatcherFunction> };
		const report = findDuplicateMatchers({ source: expectlyMatchers, built: built.expectlyMatchers });
		expect(report.duplicates, "stale dist? run npm run build").toEqual([]);
		expect(report.sources[1]?.matcherCount, "stale dist? run npm run build").toBe(Object.keys(expectlyMatchers).length);
	});
});
