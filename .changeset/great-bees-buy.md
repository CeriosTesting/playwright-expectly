---
"@cerios/playwright-expectly": patch
---

Refactored internals to use the new `@cerios/playwright-expectly-core` shared utilities package. No changes to the public API.

## New packages

### `@cerios/playwright-expectly-core` (`0.1.0`)

New shared utilities package extracted from the core library. Provides `withMatcherState` and `PollOptions` for building custom matchers.

### `@cerios/playwright-expectly-fuzzy` (`0.1.0`)

New optional package for fuzzy string matching using [fuzzball](https://www.npmjs.com/package/fuzzball)'s `token_sort_ratio` algorithm. Ideal for validating AI-generated text where wording or word order may vary.

**`toMatchFuzzy(expected, threshold?)`**

- Works on both strings and Playwright locators
- Word-order-insensitive: `"hello world"` and `"world hello"` score 100
- Scores range from 0–100; assertion passes when score ≥ threshold
- Default threshold: 80
- Error messages include the computed similarity score and threshold for easy debugging

```bash
npm install @cerios/playwright-expectly-fuzzy --save-dev
```
