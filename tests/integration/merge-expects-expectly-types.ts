import { expectly, withReturn } from "@cerios/playwright-expectly";
import type { WithReturn } from "@cerios/playwright-expectly";
import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";
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

// Type-narrowing assertions on a merged expect with the fuzzy package and a user's own matchers.
// `WithReturn<typeof merged>` is the explicit annotation TS2775 asks for, without listing matcher types.
const userExpect = baseExpect.extend({
	toExceed(received: number, minimum: number): { pass: boolean; message: () => string } {
		return { pass: received > minimum, message: () => "expected a larger number" };
	},
});
const merged = mergeExpects(baseExpect, expectly, expectlyFuzzy, userExpect);
const narrowingExpect: WithReturn<typeof merged> = withReturn(merged);

narrowingExpect(2).toExceed(1);
narrowingExpect("hello world").toMatchFuzzy("world hello");
narrowingExpect("user@example.com").toBeValidEmail();
// @ts-expect-error - Registered matchers keep their argument types.
narrowingExpect(2).toExceed("1");

function checkMergedNarrowing(name: string | null | undefined): string {
	narrowingExpect.toBeDefined(name);
	narrowingExpect.not.toBeNull(name);
	return name;
}

function checkMergedSoftDoesNotNarrow(name: string | undefined): string {
	narrowingExpect.soft.toBeDefined(name);
	// @ts-expect-error - Soft assertions do not narrow.
	return name;
}

void [checkMergedNarrowing, checkMergedSoftDoesNotNarrow];
