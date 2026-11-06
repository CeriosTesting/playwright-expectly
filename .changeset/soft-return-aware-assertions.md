---
"@cerios/playwright-expectly": minor
---

Support soft `toPassAndReturn()` and `pollAndReturn()`.

- **Fix:** `expectly.soft(callback).toPassAndReturn()` threw `TypeError: toPassAndReturn is not a function`, and `expectly.soft.pollAndReturn()` threw `TypeError: ... is not a function`. `.soft` returned Playwright's native soft expect, which does not have the return-aware methods. It now keeps them, also on instances wrapped with `withReturn()`, and supports chained `.configure()` and `.extend()`.
- **Behaviour change:** soft return-aware assertions (`.soft` or `configure({ soft: true })`) now behave like native soft assertions. Previously they always threw on failure. Now they record the failure and let the test continue: `toPassAndReturn()` resolves with `undefined`, and `pollAndReturn()` resolves with the last polled value. Non-soft assertions still throw.
- **Types:** soft instances return `Promise<T | undefined>`. `configure({ soft: true | false })` updates the return type accordingly.
