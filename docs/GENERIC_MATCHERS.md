# Generic Matchers

Type checking and partial matching matchers that work with any data type.

## Available Matchers

- [toBeAnyOf()](#tobeanyof)
- [toBeNullish()](#tobenullish)
- [toBeInteger() / toBeFloat()](#tobeinteger--tobefloat)
- [toBePrimitive()](#tobeprimitive)
- [toBeArray() / toBeObject()](#tobearray--tobeobject)
- [toEqualPartially()](#toequalpartially)

## toBeAnyOf()

Asserts that the received value matches at least one of the provided possibilities.

```typescript
import { expectly } from '@cerios/playwright-expectly';

// Primitive values
expectly(status).toBeAnyOf(200, 201, 204);
expectly(color).toBeAnyOf('red', 'green', 'blue');

// Objects
expectly(response).toBeAnyOf(
  { status: 'success', code: 200 },
  { status: 'created', code: 201 }
);

// Mixed types
expectly(value).toBeAnyOf(null, undefined, 0, '');

// Real-world example
test('validate HTTP status codes', async () => {
  const response = await api.createUser(userData);
  expectly(response.status).toBeAnyOf(200, 201); // Success or Created
});
```

## toBeNullish()

Asserts that the received value is either `null` or `undefined`.

```typescript
// Testing optional values
expectly(user.middleName).toBeNullish();
expectly(response.data).not.toBeNullish();

// API response validation
const config = await api.getConfig();
expectly(config.optionalField).toBeNullish();

// Form validation
test('validate optional fields', async ({ page }) => {
  await page.locator('#phone').fill('');
  const phoneValue = await page.locator('#phone').inputValue();
  expectly(phoneValue || null).toBeNullish();
});
```

## toBeInteger() / toBeFloat()

Asserts that the received value is an integer or floating-point number.

```typescript
// Valid integers
expectly(42).toBeInteger();
expectly(0).toBeInteger();
expectly(-100).toBeInteger();

// Testing API responses
const userCount = await page.locator('.user-count').textContent();
expectly(Number(userCount)).toBeInteger();

// Negative assertions
expectly(3.14).not.toBeInteger();
expectly('42').not.toBeInteger();

// Valid floats
expectly(3.14).toBeFloat();
expectly(0.5).toBeFloat();
expectly(-2.718).toBeFloat();

// Testing calculations
const price = 19.99;
const tax = price * 0.08;
expectly(tax).toBeFloat();

// Not floats
expectly(42).not.toBeFloat(); // Integer
expectly(NaN).not.toBeFloat(); // NaN
expectly(Infinity).not.toBeFloat(); // Infinity
```

## toBePrimitive()

Asserts that the received value is a primitive type.

Primitive types in JavaScript: `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`.

```typescript
// Valid primitives
expectly('hello').toBePrimitive();
expectly(123).toBePrimitive();
expectly(true).toBePrimitive();
expectly(null).toBePrimitive();
expectly(undefined).toBePrimitive();
expectly(BigInt(9007199254740991)).toBePrimitive();
expectly(Symbol('key')).toBePrimitive();

// Not primitives
expectly({}).not.toBePrimitive();
expectly([]).not.toBePrimitive();
expectly(new Date()).not.toBePrimitive();

// Testing API responses
const apiValue = response.data.value;
expectly(apiValue).toBePrimitive();
```

## toBeArray() / toBeObject()

Type checking for arrays and objects.

```typescript
// Valid arrays
expectly([]).toBeArray();
expectly([1, 2, 3]).toBeArray();
expectly(['a', 'b', 'c']).toBeArray();

// Testing API responses
const users = await api.getUsers();
expectly(users).toBeArray();

// Testing page data
const items = await page.locator('.item').allTextContents();
expectly(items).toBeArray();

// Not arrays
expectly('not array').not.toBeArray();
expectly({ length: 3 }).not.toBeArray();

// Valid objects
expectly({}).toBeObject();
expectly({ name: 'John', age: 30 }).toBeObject();
expectly(new Date()).toBeObject();

// Testing API responses
const user = await api.getUser(123);
expectly(user).toBeObject();
expectly(user.profile).toBeObject();

// Not objects
expectly([]).not.toBeObject(); // Arrays are excluded
expectly(null).not.toBeObject(); // Null is excluded
expectly('string').not.toBeObject();
```

## toEqualPartially()

Asserts that an object partially matches the expected structure.

This matcher extracts only the fields specified in the expected structure and compares them:
- **Objects**: Only checks properties present in expected (extra properties ignored)
- **Arrays**: Finds matching items regardless of position or extra items
- **Nested structures**: Applies partial matching recursively

### Asymmetric Matcher Compatibility

`toEqualPartially()` **automatically** provides the functionality of Playwright's asymmetric matchers:
- No need for `expect.objectContaining()` - it handles objects with extra properties automatically
- No need for `expect.arrayContaining()` - it finds matching items in arrays automatically
- **Fully supports** using `expect.any()`, `expect.stringContaining()`, `expect.stringMatching()`, `expect.objectContaining()`, and `expect.arrayContaining()` within your expected values for additional flexibility

```typescript
// Instead of verbose asymmetric matchers:
expect(response).toEqual(
  expect.objectContaining({
    status: 'success',
    data: expect.objectContaining({
      user: expect.objectContaining({
        name: 'Alice'
      })
    })
  })
);

// Just use toEqualPartially - it's automatic:
expectly(response).toEqualPartially({
  status: 'success',
  data: {
    user: {
      name: 'Alice'
    }
  }
});
```

### Basic Examples

```typescript
// Match object with extra properties
const user = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' };
expectly(user).toEqualPartially({ name: 'Alice', role: 'admin' });

// Match array with extra items and any order
const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
];
expectly(items).toEqualPartially([
  { id: 2, name: 'Item 2' }
]); // Passes even though array has more items

// Nested partial matching
const data = {
  user: { id: 1, name: 'Test', email: 'test@example.com' },
  items: [{ id: 1 }, { id: 2 }, { id: 3 }],
  metadata: { count: 10, page: 1 }
};
expectly(data).toEqualPartially({
  user: { name: 'Test' },
  items: [{ id: 2 }]
});

// API response validation
test('validate API response structure', async () => {
  const response = await api.getUser(123);

  // Only check fields we care about
  expectly(response).toEqualPartially({
    status: 'success',
    data: {
      user: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    }
  });
  // Response can have additional fields like timestamp, metadata, etc.
});
```

### Using with Asymmetric Matchers

You can combine `toEqualPartially()` with Playwright's asymmetric matchers for additional flexibility:

```typescript
// Combine with expect.any() for type checking
expectly(response).toEqualPartially({
  id: expect.any(Number),
  name: expect.any(String),
  createdAt: expect.any(Date)
});

// Use expect.stringContaining() and expect.stringMatching()
expectly(data).toEqualPartially({
  message: expect.stringContaining('success'),
  url: expect.stringMatching(/^https:\/\//)
});

// You can even use expect.objectContaining() and expect.arrayContaining()
// within toEqualPartially() for more control
expectly(response).toEqualPartially({
  address: expect.objectContaining({
    city: expect.stringContaining('Wonder')
  }),
  tags: expect.arrayContaining(['playwright', 'typescript'])
});

// Complex nested example
expectly(apiResponse).toEqualPartially({
  users: [
    {
      id: expect.any(Number),
      email: expect.stringMatching(/@example\.com$/),
      profile: expect.objectContaining({
        age: expect.any(Number)
      })
    }
  ],
  meta: {
    timestamp: expect.any(String)
  }
});
```

## Common Use Cases

### API Response Validation

```typescript
test('validate API response types', async () => {
  const response = await api.createOrder(orderData);

  // Check types
  expectly(response).toBeObject();
  expectly(response.id).toBeInteger();
  expectly(response.total).toBeFloat();
  expectly(response.items).toBeArray();

  // Check values
  expectly(response.status).toBeAnyOf('pending', 'confirmed');

  // Partial matching
  expectly(response).toEqualPartially({
    status: 'confirmed',
    items: [
      { productId: 123, quantity: 2 }
    ]
  });
});
```

### Form Validation

```typescript
test('validate form field types', async ({ page }) => {
  await page.goto('/register');

  // Check form structure
  const formData = await page.evaluate(() => ({
    email: document.querySelector('#email')?.value,
    age: document.querySelector('#age')?.value,
    newsletter: document.querySelector('#newsletter')?.checked
  }));

  expectly(formData).toBeObject();
  expectly(formData.email).toBePrimitive();
  expectly(formData.newsletter).toBePrimitive();
});
```

### Data Type Assertions

```typescript
test('validate data types in dataset', async () => {
  const data = await api.getData();

  // Ensure proper types
  for (const item of data) {
    expectly(item).toBeObject();
    expectly(item.id).toBeInteger();
    expectly(item.price).toBeFloat();
    expectly(item.tags).toBeArray();
    expectly(item.description).not.toBeNullish();
  }
});
```

### Configuration Validation

```typescript
test('validate configuration structure', async () => {
  const config = await loadConfig();

  // Partial validation (ignore extra fields)
  expectly(config).toEqualPartially({
    api: {
      baseUrl: 'https://api.example.com',
      timeout: 5000
    },
    features: {
      enabled: true
    }
  });

  // Type checks
  expectly(config.api.timeout).toBeInteger();
  expectly(config.features.enabled).toBePrimitive();
});
```

### Flexible API Testing

```typescript
test('validate API with flexible response', async () => {
  const response = await api.search('test');

  // Response structure may vary, but certain fields must exist
  expectly(response).toEqualPartially({
    results: [],
    meta: {
      total: expect.any(Number)
    }
  });

  // Results can be empty or have items
  expectly(response.results).toBeArray();

  if (response.results.length > 0) {
    expectly(response.results[0]).toEqualPartially({
      id: expect.any(Number),
      title: expect.any(String)
    });
  }
});
```

### Polymorphic Data Validation

```typescript
test('validate polymorphic responses', async () => {
  const notification = await api.getNotification(123);

  // Type could be 'email', 'sms', or 'push'
  expectly(notification.type).toBeAnyOf('email', 'sms', 'push');

  // All types have these fields
  expectly(notification).toEqualPartially({
    id: expect.any(Number),
    timestamp: expect.any(String),
    read: false
  });

  // Type-specific validation
  if (notification.type === 'email') {
    expectly(notification).toEqualPartially({
      subject: expect.any(String),
      from: expect.any(String)
    });
  }
});
```

### Pagination Response

```typescript
test('validate paginated response', async () => {
  const page1 = await api.getUsers({ page: 1 });

  // Basic structure
  expectly(page1).toEqualPartially({
    data: [],
    meta: {
      currentPage: 1,
      totalPages: expect.any(Number)
    }
  });

  // Type checks
  expectly(page1.data).toBeArray();
  expectly(page1.meta.currentPage).toBeInteger();
  expectly(page1.meta.totalPages).toBeInteger();

  // Next/Previous can be null or strings
  if (page1.meta.nextPage !== null) {
    expectly(page1.meta.nextPage).toBePrimitive();
  }
});
```

### Error Response Handling

```typescript
test('validate error response format', async () => {
  try {
    await api.getUser(999999); // Non-existent user
  } catch (error: any) {
    // Error could have various shapes
    expectly(error.status).toBeAnyOf(404, 400);

    // But should have certain fields
    expectly(error).toEqualPartially({
      error: {
        message: expect.any(String)
      }
    });

    // Message should be primitive
    expectly(error.error.message).toBePrimitive();
  }
});
```

## Advantages of Partial Matching

### 1. **Flexible Testing**
Test only what matters, ignore implementation details:

```typescript
// Instead of brittle full matching
expectly(response).toEqual({
  id: 1,
  name: 'Test',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
  version: 1,
  metadata: { ... } // Lots of fields
});

// Flexible partial matching
expectly(response).toEqualPartially({
  id: 1,
  name: 'Test'
});
```

### 2. **Backward Compatible**
Tests don't break when new fields are added:

```typescript
// Works even when API adds new fields
expectly(apiResponse).toEqualPartially({
  status: 'success',
  data: { id: 123 }
});
// Still passes when 'timestamp', 'version', etc. are added
```

### 3. **Array Item Matching**
Find items in arrays without caring about order:

```typescript
const users = [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'user' }
];

// Find Bob, ignore others
expectly(users).toEqualPartially([
  { name: 'Bob' }
]);
```

## Related

- [String Matchers](./STRING_MATCHERS.md) - For string validation
- [Number Array Matchers](./NUMBER_ARRAY_MATCHERS.md) - For number arrays
- [Object Array Matchers](./OBJECT_ARRAY_MATCHERS.md) - For object arrays

[← Back to README](../README.md)
