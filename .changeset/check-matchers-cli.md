---
"@cerios/playwright-expectly": minor
---

Add `npx playwright-expectly check-matchers` and `findDuplicateMatchers()` to detect matcher names that are defined more than once.

- **Feature:** when `expectlyMatchers`, `expectlyFuzzyMatchers` and your own matchers are combined with `.extend()` or `mergeExpects()`, a name that two sources define silently keeps the later implementation. `npx playwright-expectly check-matchers ./tests/support/expect.ts` loads the module the way Playwright loads test files, takes every exported matcher object and expect instance as a source next to the installed Expectly packages, and reports names whose implementations differ as well as names that override a Playwright built-in matcher. Exit code 1 flags findings and 2 usage or load errors; `module#export` selects one export, `--json` prints the report as JSON and `--no-packages` leaves the installed packages out.
- **API:** `findDuplicateMatchers()`, `assertNoDuplicateMatchers()` (throws `DuplicateMatcherError`), `formatDuplicateMatcherReport()` and `playwrightBuiltinMatcherNames()`, with the types `DuplicateMatcherReport`, `MatcherNameConflict`, `MatcherSource`, `MatcherDictionary`, `MatcherFunction`, `ExpectLike`, `MatcherSourceSummary` and `FindDuplicateMatchersOptions`.
- **Behaviour:** the same function in several sources, or the same package loaded twice (its CommonJS and ESM builds), is not a duplicate; Expectly matchers carry an origin tag for this.
- **Caveat:** Playwright 1.60 and newer expose the matchers of an expect instance. On older versions an expect instance is listed as not inspectable; export the matcher objects that build it and compare those.
