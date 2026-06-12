---
"@cerios/playwright-expectly": patch
"@cerios/playwright-expectly-core": patch
"@cerios/playwright-expectly-fuzzy": patch
---

**Migrate build tooling from tsup to tsdown and improve matcher type inference**

- Replaced `tsup` with `tsdown` as the build tool for all three packages (`playwright-expectly`, `playwright-expectly-core`, `playwright-expectly-fuzzy`)
- Added explicit type assertions on `expectlyMatchers` and `expectlyLocatorMatchers` spread objects so TypeScript correctly infers the full union of all matcher method signatures, improving IntelliSense across all matcher groups
