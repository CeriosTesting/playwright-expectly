import { withMatcherState } from "@cerios/playwright-expectly-core";

import { compareDurations, formatDuration, normalizeDuration } from "../date-time/durations";
import type { DurationCompareOptions, DurationInput } from "../date-time/types";

import { dateMatcherResult } from "./date-matcher-utils";

/**
 * Duration matchers for `Temporal.Duration`, duration objects and ISO 8601 duration strings.
 * Durations with years, months or weeks require `relativeTo`; nothing is approximated.
 */
export const expectlyDurationMatchers = withMatcherState({
	toBeShorterThan(actual: DurationInput, limit: DurationInput, options?: DurationCompareOptions) {
		const received = normalizeDuration(actual, "actual duration");
		const maximum = normalizeDuration(limit, "duration limit");
		return dateMatcherResult(this, {
			name: "toBeShorterThan",
			pass: compareDurations(received, maximum, options?.relativeTo) < 0,
			subject: "duration",
			expectation: `be shorter than ${formatDuration(maximum)}`,
			lines: () => [
				["Limit", formatDuration(maximum), "expected"],
				["Received", formatDuration(received), "received"],
			],
			expected: limit,
			actual,
		});
	},

	toBeLongerThan(actual: DurationInput, limit: DurationInput, options?: DurationCompareOptions) {
		const received = normalizeDuration(actual, "actual duration");
		const minimum = normalizeDuration(limit, "duration limit");
		return dateMatcherResult(this, {
			name: "toBeLongerThan",
			pass: compareDurations(received, minimum, options?.relativeTo) > 0,
			subject: "duration",
			expectation: `be longer than ${formatDuration(minimum)}`,
			lines: () => [
				["Limit", formatDuration(minimum), "expected"],
				["Received", formatDuration(received), "received"],
			],
			expected: limit,
			actual,
		});
	},

	toBeDurationBetween(actual: DurationInput, min: DurationInput, max: DurationInput, options?: DurationCompareOptions) {
		const received = normalizeDuration(actual, "actual duration");
		const lower = normalizeDuration(min, "minimum duration");
		const upper = normalizeDuration(max, "maximum duration");
		if (compareDurations(lower, upper, options?.relativeTo) > 0) {
			throw new TypeError(`Invalid duration range: minimum ${lower.toString()} exceeds maximum ${upper.toString()}`);
		}
		return dateMatcherResult(this, {
			name: "toBeDurationBetween",
			pass:
				compareDurations(received, lower, options?.relativeTo) >= 0 &&
				compareDurations(received, upper, options?.relativeTo) <= 0,
			subject: "duration",
			expectation: "be between (inclusive)",
			lines: () => [
				["Minimum", formatDuration(lower), "expected"],
				["Maximum", formatDuration(upper), "expected"],
				["Received", formatDuration(received), "received"],
			],
			expected: { min, max },
			actual,
		});
	},
});
