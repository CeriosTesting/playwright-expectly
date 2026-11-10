// Fixture for check-matchers: a tsconfig "paths" alias and an import without a file extension, as
// Playwright test files use them. Both exports define `toBeAliased`.
import { common } from "@fixtures/common";

import { local } from "./local";

export { common, local };
