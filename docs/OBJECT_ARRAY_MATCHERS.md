# Object Array Matchers

Matchers for validating arrays of objects, including sorting and uniqueness checks.

## Available Matchers

- [toHaveOnlyUniqueObjects()](#tohaveonlyuniqueobjects)
- [toHaveObjectsInAscendingOrderBy()](#tohaveobjectsinascendingorderby)
- [toHaveObjectsInDescendingOrderBy()](#tohaveobjectsindescendingorderby)

## toHaveOnlyUniqueObjects()

Asserts that an array contains only unique objects (no duplicates).

Uses deep equality comparison via JSON serialization to detect duplicates. Handles circular references gracefully.

```typescript
import { expectly } from '@cerios/playwright-expectly';

// Validate unique records
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];
expectly(users).toHaveOnlyUniqueObjects();

// This would fail (duplicate objects)
const items = [{ id: 1 }, { id: 1 }];
expectly(items).not.toHaveOnlyUniqueObjects();

// Works with nested objects
const records = [
  { user: { id: 1, name: 'Alice' }, status: 'active' },
  { user: { id: 2, name: 'Bob' }, status: 'active' }
];
expectly(records).toHaveOnlyUniqueObjects();
```

## toHaveObjectsInAscendingOrderBy()

Asserts that an array of objects is sorted in ascending order by a specific property.

```typescript
// Validate sorted by age
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 }
];
expectly(users).toHaveObjectsInAscendingOrderBy('age');

// Check alphabetical sorting
const products = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' }
];
expectly(products).toHaveObjectsInAscendingOrderBy('name');

// Date sorting
const events = [
  { title: 'First', date: '2024-01-01' },
  { title: 'Second', date: '2024-02-01' },
  { title: 'Third', date: '2024-03-01' }
];
expectly(events).toHaveObjectsInAscendingOrderBy('date');
```

## toHaveObjectsInDescendingOrderBy()

Asserts that an array of objects is sorted in descending order by a specific property.

```typescript
// Validate sorted by score (high to low)
const players = [
  { name: 'Alice', score: 950 },
  { name: 'Bob', score: 850 },
  { name: 'Charlie', score: 750 }
];
expectly(players).toHaveObjectsInDescendingOrderBy('score');

// Check reverse chronological order
const posts = [
  { title: 'Latest', date: '2024-12-31' },
  { title: 'Earlier', date: '2024-11-15' },
  { title: 'Oldest', date: '2024-01-01' }
];
expectly(posts).toHaveObjectsInDescendingOrderBy('date');

// Price sorting (high to low)
const products = [
  { name: 'Premium', price: 99.99 },
  { name: 'Standard', price: 49.99 },
  { name: 'Basic', price: 19.99 }
];
expectly(products).toHaveObjectsInDescendingOrderBy('price');
```

## Common Use Cases

### API Response Validation

```typescript
test('validate sorted API response', async () => {
  const response = await api.getUsers({ sortBy: 'age' });

  expectly(response.users).toHaveObjectsInAscendingOrderBy('age');
  expectly(response.users).toHaveOnlyUniqueObjects();
});
```

### Table Data Verification

```typescript
test('validate table sorting', async ({ page }) => {
  await page.goto('/users');
  await page.locator('th.age').click(); // Sort by age

  const rows = await page.locator('tbody tr').all();
  const userData = await Promise.all(
    rows.map(async (row) => ({
      name: await row.locator('.name').textContent(),
      age: Number(await row.locator('.age').textContent())
    }))
  );

  expectly(userData).toHaveObjectsInAscendingOrderBy('age');
});
```

### Leaderboard Validation

```typescript
test('validate leaderboard order', async () => {
  const leaderboard = await api.getLeaderboard();

  // Should be sorted by score descending
  expectly(leaderboard).toHaveObjectsInDescendingOrderBy('score');

  // All entries should be unique
  expectly(leaderboard).toHaveOnlyUniqueObjects();
});
```

### E-commerce Product Sorting

```typescript
test('validate product sorting options', async ({ page }) => {
  await page.goto('/products');

  // Test price sorting (low to high)
  await page.selectOption('#sort', 'price-asc');
  await page.waitForLoadState('networkidle');

  const productData = await page.locator('.product').evaluateAll((elements) =>
    elements.map((el) => ({
      name: el.querySelector('.name')?.textContent || '',
      price: parseFloat(el.querySelector('.price')?.textContent || '0')
    }))
  );

  expectly(productData).toHaveObjectsInAscendingOrderBy('price');

  // Test price sorting (high to low)
  await page.selectOption('#sort', 'price-desc');
  await page.waitForLoadState('networkidle');

  const productDataDesc = await page.locator('.product').evaluateAll((elements) =>
    elements.map((el) => ({
      name: el.querySelector('.name')?.textContent || '',
      price: parseFloat(el.querySelector('.price')?.textContent || '0')
    }))
  );

  expectly(productDataDesc).toHaveObjectsInDescendingOrderBy('price');
});
```

### Timeline Validation

```typescript
test('validate event timeline', async () => {
  const events = await api.getEvents();

  // Events should be in chronological order
  expectly(events).toHaveObjectsInAscendingOrderBy('timestamp');

  // Each event should be unique
  expectly(events).toHaveOnlyUniqueObjects();
});
```

### Search Results Ranking

```typescript
test('validate search results relevance', async () => {
  const searchResults = await api.search('playwright');

  // Results should be sorted by relevance score
  expectly(searchResults).toHaveObjectsInDescendingOrderBy('relevanceScore');

  // No duplicate results
  expectly(searchResults).toHaveOnlyUniqueObjects();
});
```

## Property Validation

The sorting matchers perform comprehensive validation:

### Type Checking

```typescript
const mixed = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: '25' }, // String instead of number
];

expectly(mixed).toHaveObjectsInAscendingOrderBy('age');
// Error: Type mismatch at indices 0 and 1: number vs string
```

### Missing Properties

```typescript
const incomplete = [
  { name: 'Alice', age: 30 },
  { name: 'Bob' }, // Missing 'age' property
];

expectly(incomplete).toHaveObjectsInAscendingOrderBy('age');
// Error: Property "age" not found on object at index 1
```

### Null/Undefined Values

```typescript
const withNull = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: null },
];

expectly(withNull).toHaveObjectsInAscendingOrderBy('age');
// Error: Property "age" is null at index 1
```

## Complex Object Structures

### Nested Properties

For nested property access, you'll need to extract the value first:

```typescript
const users = [
  { profile: { name: 'Alice', level: 5 } },
  { profile: { name: 'Bob', level: 8 } }
];

// Extract nested property
const levels = users.map(u => ({ level: u.profile.level }));
expectly(levels).toHaveObjectsInAscendingOrderBy('level');
```

### Multiple Sort Keys

For multi-level sorting, validate each level:

```typescript
const data = [
  { category: 'A', priority: 1 },
  { category: 'A', priority: 2 },
  { category: 'B', priority: 1 }
];

// Group and validate each category
const categoryA = data.filter(d => d.category === 'A');
expectly(categoryA).toHaveObjectsInAscendingOrderBy('priority');
```

## Performance Considerations

### Large Arrays

The uniqueness matcher uses memoization for performance with large arrays:

```typescript
// Efficient even with thousands of objects
const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  value: Math.random()
}));

expectly(largeDataset).toHaveOnlyUniqueObjects(); // Fast
```

### Circular References

Circular references are handled gracefully:

```typescript
const obj1: any = { id: 1, name: 'Alice' };
const obj2: any = { id: 2, name: 'Bob' };
obj1.friend = obj2;
obj2.friend = obj1;

const users = [obj1, obj2];
expectly(users).toHaveOnlyUniqueObjects(); // Works correctly
```

## Error Messages

Clear, descriptive error messages help identify issues quickly:

```typescript
const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 35 }
];

expectly(users).toHaveObjectsInAscendingOrderBy('age');
// Error: Expected array to be sorted in ascending order by property "age"
// Found out of order at indices 0 and 1: 30 > 25
```

## Related

- [Number Array Matchers](./NUMBER_ARRAY_MATCHERS.md) - For number array validation
- [String Array Matchers](./STRING_ARRAY_MATCHERS.md) - For string array validation
- [Generic Matchers](./GENERIC_MATCHERS.md) - For type and structure validation

[← Back to README](../README.md)
