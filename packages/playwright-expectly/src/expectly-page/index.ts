import { runPolledMatcher, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { BrowserContext, Cookie, Expect, ExpectMatcherState, Page } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { isEqual } from "../matchers/equality";
import type { ExpectlyMatcherResult } from "../matchers/matcher-result";
import { matchesPattern } from "../matchers/text-validation-utils";

export type CookieOptions = PollOptions & {
	/** Only consider cookies for this domain (as stored, e.g. `".example.com"` or `"example.com"`). */
	domain?: string;
	/** Only consider cookies with this path. */
	path?: string;
};

/**
 * An asymmetric matcher such as `expect.anything()`. Playwright types them as `Record<string, any>`, which this
 * accepts; that a value really is one is checked at runtime.
 */
type AsymmetricMatcher = Record<string, unknown>;

/**
 * The expected value of one query parameter:
 * - a string, pattern or asymmetric matcher (`expect.anything()`) for its value, read like
 *   `URLSearchParams.get()`: the first occurrence;
 * - a string array for all of its values (`?tag=a&tag=b`), in order.
 */
export type ExpectedSearchParamValue = string | RegExp | readonly string[] | AsymmetricMatcher;

export type ExpectedSearchParams = Record<string, ExpectedSearchParamValue>;

export type URLSearchParamsOptions = PollOptions & {
	/** Also fail when the URL has parameters that `expected` does not list. Default: `false`. */
	exact?: boolean;
};

function isAsymmetricMatcher(value: unknown): value is { asymmetricMatch(other: unknown): boolean } {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as { asymmetricMatch?: unknown }).asymmetricMatch === "function"
	);
}

/** A missing parameter matches nothing, so `.not` with `expect.anything()` asserts that it is absent. */
function searchParamMatches(params: URLSearchParams, key: string, expected: ExpectedSearchParamValue): boolean {
	if (Array.isArray(expected)) {
		// getAll() returns [] for a missing key; a missing parameter must not match an empty array.
		if (!params.has(key)) return false;
		const values = params.getAll(key);
		return values.length === expected.length && values.every((value, index) => value === expected[index]);
	}
	const value = params.get(key);
	if (value === null) return false;
	if (isAsymmetricMatcher(expected)) return isEqual(value, expected);
	return valueMatches(value, expected as string | RegExp);
}

/** The query parameters of a URL; none for a URL that does not parse (such as an empty one). */
function searchParamsOf(url: string): URLSearchParams {
	try {
		return new URL(url).searchParams;
	} catch {
		return new URLSearchParams();
	}
}

/** The query of a URL as `{ key: value }`, with an array for repeated keys. */
function describeSearchParams(params: URLSearchParams): Record<string, string | string[]> {
	const described: Record<string, string | string[]> = {};
	for (const key of new Set(params.keys())) {
		const values = params.getAll(key);
		described[key] = values.length === 1 ? values[0] : values;
	}
	return described;
}

function validateExpectedSearchParams(
	assertionName: string,
	expected: unknown,
): asserts expected is ExpectedSearchParams {
	if (typeof expected !== "object" || expected === null || Array.isArray(expected) || expected instanceof RegExp) {
		throw new TypeError(`${assertionName}: expected must be an object of query parameters`);
	}
	const entries = Object.entries(expected);
	if (entries.length === 0) throw new TypeError(`${assertionName}: expected must list at least one parameter`);
	for (const [key, value] of entries) {
		const valid =
			typeof value === "string" ||
			value instanceof RegExp ||
			isAsymmetricMatcher(value) ||
			(Array.isArray(value) && value.every((item) => typeof item === "string"));
		if (!valid) {
			// A parameter value is never null: `?debug` is "" and a missing one has no value at all.
			const absence = value === null ? "; to assert absence use .not with expect.anything()" : "";
			throw new TypeError(
				`${assertionName}: parameter ${JSON.stringify(key)} must be a string, RegExp, string array or asymmetric matcher${absence}`,
			);
		}
	}
}

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

/**
 * Reads a web storage item through `page.localStorage` / `page.sessionStorage` when this Playwright version
 * has them: those reads are getters, which reporters leave out, so polling adds no steps under the matcher.
 * Older versions fall back to `page.evaluate()`, which is reported as an "Evaluate" step.
 */
async function readStorageItem(page: Page, area: StorageArea, key: string): Promise<string | null> {
	const storage = (page as Partial<Pick<Page, StorageArea>>)[area];
	if (typeof storage?.getItem === "function") return await storage.getItem(key);
	return await page.evaluate(([storage, item]) => window[storage].getItem(item), [area, key] as const);
}

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

	const pass = await runPolledMatcher(
		state,
		options,
		async () => {
			try {
				actual = await readStorageItem(page, area, key);
			} catch (error) {
				if (!isNavigationError(error)) throw error;
				actual = null;
			}
			return valueMatches(actual, expected);
		},
		{ target: page },
	);

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
			{ target: context },
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
	async toHaveURLSearchParams(received: Page, expected: ExpectedSearchParams, options?: URLSearchParamsOptions) {
		const assertionName = "toHaveURLSearchParams";
		const page = pageOf(assertionName, received);
		validateExpectedSearchParams(assertionName, expected);
		const expectedKeys = Object.keys(expected);
		const expectedKeySet = new Set(expectedKeys);
		let url = "";
		let params = new URLSearchParams();
		let mismatched: string[] = [];
		let unexpected: string[] = [];

		const pass = await runPolledMatcher(
			this,
			options && { timeout: options.timeout, intervals: options.intervals },
			() => {
				// page.url() is a synchronous getter, so polling adds no steps to the report.
				url = page.url();
				params = searchParamsOf(url);
				mismatched = expectedKeys.filter((key) => !searchParamMatches(params, key, expected[key]));
				unexpected = options?.exact ? [...new Set(params.keys())].filter((key) => !expectedKeySet.has(key)) : [];
				return Promise.resolve(mismatched.length === 0 && unexpected.length === 0);
			},
			{ target: page },
		);

		const message = (): string => {
			const hint = this.utils.matcherHint(assertionName, undefined, "expected", { isNot: this.isNot });
			const scope = options?.exact ? " (and no others)" : "";
			return (
				`${hint}\n\n` +
				`Expected URL to ${this.isNot ? "not " : ""}have search params${scope}: ${this.utils.printExpected(expected)}\n` +
				`Received: ${this.utils.printReceived(describeSearchParams(params))}\n` +
				(mismatched.length > 0 ? `Mismatched: ${this.utils.printReceived(mismatched)}\n` : "") +
				(unexpected.length > 0 ? `Unexpected: ${this.utils.printReceived(unexpected)}\n` : "") +
				`URL:      ${url}`
			);
		};

		return { message, pass, name: assertionName, expected, actual: describeSearchParams(params) };
	},
});

export const expectlyPage: Expect<typeof expectlyPageMatchers> = baseExpect.extend(expectlyPageMatchers);
