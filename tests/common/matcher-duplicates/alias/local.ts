type MatcherResult = { pass: boolean; message: () => string };

export const local = {
	toBeAliased(received: unknown): MatcherResult {
		return { pass: received === "local", message: () => "local" };
	},
};
