---
"@cerios/playwright-expectly": patch
---

**Improve matcher discoverability, consistency, and maintenance**

- Fixed `expectly` type composition so merged matcher typings include all matcher groups (including locator visibility matchers) for better TypeScript IntelliSense.
- Added missing locator visibility documentation for `toHaveCountVisible` and updated module/category docs with granular import examples.
- Refactored number-array `toHaveMin`, `toHaveMax`, and `toHaveRange` to reuse shared `getMinMax` utility logic.
- Aligned `toBeStable` option typing with shared `PollOptions` while preserving stability-specific options.
- Added a shared test helper for rejected assertions and reused it in locator state/visibility tests to reduce duplication.
- Cleaned README documentation links by removing references to non-existent docs.

This is a maintenance and documentation-focused patch release with no breaking API changes.
