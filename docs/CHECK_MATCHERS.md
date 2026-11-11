# Checking for Duplicate Matcher Names

When two sources define the same matcher name, the later `.extend()` or object spread silently wins, and Playwright doesn't warn. That happens when you combine `expectlyMatchers`, `expectlyFuzzyMatchers`, your own matchers and matchers from other libraries. `@cerios/playwright-expectly` ships a command and a code API that find these collisions.

## Contents

- [Command line](#command-line)
- [Arguments and options](#arguments-and-options)
- [Output](#output)
- [Exit codes and CI](#exit-codes-and-ci)
- [In code](#in-code)
- [What counts as a duplicate](#what-counts-as-a-duplicate)
- [Playwright version support](#playwright-version-support)

## Command line

Point `check-matchers` at the module that builds your `expect`:

```bash
npx playwright-expectly check-matchers ./tests/support/expect.ts
```

The module is loaded the way Playwright loads test files: tsconfig `paths`, imports without a file extension, and ESM or CommonJS all work. Every exported object of matcher functions and every exported expect instance becomes a source, next to the installed `expectlyMatchers` and `expectlyFuzzyMatchers`.

Run the command in the project where `@cerios/playwright-expectly` is installed. `npx` must use that copy and not download a separate one, otherwise two copies of `@playwright/test` get loaded and the command stops with an error.

## Arguments and options

```
playwright-expectly check-matchers [module[#export] ...] [--json] [--no-packages]
```

| Argument        | Description                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `module`        | A file (`./tests/support/expect.ts`, with or without extension) or a package name. Pass several to compare fixture files with each other. |
| `module#export` | Use only that export of the module as a source.                                                                                           |
| _(none)_        | Compare only the installed Expectly packages with each other.                                                                             |
| `--json`        | Print the report as JSON.                                                                                                                 |
| `--no-packages` | Don't add the installed `@cerios/playwright-expectly` and `@cerios/playwright-expectly-fuzzy` matchers as sources.                        |
| `--help`, `-h`  | Print usage.                                                                                                                              |

## Output

```
Playwright 1.64.1, loader: playwright

Sources:
  - @cerios/playwright-expectly#expectlyMatchers (dictionary, 136 matchers)
  - @cerios/playwright-expectly-fuzzy#expectlyFuzzyMatchers (dictionary, 1 matchers)
  - tests/support/expect.ts#myMatchers (dictionary, 3 matchers)
  - tests/support/expect.ts#expect (expect, 139 matchers)

Duplicate matcher names (same name, different implementation):
  - toBeValidEmail: @cerios/playwright-expectly#expectlyMatchers, tests/support/expect.ts#myMatchers, tests/support/expect.ts#expect

FAIL: 1 duplicate matcher name, 0 built-in overrides.
```

The report has up to four sections:

- **Sources** — every source that could be inspected, with its kind (`dictionary` or `expect`) and number of matchers.
- **Duplicate matcher names** — names defined by two or more sources with a different implementation.
- **Playwright built-in matchers overridden** — names that replace a Playwright matcher, such as a custom `toBeCloseTo`.
- **Not inspectable** — expect instances whose matchers can't be read on this Playwright version (see [below](#playwright-version-support)).

`loader: native` means Playwright's module loader wasn't found and Node's own loader was used; tsconfig `paths` and TypeScript imports without a file extension are then not supported. A note in the output says so.

### JSON

With `--json` the command prints:

```json
{
	"ok": false,
	"playwrightVersion": "1.64.1",
	"loader": "playwright",
	"sources": [{ "name": "tests/support/expect.ts#myMatchers", "kind": "dictionary", "matcherCount": 3 }],
	"duplicates": [
		{
			"name": "toBeValidEmail",
			"sources": ["@cerios/playwright-expectly#expectlyMatchers", "tests/support/expect.ts#myMatchers"]
		}
	],
	"builtinOverrides": [],
	"uninspectable": [],
	"notes": []
}
```

## Exit codes and CI

| Code | Meaning                                                                  |
| ---- | ------------------------------------------------------------------------ |
| `0`  | No duplicates or built-in overrides                                      |
| `1`  | Duplicates or built-in overrides found                                   |
| `2`  | Usage error, a module that can't be found or loaded, or no sources found |

Because of the exit codes, the command works as a CI step:

```yaml
- run: npx playwright-expectly check-matchers ./tests/support/expect.ts
```

## In code

The same check is available as functions, for example in a test or in `globalSetup`:

```typescript
import { assertNoDuplicateMatchers, expectlyMatchers } from "@cerios/playwright-expectly";
import { expectlyFuzzyMatchers } from "@cerios/playwright-expectly-fuzzy";

import { expect, myMatchers } from "./support/expect";

assertNoDuplicateMatchers({
	expectly: expectlyMatchers,
	fuzzy: expectlyFuzzyMatchers,
	mine: myMatchers,
	merged: expect,
});
```

The object keys are the source names used in the report. A source is either a plain object of matcher functions or an expect instance.

| Export                                         | Description                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `findDuplicateMatchers(sources, options?)`     | Returns a `DuplicateMatcherReport`                                                                           |
| `assertNoDuplicateMatchers(sources, options?)` | Same, but throws a `DuplicateMatcherError` (with a `report` property) when there are duplicates or overrides |
| `formatDuplicateMatcherReport(report)`         | Formats a report as the text the command prints                                                              |
| `playwrightBuiltinMatcherNames(expect?)`       | Names of Playwright's built-in matchers, read from an expect instance (Playwright's `expect` by default)     |

`options` accepts `builtinNames` (an explicit list of built-in names) or `expect` (the instance to read them from; Playwright's `expect` by default).

Exported types: `DuplicateMatcherReport`, `MatcherNameConflict`, `MatcherSource`, `MatcherSourceSummary`, `MatcherDictionary`, `MatcherFunction`, `ExpectLike`, `FindDuplicateMatchersOptions`.

## What counts as a duplicate

A name is a duplicate only when the implementations differ. These are not duplicates:

- the same function in several sources, for example `expectlyMatchers` spread into your own `expect`;
- the same package loaded twice, such as its CommonJS and ESM builds. Expectly matchers carry an origin tag for this.

A name that matches a Playwright built-in matcher is always reported as a built-in override, even when only one source defines it.

## Playwright version support

Playwright 1.60 and newer expose the matchers of an expect instance, so a merged `expect` can be compared directly. Older versions report an expect instance as not inspectable. Export the matcher objects that build it and compare those instead.

Before 1.60, `playwrightBuiltinMatcherNames()` can't tell custom matchers registered with `expect.extend()` apart from built-ins. Pass `builtinNames` explicitly when that matters.

## Related

- [Returning Values from Retrying Assertions](./RETURNING_VALUES.md) - `withReturn()` for your merged expect
- [Fuzzy Matchers](./FUZZY_MATCHERS.md) - Combining fuzzy and core matchers

[← Back to README](../README.md)
