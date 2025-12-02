# String Array Matchers

Matchers for validating arrays of strings, including sorting and uniqueness checks.

## Available Matchers

- [toHaveAscendingOrder()](#tohaveascendingorder)
- [toHaveDescendingOrder()](#tohavedescendingorder)
- [toHaveStrictlyAscendingOrder()](#tohavestrictlyascendingorder)
- [toHaveStrictlyDescendingOrder()](#tohavestrictlydescendingorder)
- [toBeMonotonic()](#tobemonotonic)
- [toHaveUniqueValues()](#tohaveuniquevalues)

## toHaveAscendingOrder()

Asserts that an array of strings is in ascending order (alphabetically A-Z).

```typescript
import { expectly } from '@cerios/playwright-expectly';

// Validate sorted names
const names = ["Alice", "Bob", "Charlie", "David"];
expectly(names).toHaveAscendingOrder();

// Check sorted categories from API
const categories = await page.locator('.category').allTextContents();
expectly(categories).toHaveAscendingOrder();

// Case-sensitive sorting
const items = ["Apple", "Banana", "apple", "banana"];
expectly(items).toHaveAscendingOrder(); // Uppercase comes first
```

## toHaveDescendingOrder()

Asserts that an array of strings is in descending order (alphabetically Z-A).

```typescript
// Validate reverse sorted list
const items = ["Zebra", "Yak", "Xylophone", "Watermelon"];
expectly(items).toHaveDescendingOrder();

// Check descending sort
expectly(sortedList).toHaveDescendingOrder();

// From page content
const menuItems = await page.locator('.menu-item').allTextContents();
expectly(menuItems).toHaveDescendingOrder();
```

## toHaveStrictlyAscendingOrder()

Asserts that strings are in strictly ascending order (each element > previous).

Unlike `toHaveAscendingOrder()`, this rejects equal consecutive values.

```typescript
// Validate increasing values
const versions = ["v1.0", "v1.1", "v2.0", "v3.0"];
expectly(versions).toHaveStrictlyAscendingOrder();

// This would fail (has equal consecutive values)
expectly(["a", "b", "b", "c"]).not.toHaveStrictlyAscendingOrder();

// All values must be different
const statuses = ["pending", "processing", "shipped"];
expectly(statuses).toHaveStrictlyAscendingOrder();
```

## toHaveStrictlyDescendingOrder()

Asserts that strings are in strictly descending order (each element < previous).

Unlike `toHaveDescendingOrder()`, this rejects equal consecutive values.

```typescript
// Validate decreasing values
const priorities = ["urgent", "high", "medium", "low"];
expectly(priorities).toHaveStrictlyDescendingOrder();

// This would fail (has equal consecutive values)
expectly(["z", "y", "y", "x"]).not.toHaveStrictlyDescendingOrder();

// All values must be different
const ranks = ["gold", "silver", "bronze"];
expectly(ranks).toHaveStrictlyDescendingOrder();
```

## toBeMonotonic()

Asserts that an array is monotonic (consistently ascending or descending).

A monotonic array never changes direction - it only goes up, only goes down, or stays flat.

```typescript
// Valid monotonic arrays
expectly(["a", "b", "b", "c", "d"]).toBeMonotonic(); // Ascending
expectly(["z", "y", "x", "x", "w"]).toBeMonotonic(); // Descending
expectly(["same", "same", "same"]).toBeMonotonic(); // Flat

// Not monotonic (changes direction)
expectly(["a", "c", "b", "d"]).not.toBeMonotonic();

// Use case: validating sorted data
const timestamps = ["2024-01-01", "2024-01-02", "2024-01-03"];
expectly(timestamps).toBeMonotonic();
```

## toHaveUniqueValues()

Asserts that all strings in an array are unique (no duplicates).

```typescript
// Validate unique usernames
const usernames = ["alice", "bob", "charlie", "david"];
expectly(usernames).toHaveUniqueValues();

// Check for duplicates
expectly(["a", "b", "b", "c"]).not.toHaveUniqueValues();

// From page elements
const tags = await page.locator('.tag').allTextContents();
expectly(tags).toHaveUniqueValues();
```

## Common Use Cases

### Navigation Menu Validation

```typescript
test('validate menu items are sorted', async ({ page }) => {
  await page.goto('/');

  const menuItems = await page.locator('.nav-menu a').allTextContents();

  expectly(menuItems).toHaveAscendingOrder();
  expectly(menuItems).toHaveUniqueValues();
});
```

### Category/Tag Validation

```typescript
test('validate category sorting', async ({ page }) => {
  await page.goto('/products');

  const categories = await page.locator('.category').allTextContents();

  // Categories should be alphabetically sorted
  expectly(categories).toHaveAscendingOrder();

  // No duplicate categories
  expectly(categories).toHaveUniqueValues();
});
```

### Dropdown Options

```typescript
test('validate dropdown options', async ({ page }) => {
  await page.goto('/settings');

  const options = await page.locator('select.language option').allTextContents();

  // Options should be sorted
  expectly(options).toHaveAscendingOrder();

  // All options should be unique
  expectly(options).toHaveUniqueValues();
});
```

### Search Results

```typescript
test('validate search results alphabetically', async ({ page }) => {
  await page.goto('/search?q=test&sort=alpha');

  const results = await page.locator('.result-title').allTextContents();

  expectly(results).toHaveAscendingOrder();
});
```

### File Listing

```typescript
test('validate file list sorting', async ({ page }) => {
  await page.goto('/files');
  await page.locator('th.filename').click(); // Sort by filename

  const filenames = await page.locator('.filename').allTextContents();

  // Should be sorted alphabetically
  expectly(filenames).toHaveAscendingOrder();
  expectly(filenames).toBeMonotonic();
});
```

### API Response Validation

```typescript
test('validate API returns sorted data', async () => {
  const response = await api.getUsers({ sort: 'name' });
  const names = response.users.map(u => u.name);

  expectly(names).toHaveAscendingOrder();
  expectly(names).toHaveUniqueValues();
});
```

### Priority Queue

```typescript
test('validate priority ordering', async () => {
  const tasks = await api.getTasks();
  const priorities = tasks.map(t => t.priority);

  // Priorities should be monotonic (all ascending or all descending)
  expectly(priorities).toBeMonotonic();
});
```

### Version Numbers

```typescript
test('validate version progression', async () => {
  const versions = await api.getReleases();
  const versionNumbers = versions.map(v => v.version);

  // Versions should increase
  expectly(versionNumbers).toHaveStrictlyAscendingOrder();
});
```

## Case Sensitivity

String comparison is case-sensitive. Uppercase letters come before lowercase in ASCII order:

```typescript
// This will pass (uppercase comes first)
expectly(["Apple", "Banana", "apple"]).toHaveAscendingOrder();

// This will fail
expectly(["apple", "Apple", "Banana"]).not.toHaveAscendingOrder();

// To normalize case, transform the array first
const items = ["apple", "Apple", "Banana"];
const normalized = items.map(s => s.toLowerCase()).sort();
expectly(normalized).toHaveAscendingOrder();
```

## Whitespace Handling

Whitespace is significant in string comparisons:

```typescript
// These are different strings
expectly(["a", "a "]).not.toHaveUniqueValues(); // Has duplicate (false)
expectly(["a", "a "]).toHaveUniqueValues(); // Actually different (true)

// Trim whitespace if needed
const values = ["  a  ", "  b  ", "  c  "];
const trimmed = values.map(s => s.trim());
expectly(trimmed).toHaveAscendingOrder();
```

## Locale-Specific Sorting

For locale-specific sorting, sort the array with `localeCompare` before validating:

```typescript
test('validate locale-specific sorting', async () => {
  const names = ["Änne", "Zebra", "Österreich"];

  // Sort with locale
  const sorted = [...names].sort((a, b) => a.localeCompare(b, 'de'));

  // Validate the sorted result
  expectly(sorted).toHaveAscendingOrder();
});
```

## Error Messages

Clear error messages help identify sorting issues:

```typescript
const items = ["Charlie", "Alice", "Bob"];

expectly(items).toHaveAscendingOrder();
// Error: Expected array to be in ascending order
// Expected: ["Alice", "Bob", "Charlie"]
// Received: ["Charlie", "Alice", "Bob"]

const duplicates = ["a", "b", "b", "c"];
expectly(duplicates).toHaveUniqueValues();
// Error: Expected array to contain only unique values
// Duplicate values (1): ["b"]
// Full array (4 elements): ["a", "b", "b", "c"]
```

## Performance Considerations

### Large Arrays

All matchers are optimized for performance:

```typescript
// Efficient even with thousands of strings
const largeArray = Array.from({ length: 10000 }, (_, i) => `item${i}`);
expectly(largeArray).toHaveUniqueValues(); // Fast
expectly(largeArray).toHaveAscendingOrder(); // Fast
```

### Monotonic Checking

The monotonic checker is optimized to stop early when direction changes:

```typescript
const mixed = ["a", "b", "c", "b", ...Array(1000).fill("x")];
expectly(mixed).not.toBeMonotonic(); // Stops at index 3
```

## Related

- [Number Array Matchers](./NUMBER_ARRAY_MATCHERS.md) - For number array validation
- [Object Array Matchers](./OBJECT_ARRAY_MATCHERS.md) - For object array validation
- [String Matchers](./STRING_MATCHERS.md) - For individual string validation

[← Back to README](../README.md)
