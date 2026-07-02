---
"@cerios/playwright-expectly-core": patch
"@cerios/playwright-expectly": patch
"@cerios/playwright-expectly-fuzzy": patch
---

Move the shared negated-aware polling helper into core and fix locator and fuzzy locator `.not` matchers so passing negated assertions stop as soon as the negated condition is met instead of waiting for the full poll timeout.
