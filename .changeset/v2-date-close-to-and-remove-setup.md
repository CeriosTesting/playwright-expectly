---
"@cerios/playwright-expectly": major
"@cerios/playwright-expectly-fuzzy": major
---

**Breaking:** rename the Date matcher `toBeCloseTo` to `toBeDateCloseTo`, and remove the deprecated `setupExpectly()` / `setupExpectlyFuzzy()`.

- **`toBeCloseTo` → `toBeDateCloseTo`** (`@cerios/playwright-expectly`). The Date matcher was registered under the same name as Playwright's built-in numeric `toBeCloseTo`, so every `expect` extended with `expectlyMatchers` (including `mergeExpects()` compositions and the standalone `expectly`) lost numeric support: `expect(0.1 + 0.2).toBeCloseTo(0.3, 5)` threw `Invalid actual date`, while TypeScript still accepted the call. The Date matcher now has its own name, and Playwright's numeric `toBeCloseTo` keeps working unchanged next to it.

  ```typescript
  // Before
  expect(responseDate).toBeCloseTo(expectedDate, { seconds: 30 });

  // After
  expect(responseDate).toBeDateCloseTo(expectedDate, { seconds: 30 });
  ```

- **`setupExpectly()` and `setupExpectlyFuzzy()` are removed.** Both were deprecated in 1.x. Extend Playwright's `expect` yourself and capture the return value, e.g. in `tests/support/expect.ts`:

  ```typescript
  import { expectlyMatchers } from "@cerios/playwright-expectly";
  import { expect as baseExpect, test } from "@playwright/test";

  export const expect = baseExpect.extend(expectlyMatchers);
  export { test };
  ```
