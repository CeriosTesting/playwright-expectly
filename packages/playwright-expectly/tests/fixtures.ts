import { expect, test } from "@playwright/test";

import { setupExpectly } from "../src/playwright-setup";

setupExpectly();

export { expect, test };
