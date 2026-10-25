import { withMatcherState } from "@cerios/playwright-expectly-core";

import { normalize, normalizeAs } from "../date-time/inputs";
import type { ISOKind } from "../date-time/iso";
import { ISO_FORMATS, parseISOValue } from "../date-time/iso";
import type { DateTimeInput, ISODateTimeValidationOptions } from "../date-time/types";
import { validateTimeZone } from "../date-time/zones";

import { dateMatcherResult } from "./date-matcher-utils";

const OFFSET_PATTERN = /^[+-]\d{2}:\d{2}$/;
const OFFSET_LIKE = /^(?:Z|[+-]\d{2}(?::?\d{2})?)$/i;

/** Why `value` is not a valid ISO string of the given kinds, or undefined when it is. */
function isoProblem(value: unknown, kinds: readonly ISOKind[]): string | undefined {
	if (typeof value !== "string") return `expected a string, received ${value === null ? "null" : typeof value}`;
	try {
		parseISOValue(value, "value", kinds);
		return undefined;
	} catch (error) {
		return error instanceof Error ? error.message.replace(/^Invalid value: /, "") : String(error);
	}
}

function normalizeExpectedOffset(expectedOffset: string): string {
	const offset = expectedOffset === "Z" ? "+00:00" : expectedOffset;
	if (typeof offset !== "string" || !OFFSET_PATTERN.test(offset)) {
		throw new TypeError(`Invalid expected offset: ${String(expectedOffset)}. Use "Z" or "±HH:mm"`);
	}
	return offset;
}

/**
 * ISO validation and explicit zone/offset matchers. Validation shares its grammar with the
 * `isISO*()` guards and `parseISO*()` functions.
 */
export const expectlyDateValidationMatchers = withMatcherState({
	toBeValidISODate(actual: unknown) {
		const problem = isoProblem(actual, ["date"]);
		return dateMatcherResult(this, {
			name: "toBeValidISODate",
			pass: problem === undefined,
			subject: "value",
			expectation: "be a valid ISO 8601 calendar date",
			lines: () => [
				["Received", actual, "received"],
				["Expected format", ISO_FORMATS.date],
				problem !== undefined && ["Problem", problem],
			],
			actual,
		});
	},

	toBeValidISODateTime(actual: unknown, options?: ISODateTimeValidationOptions) {
		const kinds: ISOKind[] = options?.requireOffset
			? ["instant", "zonedDateTime"]
			: ["localDateTime", "instant", "zonedDateTime"];
		let problem = isoProblem(actual, kinds);
		if (problem === undefined && options?.requireOffset) {
			const parsed = parseISOValue(actual as string, "value", kinds);
			if (parsed.kind === "zonedDateTime" && parsed.offset === undefined) {
				problem = "the offset is not spelled out (only a time-zone annotation is present)";
			}
		}
		return dateMatcherResult(this, {
			name: "toBeValidISODateTime",
			pass: problem === undefined,
			subject: "value",
			expectation: `be a valid ISO 8601 datetime${options?.requireOffset ? " with an explicit offset" : ""}`,
			lines: () => [
				["Received", actual, "received"],
				["Expected format", kinds.map((kind) => ISO_FORMATS[kind]).join(" or ")],
				problem !== undefined && ["Problem", problem],
			],
			actual,
		});
	},

	toHaveTimeZone(actual: DateTimeInput, expectedTimeZone: string) {
		if (typeof expectedTimeZone === "string" && OFFSET_LIKE.test(expectedTimeZone)) {
			throw new TypeError(
				`toHaveTimeZone() expects an IANA time zone such as "Europe/Amsterdam", received the offset ${JSON.stringify(expectedTimeZone)}. Use toHaveOffset() to check offsets.`,
			);
		}
		const expectedZone = validateTimeZone(expectedTimeZone, "expected time zone");
		const received = normalizeAs(actual, "actual date", ["zoned"]);
		const zoned = received.value;
		return dateMatcherResult(this, {
			name: "toHaveTimeZone",
			// equals() compares time zones by canonical identity, so aliases such as Europe/Kiev and Europe/Kyiv match.
			pass: zoned.equals(zoned.withTimeZone(expectedZone)),
			expectation: "have time zone",
			lines: () => [
				["Expected time zone", expectedTimeZone, "expected"],
				["Received time zone", zoned.timeZoneId, "received"],
				["Received", received.display],
			],
			expected: expectedTimeZone,
			actual: zoned.timeZoneId,
		});
	},

	toHaveOffset(actual: DateTimeInput, expectedOffset: string) {
		const expected = normalizeExpectedOffset(expectedOffset);
		const received = normalize(actual, "actual date");
		if (received.kind !== "zoned" && (received.kind !== "instant" || received.offset === undefined)) {
			throw new TypeError(
				`Invalid actual date: ${JSON.stringify(received.display)} has no explicit offset. ` +
					"Offsets are only read from ISO strings with Z/±HH:mm and ZonedDateTime values; they are never inferred.",
			);
		}
		const offset = received.kind === "zoned" ? received.value.offset : (received.offset as string);
		return dateMatcherResult(this, {
			name: "toHaveOffset",
			pass: offset === expected,
			expectation: "have offset",
			lines: () => [
				["Expected offset", expected, "expected"],
				["Received offset", offset, "received"],
				["Received", received.display],
			],
			expected,
			actual: offset,
		});
	},
});
