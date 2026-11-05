import type { ExpectMatcherState } from "@playwright/test";

/*
 * Notes appended to a matcher's failure message, keyed by the matcher invocation: Playwright creates a fresh
 * `ExpectMatcherState` for every call. This lets shared helpers such as polling explain what happened without
 * every matcher threading that through its own message. `withMatcherState` appends the notes.
 */
const notes = new WeakMap<ExpectMatcherState, string[]>();

export function addMatcherNote(state: ExpectMatcherState, note: string): void {
	const existing = notes.get(state);
	if (existing) existing.push(note);
	else notes.set(state, [note]);
}

/** Returns and clears the notes for this invocation. */
export function takeMatcherNotes(state: ExpectMatcherState): string[] {
	const existing = notes.get(state);
	notes.delete(state);
	return existing ?? [];
}
