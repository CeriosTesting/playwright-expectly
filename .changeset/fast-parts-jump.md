---
"@cerios/playwright-expectly": minor
---

### Features

- **Added `toEqualPartially` with asymmetric matcher support**: Enhanced partial equality matching with support for `expect.any()`, `expect.stringContaining()`, and other asymmetric matchers

### Improvements

- **Improved type safety**: Enhanced type definitions for merged expectly matchers
- **Updated CI/CD workflows**: Optimized GitHub Actions with browser caching and automated release pipeline

### Documentation

- **Comprehensive documentation**: Added detailed matcher documentation with examples across 7 categories (Date, String, Number Array, Object Array, String Array, Locator, and Generic matchers)
- **Enhanced README**: Complete installation guide, usage examples, and API reference

### Internal

- Split Playwright test projects configuration for better test organization
- Excluded test artifacts from linting
