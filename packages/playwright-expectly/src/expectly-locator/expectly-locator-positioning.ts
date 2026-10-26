import { locatorNotFoundMessage, pollLocators, withMatcherState } from "@cerios/playwright-expectly-core";
import { PollOptions } from "@cerios/playwright-expectly-core";
import type { Expect, ExpectMatcherState } from "@playwright/test";
import { expect as baseExpect, Locator } from "@playwright/test";

import type { ExpectlyMatcherResult } from "../matchers/matcher-result";

type Box = { x: number; y: number; width: number; height: number };

// Layout with transforms or zoom can report touching edges a fraction of a pixel apart.
const EDGE_TOLERANCE_PX = 0.5;

type Relation = {
	assertionName: string;
	/** "above", "below", "left of", "right of". */
	relation: string;
	/** The compared edge of the first and the second element, e.g. ["bottom", "top"]. */
	edgeNames: readonly [string, string];
	/** Returns [first edge, second edge] in page pixels. */
	edges: (box: Box, otherBox: Box) => readonly [number, number];
	/** Whether the first edge must be at or before ("before") or at or after ("after") the second edge. */
	order: "before" | "after";
	rule: string;
};

const ELEMENT_LABELS = ["First element", "Second element"] as const;
const LOCATOR_LABELS = ["first locator", "second locator"] as const;

async function positionMatcher(
	state: ExpectMatcherState,
	relation: Relation,
	locator: Locator,
	otherLocator: Locator,
	options: PollOptions | undefined,
): Promise<ExpectlyMatcherResult> {
	let hiddenIndex: number | undefined;
	let edges: readonly [number, number] | undefined;

	const { pass, snapshot } = await pollLocators(
		state,
		options,
		[locator, otherLocator],
		(actionOptions) => Promise.all([locator.boundingBox(actionOptions), otherLocator.boundingBox(actionOptions)]),
		([box, otherBox]) => {
			// A hidden element has no box, so the relation cannot be measured. Like a missing element, this keeps
			// polling and fails both the assertion and its `.not` form if the element never becomes visible.
			if (!box || !otherBox) {
				hiddenIndex = box ? 1 : 0;
				edges = undefined;
				return state.isNot;
			}
			hiddenIndex = undefined;
			edges = relation.edges(box, otherBox);
			const [first, second] = edges;
			return relation.order === "before" ? first <= second + EDGE_TOLERANCE_PX : first >= second - EDGE_TOLERANCE_PX;
		},
	);

	const message = (): string => {
		const notFound = locatorNotFoundMessage(state, relation.assertionName, snapshot, LOCATOR_LABELS);
		if (notFound) return notFound;
		const hint = state.utils.matcherHint(relation.assertionName, undefined, undefined, {
			isNot: state.isNot,
		});
		if (hiddenIndex !== undefined) {
			return `${hint}\n\nError: ${ELEMENT_LABELS[hiddenIndex]} is not visible (it has no bounding box)`;
		}
		const [firstEdge, secondEdge] = relation.edgeNames;
		const edgeLines = edges
			? `First element ${firstEdge}: ${edges[0]}px\nSecond element ${secondEdge}: ${edges[1]}px`
			: undefined;

		if (pass && state.isNot) {
			return `${hint}\n\nExpected first element to not be ${relation.relation} second element\n${edgeLines}`;
		}

		if (!pass && !state.isNot) {
			const reason = edgeLines ? `${edgeLines}\n${relation.rule}` : "The elements were not measured before the timeout";
			return `${hint}\n\nExpected first element to be ${relation.relation} second element\n${reason}`;
		}

		return hint;
	};

	return {
		message,
		pass,
		name: relation.assertionName,
	};
}

const ABOVE: Relation = {
	assertionName: "toBeAbove",
	relation: "above",
	edgeNames: ["bottom", "top"],
	edges: (box, otherBox) => [box.y + box.height, otherBox.y],
	order: "before",
	rule: "First element must end at or before second element starts",
};

const BELOW: Relation = {
	assertionName: "toBeBelow",
	relation: "below",
	edgeNames: ["top", "bottom"],
	edges: (box, otherBox) => [box.y, otherBox.y + otherBox.height],
	order: "after",
	rule: "First element must start at or after second element ends",
};

const LEFT_OF: Relation = {
	assertionName: "toBeLeftOf",
	relation: "left of",
	edgeNames: ["right edge", "left edge"],
	edges: (box, otherBox) => [box.x + box.width, otherBox.x],
	order: "before",
	rule: "First element must end at or before second element starts",
};

const RIGHT_OF: Relation = {
	assertionName: "toBeRightOf",
	relation: "right of",
	edgeNames: ["left edge", "right edge"],
	edges: (box, otherBox) => [box.x, otherBox.x + otherBox.width],
	order: "after",
	rule: "First element must start at or after second element ends",
};

/**
 * Element positioning matchers for Playwright locators.
 * These matchers validate spatial relationships between elements.
 */
export const expectlyLocatorPositioningMatchers = withMatcherState({
	async toBeAbove(locator: Locator, otherLocator: Locator, options?: PollOptions) {
		return positionMatcher(this, ABOVE, locator, otherLocator, options);
	},
	async toBeBelow(locator: Locator, otherLocator: Locator, options?: PollOptions) {
		return positionMatcher(this, BELOW, locator, otherLocator, options);
	},
	async toBeLeftOf(locator: Locator, otherLocator: Locator, options?: PollOptions) {
		return positionMatcher(this, LEFT_OF, locator, otherLocator, options);
	},
	async toBeRightOf(locator: Locator, otherLocator: Locator, options?: PollOptions) {
		return positionMatcher(this, RIGHT_OF, locator, otherLocator, options);
	},
});

export const expectlyLocatorPositioning: Expect<typeof expectlyLocatorPositioningMatchers> = baseExpect.extend(
	expectlyLocatorPositioningMatchers,
);
