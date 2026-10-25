import type { Instant, PlainDate, PlainDateTime, PlainTime, ZonedDateTime } from "./temporal";
import { getTemporal } from "./temporal";

export type ISOKind = "date" | "time" | "localDateTime" | "instant" | "zonedDateTime";

export type ParsedISO =
	| { kind: "date"; value: PlainDate }
	| { kind: "time"; value: PlainTime }
	| { kind: "localDateTime"; value: PlainDateTime }
	| { kind: "instant"; value: Instant; offset: string }
	| { kind: "zonedDateTime"; value: ZonedDateTime; offset?: string };

// The accepted grammar is a strict subset of what Temporal parses: extended format only, uppercase
// `T`/`Z`, `HH:mm` offsets, a single time-zone annotation and no calendar annotations.
const DATE = String.raw`\d{4}-\d{2}-\d{2}`;
const TIME = String.raw`\d{2}:\d{2}:(\d{2})(?:\.\d{1,9})?`;
const OFFSET = String.raw`Z|[+-]\d{2}:\d{2}`;
const ZONE = String.raw`\[([A-Za-z0-9_/+:-]+)\]`;

const PATTERNS: Record<ISOKind, RegExp> = {
	date: new RegExp(`^${DATE}$`),
	time: new RegExp(String.raw`^\d{2}:\d{2}(?::(\d{2})(?:\.\d{1,9})?)?$`),
	localDateTime: new RegExp(`^${DATE}T${TIME}$`),
	instant: new RegExp(`^${DATE}T${TIME}(${OFFSET})$`),
	zonedDateTime: new RegExp(`^${DATE}T${TIME}(${OFFSET})?${ZONE}$`),
};

const KIND_ORDER: readonly ISOKind[] = ["date", "time", "localDateTime", "instant", "zonedDateTime"];

export const ISO_FORMATS: Record<ISOKind, string> = {
	date: "ISO date (YYYY-MM-DD)",
	time: "ISO time (HH:mm[:ss[.fffffffff]])",
	localDateTime: "ISO local datetime (YYYY-MM-DDTHH:mm:ss[.fffffffff])",
	instant: "ISO instant (YYYY-MM-DDTHH:mm:ss[.fffffffff] followed by Z or ±HH:mm)",
	zonedDateTime: "ISO zoned datetime (YYYY-MM-DDTHH:mm:ss[.fffffffff][±HH:mm][Area/City])",
};

function normalizeOffset(offset: string): string {
	return offset === "Z" ? "+00:00" : offset;
}

function interpret(kind: ISOKind, value: string, match: RegExpExecArray): ParsedISO {
	// Temporal silently maps a leap second (:60) to :59; reject it like every other impossible time.
	if (match[1] !== undefined && Number(match[1]) > 59) throw new RangeError(`second ${match[1]} is out of range`);
	const T = getTemporal();
	switch (kind) {
		case "date":
			return { kind, value: T.PlainDate.from(value) };
		case "time":
			return { kind, value: T.PlainTime.from(value) };
		case "localDateTime":
			return { kind, value: T.PlainDateTime.from(value) };
		case "instant":
			if (match[2] === "-00:00") throw new RangeError("the unknown-offset marker -00:00 is not a valid offset");
			return { kind, value: T.Instant.from(value), offset: normalizeOffset(match[2]) };
		case "zonedDateTime": {
			if (match[2] === "-00:00") throw new RangeError("the unknown-offset marker -00:00 is not a valid offset");
			const parsed = T.ZonedDateTime.from(value, { offset: "reject", disambiguation: "reject" });
			return { kind, value: parsed, offset: match[2] === undefined ? undefined : normalizeOffset(match[2]) };
		}
	}
}

/**
 * Strictly parses a supported ISO string into a Temporal value.
 * @throws TypeError describing the expected format, or the semantic reason (e.g. an impossible date).
 */
export function parseISOValue(value: string, label: string, kinds: readonly ISOKind[] = KIND_ORDER): ParsedISO {
	const kind = kinds.find((candidate) => PATTERNS[candidate].test(value));
	const expected = kinds.map((candidate) => ISO_FORMATS[candidate]).join(" or ");
	if (kind === undefined) {
		throw new TypeError(`Invalid ${label}: ${JSON.stringify(value)} is not a supported ${expected}`);
	}
	try {
		return interpret(kind, value, PATTERNS[kind].exec(value) as RegExpExecArray);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new TypeError(`Invalid ${label}: ${JSON.stringify(value)} is not a valid ${ISO_FORMATS[kind]}: ${reason}`);
	}
}

/** Returns the parsed value, or undefined for anything that is not a valid string of the given kinds. */
export function tryParseISO(value: unknown, kinds: readonly ISOKind[]): ParsedISO | undefined {
	if (typeof value !== "string") return undefined;
	try {
		return parseISOValue(value, "value", kinds);
	} catch {
		return undefined;
	}
}
