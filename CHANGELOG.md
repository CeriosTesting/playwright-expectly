# @cerios/playwright-expectly

## 1.2.0

### Minor Changes

- 5e7b5c8: ### New Features

  - **Added `toHaveDirectText` matcher**: Validates text content of an element while ignoring text from nested child elements. Useful for checking only the direct text nodes of a parent element.

    - Example: `await expectly(page.locator('div')).toHaveDirectText('new value')`

  - **Added `toHaveCountVisible` matcher**: Asserts the expected number of visible elements matching a locator.
    - Example: `await expectly(page.locator('.list-item')).toHaveCountVisible(3)`

## 1.1.1

### Patch Changes

- b01508e: ### Features

  - **Added modular locator matcher organization**: Split locator matchers into granular modules (text, attributes, positioning, and state) for improved maintainability and targeted imports

  ### Improvements

  - **Enhanced test reliability**: Adjusted timeout values in stability tests to provide more reliable execution and reduce flakiness
  - **Improved error message clarity**: Refactored error message formatting in required attribute assertions for better readability
  - **Strengthened validation**: Enhanced stability tests with error message validation for invalid parameters

## 1.1.0

### Minor Changes

- 78fb0a9: ### Features

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

## 1.0.0

### Major Changes

- d9857ef: # 🎉 First Major Release - v1.0.0

  We're excited to announce the first major release of `@cerios/playwright-expectly`! This comprehensive matcher library extends Playwright's built-in assertions with 50+ intuitive matchers for strings, numbers, dates, arrays, objects, and locators.

  ## What's Included

  - **String matchers**: `toBeAlphanumeric`, `toBeValidEmail`, `toMatchPattern`, and more
  - **Number matchers**: `toBeInRange`, `toBePositive`, `toBeDivisibleBy`, and more
  - **Date matchers**: `toBeInTheFuture`, `toBeInThePast`, `toBeWeekday`, and more
  - **Array matchers**: `toHaveAscendingOrder`, `toBeUnique`, `toContainValue`, and more
  - **Object matchers**: Deep validation and structure checking
  - **Locator matchers**: Enhanced element assertions for E2E testing

  ## Why Use playwright-expectly?

  - ✅ Type-safe with full TypeScript support
  - ✅ Intuitive, readable test assertions
  - ✅ Comprehensive error messages
  - ✅ Zero dependencies beyond Playwright
  - ✅ Production-ready and thoroughly tested

  Perfect for simplifying your E2E test assertions and making your test code more maintainable!
