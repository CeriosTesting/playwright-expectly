---
"@cerios/playwright-expectly": patch
---

Fix matcher type augmentation visibility when using `setupExpectly()`.

- Ensure Playwright matcher type augmentation is loaded from the package entrypoint so importing from `@cerios/playwright-expectly` consistently exposes custom matcher types like `toEqualPartially`.
- Improve setup guidance for projects where `playwright.config` is JavaScript or not included in the TypeScript program by documenting a one-time ambient import option.
- Add a regression test covering usage from a separate class without importing `expectly` directly.
