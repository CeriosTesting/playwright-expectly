type MatcherResult = { pass: boolean; message: () => string };

/** Redefines an Expectly matcher name; `playwright-expectly check-matchers` must report it. */
export const clashingMatchers = {
	toStartWith(received: string, prefix: string): MatcherResult {
		return { pass: received.startsWith(prefix), message: () => "clashing toStartWith" };
	},
};
