import type { ExpectMatcherState } from "@playwright/test";

export const withMatcherState = <T extends Record<string, (...args: any[]) => any>>(
	matchers: T & ThisType<ExpectMatcherState>
): T => matchers;
