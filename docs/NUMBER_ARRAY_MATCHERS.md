# Number Array Matchers

Statistical and sorting matchers for arrays of numbers.

## Available Matchers

- [toHaveAscendingOrder()](#tohaveascendingorder)
- [toHaveDescendingOrder()](#tohavedescendingorder)
- [toHaveSum()](#tohavesum)
- [toHaveAverage()](#tohaveaverage)
- [toHaveMedian()](#tohavemedian)
- [toHaveMin() / toHaveMax()](#tohavemin--tohavemax)
- [toHaveRange()](#tohaverange)
- [toBeAllBetween()](#tobeallbetween)
- [toBeAllPositive() / toBeAllNegative()](#tobeallpositive--tobeallnegative)
- [toBeAllIntegers()](#tobeallintegers)
- [toBeAllGreaterThan() / toBeAllLessThan()](#tobeallgreaterthan--tobealllessthan)
- [toHaveStrictlyAscendingOrder()](#tohavestrictlyascendingorder)
- [toHaveStrictlyDescendingOrder()](#tohavestrictlydescendingorder)
- [toBeMonotonic()](#tobemonotonic)
- [toHaveUniqueValues()](#tohaveuniquevalues)
- [toHaveConsecutiveIntegers()](#tohaveconsecutiveintegers)

## toHaveAscendingOrder()

Asserts that an array of numbers is sorted from smallest to largest.

```typescript
import { expectly } from '@cerios/playwright-expectly';

// Validate sorted prices
const prices = [9.99, 19.99, 29.99, 49.99];
expectly(prices).toHaveAscendingOrder();

// Check numeric scores
const scores = [85, 90, 92, 95];
expectly(scores).toHaveAscendingOrder();
```

## toHaveDescendingOrder()

Asserts that an array of numbers is sorted from largest to smallest.

```typescript
// Validate ranked scores
const rankings = [100, 95, 87, 75, 60];
expectly(rankings).toHaveDescendingOrder();

// Check leaderboard
expectly(leaderboardScores).toHaveDescendingOrder();
```

## toHaveSum()

Asserts that an array of numbers sums to the expected value.

```typescript
// Validate cart total
const itemPrices = [10.99, 5.50, 15.00];
expectly(itemPrices).toHaveSum(31.49);

// Check vote count
expectly([45, 32, 23]).toHaveSum(100);
```

## toHaveAverage()

Asserts that an array has the expected average (mean).

```typescript
// Validate test scores average
const scores = [85, 90, 95, 80];
expectly(scores).toHaveAverage(87.5);

// Check rating average
expectly(ratings).toHaveAverage(4.5);
```

## toHaveMedian()

Asserts that an array has the expected median (middle value).

```typescript
// Validate median salary
const salaries = [50000, 60000, 70000, 80000, 90000];
expectly(salaries).toHaveMedian(70000);

// Check median response time
expectly(responseTimes).toHaveMedian(250);
```

## toHaveMin() / toHaveMax()

Asserts that an array's minimum or maximum value equals the expected number.

```typescript
// Validate lowest price
const prices = [19.99, 9.99, 29.99, 15.00];
expectly(prices).toHaveMin(9.99);

// Check minimum temperature
expectly(temperatures).toHaveMin(-5);

// Validate highest score
const scores = [78, 92, 85, 95, 88];
expectly(scores).toHaveMax(95);
```

## toHaveRange()

Asserts that an array's range (max - min) equals the expected number.

```typescript
// Validate data spread
const values = [10, 15, 20, 25, 30];
expectly(values).toHaveRange(20); // 30 - 10 = 20

// Check temperature variation
expectly(dailyTemps).toHaveRange(15);
```

## toBeAllBetween()

Asserts that all numbers fall within the specified range (inclusive).

```typescript
// Validate percentages
const percentages = [45, 67, 89, 92, 78];
expectly(percentages).toBeAllBetween(0, 100);

// Check scores within range
expectly(testScores).toBeAllBetween(60, 100);
```

## toBeAllPositive() / toBeAllNegative()

Asserts that all numbers are positive (> 0) or negative (< 0).

```typescript
// Validate positive values
const prices = [10.99, 5.50, 15.00];
expectly(prices).toBeAllPositive();

// Check counts
expectly(userCounts).toBeAllPositive();

// Validate negative adjustments
const adjustments = [-5, -10, -3.50];
expectly(adjustments).toBeAllNegative();
```

## toBeAllIntegers()

Asserts that all numbers are integers (whole numbers).

```typescript
// Validate item counts
const quantities = [1, 5, 10, 3];
expectly(quantities).toBeAllIntegers();

// Check whole numbers
expectly(votes).toBeAllIntegers();
```

## toBeAllGreaterThan() / toBeAllLessThan()

Asserts that all numbers are greater than or less than a threshold.

```typescript
// Validate minimum threshold
const scores = [75, 82, 91, 88];
expectly(scores).toBeAllGreaterThan(70);

// Check above baseline
expectly(measurements).toBeAllGreaterThan(0);

// Validate maximum limit
const responseTimes = [150, 200, 180, 220];
expectly(responseTimes).toBeAllLessThan(250);
```

## toHaveStrictlyAscendingOrder()

Asserts that numbers are in strictly ascending order (each element > previous).

```typescript
// Validate increasing values
const growth = [10, 20, 35, 50];
expectly(growth).toHaveStrictlyAscendingOrder();

// This would fail (has equal consecutive values)
expectly([1, 2, 2, 3]).not.toHaveStrictlyAscendingOrder();
```

## toHaveStrictlyDescendingOrder()

Asserts that numbers are in strictly descending order (each element < previous).

```typescript
// Validate decreasing values
const decline = [100, 75, 50, 25];
expectly(decline).toHaveStrictlyDescendingOrder();

// This would fail (has equal consecutive values)
expectly([5, 4, 4, 3]).not.toHaveStrictlyDescendingOrder();
```

## toBeMonotonic()

Asserts that an array is monotonic (consistently ascending or descending).

```typescript
// Valid monotonic arrays
expectly([1, 2, 2, 3, 4]).toBeMonotonic(); // Ascending
expectly([5, 4, 3, 3, 1]).toBeMonotonic(); // Descending
expectly([2, 2, 2, 2]).toBeMonotonic(); // Flat

// Not monotonic (changes direction)
expectly([1, 3, 2, 4]).not.toBeMonotonic();
```

## toHaveUniqueValues()

Asserts that all numbers are unique (no duplicates).

```typescript
// Validate unique IDs
const userIds = [101, 202, 303, 404];
expectly(userIds).toHaveUniqueValues();

// Check for duplicates
expectly([1, 2, 2, 3]).not.toHaveUniqueValues();
```

## toHaveConsecutiveIntegers()

Asserts that an array contains consecutive integers.

```typescript
// Validate sequential IDs
const pageNumbers = [1, 2, 3, 4, 5];
expectly(pageNumbers).toHaveConsecutiveIntegers();

// Order doesn't matter
expectly([5, 3, 4, 2, 1]).toHaveConsecutiveIntegers();

// This would fail (missing 3)
expectly([1, 2, 4, 5]).not.toHaveConsecutiveIntegers();
```

## Common Use Cases

### Statistical Validation

```typescript
test('validate dataset statistics', async () => {
  const scores = [85, 90, 92, 95, 88];

  expectly(scores).toHaveAverage(90);
  expectly(scores).toHaveMedian(90);
  expectly(scores).toHaveMin(85);
  expectly(scores).toHaveMax(95);
  expectly(scores).toHaveRange(10);
});
```

### Data Quality Checks

```typescript
test('validate data quality', async () => {
  const measurements = [10.5, 12.3, 11.8, 13.2];

  expectly(measurements).toBeAllPositive();
  expectly(measurements).toBeAllBetween(10, 15);
  expectly(measurements).toHaveUniqueValues();
});
```

### Sorting Verification

```typescript
test('validate sorted results', async () => {
  const sortedPrices = [9.99, 19.99, 29.99, 49.99];

  expectly(sortedPrices).toHaveAscendingOrder();
  expectly(sortedPrices).toBeMonotonic();
  expectly(sortedPrices).toHaveStrictlyAscendingOrder();
});
```

## Related

- [String Array Matchers](./STRING_ARRAY_MATCHERS.md) - For string array validation
- [Object Array Matchers](./OBJECT_ARRAY_MATCHERS.md) - For object array validation
- [Generic Matchers](./GENERIC_MATCHERS.md) - For type validation

[← Back to README](../README.md)
