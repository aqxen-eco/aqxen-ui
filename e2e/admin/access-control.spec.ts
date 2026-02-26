import { expect, test } from '@playwright/test'

const adminRoutes = [
  '/admin',
  '/admin/organization',
  '/admin/members',
  '/admin/badges',
  '/admin/new-badge',
  '/admin/beams',
  '/admin/new-beam',
  '/admin/seasons',
  '/admin/new-season',
  '/admin/badges-automation',
  '/admin/new-badge-automation',
  '/admin/subscription',
  '/admin/buy-subscription',
]

test.describe('Admin access control', () => {
  for (const route of adminRoutes) {
    test(`redirects ${route} to / when unauthenticated`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL('/')
    })
  }
})
