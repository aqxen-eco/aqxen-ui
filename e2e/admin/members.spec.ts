import { expect, test } from '../fixtures/auth'

test.describe('Admin members page', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin/members')
  })

  test('displays members heading', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('heading', { name: 'Members' }).first(),
    ).toBeVisible()
  })

  test('displays add member button', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('button', { name: 'Add member' }),
    ).toBeVisible()
  })

  test('displays pending requests section', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('heading', { name: 'Pending requests' }),
    ).toBeVisible()
  })

  test('displays members section', async ({ adminPage }) => {
    const membersHeadings = adminPage.getByRole('heading', { name: 'Members' })
    await expect(membersHeadings.last()).toBeVisible()
  })
})
