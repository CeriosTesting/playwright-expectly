/**
 * Builds poll options for expect.poll() calls, using Playwright's defaults
 * when custom values are not provided.
 *
 * @param customTimeout - Optional custom timeout override
 * @param customIntervals - Optional custom polling intervals
 * @returns Poll options object with optional timeout and intervals
 */
export function buildPollOptions(
	customTimeout?: number,
	customIntervals?: number[]
): { timeout?: number; intervals?: number[] } {
	const pollOptions: { timeout?: number; intervals?: number[] } = {};
	if (customTimeout !== undefined) {
		pollOptions.timeout = customTimeout;
	}
	if (customIntervals) {
		pollOptions.intervals = customIntervals;
	}
	return pollOptions;
}
