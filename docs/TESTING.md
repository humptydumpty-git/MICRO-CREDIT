# Testing Guide

This guide explains how to run tests for HUMPBANK.

## Test Types

HUMPBANK includes three types of tests:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test how different parts of the system work together
3. **E2E Tests** - Test the entire application from a user's perspective

## Running Tests

### Unit Tests

Run unit tests with Vitest:

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Integration Tests

Integration tests are also run with Vitest:

```bash
npm test
```

### E2E Tests

E2E tests use Playwright:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils'

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('₦1,000.00')
  })
})
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { customerService } from '@/services/customerService'

describe('CustomerService Integration', () => {
  it('should fetch customers', async () => {
    const customers = await customerService.getAll()
    expect(Array.isArray(customers)).toBe(true)
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should login and view dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## Test Coverage

Generate and view test coverage:

```bash
npm run test:coverage
```

This generates a coverage report in the `coverage/` directory.

## Best Practices

1. Write tests for critical business logic
2. Test user interactions in E2E tests
3. Mock external services in unit tests
4. Keep tests isolated and independent
5. Use descriptive test names
6. Maintain good test coverage (aim for >80%)

