import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { type APIResponse, expect, test } from "@playwright/test";

import { getRejectedError, stripAnsi } from "../../../tests/common/assertion-utils";
import { expectly } from "../src/expectly";
import type { HttpStatusClass } from "../src/expectly-response";
import { expectlyResponse } from "../src/expectly-response";

let server: Server;
let baseURL: string;

test.beforeAll(async () => {
	// Answers `/?status=404&body=text&type=application/json` with that status, body and content type.
	server = createServer((request, response) => {
		const params = new URL(request.url ?? "/", "http://localhost").searchParams;
		response.writeHead(Number(params.get("status") ?? 200), {
			"content-type": params.get("type") ?? "text/plain",
		});
		response.end(params.get("body") ?? "");
	});
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
	await new Promise<void>((resolve) => server.close(() => resolve()));
});

test.describe("toHaveStatus", () => {
	test("matches an exact status code of an APIResponse", async ({ request }) => {
		const response = await request.get(`${baseURL}/?status=201`);
		await expectlyResponse(response).toHaveStatus(201);
		await expectlyResponse(response).not.toHaveStatus(200);
	});

	test("matches a status class", async ({ request }) => {
		await expectlyResponse(await request.get(`${baseURL}/?status=204`)).toHaveStatus("2xx");
		await expectlyResponse(await request.get(`${baseURL}/?status=299`)).toHaveStatus("2xx");
		await expectlyResponse(await request.get(`${baseURL}/?status=300`)).not.toHaveStatus("2xx");
		await expectlyResponse(await request.get(`${baseURL}/?status=422`)).toHaveStatus("4xx");
		await expectlyResponse(await request.get(`${baseURL}/?status=503`)).toHaveStatus("5xx");
	});

	test("works with a page Response", async ({ page }) => {
		await page.route("https://app.expectly.test/**", (route) =>
			route.fulfill({ status: 503, contentType: "text/html", body: "<p>Down</p>" }),
		);
		const response = await page.goto("https://app.expectly.test/");
		await expectlyResponse(response!).toHaveStatus(503);
		await expectlyResponse(response!).toHaveStatus("5xx");
	});

	test("is available on the unified expectly", async ({ request }) => {
		await expectly(await request.get(`${baseURL}/?status=202`)).toHaveStatus(202);
	});

	test("formats a failure like toBeOK, with the expected and received status", async ({ request }) => {
		const response = await request.get(
			`${baseURL}/users/42?status=404&type=application/json&body=${encodeURIComponent('{"error":"User 42 not found"}')}`,
		);
		const message = stripAnsi((await getRejectedError(expectlyResponse(response).toHaveStatus(200))).message);
		expect(message).toMatch(
			/^expect\(response\)\.toHaveStatus\(200\) failed\n\nExpected: 200\nReceived: 404 Not Found\n/,
		);
		expect(message).toContain("\nCall log:\n→ GET ");
		expect(message).toContain("← 404 Not Found");
		expect(message).toMatch(/\nResponse text:\n\{"error":"User 42 not found"\}$/);
	});

	test("shows the same call log and response text as toBeOK", async ({ request }) => {
		const response = await request.get(`${baseURL}/?status=500&body=Database%20unavailable`);
		const ours = stripAnsi((await getRejectedError(expectlyResponse(response).toHaveStatus("2xx"))).message);
		const theirs = stripAnsi((await getRejectedError(expect(response).toBeOK())).message);
		const details = (text: string): string => text.slice(text.indexOf("Call log:"));
		expect(details(ours)).toBe(details(theirs).trimEnd());
	});

	test("quotes a status class", async ({ request }) => {
		const response = await request.get(`${baseURL}/?status=404`);
		const message = stripAnsi((await getRejectedError(expectlyResponse(response).toHaveStatus("2xx"))).message);
		expect(message).toContain('expect(response).toHaveStatus("2xx") failed');
		expect(message).toContain('Expected: "2xx"');
	});

	test("truncates the response text to 1000 characters, like toBeOK", async ({ request }) => {
		const response = await request.get(`${baseURL}/?status=500&body=${"x".repeat(1000)}y`);
		const message = stripAnsi((await getRejectedError(expectlyResponse(response).toHaveStatus("2xx"))).message);
		// The body is also in the request URL of the call log, so check only the response text section.
		expect(message.slice(message.indexOf("Response text:"))).toBe(`Response text:\n${"x".repeat(1000)}`);
	});

	test("shows the response text for a failing .not assertion too, like toBeOK", async ({ request }) => {
		const response = await request.get(`${baseURL}/?status=200&body=all%20good`);
		const message = stripAnsi((await getRejectedError(expectlyResponse(response).not.toHaveStatus(200))).message);
		expect(message).toContain("expect(response).not.toHaveStatus(200) failed");
		expect(message).toContain("Expected: not 200\nReceived: 200 OK");
		expect(message).toContain("Response text:\nall good");
	});

	test("does not print binary bodies", async ({ request }) => {
		const response = await request.get(`${baseURL}/?status=500&type=application/octet-stream&body=binary`);
		const message = stripAnsi((await getRejectedError(expectlyResponse(response).toHaveStatus(200))).message);
		expect(message).toContain("Call log:");
		expect(message).not.toContain("Response text");
	});

	test("shows the URL when there is no call log, and omits an unreadable body", async () => {
		const fake = {
			status: () => 500,
			statusText: () => "Internal Server Error",
			url: () => "https://api.expectly.test/",
			headers: () => ({ "content-type": "text/plain" }),
			text: () => Promise.reject(new Error("Response has been disposed")),
		} as unknown as APIResponse;
		const message = stripAnsi((await getRejectedError(expectlyResponse(fake).toHaveStatus(200))).message);
		expect(message).toContain("Received: 500 Internal Server Error\nURL:      https://api.expectly.test/");
		expect(message).not.toContain("Call log");
		expect(message).not.toContain("Response text");
	});

	test("shows the URL and text for a page Response", async ({ page }) => {
		await page.route("https://app.expectly.test/**", (route) =>
			route.fulfill({ status: 503, contentType: "text/html", body: "<p>Down</p>" }),
		);
		const response = await page.goto("https://app.expectly.test/");
		const message = stripAnsi((await getRejectedError(expectlyResponse(response!).toHaveStatus(200))).message);
		expect(message).toContain("URL:      https://app.expectly.test/");
		expect(message).toContain("Response text:\n<p>Down</p>");
	});

	test("rejects invalid expected statuses", async ({ request }) => {
		const response = await request.get(`${baseURL}/?status=200`);
		for (const invalid of [99, 600, 200.5]) {
			await expect(expectlyResponse(response).toHaveStatus(invalid)).rejects.toThrow(/integer from 100 to 599/);
		}
		for (const invalid of ["6xx", "2XX", "200"]) {
			await expect(expectlyResponse(response).toHaveStatus(invalid as HttpStatusClass)).rejects.toThrow(
				/must be a number or one of/,
			);
		}
	});

	test("rejects receivers that are not responses", async () => {
		await expect(expectlyResponse({ status: 200 } as unknown as APIResponse).toHaveStatus(200)).rejects.toThrow(
			/must be an APIResponse or Response/,
		);
	});
});
