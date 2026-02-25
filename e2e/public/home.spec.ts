import { expect, test } from '@playwright/test'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays hero heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Where Positive Actions Beam' }),
    ).toBeVisible()
  })

  test('displays hero description', async ({ page }) => {
    await expect(
      page.getByText('AqXen Socials is the social platform'),
    ).toBeVisible()
  })

  test('displays AppBar with logo', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('link', { name: 'AqXen' }).first()).toBeVisible()
  })

  test('displays footer', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible()
  })

  test('displays call-to-action Log in button in hero', async ({ page }) => {
    const hero = page.locator('header')
    await expect(hero.getByRole('button', { name: 'Log in' })).toBeVisible()
  })

  test('displays Log in button in navbar', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('button', { name: 'Log in' })).toBeVisible()
  })
})
