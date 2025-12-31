import { test, expect } from '@playwright/test'

test.describe('HUMPBANK E2E Tests', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.locator('h1')).toContainText('HUMPBANK')
  })

  // Add more E2E tests here
})

