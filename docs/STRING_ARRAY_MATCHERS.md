# String Array Matchers

Matchers for validating arrays of strings, including sorting and uniqueness checks.

These matchers require an array of strings. Any other value throws a `TypeError` that names the received type, such as `toHaveAscendingOrder: received value must be a string array, got: array of string | number`.

## Available Matchers

- [toHaveAscendingOrder()](#tohaveascendingorder)
- [toHaveDescendingOrder()](#tohavedescendingorder)
- [toHaveStrictlyAscendingOrder()](#tohavestrictlyascendingorder)
- [toHaveStrictlyDescendingOrder()](#tohavestrictlydescendingorder)
- [toBeMonotonic()](#tobemonotonic)
- [toHaveUniqueValues()](#tohaveuniquevalues)

## Order Options

The ordering matchers (`toHaveAscendingOrder()`, `toHaveDescendingOrder()`, `toHaveStrictlyAscendingOrder()`, `toHaveStrictlyDescendingOrder()` and `toBeMonotonic()`) accept an options object:

| Option    | Default | Description                                                                              |
| --------- | ------- | ---------------------------------------------------------------------------------------- |
| `numeric` | `false` | Compare digit sequences by numeric value, so `"2"` sorts before `"10"` (natural order)   |
| `locale`  | -       | Compare with the rules of a locale (an `Intl.Collator` locale), such as `"de"` or `"sv"` |

Without `numeric` or `locale`, strings are compared by UTF-16 code units: uppercase sorts before lowercase, and `"10"` before `"2"`.

```typescript
// Natural order
expectly(["Item 1", "Item 2", "Item 10"]).not.toHaveAscendingOrder();
expectly(["Item 1", "Item 2", "Item 10"]).toHaveAscendingOrder({ numeric: true });

// Locale-aware order
expectly(["Änne", "Österreich", "Zebra"]).toHaveAscendingOrder({ locale: "de" });
expectly(["Zebra", "Änne", "Österreich"]).toHaveAscendingOrder({ locale: "sv" });

// Both
expectly(["Datei 2", "Datei 10", "Übersicht"]).toHaveStrictlyAscendingOrder({ numeric: true, locale: "de" });
```

### With the combined `expectly`

`toHaveAscendingOrder()`, `toHaveDescendingOrder()`, `toHaveStrictlyAscendingOrder()`, `toHaveStrictlyDescendingOrder()`, `toBeMonotonic()` and `toHaveUniqueValues()` exist for both number and string arrays. The combined `expectly` (and `expect` extended with `expectlyMatchers`) picks the implementation by element type: an array of numbers uses the [number array matchers](./NUMBER_ARRAY_MATCHERS.md), so numbers are compared and printed as numbers, and any other array uses the string array matchers. The string options have no effect on number arrays.

```typescript
expectly([2, 10, 100]).toHaveAscendingOrder(); // Numeric comparison
expectly(["2", "10", "100"]).not.toHaveAscendingOrder(); // Code-unit comparison
expectly(["2", "10", "100"]).toHaveAscendingOrder({ numeric: true });
```

## toHaveAscendingOrder()

Asserts that an array of strings is in ascending order (alphabetically A-Z).

```typescript
import { expectly } from "@cerios/playwright-expectly";

// Validate sorted names
const names = ["Alice", "Bob", "Charlie", "David"];
expectly(names).toHaveAscendingOrder();

// Check sorted categories from API
const categories = await page.locator(".category").allTextContents();
expectly(categories).toHaveAscendingOrder();

// Case-sensitive sorting
const items = ["Apple", "Banana", "apple", "banana"];
expectly(items).toHaveAscendingOrder(); // Uppercase comes first

// Natural order for numbered items
expectly(["Chapter 2", "Chapter 10"]).toHaveAscendingOrder({ numeric: true });
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
const menuItems = await page.locator(".menu-item").allTextContents();
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
const priorities = ["P3", "P2", "P1"];
expectly(priorities).toHaveStrictlyDescendingOrder();

// This would fail (has equal consecutive values)
expectly(["z", "y", "y", "x"]).not.toHaveStrictlyDescendingOrder();

// All values must be different
const versions = ["v10", "v9", "v2"];
expectly(versions).toHaveStrictlyDescendingOrder({ numeric: true });
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
const tags = await page.locator(".tag").allTextContents();
expectly(tags).toHaveUniqueValues();
```

## Common Use Cases

### Navigation Menu Validation

```typescript
test("validate menu items are sorted", async ({ page }) => {
	await page.goto("/");

	const menuItems = await page.locator(".nav-menu a").allTextContents();

	expectly(menuItems).toHaveAscendingOrder();
	expectly(menuItems).toHaveUniqueValues();
});
```

### Category/Tag Validation

```typescript
test("validate category sorting", async ({ page }) => {
	await page.goto("/products");

	const categories = await page.locator(".category").allTextContents();

	// Categories should be alphabetically sorted
	expectly(categories).toHaveAscendingOrder();

	// No duplicate categories
	expectly(categories).toHaveUniqueValues();
});
```

### Dropdown Options

```typescript
test("validate dropdown options", async ({ page }) => {
	await page.goto("/settings");

	const options = await page.locator("select.language option").allTextContents();

	// Options should be sorted
	expectly(options).toHaveAscendingOrder();

	// All options should be unique
	expectly(options).toHaveUniqueValues();
});
```

### Search Results

```typescript
test("validate search results alphabetically", async ({ page }) => {
	await page.goto("/search?q=test&sort=alpha");

	const results = await page.locator(".result-title").allTextContents();

	expectly(results).toHaveAscendingOrder();
});
```

### File Listing

```typescript
test("validate file list sorting", async ({ page }) => {
	await page.goto("/files");
	await page.locator("th.filename").click(); // Sort by filename

	const filenames = await page.locator(".filename").allTextContents();

	// Should be sorted alphabetically
	expectly(filenames).toHaveAscendingOrder();
	expectly(filenames).toBeMonotonic();
});
```

### API Response Validation

```typescript
test("validate API returns sorted data", async () => {
	const response = await api.getUsers({ sort: "name" });
	const names = response.users.map((u) => u.name);

	expectly(names).toHaveAscendingOrder();
	expectly(names).toHaveUniqueValues();
});
```

### Priority Queue

```typescript
test("validate priority ordering", async () => {
	const tasks = await api.getTasks();
	const priorities = tasks.map((t) => t.priority);

	// Priorities should be monotonic (all ascending or all descending)
	expectly(priorities).toBeMonotonic();
});
```

### Version Numbers

```typescript
test("validate version progression", async () => {
	const versions = await api.getReleases();
	const versionNumbers = versions.map((v) => v.version);

	// Versions should increase ("1.9.0" before "1.10.0")
	expectly(versionNumbers).toHaveStrictlyAscendingOrder({ numeric: true });
});
```

## Case Sensitivity

By default, string comparison is case-sensitive. Uppercase letters come before lowercase in code-unit order:

```typescript
// This will pass (uppercase comes first)
expectly(["Apple", "Banana", "apple"]).toHaveAscendingOrder();

// This will fail
expectly(["apple", "Apple", "Banana"]).not.toHaveAscendingOrder();

// Dictionary order with a locale
expectly(["apple", "Apple", "Banana"]).toHaveAscendingOrder({ locale: "en" });

// Or normalize case first
const items = ["apple", "Apple", "Banana"];
const normalized = items.map((s) => s.toLowerCase()).sort();
expectly(normalized).toHaveAscendingOrder();
```

## Whitespace Handling

Whitespace is significant in string comparisons:

```typescript
// These are different strings
expectly(["a", "a "]).toHaveUniqueValues();

// Trim whitespace if needed
const values = ["  a  ", "  b  ", "  c  "];
const trimmed = values.map((s) => s.trim());
expectly(trimmed).toHaveAscendingOrder();
```

## Locale-Specific Sorting

Pass `locale` to compare with the rules of a language, for example for accented letters:

```typescript
test("validate locale-specific sorting", async ({ page }) => {
	const names = await page.locator(".customer-name").allTextContents();

	// German: "Ä" sorts with "A", "Ö" with "O"
	expectly(names).toHaveAscendingOrder({ locale: "de" });
});
```

To retry until a list on the page is sorted, use [`toHaveTextsInAscendingOrder()`](./LOCATOR_MATCHERS.md#tohavetextsinascendingorder--tohavetextsindescendingorder) on the locator instead of reading the texts once.

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
expectly(largeArray).toHaveAscendingOrder({ numeric: true }); // Fast ("item9" before "item10")
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
