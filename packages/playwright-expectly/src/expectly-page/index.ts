import { runPolledMatcher, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { BrowserContext, Cookie, Expect, ExpectMatcherState, Page } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import type { ExpectlyMatcherResult } from "../matchers/matcher-result";
import { matchesPattern } from "../matchers/text-validation-utils";

export type CookieOptions = PollOptions & {
	/** Only consider cookies for this domain (as stored, e.g. `".example.com"` or `"example.com"`). */
	domain?: string;
	/** Only consider cookies with this path. */
	path?: string;
};

function isBrowserContext(received: unknown): received is BrowserContext {
	return (
		typeof received === "object" && received !== null && typeof (received as BrowserContext).cookies === "function"
	);
}

function isPage(received: unknown): received is Page {
	return (
		typeof received === "object" &&
		received !== null &&
		typeof (received as Page).context === "function" &&
		typeof (received as Page).evaluate === "function"
	);
}

function contextOf(assertionName: string, received: unknown): BrowserContext {
	if (isBrowserContext(received)) return received;
	if (isPage(received)) return received.context();
	throw new TypeError(`${assertionName}: received value must be a Page or BrowserContext`);
}

function pageOf(assertionName: string, received: unknown): Page {
	if (isPage(received)) return received;
	throw new TypeError(`${assertionName}: received value must be a Page`);
}

function valueMatches(actual: string | null | undefined, expected: string | RegExp | undefined): boolean {
	if (actual === null || actual === undefined) return false;
	if (expected === undefined) return true;
	return typeof expected === "string" ? actual === expected : matchesPattern(actual, expected);
}

/** A navigation destroys the page's execution context; retry instead of failing the assertion. */
function isNavigationError(error: unknown): boolean {
	return error instanceof Error && /Execution context was destroyed|because of a navigation/i.test(error.message);
}

type StorageArea = "localStorage" | "sessionStorage";

async function storageMatcher(
	state: ExpectMatcherState,
	assertionName: string,
	area: StorageArea,
	received: unknown,
	key: string,
	expected: string | RegExp | undefined,
	options: PollOptions | undefined,
): Promise<ExpectlyMatcherResult> {
	const page = pageOf(assertionName, received);
	if (typeof key !== "string") throw new TypeError(`${assertionName}: key must be a string`);
	let actual: string | null = null;

	const pass = await runPolledMatcher(state, options, async () => {
		try {
			actual = await page.evaluate(([storage, item]) => window[storage].getItem(item), [area, key] as const);
		} catch (error) {
			if (!isNavigationError(error)) throw error;
			actual = null;
		}
		return valueMatches(actual, expected);
	});

	const message = (): string => {
		const hint = state.utils.matcherHint(assertionName, undefined, JSON.stringify(key), { isNot: state.isNot });
		const what =
			expected === undefined
				? `${area} item ${JSON.stringify(key)}`
				: `${area} item ${JSON.stringify(key)} with value ${state.utils.printExpected(expected)}`;
		return (
			hint +
			"\n\n" +
			`Expected page to ${state.isNot ? "not " : ""}have ${what}\n` +
			`Received: ${actual === null ? "(no such item)" : state.utils.printReceived(actual)}`
		);
	};

	return { message, pass, name: assertionName, expected, actual };
}

/**
 * Page and browser-context state matchers: cookies and web storage, retried until they match
 * (a cookie set by a response is not always stored by the time a click resolves).
 */
export const expectlyPageMatchers = withMatcherState({
	async toHaveCookie(
		received: Page | BrowserContext,
		name: string,
		expected?: string | RegExp,
		options?: CookieOptions,
	) {
		const assertionName = "toHaveCookie";
		const context = contextOf(assertionName, received);
		if (typeof name !== "string" || name.length === 0) {
			throw new TypeError(`${assertionName}: cookie name must be a non-empty string`);
		}
		let candidates: Cookie[] = [];

		const pass = await runPolledMatcher(
			this,
			options && { timeout: options.timeout, intervals: options.intervals },
			async () => {
				candidates = (await context.cookies()).filter(
					(cookie) =>
						cookie.name === name &&
						(options?.domain === undefined || cookie.domain === options.domain) &&
						(options?.path === undefined || cookie.path === options.path),
				);
				return candidates.some((cookie) => valueMatches(cookie.value, expected));
			},
		);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, JSON.stringify(name), { isNot: this.isNot });
			const scope = [options?.domain && `domain ${options.domain}`, options?.path && `path ${options.path}`]
				.filter(Boolean)
				.join(", ");
			const what = `cookie ${JSON.stringify(name)}${expected === undefined ? "" : ` with value ${this.utils.printExpected(expected)}`}${scope ? ` (${scope})` : ""}`;
			const found =
				candidates.length === 0
					? "(no such cookie)"
					: candidates
							.map((cookie) => `${this.utils.printReceived(cookie.value)} (${cookie.domain}${cookie.path})`)
							.join(", ");
			return `${hint}\n\nExpected ${this.isNot ? "no " : ""}${what}\nReceived: ${found}`;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: candidates.map((cookie) => cookie.value),
		};
	},
	async toHaveLocalStorageItem(received: Page, key: string, expected?: string | RegExp, options?: PollOptions) {
		return storageMatcher(this, "toHaveLocalStorageItem", "localStorage", received, key, expected, options);
	},
	async toHaveSessionStorageItem(received: Page, key: string, expected?: string | RegExp, options?: PollOptions) {
		return storageMatcher(this, "toHaveSessionStorageItem", "sessionStorage", received, key, expected, options);
	},
});

export const expectlyPage: Expect<typeof expectlyPageMatchers> = baseExpect.extend(expectlyPageMatchers);
