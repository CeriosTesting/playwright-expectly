---
"@cerios/playwright-expectly": minor
---

Add matchers that Playwright users frequently ask for.

- **Locator count ranges** (retrying, with `{ visible: true }` to count only visible elements):
  - `toHaveCountGreaterThan`, `toHaveCountGreaterThanOrEqual`
  - `toHaveCountLessThan`, `toHaveCountLessThanOrEqual`
  - `toHaveCountBetween`
- **Sorted locator texts:** `toHaveTextsInAscendingOrder` and `toHaveTextsInDescendingOrder` check a table column or list after a sort click, with `numeric`, `locale`, `ignoreCase`, `strict`, `parse` (for example prices) and `useInnerText` options.
- **Multiple styles:** `toHaveStyles({ ... })` checks several computed CSS properties at once, including custom properties and `::before`/`::after`.
- **Page and context state:** `toHaveCookie(name, value?, { domain, path })` on a `Page` or `BrowserContext`, and `toHaveLocalStorageItem` / `toHaveSessionStorageItem` on a `Page`. All retry until they match.
- **Value matchers known from jest-extended:**
  - `toSatisfy`, `toSatisfyAll`, `toSatisfyAny`
  - `toIncludeSameMembers`, `toIncludeAllMembers`, `toIncludeAnyMembers`
  - `toContainKey`, `toContainKeys`, `toContainAllKeys`, `toContainEntry`, `toContainEntries`, `toBeEmptyObject`
  - `toEqualCaseInsensitive`, `toEqualIgnoringWhitespace`, `toBeHexadecimal`
  - `toBeEven`, `toBeOdd`, `toBeFinite`
  - `toResolve`, `toReject`, `toThrowWithMessage`
- **New exports:** `expectlyLocatorCount`, `expectlyLocatorOrder`, `expectlyPage`, `expectlyCollection` and `expectlyFunction`, with their option types.
- **Declarations:** `expectly` is now declared as `ExpectWithReturn<typeof expectlyMatchers>`, and the declaration bundle never inlines Playwright's own types, so the published types work with every supported Playwright version and with strict package managers.
