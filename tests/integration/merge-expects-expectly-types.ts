import { expectly } from "@cerios/playwright-expectly";
import { expect as baseExpect, mergeExpects } from "@playwright/test";

// Regression guard: exported `expectly` must remain merge-compatible with Playwright's base expect.
const expect = mergeExpects(baseExpect, expectly);

expect([1, 2, 3]).toHaveLength(3);
expect("user@example.com").toBeValidEmail();

export {};
