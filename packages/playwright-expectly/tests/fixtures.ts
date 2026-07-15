import type { Expect } from "@playwright/test";
import { expect as baseExpect, test } from "@playwright/test";

import { expectlyMatchers } from "../src/expectly";

// Leading pattern: build your own tests/support/expect.ts by extending Playwright's expect and
// capturing the return value — never call `.extend()` and discard it (that's what the deprecated
// setupExpectly() does, which is why it can't override matchers that collide with a Playwright
// built-in, like the Date `toBeCloseTo`).
export const expect: Expect<typeof expectlyMatchers> = baseExpect.extend(expectlyMatchers);
export { test };
