import { expect, test } from "@playwright/test";

import { expectlyAny } from "../src/expectly-any";

import { getRejectedErrorSync } from "./helpers/assertion-utils";

test.describe("toEqualPartially", () => {
	test("should match object with extra properties", () => {
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

	test("should match nested objects with extra properties", () => {
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

	test("should match array with extra items regardless of order", () => {
		const actual = [
			{ id: 1, name: "Item 1" },
			{ id: 2, name: "Item 2" },
			{ id: 3, name: "Item 3" },
		];

		// Only checking for one item, ignoring others
		expectlyAny(actual).toEqualPartially([{ id: 2, name: "Item 2" }]);
	});

	test("should match array items in any order", () => {
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

	test("should match complex nested structure from test example", () => {
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

	test("should match array with partial object properties", () => {
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

	test("should handle deeply nested structures", () => {
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

	test("should handle arrays within nested objects", () => {
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

	test("should match empty arrays", () => {
		const actual = {
			items: [],
			count: 0,
		};

		expectlyAny(actual).toEqualPartially({
			items: [],
			count: 0,
		});
	});

	test("should match primitive values in objects", () => {
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

	test("should fail when expected property value doesn't match", () => {
		const actual = {
			id: 1,
			name: "Alice",
		};

		expect(() => {
			expectlyAny(actual).toEqualPartially({
				name: "Bob",
			});
		}).toThrow(/toEqualPartially/);
	});

	test("should fail when expected array item is missing", () => {
		const actual = [
			{ id: 1, name: "Item 1" },
			{ id: 2, name: "Item 2" },
		];

		expect(() => {
			expectlyAny(actual).toEqualPartially([{ id: 3, name: "Item 3" }]);
		}).toThrow();
	});

	test("should fail when duplicate expected nested array items reuse the same actual item", () => {
		const actual = {
			items: [
				{ id: 1, name: "Item 1" },
				{ id: 2, name: "Item 2" },
				{ id: 3, name: "Item 3" },
				{ id: 4, name: "Item 4" },
				{ id: 5, name: "Item 5" },
			],
		};

		expect(() => {
			expectlyAny(actual).toEqualPartially({
				items: [{ id: 2 }, { id: 2 }, { id: 2 }, { id: 2 }, { id: 2 }],
			});
		}).toThrow(/toEqualPartially/);
	});

	test("should pass when duplicate counts in expected match actual", () => {
		const actual = {
			items: [
				{ id: 1, name: "Item 1" },
				{ id: 2, name: "Duplicate A" },
				{ id: 2, name: "Duplicate B" },
				{ id: 3, name: "Item 3" },
				{ id: 4, name: "Item 4" },
			],
		};

		expectlyAny(actual).toEqualPartially({
			items: [{ id: 2 }, { id: 2 }],
		});
	});

	test("should handle overlapping matches without greedy misassignment", () => {
		const actual = {
			items: [
				{ id: 1, name: "Specific" },
				{ id: 1, name: "Other" },
			],
		};

		expectlyAny(actual).toEqualPartially({
			items: [{ id: 1 }, { id: 1, name: "Specific" }],
		});
	});

	test("should fail when expected duplicates exceed top-level actual duplicates", () => {
		const actual = [{ id: 2 }];

		expect(() => {
			expectlyAny(actual).toEqualPartially([{ id: 2 }, { id: 2 }]);
		}).toThrow(/toEqualPartially/);
	});

	test("should fail when expected duplicates exceed nested actual duplicates", () => {
		const actual = {
			items: [{ id: 2 }],
		};

		expect(() => {
			expectlyAny(actual).toEqualPartially({
				items: [{ id: 2 }, { id: 2 }],
			});
		}).toThrow(/toEqualPartially/);
	});

	test("should fail when asymmetric matcher capacity exceeds actual array size", () => {
		const actual = [1];

		expect(() => {
			expectlyAny(actual).toEqualPartially([expect.any(Number), expect.any(Number)]);
		}).toThrow(/toEqualPartially/);
	});

	test("should pass when explicit undefined key exists in actual", () => {
		const actual = {
			profile: {
				middleName: undefined,
				lastName: "Doe",
			},
		};

		expectlyAny(actual).toEqualPartially({
			profile: {
				middleName: undefined,
			},
		});
	});

	test("should pass when explicit undefined key is missing and option is disabled", () => {
		const actual = {
			profile: {
				lastName: "Doe",
			},
		};

		expectlyAny(actual).toEqualPartially({
			profile: {
				middleName: undefined,
			},
		});
	});

	test("should fail when explicit undefined key is missing and option is enabled", () => {
		const actual = {
			profile: {
				lastName: "Doe",
			},
		};

		expect(() => {
			expectlyAny(actual).toEqualPartially(
				{
					profile: {
						middleName: undefined,
					},
				},
				{ requireExplicitUndefinedKeyPresence: true },
			);
		}).toThrow(/toEqualPartially/);
	});

	test("should throw for unknown toEqualPartially option", () => {
		expect(() => {
			expectlyAny({ id: 1 }).toEqualPartially({ id: 1 }, { badOption: true } as any);
		}).toThrow(/unknown option/);
	});

	test("should fail with matcher-style message for invalid options even with .not", () => {
		expect(() => {
			expectlyAny({ id: 1 }).not.toEqualPartially({ id: 1 }, { badOption: true } as any);
		}).toThrow(/unknown option/);
	});

	test("should throw for invalid toEqualPartially option value", () => {
		expect(() => {
			expectlyAny({ id: 1 }).toEqualPartially({ id: 1 }, { arrayMode: "wrong" } as any);
		}).toThrow(/arrayMode/);
	});

	test("should pass with arrayMode exactLength when lengths are equal", () => {
		const actual = [{ id: 1 }, { id: 2 }];
		expectlyAny(actual).toEqualPartially([{ id: 2 }, { id: 1 }], { arrayMode: "exactLength" });
	});

	test("should fail with arrayMode exactLength when lengths differ", () => {
		const actual = [{ id: 1 }, { id: 2 }, { id: 3 }];
		expect(() => {
			expectlyAny(actual).toEqualPartially([{ id: 1 }, { id: 2 }], { arrayMode: "exactLength" });
		}).toThrow(/Array length mismatch/);
	});

	test("should pass with arrayMode exactOrder when positions match", () => {
		const actual = [
			{ id: 1, extra: true },
			{ id: 2, extra: false },
		];
		expectlyAny(actual).toEqualPartially([{ id: 1 }, { id: 2 }], { arrayMode: "exactOrder" });
	});

	test("should fail with arrayMode exactOrder when positions do not match", () => {
		const actual = [{ id: 1 }, { id: 2 }];
		expect(() => {
			expectlyAny(actual).toEqualPartially([{ id: 2 }, { id: 1 }], { arrayMode: "exactOrder" });
		}).toThrow(/Unmatched expected index/);
	});

	test("should include unmatched expected indices in array mismatch error", () => {
		const actual = [{ id: 1 }];
		const error = getRejectedErrorSync(() => {
			expectlyAny(actual).toEqualPartially([{ id: 1 }, { id: 2 }]);
		});

		expect(error.message).toContain("Unmatched expected index 1");
	});

	test("should pass nested exactOrder with asymmetric matchers", () => {
		const actual = {
			projects: [
				{ id: 1, tasks: [{ id: 101, status: "done" }] },
				{ id: 2, tasks: [{ id: 201, status: "pending" }] },
			],
		};

		expectlyAny(actual).toEqualPartially(
			{
				projects: [
					{ id: expect.any(Number), tasks: [{ id: 101, status: expect.stringContaining("done") }] },
					{ id: 2, tasks: [expect.objectContaining({ status: "pending" })] },
				],
			},
			{ arrayMode: "exactOrder" },
		);
	});

	test("should fail nested exactOrder with asymmetric matchers when order differs", () => {
		const actual = {
			projects: [
				{ id: 1, tasks: [{ id: 101, status: "done" }] },
				{ id: 2, tasks: [{ id: 201, status: "pending" }] },
			],
		};

		const error = getRejectedErrorSync(() => {
			expectlyAny(actual).toEqualPartially(
				{
					projects: [
						{ id: 2, tasks: [expect.objectContaining({ status: "pending" })] },
						{ id: expect.any(Number), tasks: [{ id: 101, status: expect.stringContaining("done") }] },
					],
				},
				{ arrayMode: "exactOrder" },
			);
		});

		expect(error.message).toContain("Unmatched expected index");
		expect(error.message).toContain("$.projects[0]");
	});

	test("should fail when expected nested property is missing", () => {
		const actual = {
			user: {
				id: 1,
				name: "Alice",
			},
		};

		expect(() => {
			expectlyAny(actual).toEqualPartially({
				user: {
					email: "alice@example.com",
				},
			});
		}).toThrow();
	});

	test("should work with .not for non-matching values", () => {
		const actual = {
			id: 1,
			name: "Alice",
		};

		expectlyAny(actual).not.toEqualPartially({
			name: "Bob",
		});
	});

	test("should fail with .not when value matches", () => {
		const actual = {
			id: 1,
			name: "Alice",
			extra: "data",
		};

		expect(() => {
			expectlyAny(actual).not.toEqualPartially({
				name: "Alice",
			});
		}).toThrow(/not partially match/);
	});

	test("should handle mixed array and object nesting", () => {
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

	test("should handle Date objects", () => {
		const date = new Date("2024-01-01");
		const actual = {
			createdAt: date,
			name: "Test",
		};

		expectlyAny(actual).toEqualPartially({
			createdAt: date,
		});
	});

	test("should handle arrays of primitives", () => {
		const actual = {
			tags: ["javascript", "typescript", "playwright", "testing"],
			count: 4,
		};

		expectlyAny(actual).toEqualPartially({
			tags: ["typescript", "playwright"],
		});
	});

	test("should match single item from large array", () => {
		const actual = {
			items: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `Item ${i}` })),
		};

		// Should find this one item among 100
		expectlyAny(actual).toEqualPartially({
			items: [{ id: 50, value: "Item 50" }],
		});
	});

	test("error message should only show mismatched properties, not extra properties", () => {
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

		const error = getRejectedErrorSync(() => {
			expectlyAny(actual).toEqualPartially({
				name: "Bob", // This WILL mismatch
				addresses: {
					work: { street: "456 Office Rd", city: "Metropolis" }, // This matches
				},
			});
		});

		expect(error.message).toContain("toEqualPartially");
		expect(error.message).toContain("partial match");
		// The error should show the mismatch
		expect(error.message).toContain('"name"');
		expect(error.message).toContain("Alice");
		expect(error.message).toContain("Bob");
		// The error should NOT show 'id' as a problem since it's not in expected
		expect(error.message).not.toContain('"id"');
		// The error should NOT show 'home' address since it's not in expected
		expect(error.message).not.toContain('"home"');
	});

	test("should support asymmetric matchers (expect.any, expect.objectContaining, etc.)", () => {
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
