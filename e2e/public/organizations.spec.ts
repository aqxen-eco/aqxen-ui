import { expect, test } from '@playwright/test'

const CHAIN_API_URL = 'https://jungle.eosusa.io/'

test.describe('Organizations page', () => {
  test('displays main heading', async ({ page }) => {
    await page.goto('/organizations')

    await expect(
      page.getByRole('heading', {
        name: 'Welcome to AqXen Orgs: Building Momentum Together',
      }),
    ).toBeVisible()
  })

  test('displays subtitle', async ({ page }) => {
    await page.goto('/organizations')

    await expect(
      page.getByText('Visit Your Org or Apply to Join a New Org'),
    ).toBeVisible()
  })

  test('shows loading skeletons initially', async ({ page }) => {
    await page.route(`${CHAIN_API_URL}**/**/get_table_rows`, () => {
      // Never resolve — keeps loading state visible
    })
    await page.goto('/organizations')

    await expect(page.locator('.animate-pulse').first()).toBeVisible()
  })

  test('displays org cards when chain returns data', async ({ page }) => {
    await page.route(`${CHAIN_API_URL}**/**/get_table_rows`, (route) => {
      const postData = route.request().postDataJSON()
      if (postData?.table === 'orgs') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            rows: [
              {
                org: 'testorg1',
                org_code: 'TST',
                offchain_lookup_data: JSON.stringify({
                  user: { ipfs_image: '' },
                }),
                onchain_lookup_data: JSON.stringify({
                  user: {
                    display_name: 'Test Organization',
                    short_description: 'A test org',
                    about: 'About',
                    purpose: 'Testing',
                  },
                  system: { created_at: '2024-01-01T00:00:00' },
                }),
              },
            ],
            more: false,
          }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ rows: [], more: false }),
      })
    })

    await page.goto('/organizations')

    await expect(page.getByText('Test Organization')).toBeVisible()
    await expect(page.getByRole('link', { name: 'View' }).first()).toBeVisible()
  })

  test('displays empty state when no organizations exist', async ({
    page,
  }) => {
    await page.route(`${CHAIN_API_URL}**/**/get_table_rows`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ rows: [], more: false }),
      }),
    )

    await page.goto('/organizations')

    await expect(page.getByText('No organizations found.')).toBeVisible()
  })
})
