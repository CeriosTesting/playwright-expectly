import type { ExpectMatcherState } from "@playwright/test";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for variadic matcher function signatures
export const withMatcherState = <T extends Record<string, (...args: any[]) => any>>(
	matchers: T & ThisType<ExpectMatcherState>,
): T => matchers;
