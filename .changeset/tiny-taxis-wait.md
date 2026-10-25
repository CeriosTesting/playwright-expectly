---
"@cerios/playwright-expectly": minor
---

Add `pollAndReturn()` and `toPassAndReturn()` to `expectly`, preserving native Playwright retry semantics while returning the value from the successful attempt. Export `withReturn()` for user-created expect instances.

Return-aware assertions reject on failure even when configured as soft. Their boxed report steps and failure stacks point to the user's matcher invocation, with native retry details nested underneath.
