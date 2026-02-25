import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('navbar contains expected links', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'About' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Organizations' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'FAQ' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible()
  })

  test('footer contains expected links', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'About' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Pricing' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Organizations' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Stream' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'FAQ' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Contact' })).toBeVisible()
  })

  test('logo navigates to home', async ({ page }) => {
    await page.goto('/about-us')
    await page.getByRole('link', { name: 'AqXen' }).first().click()
    await expect(page).toHaveURL('/')
  })

  test('About link navigates to about page', async ({ page }) => {
    await page.locator('footer').getByRole('link', { name: 'About' }).click()
    await expect(page).toHaveURL('/about-us')
  })

  test('FAQ link navigates to FAQ page', async ({ page }) => {
    await page.locator('footer').getByRole('link', { name: 'FAQ' }).click()
    await expect(page).toHaveURL('/faq')
  })

  test('Contact link navigates to contact page', async ({ page }) => {
    await page.locator('footer').getByRole('link', { name: 'Contact' }).click()
    await expect(page).toHaveURL('/contact')
  })
})
