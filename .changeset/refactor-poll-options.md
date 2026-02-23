---
"@cerios/playwright-expectly": patch
---

**Refactored polling options handling in locator matchers**

- Created centralized `PollOptions` type in `src/types/poll-options.ts` for consistent type definitions across all matchers
- Removed `buildPollOptions` helper function - timeout and intervals are now passed directly to `expect.poll()`
- Simplified all locator matcher implementations by using the shared `PollOptions` type instead of inline interface definitions
- No functional changes - this is an internal code improvement that makes the codebase more maintainable

This refactoring reduces code duplication and improves type consistency without affecting the public API or behavior of any matchers.
