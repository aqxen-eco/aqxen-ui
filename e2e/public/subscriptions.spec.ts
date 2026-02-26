import { expect, test } from '@playwright/test'

test.describe('Subscriptions page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/subscriptions')
  })

  test('displays pricing heading for unauthenticated user', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'Pricing' }),
    ).toBeVisible()
  })

  test('displays sign-in subtitle', async ({ page }) => {
    await expect(
      page.getByText('Sign in with your wallet to purchase a subscription'),
    ).toBeVisible()
  })

  test('renders subscription table section', async ({ page }) => {
    await expect(page.locator('table').first()).toBeVisible()
  })
})
