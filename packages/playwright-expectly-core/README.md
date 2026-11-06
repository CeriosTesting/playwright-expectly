# @cerios/playwright-expectly-core

[![npm version](https://badge.fury.io/js/%40cerios%2Fplaywright-expectly-core.svg)](https://www.npmjs.com/package/@cerios/playwright-expectly-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Shared internal utilities used by the [`@cerios/playwright-expectly`](https://www.npmjs.com/package/@cerios/playwright-expectly) and [`@cerios/playwright-expectly-fuzzy`](https://www.npmjs.com/package/@cerios/playwright-expectly-fuzzy) packages.

> **This package is not meant to be installed or used directly.** It's a dependency of the other `@cerios/playwright-expectly*` packages and exists to avoid duplicating shared matcher-building logic between them. Its API may change without following semver as strictly as the consumer-facing packages.

## What's inside

- **`withMatcherState(matchers)`** — wraps a plain matcher-function object so each matcher has typed access to Playwright's matcher state (`this.isNot`, `this.utils`, etc.) inside `expect.extend()`-style definitions, and keeps error stacks pointing at the user's call site.
- **`runPolledMatcher(state, options, poll, { target, until, waitFullTimeout })`** — shared polling loop with the timing of Playwright's `expect.poll()`, without the nested report steps `expect.poll()` would add. When the `target` page or context closes (as it does when the test times out), polling stops at once and the matcher's failure message gets a note saying so, so the matcher still reports the last value it saw. With `waitFullTimeout`, polling waits out the time left after the last read instead of giving up when the next interval would cross the deadline.
- **`pollLocators(...)`**, **`locatorNotFoundMessage(...)`**, **`hasElements(locator)`**, **`assertLocators(...)`** — locator polling with Playwright's semantics for missing elements, and the shared "element(s) not found" failure message.
- **`PollOptions`**, **`PolledMatcherOptions`**, **`Closeable`**, **`MatcherReturnType`** — shared TypeScript types for polling matchers.

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
