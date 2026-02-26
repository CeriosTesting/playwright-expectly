---
"@cerios/playwright-expectly": minor
---

**Add `setupExpectly()` helper for one-line Playwright `expect` integration**

- Added `setupExpectly()` function that extends Playwright's native `expect` with all expectly matchers in a single call
- Importing `setupExpectly` also activates global `PlaywrightTest.Matchers` type augmentation, giving full IntelliSense on `expect` without extra type imports
- Updated README with a new "Option 2" quick-start section demonstrating `setupExpectly()` usage in `playwright.config.ts`
