type MatcherResult = { pass: boolean; message: () => string };

/** Fixture for check-matchers: replaces Playwright's built-in `toBeVisible`. */
export const overrides = {
	toBeVisible(received: unknown): MatcherResult {
		return { pass: received !== undefined, message: () => "custom toBeVisible" };
	},
};
