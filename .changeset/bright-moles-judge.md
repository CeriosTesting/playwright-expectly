---
"@cerios/playwright-expectly": patch
---

**Fix `toEqualPartially` diff output for unmatched array objects**

- Improved array partial matching in `toEqualPartially` so unmatched expected items no longer produce `+   undefined,` in assertion diffs.
- When no exact array item match is found, the matcher now projects a fallback actual item to preserve object-level field diffs.
- Added regression tests for single and multiple unmatched expected array items to ensure mismatches show useful property-level differences.

This is a bug fix with no public API changes.
