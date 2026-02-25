import { expect, test } from '../fixtures/auth'

test.describe('Admin subscription page', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin/subscription')
  })

  test('displays subscription heading', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('heading', { name: 'Subscription' }),
    ).toBeVisible()
  })

  test('displays buy subscription link', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('link', { name: 'Buy Subscription' }),
    ).toBeVisible()
  })
})
