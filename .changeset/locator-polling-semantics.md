---
"@cerios/playwright-expectly-core": minor
"@cerios/playwright-expectly": major
"@cerios/playwright-expectly-fuzzy": minor
---

Locator matchers now resolve elements the way Playwright's own assertions do.

- **Timeouts:** each locator action receives the remaining assertion time, so a short `actionTimeout` no longer cuts a longer `{ timeout }` or expect timeout short.
- **Missing elements:** a missing element no longer blocks inside a Playwright action. Polling continues until it appears; if it never does, both the assertion and its `.not` form fail with `element(s) not found`, as `expect(locator).not.toHaveAttribute()` does. Previously the `.not` form failed after the full timeout with a misleading `Received: null`.
- **Errors:** strict mode violations and other non-timeout errors are thrown at once instead of being retried or turned into a failed assertion.
- **Positioning matchers** (`toBeAbove`, `toBeBelow`, `toBeLeftOf`, `toBeRightOf`):
  - A hidden element (no bounding box) is reported as such, and its `.not` form no longer passes without comparing anything.
  - Edges within 0.5px count as touching.
  - Messages print real edge values.
- **`toBeStable`:**
  - `timeout: 0` means no timeout, as in Playwright.
  - The default stability window shrinks to fit a short expect timeout.
  - The deadline is checked after every sleep.
  - Strict mode violations are thrown.
  - A missing element fails the `.not` form too.
- **Smaller fixes:**
  - `toHaveDirectText` normalizes whitespace in the expected text as it does in the element text.
  - `toHaveDataAttribute` prints regex expectations correctly.
  - `toHaveCountVisible` rejects negative or fractional counts.
- **Fuzzy matching:**
  - `toMatchFuzzy` preprocesses with Unicode-aware rules: NFC normalization, non-ASCII letters kept, punctuation and whitespace as separators.
  - Text that is equal after preprocessing (including two empty strings) scores 100.
  - A new `{ caseSensitive: true }` option compares letter case.
  - Non-string receivers get a clear error.
- **Validators:**
  - `toBeUUID` accepts RFC 9562 versions 1–8 and the nil and max UUIDs.
  - `toBeValidUrl` requires an `http`/`https` URL with `//` and a valid host by default (`{ protocols }` accepts other schemes), so `localhost:3000`, `C:\Windows` and `javascript:` URLs are no longer valid.
  - `toBeValidEmail` rejects leading, trailing and consecutive dots and hyphen-edged domain labels.
  - Case and title-case checks are Unicode-aware and keep inner capitals such as `McDonald` and `Jean-Luc`.
  - `toBeAlphanumeric` takes `{ unicode: true }`.
  - `toMatchPattern` throws for a non-RegExp pattern instead of matching everything.
- **Stack traces:** stack frame filtering is anchored to the package and workspace folders, so user code in a folder named `playwright-expectly/src` keeps its frames.
- **Wrong receivers:** locator-only matchers called on something other than a Locator throw a clear `TypeError` instead of an internal error.
- **New core exports:** `pollLocators` and `locatorNotFoundMessage` for custom locator matchers.
