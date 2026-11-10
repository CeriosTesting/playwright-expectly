---
"@cerios/playwright-expectly": minor
---

Add type-narrowing assertions: `expectly.toBeDefined(value)`, `toBeUndefined`, `toBeNull`, `toBeTruthy` and `toBeFalsy`, each with a `.not` form (`expectly.not.toBeNull(value)`).

- **Feature:** `expect(name).toBeDefined()` does not tell TypeScript that `name` is defined, so tests needed an extra `if (!name) throw`. The new assertions take the value directly and narrow its type afterwards, e.g. `expectly.toBeDefined(name)` turns `string | undefined` into `string`. They run the native Playwright matcher, so behavior, failure messages and report steps are unchanged, and steps and failures (soft ones too) are reported at the assertion line like any matcher call. An optional second argument is the custom message.
- **Availability:** on `expectly` and on every expect wrapped with `withReturn()`, including after `.soft`, `.configure()` and `.extend()`. Playwright's asymmetric `expect.not` matchers keep working.
- **Types:** soft instances (`.soft`, `configure({ soft: true })`) run the same check but do not narrow, because the test continues after a failure. TypeScript only narrows through an expect with an explicit type annotation (TS2775); `expectly` has one, and for your own expect (for example merged with `expectlyFuzzy` and your own matchers) use `WithReturn<typeof yourExpect>`, so no matcher types need to be listed. New exported types: `WithReturn`, `NarrowingAssertions`, `NegatedNarrowingAssertions`, `SoftNarrowingAssertions`, `TypedAssertions`, `NegatedTypedAssertions`, `TypedAssertionMessage`, `FalsyPart`.
