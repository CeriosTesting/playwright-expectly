import { expect as baseExpect } from "@playwright/test";

type MatcherResult = { pass: boolean; message: () => string };

/** Fixture for check-matchers: `alpha` and `beta` both define `toBeThing`, with different implementations. */
export const alpha = {
	toBeThing(received: unknown): MatcherResult {
		return { pass: received === "thing", message: () => "alpha: expected the thing" };
	},
	toBeAlphaOnly(received: unknown): MatcherResult {
		return { pass: received === "alpha", message: () => "alpha only" };
	},
};

export const beta = {
	toBeThing(received: unknown): MatcherResult {
		return { pass: typeof received === "string", message: () => "beta: expected a string" };
	},
};

export const clean = {
	toBeCleanOnly(received: unknown): MatcherResult {
		return { pass: received === "clean", message: () => "clean only" };
	},
};

/** Shares its functions with `alpha`, so it is not a duplicate of `alpha`. */
export const expect = baseExpect.extend(alpha);

/** Not a matcher source. */
export const answer = 42;
