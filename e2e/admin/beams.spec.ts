import { expect, test } from '../fixtures/auth'

test.describe('Admin beams page', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin/beams')
  })

  test('displays beams heading', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('heading', { name: 'Beams', exact: true }),
    ).toBeVisible()
  })
})
