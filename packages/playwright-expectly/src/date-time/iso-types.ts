/**
 * Compile-time ISO 8601 string types.
 *
 * These types are structural: they reject malformed literals such as `"2026-13-25"`, `"25-10-2026"`
 * or `"2026-10-25T29:00:00"`, but they cannot prove that a calendar date exists (`"2026-02-30"`).
 * To keep type checking fast (and avoid TS2590), only month and day (dates), hour and minute (times)
 * and hour (datetimes) are range-checked; years and remaining components are numeric holes.
 * Always pair them with runtime validation: the `parseISO*()` functions and `isISO*()` guards.
 */

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Month = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12";
type Day = `0${Exclude<Digit, "0">}` | `${1 | 2}${Digit}` | "30" | "31";
type Hour = `${0 | 1}${Digit}` | "20" | "21" | "22" | "23";
type Minute = `${0 | 1 | 2 | 3 | 4 | 5}${Digit}`;
type Offset = "Z" | `${"+" | "-"}${number}:${number}`;

/** A calendar date: `YYYY-MM-DD`. */
export type ISODateString = `${number}-${Month}-${Day}`;

/** A time of day: `HH:mm`, `HH:mm:ss` or `HH:mm:ss.fffffffff`. */
export type ISOTimeString = `${Hour}:${Minute}` | `${Hour}:${Minute}:${number}`;

/** A date and wall-clock time without offset or time zone: `YYYY-MM-DDTHH:mm:ss[.fffffffff]`. */
export type ISOLocalDateTimeString = `${number}-${number}-${number}T${Hour}:${number}:${number}`;

/** An absolute timestamp with `Z` or a numeric offset: `YYYY-MM-DDTHH:mm:ss[.fffffffff](Z|±HH:mm)`. */
export type ISOInstantString = `${ISOLocalDateTimeString}${Offset}`;

/** A datetime with an IANA time-zone annotation: `YYYY-MM-DDTHH:mm:ss[.fffffffff][±HH:mm][Area/City]`. */
export type ISOZonedDateTimeString = `${ISOLocalDateTimeString}${"" | Offset}[${string}]`;

export type ISODateTimeString = ISOLocalDateTimeString | ISOInstantString | ISOZonedDateTimeString;

export type SupportedISOString = ISODateString | ISODateTimeString;

declare const validatedISO: unique symbol;

/** Only obtainable from a `parseISO*()` function or `isISO*()` guard, after runtime validation. */
type Validated<T extends string, Kind extends string> = T & { readonly [validatedISO]: Kind };

export type ValidatedISODate = Validated<ISODateString, "date">;
export type ValidatedISOTime = Validated<ISOTimeString, "time">;
export type ValidatedISOLocalDateTime = Validated<ISOLocalDateTimeString, "localDateTime">;
export type ValidatedISOInstant = Validated<ISOInstantString, "instant">;
export type ValidatedISOZonedDateTime = Validated<ISOZonedDateTimeString, "zonedDateTime">;
/** Any validated datetime: local, instant or zoned. */
export type ValidatedISODateTime = ValidatedISOLocalDateTime | ValidatedISOInstant | ValidatedISOZonedDateTime;

/**
 * Literal-aware argument check: a dynamic `string` is accepted (validated at runtime), a string
 * literal must structurally match `Pattern`, otherwise the parameter type becomes a readable error.
 */
export type ISOLiteral<S extends string, Pattern extends string, Description extends string> = string extends S
	? S
	: S extends Pattern
		? S
		: `"${S}" is not a valid ${Description}`;
