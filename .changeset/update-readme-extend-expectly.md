---
"@cerios/playwright-expectly": patch
---

Update README with usage examples for both integration styles:

- Extend Playwright `expect` using `expect.extend(expectlyMatchers)`
- Use `expectly` and family exports (`expectlyString`, `expectlyDate`, `expectlyLocator`, etc.) directly
- Document exported matcher objects (`expectlyMatchers`, `expectlyStringMatchers`, `expectlyDateMatchers`, etc.)

This clarifies how to adopt expectly globally or per matcher family.
