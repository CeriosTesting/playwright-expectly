---
"@cerios/playwright-expectly-fuzzy": patch
"@cerios/playwright-expectly": patch
---

Improve matcher setup reliability and refresh the docs around worker-side Playwright setup.

For `@cerios/playwright-expectly`, `toEqualPartially()` now has clearer array mismatch output, supports configurable array modes, validates matcher options at runtime, and tolerates repeated `setupExpectly()` calls safely.

For `@cerios/playwright-expectly-fuzzy`, `setupExpectlyFuzzy()` can now be called repeatedly without re-registering matchers, and the docs now explain that worker-side shared fixtures are the reliable way to register fuzzy matchers across Playwright workers.
