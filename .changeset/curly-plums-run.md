---
"@cerios/playwright-expectly": patch
---

**Improved locator matcher reliability and error handling**

- Refactored all locator matchers to use `expect.poll()` with progressive polling intervals `[0, 20, 50, 100, 100, 250, 250]` instead of fixed intervals, aligning with Playwright's native polling strategy
- Enhanced error handling: locator errors (element not found) are now rethrown with full Playwright context, while assertion failures (element found but condition not met) provide clear custom error messages
- Improved consistency across all locator matcher categories: text, attributes, positioning, state, and visibility matchers now follow the same polling and error handling patterns
- Updated test expectations to validate meaningful error messages while being resilient to formatting changes

This change provides better debugging experience when tests fail - you'll now see Playwright's detailed timeout errors when elements can't be found, and clear custom messages when assertions fail.