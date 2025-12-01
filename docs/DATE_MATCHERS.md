# Date Matchers

Date comparison, validation, and temporal assertion matchers.

## Available Matchers

- [toBeCloseTo()](#tobecloseto)
- [toHaveDatesAscendingOrder() / toHaveDatesDescendingOrder()](#tohavedatesascendingorder--tohavedatesdescendingorder)
- [toBeBefore() / toBeAfter()](#tobebefore--tobeafter)
- [toBeBetween()](#tobebetween)
- [toBeSameDay() / toBeSameMonth() / toBeSameYear()](#tobesameday--tobesamemonth--tobesameyear)
- [toBeToday() / toBeYesterday() / toBeTomorrow()](#tobetoday--tobeyesterday--tobetomorrow)
- [toBeWeekday() / toBeWeekend()](#tobeweekday--tobeweekend)
- [toBeInThePast() / toBeInTheFuture()](#tobeinthepast--tobeinthefuture)
- [toBeLeapYear()](#tobeleapyear)
- [toHaveDateRange()](#tohavedaterange)
- [toHaveConsecutiveDates()](#tohaveconsecutivedates)
- [toHaveDatesWithinRange()](#tohavedateswithinrange)
- [toHaveUniqueDates()](#tohaveuniquedates)
- [toBeValidISODate()](#tobevalidisodate)
- [toMatchTimeZone()](#tomat chtimezone)
- [toBeStartOfMonth() / toBeEndOfMonth()](#tobestartofmonth--tobeendofmonth)
- [toHaveDateGapsLargerThan()](#tohavedategapslargerthan)
- [toBeInQuarter()](#tobeinquarter)
- [toBeSpecificDayOfWeek() / toBeInMonth()](#tobespecificdayofweek--tobeinmonth)

## toBeCloseTo()

Asserts that a date is close to another date within a specified deviation.

```typescript
import { expectly } from '@cerios/playwright-expectly';

// Check if dates are within 30 seconds
expectly(responseDate).toBeCloseTo(expectedDate, { seconds: 30 });

// Check if dates are within 1 hour
const now = new Date();
expectly(createdAt).toBeCloseTo(now, { hours: 1 });

// Multiple deviation units
expectly(timestamp).toBeCloseTo(new Date('2024-01-01T12:00:00Z'), {
  hours: 2,
  minutes: 30
});
```

## toHaveDatesAscendingOrder() / toHaveDatesDescendingOrder()

Asserts that an array of dates is sorted chronologically.

```typescript
// Testing API response dates
const events = await api.getEvents();
const dates = events.map(e => e.createdAt);
expectly(dates).toHaveDatesAscendingOrder();

// Descending order (newest to oldest)
const timeline = [new Date('2024-12-31'), new Date('2024-06-15'), new Date('2024-01-01')];
expectly(timeline).toHaveDatesDescendingOrder();
```

## toBeBefore() / toBeAfter()

Asserts that one date comes before or after another.

```typescript
// Check event ordering
expectly(startDate).toBeBefore(endDate);

// Verify creation happened before update
expectly(user.createdAt).toBeBefore(user.updatedAt);

// Check expiration is in the future
expectly(expiryDate).toBeAfter(new Date());
```

## toBeBetween()

Asserts that a date falls within a range (inclusive).

```typescript
// Check date within a range
const start = new Date('2024-01-01');
const end = new Date('2024-12-31');
expectly(eventDate).toBeBetween(start, end);

// Validate appointment scheduling
expectly(appointment).toBeBetween(
  '2024-06-01T09:00:00Z',
  '2024-06-01T17:00:00Z'
);
```

## toBeSameDay() / toBeSameMonth() / toBeSameYear()

Compares dates at different granularities.

```typescript
// Check if event is today
expectly(eventDate).toBeSameDay(new Date());

// Verify dates match regardless of time
expectly('2024-01-01T08:00:00Z').toBeSameDay('2024-01-01T20:00:00Z');

// Check if dates are in the same month
expectly('2024-01-15').toBeSameMonth('2024-01-20');

// Validate same year
expectly('2024-01-01').toBeSameYear('2024-12-31');
```

## toBeToday() / toBeYesterday() / toBeTomorrow()

Checks if a date matches today, yesterday, or tomorrow.

```typescript
// Check if timestamp is from today
expectly(new Date(order.timestamp)).toBeToday();

// Check if date is from yesterday
expectly(lastLogin).toBeYesterday();

// Validate future appointment
expectly(appointment.date).toBeTomorrow();
```

## toBeWeekday() / toBeWeekend()

Validates if a date falls on a weekday or weekend.

```typescript
// Validate business day
expectly(deliveryDate).toBeWeekday();

// Check office hours scheduling
expectly(meeting.scheduledFor).toBeWeekday();

// Validate weekend event
expectly(event.date).toBeWeekend();
```

## toBeInThePast() / toBeInTheFuture()

Checks if a date is before or after the current moment.

```typescript
// Validate historical record
expectly(user.createdAt).toBeInThePast();

// Check completed event
expectly(order.completedAt).toBeInThePast();

// Validate expiration date
expectly(subscription.expiresAt).toBeInTheFuture();

// Check scheduled event
expectly(upcomingMeeting.startsAt).toBeInTheFuture();
```

## toBeLeapYear()

Validates if a date's year is a leap year.

```typescript
// Check if year is a leap year
expectly(new Date('2024-06-15')).toBeLeapYear(); // 2024 is a leap year
expectly(new Date('2023-06-15')).not.toBeLeapYear(); // 2023 is not
```

## toHaveDateRange()

Asserts that an array of dates spans approximately the expected range.

```typescript
// Check if data covers 30 days
const reportDates = await api.getReportDates();
expectly(reportDates).toHaveDateRange({ days: 30 });

// Validate year-long dataset
expectly(timestamps).toHaveDateRange({ years: 1 });

// Mixed units
expectly(dates).toHaveDateRange({ months: 3, days: 15 });
```

## toHaveConsecutiveDates()

Asserts that an array contains consecutive dates by unit.

```typescript
// Check consecutive days
const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
expectly(dates).toHaveConsecutiveDates('day');

// Validate monthly sequence
expectly(billingDates).toHaveConsecutiveDates('month');

// Check yearly progression
expectly(annualReports).toHaveConsecutiveDates('year');
```

## toHaveDatesWithinRange()

Asserts that all dates in an array fall within a range.

```typescript
// Validate all dates are in Q1 2024
expectly(transactions).toHaveDatesWithinRange(
  '2024-01-01',
  '2024-03-31'
);

// Check business hours entries
expectly(logEntries).toHaveDatesWithinRange(
  new Date('2024-06-01T09:00:00Z'),
  new Date('2024-06-01T17:00:00Z')
);
```

## toHaveUniqueDates()

Asserts that all dates in an array are unique.

```typescript
// Check for duplicate timestamps
expectly(eventTimestamps).toHaveUniqueDates();

// Validate unique days (ignore time)
expectly(dailyRecords).toHaveUniqueDates(true);

// Ensure no duplicate entries
const dates = ['2024-01-01T10:00:00Z', '2024-01-02T10:00:00Z'];
expectly(dates).toHaveUniqueDates();
```

## toBeValidISODate()

Validates that a string is in ISO 8601 format.

```typescript
// Validate API response format
const timestamp = await page.locator('.timestamp').textContent();
expectly(timestamp).toBeValidISODate();

// Check ISO format compliance
expectly('2024-01-01T12:00:00.000Z').toBeValidISODate();
expectly('2024-01-01T12:00:00Z').toBeValidISODate();
```

## toMatchTimeZone()

Asserts that a date matches a specific timezone offset.

```typescript
// Check if date is in UTC
expectly(timestamp).toMatchTimeZone(0);
expectly(timestamp).toMatchTimeZone('UTC');

// Check if date is in EST (UTC-5)
expectly(date).toMatchTimeZone(-300);
expectly(date).toMatchTimeZone('-05:00');

// Check if date is in IST (UTC+5:30)
expectly(date).toMatchTimeZone(330);
expectly(date).toMatchTimeZone('+05:30');
```

## toBeStartOfMonth() / toBeEndOfMonth()

Checks if a date is the first or last day of the month.

```typescript
// Check if billing date is start of month
expectly(billingDate).toBeStartOfMonth();

// Validate monthly report date
expectly(new Date('2024-01-01')).toBeStartOfMonth();

// Check if date is end of month
expectly(paymentDate).toBeEndOfMonth();

// Validate month-end processing
expectly(new Date('2024-01-31')).toBeEndOfMonth();
```

## toHaveDateGapsLargerThan()

Finds gaps larger than the specified duration in a date array.

```typescript
// Check for gaps larger than 7 days
expectly(activityDates).toHaveDateGapsLargerThan({ days: 7 });

// Find inactivity periods longer than 1 hour
expectly(loginTimestamps).toHaveDateGapsLargerThan({ hours: 1 });

// Detect monthly gaps
expectly(reportDates).toHaveDateGapsLargerThan({ months: 1 });
```

## toBeInQuarter()

Validates that a date falls within a specific fiscal quarter.

```typescript
// Check if date is in Q1 (Jan-Mar)
expectly(date).toBeInQuarter(1);

// Validate Q4 date (Oct-Dec)
expectly(yearEndReport).toBeInQuarter(4);
```

## toBeSpecificDayOfWeek() / toBeInMonth()

Checks if a date falls on a specific day or in a specific month.

```typescript
// Check if date is a Monday
expectly(meetingDate).toBeSpecificDayOfWeek('Monday');
expectly(meetingDate).toBeSpecificDayOfWeek(1);

// Validate weekend day
expectly(eventDate).toBeSpecificDayOfWeek('Saturday');

// Check if date is in January
expectly(date).toBeInMonth('January');
expectly(date).toBeInMonth(1);

// Validate December date
expectly(holidayDate).toBeInMonth('December');
```

## Common Use Cases

### Event Scheduling

```typescript
test('validate event timing', async () => {
  const event = await api.getEvent(123);

  expectly(event.startDate).toBeInTheFuture();
  expectly(event.startDate).toBeBefore(event.endDate);
  expectly(event.startDate).toBeWeekday();
  expectly(event.startDate).toBeCloseTo(new Date('2024-06-01'), { days: 1 });
});
```

### Data Timeline Validation

```typescript
test('validate data timeline', async () => {
  const records = await api.getRecords();
  const dates = records.map(r => r.createdAt);

  expectly(dates).toHaveDatesAscendingOrder();
  expectly(dates).toHaveDatesWithinRange(
    new Date('2024-01-01'),
    new Date('2024-12-31')
  );
  expectly(dates).toHaveUniqueDates();
});
```

### Business Logic

```typescript
test('validate business rules', async () => {
  const order = await api.getOrder(456);

  expectly(order.createdAt).toBeInThePast();
  expectly(order.deliveryDate).toBeWeekday();
  expectly(order.deliveryDate).not.toBeWeekend();
  expectly(order.expiryDate).toBeAfter(order.deliveryDate);
});
```

## Related

- [Number Array Matchers](./NUMBER_ARRAY_MATCHERS.md) - For numerical validation
- [Generic Matchers](./GENERIC_MATCHERS.md) - For type validation
- [Locator Matchers](./LOCATOR_MATCHERS.md) - For DOM date validation

[← Back to README](../README.md)
