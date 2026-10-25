import { withMatcherState } from "@cerios/playwright-expectly-core";

import type { Point } from "../date-time/compare";
import { alignPoints, comparePoints, pointDifference } from "../date-time/compare";
import { elapsedLimit, formatElapsed } from "../date-time/durations";
import type { AbsoluteDateTime } from "../date-time/inputs";
import { normalize, normalizeAs } from "../date-time/inputs";
import type {
	DateInput,
	DurationInput,
	DurationRange,
	InstantInput,
	RelativeTimeOptions,
	TimeZoneOptions,
} from "../date-time/types";
import { currentInstant, toInstant } from "../date-time/zones";

import { dateMatcherResult } from "./date-matcher-utils";

function alignTwo(actual: unknown, expected: unknown, expectedLabel: string, timeZone?: string): [Point, Point] {
	const [left, right] = alignPoints(
		[normalize(actual, "actual date"), normalize(expected, expectedLabel)],
		["actual date", expectedLabel],
		timeZone,
	);
	return [left, right];
}

function instantText(value: AbsoluteDateTime): string {
	return value.kind === "instant" ? value.value.toString() : value.value.toInstant().toString();
}

function abs(value: bigint): bigint {
	return value < 0n ? -value : value;
}

function relation(difference: bigint): string {
	if (difference === 0n) return "equal";
	return difference > 0n ? "later" : "earlier";
}

/** Elapsed nanoseconds from the "now" of this assertion to the actual value (positive = future). */
function fromNow(
	actual: unknown,
	options: RelativeTimeOptions | undefined,
): { now: string; delta: bigint; display: string } {
	const now = currentInstant(options?.now);
	const value = normalize(actual, "actual date");
	const instant = toInstant(value, "actual date", options?.timeZone);
	return { now: now.toString(), delta: instant.epochNanoseconds - now.epochNanoseconds, display: value.display };
}

function isDurationRange(limit: DurationInput | DurationRange): limit is DurationRange {
	return typeof limit === "object" && limit !== null && ("min" in limit || "max" in limit);
}

function durationBounds(limit: DurationInput | DurationRange): { min: bigint; max?: bigint } {
	if (!isDurationRange(limit)) return { min: 0n, max: elapsedLimit(limit, "maximum duration") };
	if (limit.min === undefined && limit.max === undefined) {
		throw new TypeError("Invalid duration range: specify min, max or both");
	}
	const min = limit.min === undefined ? 0n : elapsedLimit(limit.min, "minimum duration");
	const max = limit.max === undefined ? undefined : elapsedLimit(limit.max, "maximum duration");
	if (max !== undefined && min > max) {
		throw new TypeError(`Invalid duration range: minimum ${formatElapsed(min)} exceeds maximum ${formatElapsed(max)}`);
	}
	return { min, max };
}

function windowExpectation(min: bigint, max: bigint | undefined): string {
	if (max === undefined) return `occur at least ${formatElapsed(min)} after the start`;
	if (min === 0n) return `occur within ${formatElapsed(max)} after the start`;
	return `occur between ${formatElapsed(min)} and ${formatElapsed(max)} after the start`;
}

/**
 * Chronological date matchers: ordering, closeness, relative time windows and elapsed time.
 */
export const expectlyDateChronologyMatchers = withMatcherState({
	toBeDateCloseTo(actual: DateInput, expected: DateInput, deviation: DurationInput, options?: TimeZoneOptions) {
		const [received, target] = alignTwo(actual, expected, "expected date", options?.timeZone);
		const allowed = elapsedLimit(deviation, "deviation");
		const difference = pointDifference(target, received);
		return dateMatcherResult(this, {
			name: "toBeDateCloseTo",
			pass: abs(difference) <= allowed,
			expectation: "be close to the expected date within the allowed deviation",
			lines: () => [
				["Expected", target.display, "expected"],
				["Received", received.display, "received"],
				["Difference", `${formatElapsed(abs(difference))} (${relation(difference)})`],
				["Allowed deviation", `±${formatElapsed(allowed)}`],
			],
			expected,
			actual,
		});
	},

	toBeBefore(actual: DateInput, expected: DateInput, options?: TimeZoneOptions) {
		const [received, target] = alignTwo(actual, expected, "expected date", options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeBefore",
			pass: comparePoints(received, target) < 0,
			expectation: "be before",
			lines: () => [
				["Expected", target.display, "expected"],
				["Received", received.display, "received"],
			],
			expected,
			actual,
		});
	},

	toBeAfter(actual: DateInput, expected: DateInput, options?: TimeZoneOptions) {
		const [received, target] = alignTwo(actual, expected, "expected date", options?.timeZone);
		return dateMatcherResult(this, {
			name: "toBeAfter",
			pass: comparePoints(received, target) > 0,
			expectation: "be after",
			lines: () => [
				["Expected", target.display, "expected"],
				["Received", received.display, "received"],
			],
			expected,
			actual,
		});
	},

	toBeBetween(actual: DateInput, startDate: DateInput, endDate: DateInput, options?: TimeZoneOptions) {
		const [received, start, end] = alignPoints(
			[normalize(actual, "actual date"), normalize(startDate, "start date"), normalize(endDate, "end date")],
			["actual date", "start date", "end date"],
			options?.timeZone,
		);
		if (comparePoints(start, end) > 0) {
			throw new TypeError(`Invalid range: start date ${start.display} is after end date ${end.display}`);
		}
		return dateMatcherResult(this, {
			name: "toBeBetween",
			pass: comparePoints(received, start) >= 0 && comparePoints(received, end) <= 0,
			expectation: "be between (inclusive)",
			lines: () => [
				["Start", start.display, "expected"],
				["End", end.display, "expected"],
				["Received", received.display, "received"],
			],
			expected: { start: startDate, end: endDate },
			actual,
		});
	},

	toBeSameInstant(actual: InstantInput, expected: InstantInput) {
		const received = normalizeAs(actual, "actual date", ["instant", "zoned"]);
		const target = normalizeAs(expected, "expected date", ["instant", "zoned"]);
		const difference = received.value.epochNanoseconds - target.value.epochNanoseconds;
		return dateMatcherResult(this, {
			name: "toBeSameInstant",
			pass: difference === 0n,
			expectation: "be the same instant",
			lines: () => [
				["Expected", target.display, "expected"],
				["Received", received.display, "received"],
				["Expected instant", instantText(target)],
				["Received instant", instantText(received)],
				difference !== 0n && ["Difference", `${formatElapsed(abs(difference))} (${relation(difference)})`],
			],
			expected,
			actual,
		});
	},

	toBeInThePast(actual: DateInput, options?: RelativeTimeOptions) {
		const { now, delta, display } = fromNow(actual, options);
		return dateMatcherResult(this, {
			name: "toBeInThePast",
			pass: delta < 0n,
			expectation: "be in the past",
			lines: () => [
				["Now", now, "expected"],
				["Received", display, "received"],
			],
			actual,
		});
	},

	toBeInTheFuture(actual: DateInput, options?: RelativeTimeOptions) {
		const { now, delta, display } = fromNow(actual, options);
		return dateMatcherResult(this, {
			name: "toBeInTheFuture",
			pass: delta > 0n,
			expectation: "be in the future",
			lines: () => [
				["Now", now, "expected"],
				["Received", display, "received"],
			],
			actual,
		});
	},

	toBeWithinLast(actual: DateInput, duration: DurationInput, options?: RelativeTimeOptions) {
		const limit = elapsedLimit(duration, "duration");
		const { now, delta, display } = fromNow(actual, options);
		const elapsed = -delta;
		return dateMatcherResult(this, {
			name: "toBeWithinLast",
			pass: elapsed >= 0n && elapsed <= limit,
			expectation: `be within the last ${formatElapsed(limit)}`,
			lines: () => [
				["Now", now, "expected"],
				["Received", display, "received"],
				elapsed >= 0n ? ["Elapsed", formatElapsed(elapsed)] : ["In the future by", formatElapsed(-elapsed)],
				["Maximum", formatElapsed(limit)],
			],
			expected: duration,
			actual,
		});
	},

	toBeWithinNext(actual: DateInput, duration: DurationInput, options?: RelativeTimeOptions) {
		const limit = elapsedLimit(duration, "duration");
		const { now, delta, display } = fromNow(actual, options);
		return dateMatcherResult(this, {
			name: "toBeWithinNext",
			pass: delta >= 0n && delta <= limit,
			expectation: `be within the next ${formatElapsed(limit)}`,
			lines: () => [
				["Now", now, "expected"],
				["Received", display, "received"],
				delta >= 0n ? ["Remaining", formatElapsed(delta)] : ["In the past by", formatElapsed(-delta)],
				["Maximum", formatElapsed(limit)],
			],
			expected: duration,
			actual,
		});
	},

	toBeWithinDurationAfter(
		actual: DateInput,
		start: DateInput,
		limit: DurationInput | DurationRange,
		options?: TimeZoneOptions,
	) {
		const { min, max } = durationBounds(limit);
		const [received, origin] = alignTwo(actual, start, "start date", options?.timeZone);
		const elapsed = pointDifference(origin, received);
		return dateMatcherResult(this, {
			name: "toBeWithinDurationAfter",
			pass: elapsed >= min && (max === undefined || elapsed <= max),
			subject: "event",
			expectation: windowExpectation(min, max),
			lines: () => [
				["Start", origin.display, "expected"],
				["Actual", received.display, "received"],
				["Elapsed", `${formatElapsed(elapsed)}${elapsed < 0n ? " (before the start)" : ""}`],
				min > 0n && ["Minimum", formatElapsed(min)],
				max !== undefined && ["Maximum", formatElapsed(max)],
			],
			expected: limit,
			actual,
		});
	},
});
