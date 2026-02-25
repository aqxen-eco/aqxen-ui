import { expect, test } from '@playwright/test'

test.describe('Stream page (unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stream')
  })

  test('displays main heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: 'Welcome to the AqXen Stream: Progress in Action',
      }),
    ).toBeVisible()
  })

  test('displays "A Stream Free From Noise" section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'A Stream Free From Noise.' }),
    ).toBeVisible()
  })

  test('displays "What You\'ll Find Here" section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: "What You'll Find Here" }),
    ).toBeVisible()
  })

  test('displays "Ready to See Real Progress?" section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Ready to See Real Progress?' }),
    ).toBeVisible()
  })

  test('displays log in button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Log in to the AqXen Stream' }),
    ).toBeVisible()
  })
})
