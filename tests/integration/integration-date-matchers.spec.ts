import "@cerios/playwright-expectly";

import { expect, test } from "@playwright/test";

/**
 * Integration tests for date matchers using setupExpectly.
 *
 * These tests demonstrate using the `toBeCloseTo` date matcher
 * with the native expect instance (which has setupExpectly already registered the methods).
 */
test.describe("Integration: Date matchers with setupExpectly", () => {
	test("should validate an API response timestamp is within expected deviation", () => {
		// Simulate an API response with a server timestamp
		const apiResponse = {
			status: "success",
			data: { id: 1, message: "Hello World" },
			timestamp: new Date(Date.now() + 100), // Server time slightly ahead
		};

		const expectedTime = new Date();

		// Validate the response structure
		expect(apiResponse.status).toBe("success");
		expect(apiResponse.data.message).toEqual("Hello World");

		// Validate the timestamp is close to now (within 1 second)
		expect(apiResponse.timestamp).toBeCloseTo(expectedTime, { seconds: 1 });
	});

	test("should fail when timestamp deviates beyond tolerance", () => {
		const pastDate = new Date(Date.now() - 5000); // 5 seconds ago
		const now = new Date();

		// This should fail because 5 seconds exceeds the 1-second tolerance
		expect(() => {
			expect(pastDate).toBeCloseTo(now, { seconds: 1 });
		}).toThrow();
	});
});
