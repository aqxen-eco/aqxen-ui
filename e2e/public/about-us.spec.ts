import { expect, test } from '@playwright/test'

test.describe('About Us page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about-us')
  })

  test('displays main heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: "The AqXen Ecosystem's Commitment to Progress",
      }),
    ).toBeVisible()
  })

  test('displays Beams section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: "What are 'Beams'?" }),
    ).toBeVisible()
  })

  test('displays audience section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Who is AqXen Socials For?' }),
    ).toBeVisible()
  })

  test('displays Get Started link', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: 'Get Started' }),
    ).toBeVisible()
  })

  test('Get Started link points to subscriptions', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Get Started' })).toHaveAttribute(
      'href',
      '/subscriptions',
    )
  })
})
