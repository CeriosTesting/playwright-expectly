import { expect, test } from "@playwright/test";
import { expectlyAny } from "../src/expectly-any";

test.describe("toEqualPartially", () => {
	test("should match object with extra properties", async () => {
		const actual = {
			id: 1,
			name: "Test",
			email: "test@example.com",
			role: "admin",
			createdAt: "2024-01-01",
		};

		expectlyAny(actual).toEqualPartially({
			name: "Test",
			role: "admin",
		});
	});

	test("should match nested objects with extra properties", async () => {
		const actual = {
			user: {
				id: 1,
				name: "Alice",
				email: "alice@example.com",
				phone: "123-456-7890",
			},
			metadata: {
				count: 10,
				page: 1,
				total: 100,
			},
		};

		expectlyAny(actual).toEqualPartially({
			user: {
				name: "Alice",
			},
			metadata: {
				count: 10,
			},
		});
	});

	test("should match array with extra items regardless of order", async () => {
		const actual = [
			{ id: 1, name: "Item 1" },
			{ id: 2, name: "Item 2" },
			{ id: 3, name: "Item 3" },
		];

		// Only checking for one item, ignoring others
		expectlyAny(actual).toEqualPartially([{ id: 2, name: "Item 2" }]);
	});

	test("should match array items in any order", async () => {
		const actual = [
			{ id: 1, name: "First" },
			{ id: 2, name: "Second" },
			{ id: 3, name: "Third" },
		];

		// Order doesn't matter
		expectlyAny(actual).toEqualPartially([
			{ id: 3, name: "Third" },
			{ id: 1, name: "First" },
		]);
	});

	test("should match complex nested structure from test example", async () => {
		const actual = {
			id: 1,
			name: "Test",
			details: {
				age: 30,
				city: "New York",
			},
			addresses: [
				{ street: "123 Main St", zip: "10001" },
				{ street: "456 Elm St", zip: "10002" },
			],
		};

		const expected = {
			name: "Test",
			details: {
				city: "New York",
			},
			addresses: [{ street: "456 Elm St", zip: "10002" }],
		};

		expectlyAny(actual).toEqualPartially(expected);
	});

	test("should match array with partial object properties", async () => {
		const actual = [
			{ id: 1, name: "Item 1", category: "A", price: 10 },
			{ id: 2, name: "Item 2", category: "B", price: 20 },
			{ id: 3, name: "Item 3", category: "A", price: 30 },
		];

		// Only check specific properties, ignoring others
		expectlyAny(actual).toEqualPartially([
			{ id: 2, category: "B" },
			{ id: 3, category: "A" },
		]);
	});

	test("should handle deeply nested structures", async () => {
		const actual = {
			level1: {
				level2: {
					level3: {
						id: 123,
						data: "value",
						extra: "ignored",
					},
					otherData: "also here",
				},
			},
		};

		expectlyAny(actual).toEqualPartially({
			level1: {
				level2: {
					level3: {
						id: 123,
					},
				},
			},
		});
	});

	test("should handle arrays within nested objects", async () => {
		const actual = {
			users: [
				{ id: 1, name: "Alice", roles: ["admin", "user"] },
				{ id: 2, name: "Bob", roles: ["user"] },
				{ id: 3, name: "Charlie", roles: ["moderator", "user"] },
			],
			metadata: {
				total: 3,
				page: 1,
			},
		};

		expectlyAny(actual).toEqualPartially({
			users: [
				{ id: 2, name: "Bob" },
				{ id: 1, name: "Alice" },
			],
			metadata: {
				total: 3,
			},
		});
	});

	test("should match empty arrays", async () => {
		const actual = {
			items: [],
			count: 0,
		};

		expectlyAny(actual).toEqualPartially({
			items: [],
			count: 0,
		});
	});

	test("should match primitive values in objects", async () => {
		const actual = {
			string: "hello",
			number: 42,
			boolean: true,
			nullValue: null,
			extra: "ignored",
		};

		expectlyAny(actual).toEqualPartially({
			string: "hello",
			number: 42,
			boolean: true,
			nullValue: null,
		});
	});

	test("should fail when expected property value doesn't match", async () => {
		const actual = {
			id: 1,
			name: "Alice",
		};

		let error: Error | undefined;
		try {
			expectlyAny(actual).toEqualPartially({
				name: "Bob",
			});
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("toEqualPartially");
	});

	test("should fail when expected array item is missing", async () => {
		const actual = [
			{ id: 1, name: "Item 1" },
			{ id: 2, name: "Item 2" },
		];

		let error: Error | undefined;
		try {
			expectlyAny(actual).toEqualPartially([{ id: 3, name: "Item 3" }]);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should fail when expected nested property is missing", async () => {
		const actual = {
			user: {
				id: 1,
				name: "Alice",
			},
		};

		let error: Error | undefined;
		try {
			expectlyAny(actual).toEqualPartially({
				user: {
					email: "alice@example.com",
				},
			});
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
	});

	test("should work with .not for non-matching values", async () => {
		const actual = {
			id: 1,
			name: "Alice",
		};

		expectlyAny(actual).not.toEqualPartially({
			name: "Bob",
		});
	});

	test("should fail with .not when value matches", async () => {
		const actual = {
			id: 1,
			name: "Alice",
			extra: "data",
		};

		let error: Error | undefined;
		try {
			expectlyAny(actual).not.toEqualPartially({
				name: "Alice",
			});
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toContain("not partially match");
	});

	test("should handle mixed array and object nesting", async () => {
		const actual = {
			projects: [
				{
					id: 1,
					name: "Project A",
					tasks: [
						{ id: 101, title: "Task 1", status: "done" },
						{ id: 102, title: "Task 2", status: "pending" },
					],
				},
				{
					id: 2,
					name: "Project B",
					tasks: [
						{ id: 201, title: "Task 3", status: "done" },
						{ id: 202, title: "Task 4", status: "in-progress" },
					],
				},
			],
		};

		expectlyAny(actual).toEqualPartially({
			projects: [
				{
					id: 2,
					tasks: [{ id: 201, status: "done" }],
				},
			],
		});
	});

	test("should handle Date objects", async () => {
		const date = new Date("2024-01-01");
		const actual = {
			createdAt: date,
			name: "Test",
		};

		expectlyAny(actual).toEqualPartially({
			createdAt: date,
		});
	});

	test("should handle arrays of primitives", async () => {
		const actual = {
			tags: ["javascript", "typescript", "playwright", "testing"],
			count: 4,
		};

		expectlyAny(actual).toEqualPartially({
			tags: ["typescript", "playwright"],
		});
	});

	test("should match single item from large array", async () => {
		const actual = {
			items: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `Item ${i}` })),
		};

		// Should find this one item among 100
		expectlyAny(actual).toEqualPartially({
			items: [{ id: 50, value: "Item 50" }],
		});
	});

	test("error message should only show mismatched properties, not extra properties", async () => {
		// This test verifies that the error message doesn't mark extra properties (like 'id', 'home')
		// as failures - only the actual mismatches should be highlighted
		const actual = {
			id: 1, // Extra property - should NOT appear in error
			name: "Alice",
			addresses: {
				home: { street: "123 Main St", city: "Wonderland" }, // Extra nested - should NOT appear
				work: { street: "456 Office Rd", city: "Metropolis" },
			},
		};

		let error: Error | undefined;
		try {
			expectlyAny(actual).toEqualPartially({
				name: "Bob", // This WILL mismatch
				addresses: {
					work: { street: "456 Office Rd", city: "Metropolis" }, // This matches
				},
			});
		} catch (e) {
			error = e as Error;
		}

		expect(error).toBeDefined();
		expect(error?.message).toContain("toEqualPartially");
		expect(error?.message).toContain("partial match");
		// The error should show the mismatch
		expect(error?.message).toContain('"name"');
		expect(error?.message).toContain("Alice");
		expect(error?.message).toContain("Bob");
		// The error should NOT show 'id' as a problem since it's not in expected
		expect(error?.message).not.toContain('"id"');
		// The error should NOT show 'home' address since it's not in expected
		expect(error?.message).not.toContain('"home"');
	});

	test("should support asymmetric matchers (expect.any, expect.objectContaining, etc.)", async () => {
		const actual = {
			id: 123,
			name: "Alice",
			email: "alice@example.com",
			createdAt: new Date("2024-01-01"),
			tags: ["typescript", "playwright", "testing"],
			address: {
				street: "123 Main St",
				city: "Wonderland",
				zipCode: "12345",
			},
		};

		// Should work with expect.any()
		expectlyAny(actual).toEqualPartially({
			id: expect.any(Number),
			name: expect.any(String),
			createdAt: expect.any(Date),
		});

		// Should work with expect.stringContaining()
		expectlyAny(actual).toEqualPartially({
			email: expect.stringContaining("@example.com"),
		});

		// Should work with expect.arrayContaining()
		expectlyAny(actual).toEqualPartially({
			tags: expect.arrayContaining(["playwright", "typescript"]),
		});

		// Should work with expect.objectContaining()
		expectlyAny(actual).toEqualPartially({
			address: expect.objectContaining({
				city: "Wonderland",
			}),
		});

		// Should work with nested asymmetric matchers
		expectlyAny(actual).toEqualPartially({
			id: expect.any(Number),
			address: expect.objectContaining({
				city: expect.stringContaining("Wonder"),
				zipCode: expect.any(String),
			}),
		});
	});
});
