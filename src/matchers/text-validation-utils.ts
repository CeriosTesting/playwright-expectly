/**
 * Shared validation patterns and utilities for text-based matchers
 */

// Email validation pattern
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Alphanumeric pattern (letters and numbers only)
export const ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;

// Numeric string pattern (digits only)
export const NUMERIC_PATTERN = /^[0-9]+$/;

// UUID version patterns
export const UUID_PATTERNS = {
	1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
	3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
	4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
	5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
	any: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// Pre-compiled patterns for case checking (performance optimization)
const HAS_UPPERCASE_LETTER = /[A-Z]/;
const HAS_LOWERCASE_LETTER = /[a-z]/;

/**
 * Validates if a string is a valid email address
 */
export function isValidEmail(text: string): boolean {
	return EMAIL_PATTERN.test(text);
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(text: string): boolean {
	try {
		new URL(text);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates if a string contains only alphanumeric characters
 */
export function isAlphanumeric(text: string): boolean {
	return ALPHANUMERIC_PATTERN.test(text);
}

/**
 * Validates if a string contains only numeric digits
 */
export function isNumericString(text: string): boolean {
	return NUMERIC_PATTERN.test(text);
}

/**
 * Validates if a string is uppercase and contains at least one letter
 */
export function isUpperCase(text: string): boolean {
	return text.length > 0 && text === text.toUpperCase() && HAS_UPPERCASE_LETTER.test(text);
}

/**
 * Validates if a string is lowercase and contains at least one letter
 */
export function isLowerCase(text: string): boolean {
	return text.length > 0 && text === text.toLowerCase() && HAS_LOWERCASE_LETTER.test(text);
}

/**
 * Converts a string to title case (first letter of each word capitalized)
 */
export function toTitleCase(text: string): string {
	return text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
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
	const titleCased = toTitleCase(text);
	return text === titleCased;
}

/**
 * Validates if a string is a valid UUID (optionally of a specific version)
 */
export function isValidUUID(text: string, version?: 1 | 3 | 4 | 5): boolean {
	const pattern = version ? UUID_PATTERNS[version] : UUID_PATTERNS.any;
	return pattern.test(text);
}

/**
 * Gets the UUID format description for error messages
 */
export function getUUIDFormatDescription(version?: 1 | 3 | 4 | 5): string {
	return `xxxxxxxx-xxxx-${version || "[1-5]"}xxx-[89ab]xxx-xxxxxxxxxxxx`;
}
