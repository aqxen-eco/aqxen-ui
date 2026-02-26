import { expect, test } from '@playwright/test'

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('displays heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: "Let's Connect" }),
    ).toBeVisible()
  })

  test('renders all form fields', async ({ page }) => {
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel(/Organization Name/)).toBeVisible()
    await expect(page.getByLabel('Message')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Email is invalid')).toBeVisible()
    await expect(page.getByText('Message is required')).toBeVisible()
  })

  test('shows email format validation error', async ({ page }) => {
    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByLabel('Message').fill('Test message')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('Email is invalid')).toBeVisible()
  })

  test('organization name is optional', async ({ page }) => {
    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Message').fill('Test message')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('Name is required')).not.toBeVisible()
    await expect(page.getByText('Email is invalid')).not.toBeVisible()
    await expect(page.getByText('Message is required')).not.toBeVisible()
  })

  test('sets aria-invalid on invalid fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByLabel('Name')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await expect(page.getByLabel('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await expect(page.getByLabel('Message')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  test('shows loading state on submit', async ({ page }) => {
    await page.route('**/contact', (route) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          route.fulfill({ status: 200, body: '{}' })
          resolve(undefined)
        }, 2000)
      })
    })

    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Message').fill('Hello')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(
      page.getByRole('button', { name: 'Submitting...' }),
    ).toBeVisible()
  })
})
