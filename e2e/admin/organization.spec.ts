import { expect, test } from '../fixtures/auth'

test.describe('Admin organization page', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin/organization')
  })

  test('displays form fields', async ({ adminPage }) => {
    await expect(adminPage.getByLabel('Name')).toBeVisible()
    await expect(adminPage.getByText('Logo')).toBeVisible()
    await expect(adminPage.getByLabel('Short Description')).toBeVisible()
    await expect(adminPage.getByLabel('About Organization')).toBeVisible()
    await expect(adminPage.getByLabel('Organization Purpose')).toBeVisible()
  })

  test('displays save button', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('button', { name: 'Save' }),
    ).toBeVisible()
  })

  test('displays organization preview panel', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('heading', { name: 'Organization preview' }),
    ).toBeVisible()
  })
})
