---
"@cerios/playwright-expectly": minor
---

Added `toMatchFuzzy(expected, threshold?)` string matcher using fuzzball's `token_sort_ratio` algorithm for fuzzy string comparison. Useful for validating AI-generated text where wording may vary but meaning is equivalent.

- Word-order-insensitive: `"hello world"` and `"world hello"` score 100
- Scores range from 0–100; assertion passes when score ≥ threshold
- Default threshold: 80
- Error messages include the computed similarity score and threshold for easy debugging
