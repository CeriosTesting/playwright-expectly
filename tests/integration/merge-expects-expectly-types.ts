import { expectly } from "@cerios/playwright-expectly";
import { expect as baseExpect, mergeExpects } from "@playwright/test";

// Regression guard: exported `expectly` must remain merge-compatible with Playwright's base expect.
const expect = mergeExpects(baseExpect, expectly);

expect([1, 2, 3]).toHaveLength(3);
expect("user@example.com").toBeValidEmail();

// Regression guard: Playwright's numeric `toBeCloseTo` keeps its own signature, and the Date
// matcher is only available as `toBeDateCloseTo`.
expect(0.1 + 0.2).toBeCloseTo(0.3);
expect(0.1 + 0.2).toBeCloseTo(0.3, 5);
expect(new Date()).toBeDateCloseTo(new Date(), { seconds: 1 });
// @ts-expect-error - Dates are not accepted by Playwright's numeric `toBeCloseTo`.
expect(new Date()).toBeCloseTo(new Date(), { seconds: 1 });
