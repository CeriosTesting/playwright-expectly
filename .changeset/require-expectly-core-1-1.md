---
"@cerios/playwright-expectly": patch
"@cerios/playwright-expectly-fuzzy": patch
---

Require `@cerios/playwright-expectly-core` `^1.1.0` instead of `*`. Both packages use exports that first shipped in core 1.1.0 (`pollLocators`, `locatorNotFoundMessage`, `MatcherReturnType`), but `*` let npm keep an older core that was already in a consumer's lockfile when upgrading. With core 1.0.1, type checking failed with `TS2305: Module '"@cerios/playwright-expectly-core"' has no exported member 'MatcherReturnType'`, and locator matchers threw `pollLocators is not a function` at runtime.
