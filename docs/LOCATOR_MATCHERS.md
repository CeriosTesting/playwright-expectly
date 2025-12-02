# Locator Matchers

DOM element text and attribute validation matchers for Playwright locators.

## Available Matchers

- [toStartWith() / toEndWith()](#tostartwith--toendwith)
- [toMatchPattern()](#tomatchpattern)
- [toBeValidEmail() / toBeValidUrl()](#tobevalidemail--tobevalidurl)
- [toBeAlphanumeric() / toBeNumericString()](#tobealphanumeric--tobenumericstring)
- [toBeUpperCase() / toBeLowerCase() / toBeTitleCase()](#tobeuppercase--tobelowercase--tobetitlecase)
- [toBeUUID()](#tobeuuid)
- [toHavePlaceholder()](#tohaveplaceholder)
- [toHaveHref() / toHaveSrc() / toHaveAlt()](#tohavehref--tohavesrc--tohavealt)
- [toHaveTitle() / toHaveTarget()](#tohavetitle--tohavetarget)
- [toHaveDataAttribute()](#tohavedataattribute)
- [toHaveAriaLabel()](#tohavearialabel)

## toStartWith() / toEndWith()

Validates that a locator's text starts with or ends with the expected string.

```typescript
import { expectly } from '@cerios/playwright-expectly';

// Check greeting message
await expectly(page.locator('.welcome')).toStartWith('Hello, ');

// Validate prefix in title
await expectly(page.locator('h1')).toStartWith('Chapter 1:');

// Check file extension in filename
await expectly(page.locator('.filename')).toEndWith('.pdf');

// Validate suffix in text
await expectly(page.locator('.price')).toEndWith(' USD');
```

## toMatchPattern()

Validates that a locator's text matches a regular expression.

```typescript
// Validate phone number format
await expectly(page.locator('.phone')).toMatchPattern(/^\d{3}-\d{3}-\d{4}$/);

// Check alphanumeric ID
await expectly(page.locator('.order-id')).toMatchPattern(/^[A-Z0-9]{8}$/);

// Version string
await expectly(page.locator('.version')).toMatchPattern(/^v\d+\.\d+\.\d+$/);
```

## toBeValidEmail() / toBeValidUrl()

Validates that a locator's text is a valid email or URL.

```typescript
// Validate email in profile
await expectly(page.locator('.user-email')).toBeValidEmail();

// Check contact info
await expectly(page.locator('[data-testid="email"]')).toBeValidEmail();

// Validate link text
await expectly(page.locator('.website-url')).toBeValidUrl();

// Check API endpoint display
await expectly(page.locator('.api-url')).toBeValidUrl();
```

## toBeAlphanumeric() / toBeNumericString()

Validates text contains only letters/numbers or only numbers.

```typescript
// Validate username format
await expectly(page.locator('.username')).toBeAlphanumeric();

// Check product code
await expectly(page.locator('.product-code')).toBeAlphanumeric();

// Validate PIN code
await expectly(page.locator('.pin-code')).toBeNumericString();

// Check ZIP code
await expectly(page.locator('.zip-code')).toBeNumericString();
```

## toBeUpperCase() / toBeLowerCase() / toBeTitleCase()

Validates text case formatting.

```typescript
// Validate capitalized heading
await expectly(page.locator('.heading')).toBeUpperCase();

// Check state abbreviation
await expectly(page.locator('.state-code')).toBeUpperCase();

// Validate lowercase username
await expectly(page.locator('.username')).toBeLowerCase();

// Check email format
await expectly(page.locator('.email')).toBeLowerCase();

// Validate book title format
await expectly(page.locator('.book-title')).toBeTitleCase();

// Check proper name formatting
await expectly(page.locator('.full-name')).toBeTitleCase();
```

## toBeUUID()

Validates that a locator's text is a valid UUID.

```typescript
// Validate any UUID
await expectly(page.locator('.transaction-id')).toBeUUID();

// Validate specific UUID v4
await expectly(page.locator('.user-id')).toBeUUID(4);

// With timeout
await expectly(page.locator('.session-id')).toBeUUID(4, { timeout: 5000 });
```

## toHavePlaceholder()

Validates an input element's placeholder attribute.

```typescript
// Check input placeholder
await expectly(page.locator('input[name="email"]')).toHavePlaceholder('Enter your email');

// Validate placeholder with regex
await expectly(page.locator('.search-input')).toHavePlaceholder(/search/i);

// With timeout
await expectly(page.locator('#username')).toHavePlaceholder('Username', { timeout: 3000 });
```

## toHaveHref() / toHaveSrc() / toHaveAlt()

Validates link, image, and accessibility attributes.

```typescript
// Check link destination
await expectly(page.locator('a.home-link')).toHaveHref('/');

// Validate external link with regex
await expectly(page.locator('.external-link')).toHaveHref(/^https:\/\//);

// Check image source
await expectly(page.locator('img.logo')).toHaveSrc('/images/logo.png');

// Validate CDN source with regex
await expectly(page.locator('.product-image')).toHaveSrc(/cdn\.example\.com/);

// Check alt text for accessibility
await expectly(page.locator('img.avatar')).toHaveAlt('User profile picture');

// Validate alt text pattern
await expectly(page.locator('.thumbnail')).toHaveAlt(/product image/i);
```

## toHaveTitle() / toHaveTarget()

Validates tooltip and link target attributes.

```typescript
// Check tooltip text
await expectly(page.locator('.help-icon')).toHaveTitle('Click for help');

// Validate title attribute
await expectly(page.locator('abbr')).toHaveTitle(/definition/i);

// Check if link opens in new tab
await expectly(page.locator('a.external')).toHaveTarget('_blank');

// Validate target attribute
await expectly(page.locator('.help-link')).toHaveTarget(/_blank|_top/);
```

## toHaveDataAttribute()

Validates custom data attributes.

```typescript
// Check if data attribute exists
await expectly(page.locator('.item')).toHaveDataAttribute('id');

// Check data attribute value
await expectly(page.locator('.item')).toHaveDataAttribute('status', 'active');

// Validate with regex
await expectly(page.locator('.item')).toHaveDataAttribute('price', /^\d+\.\d{2}$/);

// Can use 'data-' prefix or not
await expectly(page.locator('.widget')).toHaveDataAttribute('data-config', '{}');
await expectly(page.locator('.widget')).toHaveDataAttribute('config', '{}'); // Same
```

## toHaveAriaLabel()

Validates accessibility labels for screen readers.

```typescript
// Check accessibility label
await expectly(page.locator('button.close')).toHaveAriaLabel('Close dialog');

// Validate aria-label for screen readers
await expectly(page.locator('.menu-btn')).toHaveAriaLabel(/menu/i);

// Form accessibility
await expectly(page.locator('input#search')).toHaveAriaLabel('Search input');
```

## Common Use Cases

### Form Validation

```typescript
test('validate registration form elements', async ({ page }) => {
  await page.goto('/register');

  // Input placeholders
  await expectly(page.locator('#email')).toHavePlaceholder('Enter your email');
  await expectly(page.locator('#password')).toHavePlaceholder('Choose a password');

  // Actual values
  await page.locator('#email').fill('user@example.com');
  await expectly(page.locator('#email')).toBeValidEmail();

  await page.locator('#username').fill('user123');
  await expectly(page.locator('#username')).toBeAlphanumeric();

  await page.locator('#zip').fill('12345');
  await expectly(page.locator('#zip')).toBeNumericString();
});
```

### UI Component Testing

```typescript
test('validate product card', async ({ page }) => {
  const productCard = page.locator('.product-card').first();

  // Text formatting
  await expectly(productCard.locator('.product-title')).toBeTitleCase();
  await expectly(productCard.locator('.product-code')).toBeUpperCase();

  // Image validation
  await expectly(productCard.locator('img')).toHaveSrc(/cdn\.example\.com/);
  await expectly(productCard.locator('img')).toHaveAlt(/product/i);

  // Link validation
  await expectly(productCard.locator('a')).toHaveHref(/^\/products\//);

  // Data attributes
  await expectly(productCard).toHaveDataAttribute('product-id');
  await expectly(productCard).toHaveDataAttribute('category', 'electronics');
});
```

### Accessibility Testing

```typescript
test('validate accessibility attributes', async ({ page }) => {
  await page.goto('/dashboard');

  // ARIA labels
  await expectly(page.locator('button.menu')).toHaveAriaLabel('Main menu');
  await expectly(page.locator('button.close')).toHaveAriaLabel('Close');

  // Image alt text
  await expectly(page.locator('.logo')).toHaveAlt('Company Logo');
  await expectly(page.locator('.avatar')).toHaveAlt(/user profile/i);

  // Link targets for external links
  await expectly(page.locator('a.external')).toHaveTarget('_blank');

  // Tooltips
  await expectly(page.locator('.help-icon')).toHaveTitle('Click for help');
});
```

### Content Validation

```typescript
test('validate dynamic content', async ({ page }) => {
  await page.goto('/user/profile');

  // Email formatting
  const email = page.locator('.user-email');
  await expectly(email).toBeValidEmail();
  await expectly(email).toBeLowerCase();

  // URLs
  const website = page.locator('.user-website');
  await expectly(website).toBeValidUrl();
  await expectly(website).toStartWith('https://');

  // IDs
  const userId = page.locator('.user-id');
  await expectly(userId).toBeUUID(4);

  // Formatted text
  const fullName = page.locator('.user-name');
  await expectly(fullName).toBeTitleCase();
});
```

### Link and Navigation Testing

```typescript
test('validate navigation links', async ({ page }) => {
  await page.goto('/');

  // Internal links
  await expectly(page.locator('a.home')).toHaveHref('/');
  await expectly(page.locator('a.about')).toHaveHref('/about');

  // External links
  await expectly(page.locator('a.docs')).toHaveHref(/^https:\/\/docs\./);
  await expectly(page.locator('a.docs')).toHaveTarget('_blank');

  // Link text
  await expectly(page.locator('a.home')).toMatchPattern(/^home$/i);
});
```

## Timeout Configuration

All locator matchers support custom timeout configuration:

```typescript
// Default timeout (10 seconds)
await expectly(page.locator('.username')).toBeAlphanumeric();

// Custom timeout (5 seconds)
await expectly(page.locator('.username')).toBeAlphanumeric({ timeout: 5000 });

// Short timeout for fast-failing tests
await expectly(page.locator('.quick-element')).toBeValidEmail({ timeout: 2000 });
```

## Error Handling

When locators fail to be found or assertions fail, descriptive errors are provided:

```typescript
// Element not found
await expectly(page.locator('.missing')).toBeValidEmail();
// Error: Failed to get text from locator:
// Timeout 10000ms exceeded

// Assertion failure
await expectly(page.locator('.email')).toBeValidEmail();
// Error: Expected locator text to be a valid email address
// Received: "not-an-email"
```

## Related

- [String Matchers](./STRING_MATCHERS.md) - For string value validation
- [Generic Matchers](./GENERIC_MATCHERS.md) - For type validation
- [Date Matchers](./DATE_MATCHERS.md) - For date validation

[← Back to README](../README.md)
