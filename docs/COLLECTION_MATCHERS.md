# Collection and Function Matchers

Matchers for array members, object keys and entries, promises and thrown errors, known from [jest-extended](https://jest-extended.jestcommunity.dev/).

## Module Organization

- **Collection Matchers** (`expectlyCollection`) - Array predicates and members, object keys and entries
- **Function Matchers** (`expectlyFunction`) - Promise settlement and thrown errors

```typescript
// Option 1: Use the unified expectly interface (recommended)
import { expectly } from "@cerios/playwright-expectly";
expectly(["b", "a"]).toIncludeSameMembers(["a", "b"]);

// Option 2: Use granular imports
import { expectlyCollection, expectlyFunction } from "@cerios/playwright-expectly";
expectlyCollection({ id: 1 }).toContainKey("id");
await expectlyFunction(fetchHealth()).toResolve();
```

Members and values are compared with `toEqual` semantics, so asymmetric matchers such as `expect.any(Number)` work inside them.

## Available Matchers

### Collection Matchers (`expectlyCollection`)

- [toSatisfyAll() / toSatisfyAny()](#tosatisfyall--tosatisfyany)
- [toIncludeSameMembers()](#toincludesamemembers)
- [toIncludeAllMembers() / toIncludeAnyMembers()](#toincludeallmembers--toincludeanymembers)
- [toContainKey() / toContainKeys()](#tocontainkey--tocontainkeys)
- [toContainAllKeys()](#tocontainallkeys)
- [toContainEntry() / toContainEntries()](#tocontainentry--tocontainentries)
- [toBeEmptyObject()](#tobeemptyobject)

### Function Matchers (`expectlyFunction`)

- [toResolve() / toReject()](#toresolve--toreject)
- [toThrowWithMessage()](#tothrowwithmessage)

## toSatisfyAll() / toSatisfyAny()

Asserts that every element (`toSatisfyAll()`) or at least one element (`toSatisfyAny()`) of an array satisfies a predicate. The predicate receives the element and its index; a truthy result counts as satisfied.

An empty array satisfies `toSatisfyAll()` and never satisfies `toSatisfyAny()`. A failure lists the failing indexes and values.

```typescript
import { expectly } from "@cerios/playwright-expectly";

// Every user is active
expectly(users).toSatisfyAll((user) => user.active);

// Every price is positive and has at most two decimals
expectly(prices).toSatisfyAll((price) => price > 0 && Number.isInteger(price * 100));

// Use the index
expectly(rows).toSatisfyAll((row, index) => row.position === index + 1);

// At least one admin
expectly(roles).toSatisfyAny((role) => role.name === "admin");

// No element is satisfied
expectly([1, 3, 5]).not.toSatisfyAny((n) => n % 2 === 0);
```

For a single value, use [`toSatisfy()`](./GENERIC_MATCHERS.md#tosatisfy).

## toIncludeSameMembers()

Asserts that an array has exactly the same members as `expected`, in any order. Duplicates must appear the same number of times. A failure lists the missing and unexpected members.

```typescript
// Order does not matter
expectly(["b", "a", "c"]).toIncludeSameMembers(["a", "b", "c"]);

// Objects are compared by value
expectly([{ id: 2 }, { id: 1 }]).toIncludeSameMembers([{ id: 1 }, { id: 2 }]);

// Duplicates count
expectly(["a", "a", "b"]).not.toIncludeSameMembers(["a", "b", "b"]);

// Asymmetric matchers
expectly([{ id: 1, name: "Ada" }]).toIncludeSameMembers([{ id: expect.any(Number), name: "Ada" }]);
```

## toIncludeAllMembers() / toIncludeAnyMembers()

`toIncludeAllMembers()` asserts that an array includes all of the given members, in any order; it may contain others. Each expected member needs its own match, so a member listed twice must appear twice. `toIncludeAnyMembers()` asserts that at least one of the given members is included.

```typescript
// All required permissions, possibly more
expectly(permissions).toIncludeAllMembers(["read", "write"]);

// At least one failure status
expectly(statuses).toIncludeAnyMembers(["failed", "error"]);

// None of them
expectly(["queued", "running"]).not.toIncludeAnyMembers(["failed", "error"]);
```

The receiver and the expected value of the member matchers must be arrays; anything else throws a `TypeError`.

## toContainKey() / toContainKeys()

`toContainKey()` asserts that an object has an own key (string, number or symbol). `toContainKeys()` asserts that it has all of the given own keys; it may have others. Inherited keys do not count.

```typescript
// Single key
expectly(response).toContainKey("id");

// Several keys
expectly(user).toContainKeys(["id", "email"]);

// Inherited members are not own keys
expectly({ id: 1 }).not.toContainKey("toString");

// Symbol keys
const VERSION = Symbol("version");
expectly({ [VERSION]: 2 }).toContainKey(VERSION);
```

## toContainAllKeys()

Asserts that an object has exactly the given own enumerable keys (string and symbol keys), in any order. A failure lists missing and unexpected keys. Numbers name their string keys, so `toContainAllKeys([1])` matches `{ 1: "a" }`, as `toContainKey(1)` does.

```typescript
// Exactly these fields
expectly(payload).toContainAllKeys(["id", "name", "createdAt"]);

// An extra or missing field fails
expectly({ id: 1, name: "Ada", debug: true }).not.toContainAllKeys(["id", "name"]);
```

## toContainEntry() / toContainEntries()

Asserts that an object has an own entry (`[key, value]`) with an equal value, or all of the given entries. Values are compared with `toEqual` semantics.

```typescript
// Single entry
expectly(config).toContainEntry(["mode", "production"]);

// Several entries
expectly(user).toContainEntries([
	["role", "admin"],
	["active", true],
]);

// Nested values and asymmetric matchers
expectly(order).toContainEntry(["customer", { id: expect.any(Number), country: "NL" }]);
```

`toContainEntry()` throws a `TypeError` when the entry is not a `[key, value]` pair.

## toBeEmptyObject()

Asserts that the received value is an object (not an array) without own enumerable keys. Arrays, `null` and primitives fail. A `Map` or `Set` must also have no entries.

```typescript
// No validation errors
expectly(response.errors).toBeEmptyObject();

// Not empty
expectly({ id: 1 }).not.toBeEmptyObject();

// Not an object
expectly([]).not.toBeEmptyObject();
expectly(null).not.toBeEmptyObject();
```

The key and entry matchers (`toContainKey()` to `toContainEntries()`) require an object receiver and throw a `TypeError` for arrays, `null` and primitives, such as `toContainKey: received value must be an object, got: array`.

## toResolve() / toReject()

Asserts that a promise resolves or rejects. The receiver is a promise, or a function returning one, which is called during the assertion. A function that throws synchronously counts as a rejection. Anything else throws a `TypeError`.

Both matchers always return a promise, so use `await`.

```typescript
// The request completes
await expectly(fetchHealth()).toResolve();

// Defer the call by passing a function
await expectly(() => api.deleteUser(userId)).toResolve();

// Wrong credentials are rejected
await expectly(() => api.login("user@example.com", "wrong-password")).toReject();

// A Playwright wait that must succeed
await expectly(page.waitForResponse("**/api/orders")).toResolve();
```

A failure shows what the promise resolved or rejected with, such as `Rejected with: Error: Network error`.

## toThrowWithMessage()

Asserts that a function throws an error of the given type (or a subclass) with the given message. The message is an exact string or a `RegExp`.

A function that returns a promise is awaited. The assertion then returns a promise, so use `await` for async functions.

```typescript
// Synchronous function
expectly(() => parsePrice("abc")).toThrowWithMessage(TypeError, "Invalid price: abc");

// Message pattern
expectly(() => JSON.parse("{")).toThrowWithMessage(SyntaxError, /JSON/);

// Async function
await expectly(async () => api.getOrder(-1)).toThrowWithMessage(Error, /not found/);

// Subclasses match the base type
expectly(() => {
	throw new RangeError("Out of range");
}).toThrowWithMessage(Error, "Out of range");

// Nothing thrown, or a different type or message
expectly(() => parsePrice("12.50")).not.toThrowWithMessage(TypeError, /Invalid price/);
```

The receiver must be a function, the type an error class and the message a string or `RegExp`; anything else throws a `TypeError`.

## Common Use Cases

### API Response Validation

```typescript
test("validate users endpoint", async ({ request }) => {
	const response = await request.get("/api/users");
	const users = await response.json();

	// Every user has the required fields
	expectly(users).toSatisfyAll((user) => typeof user.id === "number" && user.email.includes("@"));

	// The first user has exactly the documented fields
	expectly(users[0]).toContainAllKeys(["id", "name", "email", "role"]);

	// At least one administrator
	expectly(users.map((user) => user.role)).toIncludeAnyMembers(["admin", "owner"]);
});
```

### Page Data Validation

```typescript
test("filter shows the selected tags", async ({ page }) => {
	await page.goto("/products?tags=sale,new");

	const tags = await page.locator(".active-filter").allTextContents();
	expectly(tags).toIncludeSameMembers(["new", "sale"]);
});
```

### Error Handling

```typescript
test("client reports invalid input", async () => {
	expectly(() => createClient({ baseUrl: "" })).toThrowWithMessage(TypeError, "baseUrl must not be empty");

	await expectly(() => client.getOrder("missing")).toReject();
	await expectly(async () => client.getOrder("missing")).toThrowWithMessage(Error, /404/);
});
```

## Error Messages

```typescript
expectly([1, -2, 3, -4]).toSatisfyAll((n) => n > 0);
// Error: Expected value to have every element satisfy the predicate
// Failing indexes: 1, 3
// Failing values: [-2, -4]

expectly(["a", "b"]).toIncludeSameMembers(["a", "c"]);
// Error: Expected value to have the same members in any order
// Expected: ["a", "c"]
// Received: ["a", "b"]
// Missing: ["c"]
// Unexpected: ["b"]

await expectly(Promise.reject(new Error("Network error"))).toResolve();
// Error: Expected promise to resolve
// Rejected with: Error: Network error
```

## Related

- [Generic Matchers](./GENERIC_MATCHERS.md) - For type checking, `toSatisfy()` and partial matching
- [String Array Matchers](./STRING_ARRAY_MATCHERS.md) - For sorting and uniqueness of string arrays
- [Object Array Matchers](./OBJECT_ARRAY_MATCHERS.md) - For sorting and uniqueness of object arrays

[← Back to README](../README.md)
