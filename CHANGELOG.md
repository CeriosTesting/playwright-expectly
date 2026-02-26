# @cerios/playwright-expectly

## 1.3.0

### Minor Changes

- 256ef82: **Add `setupExpectly()` helper for one-line Playwright `expect` integration**
  - Added `setupExpectly()` function that extends Playwright's native `expect` with all expectly matchers in a single call
  - Importing `setupExpectly` also activates global `PlaywrightTest.Matchers` type augmentation, giving full IntelliSense on `expect` without extra type imports
  - Updated README with a new "Option 2" quick-start section demonstrating `setupExpectly()` usage in `playwright.config.ts`

### Patch Changes

- 13fe2b2: **Fix `toEqualPartially` diff output for unmatched array objects**
  - Improved array partial matching in `toEqualPartially` so unmatched expected items no longer produce `+   undefined,` in assertion diffs.
  - When no exact array item match is found, the matcher now projects a fallback actual item to preserve object-level field diffs.
  - Added regression tests for single and multiple unmatched expected array items to ensure mismatches show useful property-level differences.

  This is a bug fix with no public API changes.

- 438a9d4: **Improved locator matcher reliability and error handling**
  - Refactored all locator matchers to use `expect.poll()` with progressive polling intervals `[0, 20, 50, 100, 100, 250, 250]` instead of fixed intervals, aligning with Playwright's native polling strategy
  - Enhanced error handling: locator errors (element not found) are now rethrown with full Playwright context, while assertion failures (element found but condition not met) provide clear custom error messages
  - Improved consistency across all locator matcher categories: text, attributes, positioning, state, and visibility matchers now follow the same polling and error handling patterns
  - Updated test expectations to validate meaningful error messages while being resilient to formatting changes

  This change provides better debugging experience when tests fail - you'll now see Playwright's detailed timeout errors when elements can't be found, and clear custom messages when assertions fail.

- c892c18: **Improve matcher discoverability, consistency, and maintenance**
  - Fixed `expectly` type composition so merged matcher typings include all matcher groups (including locator visibility matchers) for better TypeScript IntelliSense.
  - Added missing locator visibility documentation for `toHaveCountVisible` and updated module/category docs with granular import examples.
  - Refactored number-array `toHaveMin`, `toHaveMax`, and `toHaveRange` to reuse shared `getMinMax` utility logic.
  - Aligned `toBeStable` option typing with shared `PollOptions` while preserving stability-specific options.
  - Added a shared test helper for rejected assertions and reused it in locator state/visibility tests to reduce duplication.
  - Cleaned README documentation links by removing references to non-existent docs.

  This is a maintenance and documentation-focused patch release with no breaking API changes.

- ea712a7: **Refactored polling options handling in locator matchers**
  - Created centralized `PollOptions` type in `src/types/poll-options.ts` for consistent type definitions across all matchers
  - Removed `buildPollOptions` helper function - timeout and intervals are now passed directly to `expect.poll()`
  - Simplified all locator matcher implementations by using the shared `PollOptions` type instead of inline interface definitions
  - No functional changes - this is an internal code improvement that makes the codebase more maintainable

  This refactoring reduces code duplication and improves type consistency without affecting the public API or behavior of any matchers.

- 30b4c86: Update README with usage examples for both integration styles:
  - Extend Playwright `expect` using `expect.extend(expectlyMatchers)`
  - Use `expectly` and family exports (`expectlyString`, `expectlyDate`, `expectlyLocator`, etc.) directly
  - Document exported matcher objects (`expectlyMatchers`, `expectlyStringMatchers`, `expectlyDateMatchers`, etc.)

  This clarifies how to adopt expectly globally or per matcher family.

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
