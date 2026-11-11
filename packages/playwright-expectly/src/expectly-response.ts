import { withMatcherState } from "@cerios/playwright-expectly-core";
import type { Expect } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import type { ExpectlyMatcherResult } from "./matchers/matcher-result";

/** A class of HTTP status codes: `"2xx"` matches 200–299. */
export type HttpStatusClass = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

/** The part of Playwright's `APIResponse` and `Response` that the response matchers read. */
interface ResponseLike {
	status(): number;
	statusText(): string;
	url(): string;
	headers?(): Record<string, string>;
	text?(): Promise<string>;
	/** Internal to Playwright's `APIResponse`; `toBeOK()` prints it as the call log. */
	_fetchLog?(): Promise<string[]>;
}

const MAX_BODY_LENGTH = 1000;
const STATUS_CLASS = /^([1-5])xx$/;

function isResponseLike(received: unknown): received is ResponseLike {
	if (typeof received !== "object" || received === null) return false;
	const candidate = received as Partial<Record<keyof ResponseLike, unknown>>;
	return (
		typeof candidate.status === "function" &&
		typeof candidate.statusText === "function" &&
		typeof candidate.url === "function"
	);
}

function parseExpectedStatus(
	assertionName: string,
	expected: number | HttpStatusClass,
): { matches: (status: number) => boolean; label: string } {
	if (typeof expected === "number") {
		if (!Number.isInteger(expected) || expected < 100 || expected > 599) {
			throw new TypeError(`${assertionName}: expected status must be an integer from 100 to 599, got: ${expected}`);
		}
		return { matches: (status) => status === expected, label: String(expected) };
	}
	const statusClass = typeof expected === "string" ? STATUS_CLASS.exec(expected) : null;
	if (!statusClass) {
		throw new TypeError(
			`${assertionName}: expected status must be a number or one of "1xx", "2xx", "3xx", "4xx", "5xx", got: ${String(expected)}`,
		);
	}
	const hundreds = Number(statusClass[1]) * 100;
	return { matches: (status) => status >= hundreds && status < hundreds + 100, label: expected };
}

/** Playwright's `isTextualMimeType()`: only these bodies are printed, so binary content never is. */
const TEXTUAL_MIME_TYPE =
	/^(text\/.*?|application\/(json|(x-)?javascript|xml.*?|ecmascript|graphql|x-www-form-urlencoded)|image\/svg(\+xml)?|application\/.*?(\+json|\+xml))(;\s*charset=.*)?$/;

/** The response text for a failure message, as `toBeOK()` shows it; `undefined` for non-text or unreadable bodies. */
async function responseText(response: ResponseLike): Promise<string | undefined> {
	const contentType = typeof response.headers === "function" ? response.headers()["content-type"] : undefined;
	if (!contentType || !TEXTUAL_MIME_TYPE.test(contentType) || typeof response.text !== "function") return undefined;
	try {
		return (await response.text()).substring(0, MAX_BODY_LENGTH);
	} catch {
		// A disposed APIResponse or a redirect response without a body; the status is still reported.
		return undefined;
	}
}

/**
 * The request and response lines `toBeOK()` prints as its call log. `_fetchLog()` is internal to Playwright's
 * `APIResponse` (a page `Response` has none), so it is optional and its failure is ignored.
 */
async function fetchLog(response: ResponseLike): Promise<string[] | undefined> {
	if (typeof response._fetchLog !== "function") return undefined;
	try {
		const log = await response._fetchLog();
		return Array.isArray(log) && log.some(Boolean) ? log : undefined;
	} catch {
		return undefined;
	}
}

/** Playwright's matcher colors; they are not part of its public `ExpectMatcherUtils` type. */
type Colors = Record<"DIM_COLOR" | "EXPECTED_COLOR" | "RECEIVED_COLOR", (text: string) => string>;

function colorsOf(utils: object): Colors {
	const candidate = utils as Partial<Colors>;
	const plain = (text: string): string => text;
	return {
		DIM_COLOR: candidate.DIM_COLOR ?? plain,
		EXPECTED_COLOR: candidate.EXPECTED_COLOR ?? plain,
		RECEIVED_COLOR: candidate.RECEIVED_COLOR ?? plain,
	};
}

/**
 * HTTP response matchers for Playwright's `APIResponse` (from `request`) and `Response` (from `page`).
 */
export const expectlyResponseMatchers = withMatcherState({
	async toHaveStatus(received: ResponseLike, expected: number | HttpStatusClass): Promise<ExpectlyMatcherResult> {
		const assertionName = "toHaveStatus";
		if (!isResponseLike(received)) {
			throw new TypeError(`${assertionName}: received value must be an APIResponse or Response`);
		}
		const { matches, label } = parseExpectedStatus(assertionName, expected);
		const status = received.status();
		const statusText = received.statusText();
		const pass = matches(status);
		// Like toBeOK(), a failure in either direction shows the call log and the response text.
		const failed = pass === this.isNot;
		const [log, text] = failed ? await Promise.all([fetchLog(received), responseText(received)]) : [];

		const message = (): string => {
			const { DIM_COLOR, EXPECTED_COLOR, RECEIVED_COLOR } = colorsOf(this.utils);
			const printedExpected = typeof expected === "number" ? String(expected) : `"${label}"`;
			const header =
				DIM_COLOR("expect(") +
				RECEIVED_COLOR("response") +
				DIM_COLOR(`)${this.isNot ? ".not" : ""}.`) +
				assertionName +
				DIM_COLOR("(") +
				EXPECTED_COLOR(printedExpected) +
				DIM_COLOR(")") +
				" failed";
			return (
				`${header}\n\n` +
				`Expected: ${this.isNot ? "not " : ""}${EXPECTED_COLOR(printedExpected)}\n` +
				`Received: ${RECEIVED_COLOR(`${status}${statusText ? ` ${statusText}` : ""}`)}\n` +
				// Without a call log, the URL is the only pointer to the request.
				(log ? `\nCall log:\n${DIM_COLOR(log.join("\n"))}\n` : `URL:      ${received.url()}\n`) +
				(text === undefined ? "" : `\nResponse text:\n${DIM_COLOR(text)}`)
			);
		};

		return { message, pass, name: assertionName, expected, actual: status };
	},
});

export const expectlyResponse: Expect<typeof expectlyResponseMatchers> = baseExpect.extend(expectlyResponseMatchers);
