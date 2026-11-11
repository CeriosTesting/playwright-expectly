---
"@cerios/playwright-expectly": minor
---

Add matchers that are frequently requested in the Playwright and jest-extended issue trackers.

- **Response:** `toHaveStatus(201 | "2xx")` for an `APIResponse` or page `Response`. A failure is formatted like Playwright's `toBeOK()`, with the same call log and response text (textual bodies only, truncated to 1000 characters), plus the expected and received status. New granular import `expectlyResponse` and type `HttpStatusClass`.
- **Page:** `toHaveURLSearchParams(expected, { exact })` asserts the query of the page URL in any order, retrying. Values can be a string, a RegExp or an asymmetric matcher (read like `URLSearchParams.get()`), or a string array for all values of a repeated parameter. Assert an absent parameter with `.not.toHaveURLSearchParams({ debug: expect.anything() })`. New types `ExpectedSearchParams`, `ExpectedSearchParamValue` and `URLSearchParamsOptions`.
- **Locator:** `toHaveSelectedOption(label | labels[])` asserts the visible label of the selected `<select>` option(s), retrying; the built-in `toHaveValue()` checks the `value` attribute instead.
- **Collection:** `toContainValue()`, `toContainValues()`, `toContainAllValues()` (exact multiset), `toContainAnyValues()`, `toContainAnyKeys()` and `toContainAnyEntries()` for object values, with `toEqual` semantics.
- **String:** `toBeValidJSON(expected?)` checks that a string parses as JSON and, optionally, that the parsed value equals `expected` (asymmetric matchers such as `expect.objectContaining()` work).
- **Numbers:** `toBeNear(expected, { tolerance } | { percent })` for an absolute or relative deviation, absorbing binary rounding of decimal inputs, and `toBeWithin(min, max)` for an inclusive range. New type `NearOptions`.
