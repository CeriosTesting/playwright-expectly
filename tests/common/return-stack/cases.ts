import { expect, test } from "@playwright/test";

import { withReturn } from "../../../packages/playwright-expectly/src/expectly-return";

// The same reporter fixture can verify source imports and built CJS/ESM entries.
const wrap = process.env.EXPECTLY_STACK_ENTRY
	? (require(process.env.EXPECTLY_STACK_ENTRY) as { withReturn: typeof withReturn }).withReturn
	: withReturn;
const wrapped = wrap(expect);
const options = { timeout: 30, intervals: [1] };

test("regular", () => {
	wrapped(1).toBe(2); // call:regular
});

test("poll", async () => {
	await wrapped.pollAndReturn(() => 1, options).toBe(2); // call:poll
});

test("negated", async () => {
	await wrapped.pollAndReturn(() => 1, options).not.toBe(1); // call:negated
});

test("pass", async () => {
	const assertion = wrapped(async () => {
		await Promise.resolve();
		expect(1).toBe(2);
		return 1;
	});
	await assertion.toPassAndReturn(options); // call:pass
});

test("detached", async () => {
	const matcher = wrapped.pollAndReturn(() => 1, options).toBe;
	await matcher(2); // call:detached
});

test("success", async () => {
	await wrapped.pollAndReturn(() => 1, options).toBe(1); // call:success
});
