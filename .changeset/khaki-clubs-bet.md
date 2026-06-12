---
"@cerios/playwright-expectly": minor
"@cerios/playwright-expectly-core": minor
"@cerios/playwright-expectly-fuzzy": minor
---

**Migrate build tooling from tsup to tsdown and improve matcher type inference**

- Replaced `tsup` with `tsdown` as the build tool for all three packages (`playwright-expectly`, `playwright-expectly-core`, `playwright-expectly-fuzzy`)
- Added explicit type assertions on `expectlyMatchers` and `expectlyLocatorMatchers` spread objects so TypeScript correctly infers the full union of all matcher method signatures, improving IntelliSense across all matcher groups
