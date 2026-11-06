import { EventEmitter } from "node:events";

import { runPolledMatcher } from "@cerios/playwright-expectly-core";
import { expect, type ExpectMatcherState, type Locator, test } from "@playwright/test";

import { getRejectedError } from "../../../../tests/common/assertion-utils";
import { expectlyLocator } from "../../src/expectly-locator";

// Regression tests for how polled locator matchers resolve elements: missing elements, `actionTimeout`,
// strict mode and hidden elements.

test.describe("locator polling - missing elements", () => {
	// Playwright's own locator assertions fail both forms with "element(s) not found", e.g.
	// `expect(absent).not.toHaveAttribute("href", "/x")`.
	const missingElementCases: Array<[string, (absent: Locator) => Promise<unknown>]> = [
		["not.toHaveHref", (absent) => expectlyLocator(absent).not.toHaveHref("/x")],
		["not.toHaveDataAttribute", (absent) => expectlyLocator(absent).not.toHaveDataAttribute("role")],
		["not.toBeRequired", (absent) => expectlyLocator(absent).not.toBeRequired()],
		["not.toStartWith", (absent) => expectlyLocator(absent).not.toStartWith("a")],
		["not.toBeUUID", (absent) => expectlyLocator(absent).not.toBeUUID()],
		["not.toHaveDirectText", (absent) => expectlyLocator(absent).not.toHaveDirectText("a")],
		["toHaveHref", (absent) => expectlyLocator(absent).toHaveHref("/x")],
		["toBeValidEmail", (absent) => expectlyLocator(absent).toBeValidEmail()],
	];

	for (const [name, assertion] of missingElementCases) {
		test(`${name} should fail with "element(s) not found", like Playwright`, async ({ page }) => {
			await page.setContent("<div></div>");
			const error = await getRejectedError(assertion(page.locator("#absent")));
			expect(error.message).toContain("element(s) not found");
			expect(error.message).not.toContain("attribute");
		});
	}

	test("should fail .not.toBeStable on a missing element", async ({ page }) => {
		await page.setContent("<div></div>");
		const error = await getRejectedError(
			expectlyLocator(page.locator("#absent")).not.toBeStable({ timeout: 400, stabilityDuration: 100 }),
		);
		expect(error.message).toContain("Locator was not found");
	});

	test("should keep polling until a missing element appears", async ({ page }) => {
		await page.setContent(`
			<div id="host"></div>
			<script>
				setTimeout(() => {
					document.getElementById('host').innerHTML = '<a id="late" href="/late">Late</a>';
				}, 300);
			</script>
		`);
		await expectlyLocator(page.locator("#late")).toHaveHref("/late", { timeout: 3000 });
	});
});

test.describe("locator polling - actionTimeout", () => {
	test.use({ actionTimeout: 100 });

	test("should honour the assertion timeout when actionTimeout is shorter", async ({ page }) => {
		await page.setContent(`
			<div id="host"></div>
			<script>
				setTimeout(() => {
					document.getElementById('host').innerHTML = '<input id="late" placeholder="Name" />';
				}, 500);
			</script>
		`);
		await expectlyLocator(page.locator("#late")).toHavePlaceholder("Name", { timeout: 3000 });
	});

	test("should honour the assertion timeout for text matchers when actionTimeout is shorter", async ({ page }) => {
		await page.setContent(`
			<div id="host"></div>
			<script>
				setTimeout(() => {
					document.getElementById('host').innerHTML = '<span id="late">HELLO</span>';
				}, 500);
			</script>
		`);
		await expectlyLocator(page.locator("#late")).toBeUpperCase({ timeout: 3000 });
	});
});

test.describe("locator polling - strict mode", () => {
	test("should throw a strict mode violation instead of retrying", async ({ page }) => {
		await page.setContent('<a href="/a">A</a><a href="/b">B</a>');
		const error = await getRejectedError(expectlyLocator(page.locator("a")).not.toHaveHref("/c", { timeout: 2000 }));
		expect(error.message).toMatch(/strict mode violation/);
		// The element-existence probe is not strict; the violation comes from the matcher's own read.
		expect(error.message).toMatch(/^locator\.getAttribute:/);
	});

	test("should throw a strict mode violation for multiple hidden matches", async ({ page }) => {
		await page.setContent('<a href="/a" hidden>A</a><a href="/b" hidden>B</a>');
		const error = await getRejectedError(expectlyLocator(page.locator("a")).toHaveHref("/a", { timeout: 2000 }));
		expect(error.message).toMatch(/^locator\.getAttribute: Error: strict mode violation/);
	});
});

test.describe("locator polling - positioning", () => {
	test.beforeEach(async ({ page }) => {
		await page.setContent(`
			<div id="top" style="height: 50px">Top</div>
			<div id="bottom" style="height: 50px">Bottom</div>
			<div id="hidden" style="display: none">Hidden</div>
		`);
	});

	test("should explain that the other element is hidden", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("#top")).toBeAbove(page.locator("#hidden"), { timeout: 300 }),
		);
		expect(error.message).toContain("Second element is not visible");
		expect(error.message).not.toContain("undefined");
	});

	test("should not pass .not when an element is hidden, as nothing was compared", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("#top")).not.toBeAbove(page.locator("#hidden"), { timeout: 300 }),
		);
		expect(error.message).toContain("Second element is not visible");
	});

	test("should explain which element is missing", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("#absent")).toBeAbove(page.locator("#bottom"), { timeout: 300 }),
		);
		expect(error.message).toContain("element(s) not found (first locator)");
	});

	test("should treat touching edges within half a pixel as positioned", async ({ page }) => {
		await page.setContent(`
			<div id="a" style="position: absolute; top: 0; height: 10.3px; width: 10px"></div>
			<div id="b" style="position: absolute; top: 10px; height: 10px; width: 10px"></div>
		`);
		await expectlyLocator(page.locator("#a")).toBeAbove(page.locator("#b"));
	});

	test("should print real edge values for below", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("#top")).toBeBelow(page.locator("#bottom"), { timeout: 300 }),
		);
		expect(error.message).toMatch(/First element top: \d/);
		expect(error.message).not.toMatch(/: -\d/);
	});
});

test.describe("locator polling - receivers", () => {
	test("locator-only matchers explain a non-locator receiver", async () => {
		const error = await getRejectedError(expectlyLocator("HELLO" as unknown as Locator).toBeUpperCase());
		expect(error.message).toContain("needs a Playwright Locator, got: string");
		const notLocator = "x" as unknown as Locator;
		for (const assertion of [
			expectlyLocator(notLocator).toBeStable(),
			expectlyLocator(notLocator).toHaveCountVisible(1),
			expectlyLocator(notLocator).toHaveCountGreaterThan(0),
			expectlyLocator(notLocator).toHaveTextsInAscendingOrder(),
		]) {
			expect((await getRejectedError(assertion)).message).toContain("needs a Playwright Locator");
		}
	});
});

test.describe("locator polling - small fixes", () => {
	test("toHaveDirectText should normalize the expected text like the received text", async ({ page }) => {
		await page.setContent("<div id='t'>  a   b  </div>");
		await expectlyLocator(page.locator("#t")).toHaveDirectText(" a  b ");
	});

	test("toHaveDataAttribute should print regex expectations", async ({ page }) => {
		await page.setContent("<div id='t' data-role='user'></div>");
		const error = await getRejectedError(
			expectlyLocator(page.locator("#t")).toHaveDataAttribute("role", /admin/, { timeout: 200 }),
		);
		expect(error.message).toContain("/admin/");
		expect(error.message).not.toContain("{}");
	});

	test("toHaveCountVisible should reject an impossible count", async ({ page }) => {
		await page.setContent("<p>One</p>");
		const error = await getRejectedError(expectlyLocator(page.locator("p")).not.toHaveCountVisible(-1));
		expect(error.message).toContain("count must be a non-negative integer");
	});
});

test.describe("locator polling - page closed while polling", () => {
	test("should stop at once and report the last value seen", async ({ page }) => {
		await page.setContent("<div>one</div>");
		// Attach the handler before closing: the rejection arrives while close() is still pending.
		const rejected = getRejectedError(expectlyLocator(page.locator("div")).toStartWith("never", { timeout: 10000 }));
		await page.waitForTimeout(300);
		const closedAt = Date.now();
		await page.close();
		const error = await rejected;
		// This is what lets the matcher's result reach the report when a test timeout closes the page.
		expect(Date.now() - closedAt).toBeLessThan(1000);
		expect(error.message).toMatch(/Expected locator text to start with: .*"never"/);
		expect(error.message).toMatch(/Received: .*"one"/);
		expect(error.message).not.toMatch(/Target page/);
		// Reporters such as Allure show this error on its own, so it says why polling stopped early.
		expect(error.message).toMatch(/Polling stopped after \d+ms of 10000ms: the page was closed\./);
	});
});

test.describe("toBeStable - page closed while polling", () => {
	test("should fail the .not form too, since stability could not be determined", async ({ page }) => {
		await page.setContent("<div>one</div>");
		await page.evaluate(() => setInterval(() => (document.querySelector("div")!.textContent = String(Date.now())), 50));
		const rejected = getRejectedError(expectlyLocator(page.locator("div")).not.toBeStable({ timeout: 10000 }));
		await page.waitForTimeout(300);
		await page.close();
		const error = await rejected;
		expect(error.message).toContain("Could not determine whether the locator content is stable");
		expect(error.message).toMatch(/Polling stopped after \d+ms of 10000ms: the page was closed\./);
	});
});

test.describe("locator polling - no read finished", () => {
	const NO_READ_NOTE = /The first read did not finish within the 1ms timeout; any received value/;

	// A read crosses to the browser and back, so it cannot finish within a timeout of 1ms.
	test.beforeEach(async ({ page }) => {
		await page.setContent('<img src="/image.png" />');
	});

	test("should not report an existing attribute as missing", async ({ page }) => {
		const error = await getRejectedError(expectlyLocator(page.locator("img")).toHaveSrc("/image.png", { timeout: 1 }));
		expect(error.message).toContain("No value was received.");
		expect(error.message).toMatch(NO_READ_NOTE);
		expect(error.message).not.toContain("no src attribute");
	});

	test("should not report null for the .not form", async ({ page }) => {
		const error = await getRejectedError(expectlyLocator(page.locator("img")).not.toHaveSrc("/other", { timeout: 1 }));
		expect(error.message).toContain("No value was received.");
		expect(error.message).not.toContain("Received: null");
	});

	test("should explain an initial value from matchers with their own polling", async ({ page }) => {
		const error = await getRejectedError(
			expectlyLocator(page.locator("img")).toHaveCountGreaterThan(5, { timeout: 1 }),
		);
		expect(error.message).toMatch(NO_READ_NOTE);
	});

	test("should still report an attribute that really is missing", async ({ page }) => {
		await page.setContent("<img />");
		const error = await getRejectedError(expectlyLocator(page.locator("img")).toHaveSrc("/image.png"));
		expect(error.message).toContain("(no src attribute)");
		expect(error.message).not.toContain("The first read did not finish");
	});
});

test.describe("toBeStable - final interval", () => {
	// Reads land at about 0, 750, 1500 and 2250ms. The next one would cross the deadline, leaving a final
	// window from about 2250 to 2900ms that must still be observed.
	const settings = { timeout: 2900, stabilityDuration: 1500, checkInterval: 750 };

	test.beforeEach(async ({ page }) => {
		await page.setContent("<div>one</div>");
		await page.evaluate(() => setInterval(() => (document.querySelector("div")!.textContent = String(Date.now())), 50));
	});

	test("should observe the full timeout before passing the .not form", async ({ page }) => {
		const startedAt = Date.now();
		await expectlyLocator(page.locator("div")).not.toBeStable(settings);
		expect(Date.now() - startedAt).toBeGreaterThanOrEqual(2850);
	});

	test("should notice the page closing during the final interval", async ({ page }) => {
		const rejected = getRejectedError(expectlyLocator(page.locator("div")).not.toBeStable(settings));
		await page.waitForTimeout(2575);
		await page.close();
		const error = await rejected;
		expect(error.message).toContain("Could not determine whether the locator content is stable");
		expect(error.message).toMatch(/Polling stopped after \d+ms of 2900ms: the page was closed\./);
	});

	test("should keep expect.poll() timing for other matchers", async ({ page }) => {
		const startedAt = Date.now();
		const error = await getRejectedError(
			expectlyLocator(page.locator("div")).toStartWith("never", { timeout: 1000, intervals: [5000] }),
		);
		expect(error.message).toContain("never");
		// The next read would cross the deadline, so the matcher gives up instead of waiting for it.
		expect(Date.now() - startedAt).toBeLessThan(800);
	});
});

test.describe("runPolledMatcher - timers when the target closes", () => {
	const LONG_DELAY = 600_000;
	const state = { isNot: false, timeout: LONG_DELAY } as unknown as ExpectMatcherState;

	/** Tracks timers with a long delay, the ones that would visibly keep a standalone Node process alive. */
	function trackLongTimers(): { pending: Set<Parameters<typeof clearTimeout>[0]>; restore: () => void } {
		const { setTimeout: realSetTimeout, clearTimeout: realClearTimeout } = globalThis;
		const pending = new Set<Parameters<typeof clearTimeout>[0]>();
		globalThis.setTimeout = ((...args: Parameters<typeof realSetTimeout>) => {
			const timer = realSetTimeout(...args);
			if ((args[1] ?? 0) > LONG_DELAY / 2) pending.add(timer);
			return timer;
		}) as typeof setTimeout;
		globalThis.clearTimeout = (timer: Parameters<typeof realClearTimeout>[0]): void => {
			pending.delete(timer);
			realClearTimeout(timer);
		};
		return {
			pending,
			restore: (): void => {
				globalThis.setTimeout = realSetTimeout;
				globalThis.clearTimeout = realClearTimeout;
				for (const timer of pending) realClearTimeout(timer);
			},
		};
	}

	/** Lets the polling loop run until it is waiting on its timer. */
	function settle(): Promise<void> {
		return new Promise((resolve) => setImmediate(resolve));
	}

	test("should clear the interval timer", async () => {
		const timers = trackLongTimers();
		try {
			const target = new EventEmitter();
			const options = { timeout: LONG_DELAY * 2, intervals: [LONG_DELAY] };
			const result = runPolledMatcher(state, options, () => Promise.resolve(false), { target });
			await settle();
			expect(timers.pending.size).toBe(1);
			target.emit("close");
			expect(await result).toBe(false);
			expect(timers.pending.size).toBe(0);
		} finally {
			timers.restore();
		}
	});

	test("should clear the deadline timer while a read is pending", async () => {
		const timers = trackLongTimers();
		try {
			const target = new EventEmitter();
			const result = runPolledMatcher(state, { timeout: LONG_DELAY }, () => new Promise<boolean>(() => {}), { target });
			await settle();
			expect(timers.pending.size).toBe(1);
			target.emit("close");
			expect(await result).toBe(false);
			expect(timers.pending.size).toBe(0);
		} finally {
			timers.restore();
		}
	});
});
