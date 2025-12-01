# 🎭 Playwright Expectly | By Cerios

[![npm version](https://badge.fury.io/js/%40cerios%2Fplaywright-expectly.svg)](https://www.npmjs.com/package/@cerios/playwright-expectly)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Comprehensive Playwright test matchers for strings, numbers, dates, arrays, objects, and locators. Simplify your E2E tests with intuitive assertions.

## Features

- 🎯 **50+ Custom Matchers** - Extensive validation for all data types
- 🔤 **String Validation** - Email, URL, UUID, alphanumeric, and more
- 🔢 **Number Arrays** - Sorting, statistics, ranges, and patterns
- 📅 **Date Operations** - Comparisons, ranges, quarters, and business logic
- 🎨 **Locator Assertions** - DOM element validation and text formatting
- 📦 **Object Arrays** - Sorting, uniqueness, and property validation
- 💪 **Type-Safe** - Full TypeScript support
- ⚡ **Zero Dependencies** - Only Playwright required

## Installation

```bash
npm install @cerios/playwright-expectly --save-dev
```

## Quick Start

```typescript
import { expectly } from '@cerios/playwright-expectly';

// String validation
expectly('user@example.com').toBeValidEmail();

// Number array validation
expectly([1, 2, 3, 4, 5]).toHaveAscendingOrder();

// Date validation
expectly(new Date()).toBeInTheFuture(new Date('2020-01-01'));

// Locator validation
await expectly(page.locator('.username')).toBeAlphanumeric();
```

## Available Matchers

### String Matchers
- `toBeValidEmail()` - Validate email format
- `toBeValidUrl()` - Validate URL format
- `toBeUUID(version?)` - Validate UUID (optionally specific version)
- `toBeAlphanumeric()` - Only letters and numbers
- `toBeNumericString()` - Only digits
- `toStartWith(prefix)` / `toEndWith(suffix)` - String boundaries
- `toMatchPattern(regex)` - Regular expression matching

[📖 View all string matchers →](./docs/STRING_MATCHERS.md)

### Number Array Matchers
- `toHaveAscendingOrder()` / `toHaveDescendingOrder()` - Sort validation
- `toHaveAverage(value)` / `toHaveMedian(value)` - Statistical validation
- `toHaveMin(value)` / `toHaveMax(value)` - Boundary validation
- `toBeAllPositive()` / `toBeAllNegative()` - Sign validation
- `toBeMonotonic()` - Consistent direction
- `toHaveConsecutiveIntegers()` - Sequential validation

[📖 View all number array matchers →](./docs/NUMBER_ARRAY_MATCHERS.md)

### Date Matchers
- `toBeCloseTo(date, deviation)` - Within time deviation
- `toBeInTheFuture(refDate?)` / `toBeInThePast(refDate?)` - Temporal validation
- `toBeSameDay(date)` / `toBeSameMonth(date)` / `toBeSameYear(date)` - Date comparison
- `toBeInQuarter(quarter)` - Quarter validation
- `toBeLeapYear()` - Leap year check
- `toHaveConsecutiveDates(unit)` - Sequential dates

[📖 View all date matchers →](./docs/DATE_MATCHERS.md)

### Locator Matchers
- `toBeAlphanumeric()` - Alphanumeric text
- `toBeNumericString()` - Numeric text
- `toBeUUID(version?)` - UUID format
- `toBeUpperCase()` / `toBeLowerCase()` - Case validation
- `toBeTitleCase()` - Title case format
- `toHaveSrc(value)` / `toHaveHref(value)` / `toHaveAlt(value)` - Attribute validation

[📖 View all locator matchers →](./docs/LOCATOR_MATCHERS.md)

### Object Array Matchers
- `toHaveObjectsInAscendingOrderBy(property)` - Sort by property
- `toHaveObjectsInDescendingOrderBy(property)` - Reverse sort by property
- `toHaveOnlyUniqueObjects()` - Uniqueness validation

[📖 View all object array matchers →](./docs/OBJECT_ARRAY_MATCHERS.md)

### String Array Matchers
- `toHaveAscendingOrder()` / `toHaveDescendingOrder()` - Alphabetical order
- `toHaveStrictlyAscendingOrder()` - No duplicates ascending
- `toBeMonotonic()` - Consistent direction
- `toHaveUniqueValues()` - No duplicates

[📖 View all string array matchers →](./docs/STRING_ARRAY_MATCHERS.md)

### Generic Matchers
- `toBeInteger()` / `toBeFloat()` - Number type validation
- `toBeAnyOf(...values)` - Multiple value matching
- `toEqualPartially(expected)` - Partial object matching
- `toBeNullish()` - Null or undefined check
- `toBePrimitive()` / `toBeArray()` / `toBeObject()` - Type checking

[📖 View all generic matchers →](./docs/GENERIC_MATCHERS.md)

## Usage Examples

### Basic String Validation

```typescript
import { expectly } from '@cerios/playwright-expectly';

test('validate user input', async () => {
  expectly('john.doe@example.com').toBeValidEmail();
  expectly('https://example.com').toBeValidUrl();
  expectly('550e8400-e29b-41d4-a716-446655440000').toBeUUID(4);
});
```

### Number Array Assertions

```typescript
test('validate sorted data', async () => {
  const scores = [85, 90, 92, 95];

  expectly(scores).toHaveAscendingOrder();
  expectly(scores).toHaveAverage(90.5);
  expectly(scores).toBeAllPositive();
});
```

### Date Comparisons

```typescript
test('validate dates', async () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);

  expectly(tomorrow).toBeInTheFuture(now);
  expectly(tomorrow).toBeCloseTo(now, { hours: 24 });
});
```

### DOM Element Validation

```typescript
test('validate form elements', async ({ page }) => {
  await expectly(page.locator('.email')).toBeValidEmail();
  await expectly(page.locator('.username')).toBeAlphanumeric();
  await expectly(page.locator('img')).toHaveAlt('Company Logo');
});
```

## Advanced Usage

### Individual Matcher Imports

For tree-shaking optimization, import only what you need:

```typescript
import { expectlyString } from '@cerios/playwright-expectly';
import { expectlyNumberArray } from '@cerios/playwright-expectly';
import { expectlyDate } from '@cerios/playwright-expectly';

expectlyString('test@example.com').toBeValidEmail();
expectlyNumberArray([1, 2, 3]).toHaveAscendingOrder();
expectlyDate(new Date()).toBeInTheFuture(new Date('2020-01-01'));
```

### Negation

All matchers support `.not` for inverse assertions:

```typescript
expectly('not-an-email').not.toBeValidEmail();
expectly([5, 3, 1]).not.toHaveAscendingOrder();
await expectly(page.locator('.text')).not.toBeNumericString();
```

## Documentation

- [📖 String Matchers](./docs/STRING_MATCHERS.md) - Email, URL, UUID, alphanumeric validation
- [📖 Number Array Matchers](./docs/NUMBER_ARRAY_MATCHERS.md) - Sorting, statistics, range checks
- [📖 Date Matchers](./docs/DATE_MATCHERS.md) - Date comparisons, quarters, business days
- [📖 Locator Matchers](./docs/LOCATOR_MATCHERS.md) - DOM element text and attribute validation
- [📖 Object Array Matchers](./docs/OBJECT_ARRAY_MATCHERS.md) - Sorting and uniqueness by property
- [📖 String Array Matchers](./docs/STRING_ARRAY_MATCHERS.md) - Alphabetical sorting and uniqueness
- [📖 Generic Matchers](./docs/GENERIC_MATCHERS.md) - Type checking and partial matching
- [📖 API Reference](./docs/API.md) - Complete API documentation

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Cerios](https://github.com/CeriosTesting)

## Support

- 📫 [Report Issues](https://github.com/CeriosTesting/playwright-expectly/issues)
- 💬 [Discussions](https://github.com/CeriosTesting/playwright-expectly/discussions)
- 🌐 [Website](https://github.com/CeriosTesting/playwright-expectly)

---

Built with ❤️ by [Cerios](https://github.com/CeriosTesting)
