/**
 * Shared validation patterns and utilities for text-based matchers
 */

/** Assertions always test from the start without consuming the caller's RegExp. */
export function matchesPattern(text: string, pattern: RegExp): boolean {
	// `new RegExp(undefined)` matches everything, so a string passed from JavaScript must not slip through.
	if (!(pattern instanceof RegExp)) {
		throw new TypeError(
			`Expected a RegExp pattern, got: ${typeof pattern === "string" ? JSON.stringify(pattern) : typeof pattern}`,
		);
	}
	return new RegExp(pattern.source, pattern.flags).test(text);
}

// Email validation: no whitespace, no leading, trailing or consecutive dots in the local part, and a domain of
// dot-separated labels that do not start or end with a hyphen.
const EMAIL_LOCAL_PART = /^[^\s@.]+(?:\.[^\s@.]+)*$/u;
const DOMAIN_LABEL = /^[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Alphanumeric pattern (letters and numbers only)
export const ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
const UNICODE_ALPHANUMERIC_PATTERN = /^[\p{L}\p{M}\p{N}]+$/u;

// Numeric string pattern (digits only)
export const NUMERIC_PATTERN = /^[0-9]+$/;

/** UUID versions defined by RFC 9562. */
export type UUIDVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

function uuidPattern(version: string): RegExp {
	return new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-${version}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, "i");
}

// UUID version patterns
export const UUID_PATTERNS = {
	1: uuidPattern("1"),
	2: uuidPattern("2"),
	3: uuidPattern("3"),
	4: uuidPattern("4"),
	5: uuidPattern("5"),
	6: uuidPattern("6"),
	7: uuidPattern("7"),
	8: uuidPattern("8"),
	any: uuidPattern("[1-8]"),
} as const;

// The nil and max UUIDs (RFC 9562 sections 5.9 and 5.10) are valid without a version.
const SPECIAL_UUIDS = /^(?:0{8}-0{4}-0{4}-0{4}-0{12}|f{8}-f{4}-f{4}-f{4}-f{12})$/i;

// Pre-compiled patterns for case checking (performance optimization)
const HAS_UPPERCASE_LETTER = /\p{Lu}/u;
const HAS_LOWERCASE_LETTER = /\p{Ll}/u;

/**
 * Validates if a string is a valid email address
 */
export function isValidEmail(text: string): boolean {
	if (!EMAIL_PATTERN.test(text)) return false;
	const at = text.lastIndexOf("@");
	const local = text.slice(0, at);
	const labels = text.slice(at + 1).split(".");
	return EMAIL_LOCAL_PART.test(local) && labels.length >= 2 && labels.every((label) => DOMAIN_LABEL.test(label));
}

/** Schemes whose URLs must have an authority (`scheme://host`). */
const HOST_SCHEMES = new Set(["http:", "https:", "ftp:", "ws:", "wss:"]);
const HOSTNAME_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const IPV4_ADDRESS = /^\d{1,3}(?:\.\d{1,3}){3}$/;

export const DEFAULT_URL_PROTOCOLS: readonly string[] = ["http:", "https:"];

export type UrlValidationOptions = {
	/**
	 * Accepted URL schemes, with or without the trailing colon. Defaults to `["http", "https"]`.
	 */
	protocols?: readonly string[];
};

function isValidHostname(hostname: string): boolean {
	if (hostname.startsWith("[") && hostname.endsWith("]")) return true; // IPv6, already validated by URL
	if (IPV4_ADDRESS.test(hostname)) return true; // URL rejects out-of-range octets
	// URL returns Unicode hostnames in punycode, so ASCII labels cover internationalized domains.
	return hostname.split(".").every((label) => HOSTNAME_LABEL.test(label));
}

/**
 * Validates if a string is an absolute URL with an accepted scheme (http/https by default)
 * and, for web schemes, a valid host.
 */
export function isValidUrl(text: string, options?: UrlValidationOptions): boolean {
	// URL silently strips surrounding whitespace and tabs/newlines inside, which a URL in text must not contain.
	if (/\s/.test(text)) return false;
	const protocols = (options?.protocols ?? DEFAULT_URL_PROTOCOLS).map((protocol) =>
		(protocol.endsWith(":") ? protocol : `${protocol}:`).toLowerCase(),
	);
	let url: URL;
	try {
		url = new URL(text);
	} catch {
		return false;
	}
	if (!protocols.includes(url.protocol)) return false;
	if (!HOST_SCHEMES.has(url.protocol)) return true;
	// URL repairs "http:/example.com" and "http:example.com"; require the authority to be written out.
	if (!text.slice(url.protocol.length).startsWith("//")) return false;
	return url.hostname.length > 0 && isValidHostname(url.hostname);
}

/**
 * Validates if a string contains only alphanumeric characters
 * (ASCII by default, any Unicode letter or number with `unicode`).
 */
export function isAlphanumeric(text: string, unicode = false): boolean {
	return (unicode ? UNICODE_ALPHANUMERIC_PATTERN : ALPHANUMERIC_PATTERN).test(text);
}

/**
 * Validates if a string contains only numeric digits
 */
export function isNumericString(text: string): boolean {
	return NUMERIC_PATTERN.test(text);
}

/**
 * Validates if a string is uppercase and contains at least one uppercase letter
 */
export function isUpperCase(text: string): boolean {
	return text.length > 0 && text === text.toUpperCase() && HAS_UPPERCASE_LETTER.test(text);
}

/**
 * Validates if a string is lowercase and contains at least one lowercase letter
 */
export function isLowerCase(text: string): boolean {
	return text.length > 0 && text === text.toLowerCase() && HAS_LOWERCASE_LETTER.test(text);
}

// Words are runs of letters, marks, digits and apostrophes, so "Jean-Luc" has two words and "Don't" one.
const WORD = /[\p{L}\p{M}\p{N}'’]+/gu;
const STARTS_WITH_LETTER = /^\p{L}/u;

/**
 * Converts a string to title case: the first letter of each word is capitalized. Words written in all
 * capitals (longer than two letters) are lowercased first; other inner capitals ("McDonald") are kept.
 */
export function toTitleCase(text: string): string {
	return text.replace(WORD, (word) => {
		if (!STARTS_WITH_LETTER.test(word)) return word;
		const base = word.length > 2 && !HAS_LOWERCASE_LETTER.test(word) ? word.toLowerCase() : word;
		const first = String.fromCodePoint(base.codePointAt(0)!);
		return first.toUpperCase() + base.slice(first.length);
	});
}

/**
 * Validates if a string is in title case
 */
export function isTitleCase(text: string): boolean {
	// Early exit for empty strings or strings without uppercase letters
	if (text.length === 0 || !HAS_UPPERCASE_LETTER.test(text)) {
		return false;
	}
	// Only convert to title case if initial checks pass (avoid unnecessary string allocation)
	return text === toTitleCase(text);
}

/**
 * Validates if a string is a valid UUID (optionally of a specific version)
 */
export function isValidUUID(text: string, version?: UUIDVersion): boolean {
	if (version) return UUID_PATTERNS[version].test(text);
	return UUID_PATTERNS.any.test(text) || SPECIAL_UUIDS.test(text);
}

/**
 * Gets the UUID format description for error messages
 */
export function getUUIDFormatDescription(version?: UUIDVersion): string {
	return `xxxxxxxx-xxxx-${version ?? "[1-8]"}xxx-[89ab]xxx-xxxxxxxxxxxx`;
}
