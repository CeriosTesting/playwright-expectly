import type { ExpectMatcherState } from "@playwright/test";

// Only remove our implementation frames and Playwright's runner frames. Keep user helpers,
// including helpers in other dependencies, and support source maps as well as published bundles.
// Our frames are anchored to the scoped package or the workspace folder, so user folders that
// happen to be called "playwright-expectly/src" keep their frames.
const implementationFrame =
	/[/\\](?:@cerios|packages)[/\\]playwright-expectly(?:-core|-fuzzy)?[/\\](?:src|dist)[/\\]|[/\\](?:playwright|playwright-core|@playwright[/\\]test)[/\\](?:lib|src)[/\\]/;

function callerStack(boundary: (...args: unknown[]) => unknown): Error {
	const captured = new Error();
	Error.captureStackTrace(captured, boundary);
	return captured;
}

function rethrowAtCaller(error: unknown, captured: Error): never {
	const stack = (captured.stack?.split("\n").slice(1) ?? [])
		.filter((frame) => !implementationFrame.test(frame))
		.join("\n");
	if (error instanceof Error && stack) {
		// Do not replace the error: callers may inspect its type, cause or API metadata.
		// A frozen error must still propagate as-is rather than become a TypeError.
		try {
			error.stack = `${error.name}: ${error.message}\n${stack}`;
		} catch {
			// Read-only stack; preserve the original error.
		}
	}
	throw error;
}

// oxlint-disable-next-line typescript/no-explicit-any
export const withMatcherState = <T extends Record<string, (...args: any[]) => any>>(
	matchers: T & ThisType<ExpectMatcherState>,
): T => {
	return Object.fromEntries(
		Object.entries(matchers).map(([name, matcher]) => {
			function wrappedMatcher(this: ExpectMatcherState, ...args: unknown[]): unknown {
				const stack = callerStack(wrappedMatcher);
				try {
					const result: unknown = Reflect.apply(matcher, this, args);
					// Leave synchronous matchers synchronous, including synchronous throws.
					if (result instanceof Promise) return result.catch((error: unknown) => rethrowAtCaller(error, stack));
					return result;
				} catch (error) {
					return rethrowAtCaller(error, stack);
				}
			}
			return [name, wrappedMatcher];
		}),
	) as T;
};
