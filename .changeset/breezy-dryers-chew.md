---
"@cerios/playwright-expectly": patch
---

### Features

- **Added modular locator matcher organization**: Split locator matchers into granular modules (text, attributes, positioning, and state) for improved maintainability and targeted imports

### Improvements

- **Enhanced test reliability**: Adjusted timeout values in stability tests to provide more reliable execution and reduce flakiness
- **Improved error message clarity**: Refactored error message formatting in required attribute assertions for better readability
- **Strengthened validation**: Enhanced stability tests with error message validation for invalid parameters
