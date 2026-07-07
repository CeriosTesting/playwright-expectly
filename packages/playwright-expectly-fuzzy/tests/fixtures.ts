import type { Expect } from "@playwright/test";
import { expect as baseExpect, test } from "@playwright/test";

import { expectlyFuzzyMatchers } from "../src/expectly-fuzzy";

// Leading pattern: build your own tests/support/expect.ts by extending Playwright's expect and
// capturing the return value — never call `.extend()` and discard it.
export const expect: Expect<typeof expectlyFuzzyMatchers> = baseExpect.extend(expectlyFuzzyMatchers);
export { test };
