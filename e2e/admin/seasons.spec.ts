import { expect, test } from '../fixtures/auth'

test.describe('Admin seasons page', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin/seasons')
  })

  test('displays seasons heading', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('heading', { name: 'Seasons' }),
    ).toBeVisible()
  })

  test('displays new season link', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('link', { name: 'New season' }),
    ).toBeVisible()
  })
})
