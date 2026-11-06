import { errors, type ExpectMatcherState, type Locator, test } from "@playwright/test";

import type { PollOptions } from "../types/poll-options";

import { addMatcherNote } from "./matcher-notes";

/** Playwright's default `expect.poll()` intervals. */
const DEFAULT_POLL_INTERVALS = [100, 250, 500, 1000];

const REACHED = Symbol("reached");
const TIMED_OUT = Symbol("timedOut");
const CLOSED = Symbol("closed");
const SLEPT = Symbol("slept");

/** Something polling reads from that emits `close`, such as a Page or BrowserContext. */
export type Closeable = {
	once(event: "close", listener: () => void): unknown;
	off(event: "close", listener: () => void): unknown;
};

/** How `runPolledMatcher` polls, besides the timing in `PollOptions`. */
export type PolledMatcherOptions = {
	/** The page or browser context being read. Polling stops at once when it closes; see `runPolledMatcher`. */
	target?: Closeable;
	/**
	 * Poll until `poll` returns this value, instead of `true` (or `false` under `.not`). For conditions whose
	 * `.not` form must also wait for the full timeout, such as "the content never settled".
	 */
	until?: boolean;
	/**
	 * When the next interval would cross the deadline, wait out the remaining time, still watching for `target`
	 * to close, instead of giving up right away as `expect.poll()` does. For conditions that make a claim about
	 * the whole timeout, such as "the content never settled". There is no further read after this wait.
	 */
	waitFullTimeout?: boolean;
};

/** Hands out the poll intervals in order (Playwright's defaults unless given); the last one repeats. */
function intervalSequence(intervals: readonly number[] = DEFAULT_POLL_INTERVALS): () => number {
	const queue = [...intervals];
	const last = queue.pop() ?? 1000;
	return (): number => queue.shift() ?? last;
}

/**
 * Races `promise` against a timer that resolves with `elapsed`. The timer is cleared however the race ends, so
 * one that lost cannot keep a standalone Node process alive.
 */
async function raceTimer<T, E>(promise: Promise<T>, ms: number, elapsed: E): Promise<T | E> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			promise,
			new Promise<E>((resolve) => {
				timer = setTimeout(() => resolve(elapsed), ms);
			}),
		]);
	} finally {
		clearTimeout(timer);
	}
}

/** Resolves `closed` once `target` emits `close`; `stop` removes the listener again. */
function watchClose(target: Closeable | undefined): { closed: Promise<typeof CLOSED>; stop: () => void } {
	let onClose = (): void => {};
	const closed = new Promise<typeof CLOSED>((resolve) => {
		onClose = (): void => resolve(CLOSED);
		target?.once("close", onClose);
	});
	return {
		closed,
		stop: (): void => {
			target?.off("close", onClose);
		},
	};
}

type PollOutcome = typeof REACHED | typeof TIMED_OUT | typeof CLOSED;

/** Calls `poll` until it returns `desiredCondition`, the deadline passes, or `closed` resolves. */
async function pollUntil(
	poll: () => Promise<boolean>,
	desiredCondition: boolean,
	deadline: number,
	nextInterval: () => number,
	closed: Promise<typeof CLOSED>,
	waitFullTimeout: boolean,
): Promise<PollOutcome> {
	while (!deadline || performance.now() < deadline) {
		const read = Promise.race([Promise.resolve().then(poll), closed]);
		// A deadline of 0 waits forever.
		const result = await (deadline ? raceTimer(read, Math.max(0, deadline - performance.now()), TIMED_OUT) : read);
		if (result === TIMED_OUT || result === CLOSED) return result;
		if (result === desiredCondition) return REACHED;
		const interval = nextInterval();
		const remaining = deadline ? deadline - performance.now() : Infinity;
		if (remaining <= interval) {
			// Like expect.poll(), give up instead of sleeping past the deadline, unless the full timeout must be observed.
			return waitFullTimeout ? raceTimer(closed, Math.max(0, remaining), TIMED_OUT) : TIMED_OUT;
		}
		if ((await raceTimer(closed, interval, SLEPT)) === CLOSED) return CLOSED;
	}
	return TIMED_OUT;
}

/** The test's timeout when the current test has just timed out, which is why Playwright closed its pages. */
function exceededTestTimeout(): number | undefined {
	try {
		const info = test.info();
		return info.status === "timedOut" ? info.timeout : undefined;
	} catch {
		// Not inside a running test.
		return undefined;
	}
}

/** The note a matcher appends to its failure message when polling stopped because the target closed. */
function closedNote(target: Closeable | undefined, started: number, timeout: number): string {
	const elapsed = `${Math.round(performance.now() - started)}ms${timeout ? ` of ${timeout}ms` : ""}`;
	const what = target && "pages" in target ? "browser context" : "page";
	const testTimeout = exceededTestTimeout();
	const reason = testTimeout === undefined ? "" : ` because the test timeout of ${testTimeout}ms was exceeded`;
	return `Polling stopped after ${elapsed}: the ${what} was closed${reason}.`;
}

/** The note a matcher appends to its failure message when polling ended before anything was read. */
function noReadNote(outcome: PollOutcome, timeout: number): string {
	const when = outcome === CLOSED ? "before polling stopped" : `within the ${timeout}ms timeout`;
	return `The first read did not finish ${when}; any received value shown above was not read from the page.`;
}

/**
 * Polls until `poll` returns the desired condition (`true`, or `false` under `.not`, unless `until` says
 * otherwise). A timeout yields the undesired condition; an error thrown by `poll` is rethrown unchanged.
 *
 * Mirrors the timing of `expect.poll()` unless `waitFullTimeout` is set, but is deliberately not built on it:
 * every Playwright `expect` call is reported as a test step, so polling with it would nest a "poll toBe" step,
 * plus a "toBe" step per attempt, under the matcher's own step.
 *
 * When `target` (the page or context being read) closes, polling stops at once with the undesired condition,
 * so the matcher reports the last value it saw, and a note saying why polling stopped early is appended to
 * its failure message (see `withMatcherState`). Playwright closes the page when the test times out; stopping
 * right then lets the matcher's own failure be recorded next to the test timeout, as Playwright's built-in
 * matchers do. Otherwise the loop would only notice the closed page at its next read, after the test has
 * already been reported, and the report would show nothing but "Test timeout exceeded".
 *
 * Matchers report their initial value when polling ends before the first `poll` call finishes, such as
 * `Received: 0`. A note appended to the failure message says that this value was not read from the page.
 */
export async function runPolledMatcher(
	state: ExpectMatcherState,
	options: PollOptions | undefined,
	poll: () => Promise<boolean>,
	{ target, until: desiredCondition = !state.isNot, waitFullTimeout = false }: PolledMatcherOptions = {},
): Promise<boolean> {
	const timeout = options?.timeout ?? state.timeout;
	const started = performance.now();
	// Zero means "no timeout", as for expect.poll().
	const deadline = timeout ? started + timeout : 0;
	const { closed, stop } = watchClose(target);
	let readFinished = false;

	try {
		const outcome = await pollUntil(
			async () => {
				const result = await poll();
				readFinished = true;
				return result;
			},
			desiredCondition,
			deadline,
			intervalSequence(options?.intervals),
			closed,
			waitFullTimeout,
		);
		if (outcome === CLOSED) addMatcherNote(state, closedNote(target, started, timeout));
		if (!readFinished) addMatcherNote(state, noReadNote(outcome, timeout));
		return outcome === REACHED ? desiredCondition : !desiredCondition;
	} finally {
		stop();
	}
}

/** The last state seen while polling locators: either all elements were found, or one was missing. */
export type LocatorSnapshot<T> = { found: true; value: T } | { found: false; missingIndex: number };

export type LocatorPollResult<T> = {
	/** Already accounts for missing elements: a missing element fails both the assertion and its `.not` form. */
	pass: boolean;
	/** Undefined only when polling ended before the first read completed. */
	snapshot: LocatorSnapshot<T> | undefined;
};

function isTimeoutError(error: unknown): boolean {
	return error instanceof errors.TimeoutError || (error instanceof Error && error.name === "TimeoutError");
}

/**
 * Whether `locator` matches at least one element, without blocking. A visible first match settles it with
 * `isVisible()`, a getter that reporters leave out. Only hidden or missing elements need `count()`, which
 * is reported as a "Query count" step. `.first()` keeps this probe out of strict mode, so multiple matches
 * still fail in the matcher's own (strict) read, with the same error as before.
 */
export async function hasElements(locator: Locator): Promise<boolean> {
	return (await locator.first().isVisible()) || (await locator.count()) > 0;
}

/** Throws a clear TypeError when a locator-only matcher receives something other than a Locator. */
export function assertLocators(locators: readonly unknown[]): asserts locators is readonly Locator[] {
	for (const locator of locators) {
		if (typeof locator !== "object" || locator === null || typeof (locator as Partial<Locator>).count !== "function") {
			throw new TypeError(
				`This matcher needs a Playwright Locator, got: ${locator === null ? "null" : typeof locator}`,
			);
		}
	}
}

/**
 * Polls a read of one or more locators, with Playwright's semantics for missing elements: polling
 * continues until the element appears, and if it never does, both the assertion and its `.not` form fail
 * with "element(s) not found". Elements are counted first, so a missing element never blocks inside an
 * action. Actions get the remaining assertion time, so `actionTimeout` cannot cut the assertion short.
 * Strict mode violations and other errors are rethrown.
 */
export async function pollLocators<T>(
	state: ExpectMatcherState,
	options: PollOptions | undefined,
	locators: readonly Locator[],
	read: (actionOptions: { timeout: number }) => Promise<T>,
	check: (value: T) => boolean,
): Promise<LocatorPollResult<T>> {
	assertLocators(locators);
	const timeout = options?.timeout ?? state.timeout;
	const deadline = timeout ? Date.now() + timeout : 0;
	// Returning the undesired condition keeps polling, for the assertion and for its `.not` form.
	const keepPolling = state.isNot;
	let snapshot: LocatorSnapshot<T> | undefined;

	const pass = await runPolledMatcher(
		state,
		options,
		async () => {
			for (const [index, locator] of locators.entries()) {
				if (!(await hasElements(locator))) {
					snapshot = { found: false, missingIndex: index };
					return keepPolling;
				}
			}
			try {
				// Zero means "no timeout" for Playwright actions, matching a disabled assertion timeout.
				const value = await read({ timeout: deadline ? Math.max(1, deadline - Date.now()) : 0 });
				snapshot = { found: true, value };
				return check(value);
			} catch (error) {
				// The element detached between counting and reading.
				if (isTimeoutError(error)) {
					snapshot = { found: false, missingIndex: 0 };
					return keepPolling;
				}
				throw error;
			}
		},
		{ target: locators[0]?.page() },
	);

	return { pass, snapshot };
}

/**
 * The failure message for a locator that never resolved, because an element was missing or no read finished,
 * or undefined when a value was read. `labels` names the locators when a matcher takes more than one.
 */
export function locatorNotFoundMessage(
	state: ExpectMatcherState,
	assertionName: string,
	snapshot: LocatorSnapshot<unknown> | undefined,
	labels?: readonly string[],
): string | undefined {
	if (snapshot?.found) return undefined;
	const hint = state.utils.matcherHint(assertionName, undefined, undefined, { isNot: state.isNot });
	// `runPolledMatcher` appends the reason as a note.
	if (!snapshot) return `${hint}\n\nNo value was received.`;
	const which = labels?.[snapshot.missingIndex];
	return `${hint}\n\nError: element(s) not found${which ? ` (${which})` : ""}`;
}
