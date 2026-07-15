# @cerios/playwright-expectly-core

[![npm version](https://badge.fury.io/js/%40cerios%2Fplaywright-expectly-core.svg)](https://www.npmjs.com/package/@cerios/playwright-expectly-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Shared internal utilities used by the [`@cerios/playwright-expectly`](https://www.npmjs.com/package/@cerios/playwright-expectly) and [`@cerios/playwright-expectly-fuzzy`](https://www.npmjs.com/package/@cerios/playwright-expectly-fuzzy) packages.

> **This package is not meant to be installed or used directly.** It's a dependency of the other `@cerios/playwright-expectly*` packages and exists to avoid duplicating shared matcher-building logic between them. Its API may change without following semver as strictly as the consumer-facing packages.

## What's inside

- **`withMatcherState(matchers)`** — wraps a plain matcher-function object so each matcher has typed access to Playwright's matcher state (`this.isNot`, `this.utils`, etc.) inside `expect.extend()`-style definitions.
- **`runPolledMatcher(...)`** — shared polling loop used by locator-based matchers that need to retry until a condition is met or a timeout is reached (mirrors Playwright's own web-first assertion polling behavior).
- **`PollOptions`** — shared TypeScript type for `{ timeout?: number }`-style options accepted by polling matchers.

## Usage (for `@cerios/playwright-expectly*` package authors)

```typescript
import { withMatcherState } from "@cerios/playwright-expectly-core";

export const myMatchers = withMatcherState({
	toBeSomething(actual: unknown) {
		// `this` here is typed with Playwright's ExpectMatcherState
		return { pass: actual === "something", message: () => "..." };
	},
});
```

## Links

- [Full project README](https://github.com/CeriosTesting/playwright-expectly#readme)
- [Changelog](./CHANGELOG.md)
- [Issues](https://github.com/CeriosTesting/playwright-expectly/issues)

## License

MIT © Cerios
