import { expect as baseExpect, type ExpectMatcherState } from "@playwright/test";

import type { PollOptions } from "../types/poll-options";

export async function runPolledMatcher(
	state: ExpectMatcherState,
	options: PollOptions | undefined,
	poll: () => Promise<boolean>,
): Promise<boolean> {
	const desiredCondition = !state.isNot;

	try {
		await baseExpect
			.poll(poll, {
				timeout: options?.timeout ?? state.timeout,
				intervals: options?.intervals,
			})
			.toBe(desiredCondition);
		return desiredCondition;
	} catch {
		return !desiredCondition;
	}
}
