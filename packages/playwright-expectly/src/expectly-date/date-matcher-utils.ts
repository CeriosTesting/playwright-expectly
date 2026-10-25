import type { ExpectMatcherState } from "@playwright/test";

import type { NormalizedDateTime } from "../date-time/inputs";
import { normalize } from "../date-time/inputs";

import type { DateMatcherResult } from "./date-matcher-result";

/** A diagnostic line: label, value and how the value is printed. */
export type MessageLine = readonly [label: string, value: unknown, style?: "expected" | "received" | "plain"];

export interface DateMatcherOutcome {
	name: string;
	pass: boolean;
	/** The positive expectation, e.g. `"be before the expected date"`; `.not` inserts "not". */
	expectation: string;
	/** What is being asserted on. Default: `"date"`. */
	subject?: string;
	/** Built lazily, only when the assertion fails. */
	lines?: () => readonly (MessageLine | false | undefined)[];
	expected?: unknown;
	actual?: unknown;
}

function printValue(state: ExpectMatcherState, value: unknown, style: MessageLine[2]): string {
	if (style === "expected") return state.utils.printExpected(value);
	if (style === "received") return state.utils.printReceived(value);
	return String(value);
}

/** One message layout for every date matcher, symmetric for `.not`. */
export function dateMatcherResult(state: ExpectMatcherState, outcome: DateMatcherOutcome): DateMatcherResult {
	const message = (): string => {
		const hint = state.utils.matcherHint(outcome.name, undefined, undefined, { isNot: state.isNot });
		const lines = (outcome.lines?.() ?? []).filter((line): line is MessageLine => Boolean(line));
		const width = Math.max(0, ...lines.map(([label]) => label.length + 1));
		const body = lines
			.map(([label, value, style]) => `${`${label}:`.padEnd(width)} ${printValue(state, value, style)}`)
			.join("\n");
		const heading = `Expected ${outcome.subject ?? "date"} to ${state.isNot ? "not " : ""}${outcome.expectation}`;
		return `${hint}\n\n${heading}${body ? `\n\n${body}` : ""}`;
	};
	return { message, pass: outcome.pass, name: outcome.name, expected: outcome.expected, actual: outcome.actual };
}

/** The line naming the zone used to place absolute timestamps, when one was involved. */
export function zoneLine(timeZone: string, ...values: NormalizedDateTime[]): MessageLine | undefined {
	return values.some((value) => value.kind === "instant" || value.kind === "zoned")
		? ["Time zone", timeZone]
		: undefined;
}

/** Validates and normalizes a date array. */
export function normalizeDateArray(actual: unknown, minimum: 1 | 2): NormalizedDateTime[] {
	if (!Array.isArray(actual)) {
		throw new TypeError(`Invalid actual value: expected an array of dates, received ${typeof actual}`);
	}
	if (actual.length < minimum) {
		throw new Error(`Array must contain at least ${minimum === 1 ? "one date" : "two dates"}`);
	}
	return actual.map((value: unknown, index) => normalize(value, `date at index ${index}`));
}

export function indexLabels(values: readonly unknown[]): string[] {
	return values.map((_, index) => `date at index ${index}`);
}

export function rejectTimeZoneWithoutAbsolute(
	timeZone: string | undefined,
	values: readonly NormalizedDateTime[],
): void {
	if (timeZone !== undefined && !values.some((value) => value.kind === "instant" || value.kind === "zoned")) {
		throw new TypeError(
			"The timeZone option only applies to absolute timestamps; local dates and times are compared as they are",
		);
	}
}
