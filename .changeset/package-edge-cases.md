---
"@cerios/playwright-expectly-core": patch
"@cerios/playwright-expectly": patch
"@cerios/playwright-expectly-fuzzy": patch
---

Fix stale object-uniqueness results after mutation and compare rich values using deep strict equality. Make regex assertions independent of `lastIndex`, isolate concurrent return-aware polling assertions, fix consecutive-month checks at month ends, and reject impossible ISO dates.

Reject cyclic partial-matching inputs with an explicit error while allowing shared acyclic references. Numeric comparisons reject non-finite values; sum, average and median use a magnitude-aware floating-point tolerance.

Defer matcher stack formatting and partial-match diagnostic scoring until needed, dispose visibility-check handles, and reduce generated declarations with explicit expect types. Derive matcher return types from the public extension API to support Playwright 1.40 declarations, and add packaged-consumer compatibility checks in CI.
