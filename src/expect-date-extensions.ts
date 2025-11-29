import { expect as baseExpect } from "@playwright/test";

export const expectDate = baseExpect.extend({
	/**
	 * Asserts that a date is close to another date within a specified deviation.
	 *
	 * Accepts both Date objects and ISO date strings. The deviation can be specified
	 * in days, hours, minutes, and/or seconds.
	 *
	 * @param actualDate - The date to check (Date object or ISO string)
	 * @param expectedDate - The expected date to compare against
	 * @param deviation - Object specifying allowed time difference
	 *
	 * @example
	 * // Check if dates are within 30 seconds
	 * await expectDate(responseDate).toBeCloseTo(expectedDate, { seconds: 30 });
	 *
	 * @example
	 * // Check if dates are within 1 hour
	 * const now = new Date();
	 * await expectDate(createdAt).toBeCloseTo(now, { hours: 1 });
	 *
	 * @example
	 * // Multiple deviation units
	 * await expectDate(timestamp).toBeCloseTo('2024-01-01T12:00:00Z', {
	 *   hours: 2,
	 *   minutes: 30
	 * });
	 */
	toBeCloseTo(
		actualDate: Date | string,
		expectedDate: Date | string,
		deviation: { seconds?: number; minutes?: number; hours?: number; days?: number }
	) {
		const assertionName = "toBeCloseTo";

		// Parse dates
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;
		const parsedExpected = typeof expectedDate === "string" ? new Date(expectedDate) : expectedDate;

		// Validate dates
		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}
		if (!isValidDate(parsedExpected)) {
			throw new Error(`Invalid expected date: ${expectedDate}`);
		}

		// Calculate deviation in milliseconds
		const deviationMs =
			(deviation.days ?? 0) * 24 * 60 * 60 * 1000 +
			(deviation.hours ?? 0) * 60 * 60 * 1000 +
			(deviation.minutes ?? 0) * 60 * 1000 +
			(deviation.seconds ?? 0) * 1000;

		const expectedMin = parsedExpected.getTime() - deviationMs;
		const expectedMax = parsedExpected.getTime() + deviationMs;
		const actualTime = parsedActual.getTime();

		const pass = actualTime >= expectedMin && actualTime <= expectedMax;
		const timeDiff = actualTime - parsedExpected.getTime();
		const timeDiffSeconds = Math.abs(timeDiff / 1000);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be close to the expected date\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}\n` +
					`Difference: ${timeDiffSeconds.toFixed(3)} seconds\n` +
					`Allowed deviation: ±${(deviationMs / 1000).toFixed(3)} seconds`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be close to the expected date within the allowed deviation\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}\n` +
					`Difference: ${timeDiffSeconds.toFixed(3)} seconds (${timeDiff > 0 ? "later" : "earlier"})\n` +
					`Allowed deviation: ±${(deviationMs / 1000).toFixed(3)} seconds`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that an array of dates is in ascending (earliest to latest) order.
	 *
	 * @param actual - Array of Date objects or ISO date strings
	 *
	 * @example
	 * // Testing API response dates
	 * const events = await api.getEvents();
	 * const dates = events.map(e => e.createdAt);
	 * await expectDate(dates).toHaveDatesAscendingOrder();
	 *
	 * @example
	 * // With Date objects
	 * const dates = [new Date('2024-01-01'), new Date('2024-01-02'), new Date('2024-01-03')];
	 * await expectDate(dates).toHaveDatesAscendingOrder();
	 */
	async toHaveDatesAscendingOrder(actual: Date[] | string[]) {
		const assertionName = "toHaveDatesAscendingOrder";
		let pass: boolean;
		let matcherResult: any;

		const expected: string[] | Date[] = sortedExpected(actual, "ascending");
		try {
			baseExpect(actual).toEqual(expected);
			matcherResult = actual;
			pass = true;
		} catch (e: any) {
			matcherResult = e.matcherResult;
			pass = false;
		}

		const message = () =>
			this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			}) +
			"\n\n" +
			`Expected date array to ${this.isNot ? "not " : ""}be in ascending order\n\n` +
			`Expected: ${this.utils.printExpected(formatDatesForDisplay(expected))}\n` +
			`Received: ${this.utils.printReceived(formatDatesForDisplay(matcherResult?.actual || actual))}`;

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: matcherResult?.actual,
		};
	},
	/**
	 * Asserts that an array of dates is in descending (latest to earliest) order.
	 *
	 * @param actual - Array of Date objects or ISO date strings
	 *
	 * @example
	 * // Testing sorted data from newest to oldest
	 * const posts = await page.locator('.post-date').allTextContents();
	 * await expectDate(posts).toHaveDatesDescendingOrder();
	 *
	 * @example
	 * // Validate descending timeline
	 * const timeline = [new Date('2024-12-31'), new Date('2024-06-15'), new Date('2024-01-01')];
	 * await expectDate(timeline).toHaveDatesDescendingOrder();
	 */
	async toHaveDatesDescendingOrder(actual: Date[] | string[]) {
		const assertionName = "toHaveDatesDescendingOrder";
		let pass: boolean;
		let matcherResult: any;

		const expected: string[] | Date[] = sortedExpected(actual, "descending");
		try {
			baseExpect(actual).toEqual(expected);
			matcherResult = { actual };
			pass = true;
		} catch (e: any) {
			matcherResult = e.matcherResult;
			pass = false;
		}

		const message = () =>
			this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			}) +
			"\n\n" +
			`Expected date array to ${this.isNot ? "not " : ""}be in descending order\n\n` +
			`Expected: ${this.utils.printExpected(formatDatesForDisplay(expected))}\n` +
			`Received: ${this.utils.printReceived(formatDatesForDisplay(matcherResult?.actual || actual))}`;

		return {
			message,
			pass,
			name: assertionName,
			expected,
			actual: matcherResult?.actual,
		};
	},
	/**
	 * Asserts that a date is before another date.
	 *
	 * @param actualDate - The date to check
	 * @param expectedDate - The date that should come after
	 *
	 * @example
	 * // Check event ordering
	 * await expectDate(startDate).toBeBefore(endDate);
	 *
	 * @example
	 * // Verify creation happened before update
	 * await expectDate(user.createdAt).toBeBefore(user.updatedAt);
	 *
	 * @example
	 * // Using ISO strings
	 * await expectDate('2024-01-01').toBeBefore('2024-12-31');
	 */
	async toBeBefore(actualDate: Date | string, expectedDate: Date | string) {
		const assertionName = "toBeBefore";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;
		const parsedExpected = typeof expectedDate === "string" ? new Date(expectedDate) : expectedDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}
		if (!isValidDate(parsedExpected)) {
			throw new Error(`Invalid expected date: ${expectedDate}`);
		}

		const pass = parsedActual.getTime() < parsedExpected.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be before\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be before\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date is after another date.
	 *
	 * @param actualDate - The date to check
	 * @param expectedDate - The date that should come before
	 *
	 * @example
	 * // Check expiration is in the future
	 * await expectDate(expiryDate).toBeAfter(new Date());
	 *
	 * @example
	 * // Verify update happened after creation
	 * await expectDate(record.updatedAt).toBeAfter(record.createdAt);
	 */
	async toBeAfter(actualDate: Date | string, expectedDate: Date | string) {
		const assertionName = "toBeAfter";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;
		const parsedExpected = typeof expectedDate === "string" ? new Date(expectedDate) : expectedDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}
		if (!isValidDate(parsedExpected)) {
			throw new Error(`Invalid expected date: ${expectedDate}`);
		}

		const pass = parsedActual.getTime() > parsedExpected.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be after\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be after\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date falls between two dates (inclusive).
	 *
	 * @param actualDate - The date to check
	 * @param startDate - The start of the range
	 * @param endDate - The end of the range
	 *
	 * @example
	 * // Check date within a range
	 * const start = new Date('2024-01-01');
	 * const end = new Date('2024-12-31');
	 * await expectDate(eventDate).toBeBetween(start, end);
	 *
	 * @example
	 * // Validate appointment scheduling
	 * await expectDate(appointment).toBeBetween(
	 *   '2024-06-01T09:00:00Z',
	 *   '2024-06-01T17:00:00Z'
	 * );
	 */
	async toBeBetween(actualDate: Date | string, startDate: Date | string, endDate: Date | string) {
		const assertionName = "toBeBetween";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;
		const parsedStart = typeof startDate === "string" ? new Date(startDate) : startDate;
		const parsedEnd = typeof endDate === "string" ? new Date(endDate) : endDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}
		if (!isValidDate(parsedStart)) {
			throw new Error(`Invalid start date: ${startDate}`);
		}
		if (!isValidDate(parsedEnd)) {
			throw new Error(`Invalid end date: ${endDate}`);
		}

		const actualTime = parsedActual.getTime();
		const pass = actualTime >= parsedStart.getTime() && actualTime <= parsedEnd.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be between\n\n` +
					`Start: ${this.utils.printExpected(parsedStart.toISOString())}\n` +
					`End: ${this.utils.printExpected(parsedEnd.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be between\n\n` +
					`Start: ${this.utils.printExpected(parsedStart.toISOString())}\n` +
					`End: ${this.utils.printExpected(parsedEnd.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: { start: parsedStart, end: parsedEnd },
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that two dates are on the same calendar day (ignoring time).
	 *
	 * @param actualDate - The date to check
	 * @param expectedDate - The expected date to compare
	 *
	 * @example
	 * // Check if event is today
	 * await expectDate(eventDate).toBeSameDay(new Date());
	 *
	 * @example
	 * // Verify dates match regardless of time
	 * await expectDate('2024-01-01T08:00:00Z').toBeSameDay('2024-01-01T20:00:00Z');
	 */
	async toBeSameDay(actualDate: Date | string, expectedDate: Date | string) {
		const assertionName = "toBeSameDay";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;
		const parsedExpected = typeof expectedDate === "string" ? new Date(expectedDate) : expectedDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}
		if (!isValidDate(parsedExpected)) {
			throw new Error(`Invalid expected date: ${expectedDate}`);
		}

		const pass =
			parsedActual.getFullYear() === parsedExpected.getFullYear() &&
			parsedActual.getMonth() === parsedExpected.getMonth() &&
			parsedActual.getDate() === parsedExpected.getDate();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not be the same day\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to be the same day\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that two dates are in the same month and year.
	 *
	 * @param actualDate - The date to check
	 * @param expectedDate - The expected date to compare
	 *
	 * @example
	 * // Check if dates are in the same month
	 * await expectDate('2024-01-15').toBeSameMonth('2024-01-20');
	 *
	 * @example
	 * // Validate monthly report period
	 * await expectDate(report.generatedAt).toBeSameMonth(report.periodStart);
	 */
	async toBeSameMonth(actualDate: Date | string, expectedDate: Date | string) {
		const assertionName = "toBeSameMonth";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;
		const parsedExpected = typeof expectedDate === "string" ? new Date(expectedDate) : expectedDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}
		if (!isValidDate(parsedExpected)) {
			throw new Error(`Invalid expected date: ${expectedDate}`);
		}

		const pass =
			parsedActual.getFullYear() === parsedExpected.getFullYear() &&
			parsedActual.getMonth() === parsedExpected.getMonth();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not be in the same month\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to be in the same month\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that two dates are in the same year.
	 *
	 * @param actualDate - The date to check
	 * @param expectedDate - The expected date to compare
	 *
	 * @example
	 * // Check if dates are in the same year
	 * await expectDate('2024-01-01').toBeSameYear('2024-12-31');
	 *
	 * @example
	 * // Validate annual report year
	 * await expectDate(report.year).toBeSameYear(new Date());
	 */
	async toBeSameYear(actualDate: Date | string, expectedDate: Date | string) {
		const assertionName = "toBeSameYear";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;
		const parsedExpected = typeof expectedDate === "string" ? new Date(expectedDate) : expectedDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}
		if (!isValidDate(parsedExpected)) {
			throw new Error(`Invalid expected date: ${expectedDate}`);
		}

		const pass = parsedActual.getFullYear() === parsedExpected.getFullYear();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not be in the same year\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to be in the same year\n\n` +
					`Expected: ${this.utils.printExpected(parsedExpected.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: parsedExpected,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date is today (current calendar day).
	 *
	 * @param actualDate - The date to check
	 *
	 * @example
	 * // Check if timestamp is from today
	 * const createdDate = await page.locator('.created-date').textContent();
	 * await expectDate(createdDate).toBeToday();
	 *
	 * @example
	 * // Validate real-time data
	 * await expectDate(new Date(order.timestamp)).toBeToday();
	 */
	async toBeToday(actualDate: Date | string) {
		const assertionName = "toBeToday";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}

		const today = new Date();
		const pass =
			parsedActual.getFullYear() === today.getFullYear() &&
			parsedActual.getMonth() === today.getMonth() &&
			parsedActual.getDate() === today.getDate();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be today\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be today\n\n` +
					`Today: ${this.utils.printExpected(today.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date is yesterday.
	 *
	 * @param actualDate - The date to check
	 *
	 * @example
	 * // Check if date is from yesterday
	 * await expectDate(lastLogin).toBeYesterday();
	 *
	 * @example
	 * // Validate historical data
	 * await expectDate('2024-11-29').toBeYesterday(); // If today is Nov 30, 2024
	 */
	async toBeYesterday(actualDate: Date | string) {
		const assertionName = "toBeYesterday";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const pass =
			parsedActual.getFullYear() === yesterday.getFullYear() &&
			parsedActual.getMonth() === yesterday.getMonth() &&
			parsedActual.getDate() === yesterday.getDate();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be yesterday\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be yesterday\n\n` +
					`Yesterday: ${this.utils.printExpected(yesterday.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date is tomorrow.
	 *
	 * @param actualDate - The date to check
	 *
	 * @example
	 * // Check scheduled date
	 * await expectDate(scheduledDate).toBeTomorrow();
	 *
	 * @example
	 * // Validate future appointment
	 * await expectDate(appointment.date).toBeTomorrow();
	 */
	async toBeTomorrow(actualDate: Date | string) {
		const assertionName = "toBeTomorrow";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}

		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const pass =
			parsedActual.getFullYear() === tomorrow.getFullYear() &&
			parsedActual.getMonth() === tomorrow.getMonth() &&
			parsedActual.getDate() === tomorrow.getDate();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be tomorrow\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be tomorrow\n\n` +
					`Tomorrow: ${this.utils.printExpected(tomorrow.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date falls on a weekday (Monday through Friday).
	 *
	 * @param actualDate - The date to check
	 *
	 * @example
	 * // Validate business day
	 * await expectDate(deliveryDate).toBeWeekday();
	 *
	 * @example
	 * // Check office hours scheduling
	 * await expectDate(meeting.scheduledFor).toBeWeekday();
	 */
	async toBeWeekday(actualDate: Date | string) {
		const assertionName = "toBeWeekday";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}

		const dayOfWeek = parsedActual.getDay();
		const pass = dayOfWeek >= 1 && dayOfWeek <= 5;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be a weekday\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())} (${dayNames[dayOfWeek]})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be a weekday (Monday-Friday)\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())} (${dayNames[dayOfWeek]})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date falls on a weekend (Saturday or Sunday).
	 *
	 * @param actualDate - The date to check
	 *
	 * @example
	 * // Validate weekend event
	 * await expectDate(event.date).toBeWeekend();
	 *
	 * @example
	 * // Check maintenance schedule
	 * await expectDate(maintenanceWindow).toBeWeekend();
	 */
	async toBeWeekend(actualDate: Date | string) {
		const assertionName = "toBeWeekend";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}

		const dayOfWeek = parsedActual.getDay();
		const pass = dayOfWeek === 0 || dayOfWeek === 6;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be a weekend\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())} (${dayNames[dayOfWeek]})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be a weekend (Saturday-Sunday)\n\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())} (${dayNames[dayOfWeek]})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date is in the past (before the current moment).
	 *
	 * @param actualDate - The date to check
	 *
	 * @example
	 * // Validate historical record
	 * await expectDate(user.createdAt).toBeInThePast();
	 *
	 * @example
	 * // Check completed event
	 * await expectDate(order.completedAt).toBeInThePast();
	 */
	async toBeInThePast(actualDate: Date | string) {
		const assertionName = "toBeInThePast";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}

		const now = new Date();
		const pass = parsedActual.getTime() < now.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be in the past\n\n` +
					`Now: ${this.utils.printExpected(now.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be in the past\n\n` +
					`Now: ${this.utils.printExpected(now.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date is in the future (after the current moment).
	 *
	 * @param actualDate - The date to check
	 *
	 * @example
	 * // Validate expiration date
	 * await expectDate(subscription.expiresAt).toBeInTheFuture();
	 *
	 * @example
	 * // Check scheduled event
	 * await expectDate(upcomingMeeting.startsAt).toBeInTheFuture();
	 */
	async toBeInTheFuture(actualDate: Date | string) {
		const assertionName = "toBeInTheFuture";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}

		const now = new Date();
		const pass = parsedActual.getTime() > now.getTime();

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to not be in the future\n\n` +
					`Now: ${this.utils.printExpected(now.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date to be in the future\n\n` +
					`Now: ${this.utils.printExpected(now.toISOString())}\n` +
					`Received: ${this.utils.printReceived(parsedActual.toISOString())}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that a date's year is a leap year.
	 *
	 * A leap year occurs every 4 years, except for years divisible by 100,
	 * unless also divisible by 400.
	 *
	 * @param actualDate - The date to check
	 *
	 * @example
	 * // Check if year is a leap year
	 * await expectDate(new Date('2024-06-15')).toBeLeapYear(); // 2024 is a leap year
	 * await expectDate(new Date('2023-06-15')).not.toBeLeapYear(); // 2023 is not
	 *
	 * @example
	 * // Validate February 29th exists
	 * await expectDate(birthdayDate).toBeLeapYear();
	 */
	async toBeLeapYear(actualDate: Date | string) {
		const assertionName = "toBeLeapYear";
		const parsedActual = typeof actualDate === "string" ? new Date(actualDate) : actualDate;

		if (!isValidDate(parsedActual)) {
			throw new Error(`Invalid actual date: ${actualDate}`);
		}

		const year = parsedActual.getFullYear();
		const pass = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected year to not be a leap year\n\nYear: ${this.utils.printReceived(year)}`;
			}

			if (!pass && !this.isNot) {
				return `${hint}\n\nExpected year to be a leap year\n\nYear: ${this.utils.printReceived(year)}`;
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: parsedActual,
		};
	},
	/**
	 * Asserts that an array of dates spans approximately the expected range.
	 *
	 * @param actual - Array of Date objects or ISO date strings
	 * @param expectedRange - Object specifying expected time span
	 *
	 * @example
	 * // Check if data covers 30 days
	 * const reportDates = await api.getReportDates();
	 * await expectDate(reportDates).toHaveDateRange({ days: 30 });
	 *
	 * @example
	 * // Validate year-long dataset
	 * await expectDate(timestamps).toHaveDateRange({ years: 1 });
	 *
	 * @example
	 * // Mixed units
	 * await expectDate(dates).toHaveDateRange({ months: 3, days: 15 });
	 */
	async toHaveDateRange(actual: Date[] | string[], expectedRange: { days?: number; months?: number; years?: number }) {
		const assertionName = "toHaveDateRange";

		if (actual.length === 0) {
			throw new Error("Array must contain at least one date");
		}

		const parsedDates = actual.map(date => (typeof date === "string" ? new Date(date) : date));

		for (const date of parsedDates) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${date}`);
			}
		}

		const sortedDates = [...parsedDates].sort((a, b) => a.getTime() - b.getTime());
		const firstDate = sortedDates[0];
		const lastDate = sortedDates[sortedDates.length - 1];

		const diffMs = lastDate.getTime() - firstDate.getTime();
		const diffDays = diffMs / (1000 * 60 * 60 * 24);

		let expectedDays = 0;
		if (expectedRange.days) expectedDays += expectedRange.days;
		if (expectedRange.months) expectedDays += expectedRange.months * 30.44; // Average month length
		if (expectedRange.years) expectedDays += expectedRange.years * 365.25; // Average year length

		const pass = Math.abs(diffDays - expectedDays) < 1; // Allow 1 day tolerance

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date range to not match\n\n` +
					`Expected range: ${this.utils.printExpected(expectedRange)}\n` +
					`Actual range: ${this.utils.printReceived(diffDays.toFixed(1))} days\n` +
					`First date: ${firstDate.toISOString()}\n` +
					`Last date: ${lastDate.toISOString()}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected date range to match\n\n` +
					`Expected range: ${this.utils.printExpected(expectedRange)} (~${expectedDays.toFixed(1)} days)\n` +
					`Actual range: ${this.utils.printReceived(diffDays.toFixed(1))} days\n` +
					`First date: ${firstDate.toISOString()}\n` +
					`Last date: ${lastDate.toISOString()}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: expectedRange,
			actual: { days: diffDays, firstDate, lastDate },
		};
	},
	/**
	 * Asserts that an array of dates are consecutive by the specified unit.
	 *
	 * @param actual - Array of Date objects or ISO date strings
	 * @param unit - The unit of time to check ('day', 'month', or 'year')
	 *
	 * @example
	 * // Check consecutive days
	 * const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
	 * await expectDate(dates).toHaveConsecutiveDates('day');
	 *
	 * @example
	 * // Validate monthly sequence
	 * await expectDate(billingDates).toHaveConsecutiveDates('month');
	 *
	 * @example
	 * // Check yearly progression
	 * await expectDate(annualReports).toHaveConsecutiveDates('year');
	 */
	async toHaveConsecutiveDates(actual: Date[] | string[], unit: "day" | "month" | "year") {
		const assertionName = "toHaveConsecutiveDates";

		if (actual.length < 2) {
			throw new Error("Array must contain at least two dates");
		}

		const parsedDates = actual.map(date => (typeof date === "string" ? new Date(date) : date));

		for (const date of parsedDates) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${date}`);
			}
		}

		const sortedDates = [...parsedDates].sort((a, b) => a.getTime() - b.getTime());
		let pass = true;
		let failIndex = -1;

		for (let i = 1; i < sortedDates.length; i++) {
			const prev = sortedDates[i - 1];
			const curr = sortedDates[i];

			if (unit === "day") {
				const expected = new Date(prev);
				expected.setDate(expected.getDate() + 1);
				if (
					curr.getFullYear() !== expected.getFullYear() ||
					curr.getMonth() !== expected.getMonth() ||
					curr.getDate() !== expected.getDate()
				) {
					pass = false;
					failIndex = i;
					break;
				}
			} else if (unit === "month") {
				const expected = new Date(prev);
				expected.setMonth(expected.getMonth() + 1);
				if (curr.getFullYear() !== expected.getFullYear() || curr.getMonth() !== expected.getMonth()) {
					pass = false;
					failIndex = i;
					break;
				}
			} else if (unit === "year") {
				if (curr.getFullYear() !== prev.getFullYear() + 1) {
					pass = false;
					failIndex = i;
					break;
				}
			}
		}

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not be consecutive by ${unit}\n\n` +
					`Received: ${this.utils.printReceived(formatDatesForDisplay(sortedDates))}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to be consecutive by ${unit}\n\n` +
					`Gap found at index ${failIndex}:\n` +
					`Previous: ${sortedDates[failIndex - 1].toISOString()}\n` +
					`Current: ${sortedDates[failIndex].toISOString()}\n\n` +
					`Full array: ${this.utils.printReceived(formatDatesForDisplay(sortedDates))}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: unit,
			actual: sortedDates,
		};
	},
	/**
	 * Asserts that all dates in an array fall within a specified range.
	 *
	 * @param actual - Array of Date objects or ISO date strings
	 * @param startDate - The start of the acceptable range
	 * @param endDate - The end of the acceptable range
	 *
	 * @example
	 * // Validate all dates are in Q1 2024
	 * await expectDate(transactions).toHaveDatesWithinRange(
	 *   '2024-01-01',
	 *   '2024-03-31'
	 * );
	 *
	 * @example
	 * // Check business hours entries
	 * await expectDate(logEntries).toHaveDatesWithinRange(
	 *   new Date('2024-06-01T09:00:00Z'),
	 *   new Date('2024-06-01T17:00:00Z')
	 * );
	 */
	async toHaveDatesWithinRange(actual: Date[] | string[], startDate: Date | string, endDate: Date | string) {
		const assertionName = "toHaveDatesWithinRange";

		if (actual.length === 0) {
			throw new Error("Array must contain at least one date");
		}

		const parsedDates = actual.map(date => (typeof date === "string" ? new Date(date) : date));
		const parsedStart = typeof startDate === "string" ? new Date(startDate) : startDate;
		const parsedEnd = typeof endDate === "string" ? new Date(endDate) : endDate;

		for (const date of parsedDates) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${date}`);
			}
		}
		if (!isValidDate(parsedStart)) {
			throw new Error(`Invalid start date: ${startDate}`);
		}
		if (!isValidDate(parsedEnd)) {
			throw new Error(`Invalid end date: ${endDate}`);
		}

		const startTime = parsedStart.getTime();
		const endTime = parsedEnd.getTime();

		const outOfRangeDates = parsedDates.filter(date => {
			const time = date.getTime();
			return time < startTime || time > endTime;
		});

		const pass = outOfRangeDates.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not all be within range\n\n` +
					`Start: ${this.utils.printExpected(parsedStart.toISOString())}\n` +
					`End: ${this.utils.printExpected(parsedEnd.toISOString())}\n` +
					`All ${parsedDates.length} dates were within range`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all dates to be within range\n\n` +
					`Start: ${this.utils.printExpected(parsedStart.toISOString())}\n` +
					`End: ${this.utils.printExpected(parsedEnd.toISOString())}\n` +
					`Out of range dates (${outOfRangeDates.length}):\n${this.utils.printReceived(formatDatesForDisplay(outOfRangeDates))}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: { start: parsedStart, end: parsedEnd },
			actual: outOfRangeDates,
		};
	},
	/**
	 * Asserts that all dates in an array are unique.
	 *
	 * @param actual - Array of Date objects or ISO date strings
	 * @param ignoreTime - If true, only compares dates (ignores time)
	 *
	 * @example
	 * // Check for duplicate timestamps
	 * await expectDate(eventTimestamps).toHaveUniqueDates();
	 *
	 * @example
	 * // Validate unique days (ignore time)
	 * await expectDate(dailyRecords).toHaveUniqueDates(true);
	 *
	 * @example
	 * // Ensure no duplicate entries
	 * const dates = ['2024-01-01T10:00:00Z', '2024-01-02T10:00:00Z'];
	 * await expectDate(dates).toHaveUniqueDates();
	 */
	async toHaveUniqueDates(actual: Date[] | string[], ignoreTime = false) {
		const assertionName = "toHaveUniqueDates";

		if (actual.length === 0) {
			throw new Error("Array must contain at least one date");
		}

		const parsedDates = actual.map(date => (typeof date === "string" ? new Date(date) : date));

		for (const date of parsedDates) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${date}`);
			}
		}

		const seen = new Set<string>();
		const duplicates: Date[] = [];

		for (const date of parsedDates) {
			let key: string;
			if (ignoreTime) {
				key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
			} else {
				key = date.getTime().toString();
			}

			if (seen.has(key)) {
				duplicates.push(date);
			} else {
				seen.add(key);
			}
		}

		const pass = duplicates.length === 0;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected dates to not all be unique${ignoreTime ? " (ignoring time)" : ""}\n\n` +
					`All ${parsedDates.length} dates were unique`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected all dates to be unique${ignoreTime ? " (ignoring time)" : ""}\n\n` +
					`Found ${duplicates.length} duplicate(s):\n${this.utils.printReceived(formatDatesForDisplay(duplicates))}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: duplicates,
		};
	},
	/**
	 * Asserts that a string is a valid ISO 8601 date format.
	 *
	 * Expected format: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ssZ
	 *
	 * @param actual - The string to validate
	 *
	 * @example
	 * // Validate API response format
	 * const timestamp = await page.locator('.timestamp').textContent();
	 * await expectDate(timestamp).toBeValidISODate();
	 *
	 * @example
	 * // Check ISO format compliance
	 * await expectDate('2024-01-01T12:00:00.000Z').toBeValidISODate();
	 * await expectDate('2024-01-01T12:00:00Z').toBeValidISODate();
	 */
	async toBeValidISODate(actual: string) {
		const assertionName = "toBeValidISODate";

		const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
		const matchesPattern = isoPattern.test(actual);

		let isValid = false;
		if (matchesPattern) {
			const date = new Date(actual);
			isValid = isValidDate(date);
		}

		const pass = matchesPattern && isValid;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to not be a valid ISO 8601 date\n\n` +
					`Received: ${this.utils.printReceived(actual)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected string to be a valid ISO 8601 date\n\n` +
					`Received: ${this.utils.printReceived(actual)}\n` +
					`Expected format: YYYY-MM-DDTHH:mm:ss.sssZ`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual,
		};
	},
});

function isValidDate(date: Date): boolean {
	return date instanceof Date && !Number.isNaN(date.getTime());
}

function sortedExpected(actual: Date[] | string[], order: "ascending" | "descending"): Date[] | string[] {
	if (Array.isArray(actual) && actual.every(item => item instanceof Date)) {
		const copy = [...actual] as Date[];
		// Validate all dates
		for (const date of copy) {
			if (!isValidDate(date)) {
				throw new Error(`Invalid date in array: ${date}`);
			}
		}
		return order === "ascending"
			? copy.sort((a, b) => a.getTime() - b.getTime())
			: copy.sort((a, b) => b.getTime() - a.getTime());
	} else {
		const copy = [...actual] as string[];
		// Validate all date strings
		for (const item of copy) {
			const date = new Date(item);
			if (!isValidDate(date)) {
				throw new Error(`Invalid date string in array: ${item}`);
			}
		}
		return order === "ascending"
			? copy.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
			: copy.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
	}
}

function formatDatesForDisplay(dates: Date[] | string[]): string[] {
	return dates.map(date => {
		if (date instanceof Date) {
			return date.toISOString();
		}
		return date;
	});
}
