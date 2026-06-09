import { expect } from "@playwright/test";

import { expectlyFuzzyMatchers } from "./index";

export function setupExpectlyFuzzy(): void {
	expect.extend(expectlyFuzzyMatchers);
}
