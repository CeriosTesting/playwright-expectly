---
"@cerios/playwright-expectly": patch
---

Harden `toEqualPartially` matching behavior and diagnostics.

- Added `arrayMode` option for `toEqualPartially` with `subset` (default), `exactLength`, and `exactOrder`.
- Added runtime validation for `toEqualPartially` options with clear matcher-style error messages for invalid keys/values.
- Improved array mismatch diagnostics to include unmatched expected indices and path context (for example, `$.projects[0]`).
- Kept `requireExplicitUndefinedKeyPresence` configurable (default off) and aligned runtime/type docs.
- Expanded regression coverage for duplicate matching, strict array modes, invalid options, and nested asymmetric matcher scenarios.
