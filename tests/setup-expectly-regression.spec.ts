import { expect, test } from "@playwright/test";

import { setupExpectly } from "../src";

setupExpectly();

class UserAssertions {
	assertUserPartial(
		actual: { id: number; name: string; role: string },
		expected: Partial<{ id: number; name: string; role: string }>,
	): void {
		expect(actual).toEqualPartially(expected);
	}
}

test("setupExpectly enables custom matcher in separate class without importing expectly", () => {
	const userAssertions = new UserAssertions();

	userAssertions.assertUserPartial({ id: 1, name: "Alice", role: "admin" }, { name: "Alice" });
});
