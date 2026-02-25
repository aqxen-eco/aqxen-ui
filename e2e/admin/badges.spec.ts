import { expect, test } from '../fixtures/auth'

test.describe('Admin badges page', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin/badges')
  })

  test('displays badges heading', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('heading', { name: 'Badges' }),
    ).toBeVisible()
  })

  test('displays new badge link', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('link', { name: 'New badge' }),
    ).toBeVisible()
  })
})
