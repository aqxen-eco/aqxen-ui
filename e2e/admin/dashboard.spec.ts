import { expect, test } from '../fixtures/auth'

test.describe('Admin dashboard', () => {
  test('renders admin home with navigation cards', async ({ adminPage }) => {
    await adminPage.goto('/admin')

    await expect(
      adminPage.getByRole('heading', { name: /good (morning|afternoon|evening)/i }),
    ).toBeVisible()
  })

  test('displays navigation links', async ({ adminPage }) => {
    await adminPage.goto('/admin')

    await expect(adminPage.getByRole('link', { name: 'Organization' })).toBeVisible()
    await expect(adminPage.getByRole('link', { name: 'Members' })).toBeVisible()
    await expect(adminPage.getByRole('link', { name: 'Badges' })).toBeVisible()
  })
})
