export type PollOptions = {
	/**
	 * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
	 */
	timeout?: number;
	/**
	 * Custom polling intervals in milliseconds. If not provided, Playwright's default intervals are used.
	 */
	intervals?: number[];
};
