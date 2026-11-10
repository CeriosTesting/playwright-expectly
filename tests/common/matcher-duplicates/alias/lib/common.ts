type MatcherResult = { pass: boolean; message: () => string };

export const common = {
	toBeAliased(received: unknown): MatcherResult {
		return { pass: received === "common", message: () => "common" };
	},
};
