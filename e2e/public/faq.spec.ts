import { expect, test } from '@playwright/test'

test.describe('FAQ page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq')
  })

  test('displays main heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Frequently Asked Questions' }),
    ).toBeVisible()
  })

  test('displays subtitle', async ({ page }) => {
    await expect(
      page.getByText('Find answers to common questions about AqXen Socials.'),
    ).toBeVisible()
  })

  test('renders all accordion items', async ({ page }) => {
    const triggers = page.locator('[data-radix-collection-item]')
    await expect(triggers).toHaveCount(9)
  })

  test('accordion expands on click', async ({ page }) => {
    const firstTrigger = page
      .getByRole('button', {
        name: 'What is AqXen Socials and the AqXen Stream?',
      })

    await firstTrigger.click()

    const content = page.getByText(
      'AqXen Socials is a positive social media platform',
    )
    await expect(content).toBeVisible()
  })

  test('multiple accordions can be open simultaneously', async ({ page }) => {
    await page
      .getByRole('button', {
        name: 'What is AqXen Socials and the AqXen Stream?',
      })
      .click()

    await page
      .getByRole('button', {
        name: 'What are Beams and how do I get them?',
      })
      .click()

    await expect(
      page.getByText('AqXen Socials is a positive social media platform'),
    ).toBeVisible()
    await expect(
      page.getByText('A Beam is a unit of peer to peer recognition'),
    ).toBeVisible()
  })
})
