// Fixture for check-matchers: an ES module (see package.json next to it) with a clash between its exports.
type MatcherResult = { pass: boolean; message: () => string };

export const left = {
	toBeSame(received: unknown): MatcherResult {
		return { pass: received === "left", message: () => "left" };
	},
};

export const right = {
	toBeSame(received: unknown): MatcherResult {
		return { pass: received === "right", message: () => "right" };
	},
};
