---
"@cerios/playwright-expectly": minor
---

### New Features

- **Added `toHaveDirectText` matcher**: Validates text content of an element while ignoring text from nested child elements. Useful for checking only the direct text nodes of a parent element.
  - Example: `await expectly(page.locator('div')).toHaveDirectText('new value')`

- **Added `toHaveCountVisible` matcher**: Asserts the expected number of visible elements matching a locator.
  - Example: `await expectly(page.locator('.list-item')).toHaveCountVisible(3)`
