import type { Expect } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";

import { expectlyDateCalendarMatchers } from "./expectly-date-calendar";
import { expectlyDateChronologyMatchers } from "./expectly-date-chronology";
import { expectlyDateCollectionMatchers } from "./expectly-date-collections";
import { expectlyDateTimeOfDayMatchers } from "./expectly-date-time-of-day";
import { expectlyDateValidationMatchers } from "./expectly-date-validation";
import { expectlyDurationMatchers } from "./expectly-duration";

/**
 * Expectly custom matchers for dates, datetimes and durations.
 *
 * Accepts `Date`, strict ISO 8601 strings and Temporal values (native or polyfilled).
 */
export const expectlyDateMatchers = {
	...expectlyDateChronologyMatchers,
	...expectlyDateCalendarMatchers,
	...expectlyDateTimeOfDayMatchers,
	...expectlyDateValidationMatchers,
	...expectlyDateCollectionMatchers,
	...expectlyDurationMatchers,
} as typeof expectlyDateChronologyMatchers &
	typeof expectlyDateCalendarMatchers &
	typeof expectlyDateTimeOfDayMatchers &
	typeof expectlyDateValidationMatchers &
	typeof expectlyDateCollectionMatchers &
	typeof expectlyDurationMatchers;

export const expectlyDate: Expect<typeof expectlyDateMatchers> = baseExpect.extend(expectlyDateMatchers);
