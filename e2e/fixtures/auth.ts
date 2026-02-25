import { test as base, type Page } from '@playwright/test'

const CHAIN_API_URL = 'https://jungle.eosusa.io/'
const TEST_ACTOR = 'testaccount1'
const JUNGLE4_CHAIN_ID =
  '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d'

const mockOrgResponse = {
  rows: [
    {
      org: TEST_ACTOR,
      org_code: 'TEST',
      offchain_lookup_data: JSON.stringify({
        user: { ipfs_image: '' },
      }),
      onchain_lookup_data: JSON.stringify({
        user: {
          display_name: 'Test Org',
          short_description: 'A test organization',
          about: 'About test org',
          purpose: 'Testing',
        },
        system: {
          created_at: '2024-01-01T00:00:00',
        },
      }),
    },
  ],
  more: false,
}

async function mockWharfSession(page: Page) {
  await page.addInitScript(
    ({ actor, chainId }) => {
      // BrowserLocalStorage uses empty keyPrefix: keys are "wharf--session" / "wharf--sessions"
      localStorage.setItem(
        'wharf--session',
        JSON.stringify({ actor, permission: 'active', chain: chainId }),
      )
      localStorage.setItem(
        'wharf--sessions',
        JSON.stringify([
          {
            actor,
            permission: 'active',
            chain: chainId,
            default: true,
            walletPlugin: { id: 'anchor', data: {} },
          },
        ]),
      )
    },
    { actor: TEST_ACTOR, chainId: JUNGLE4_CHAIN_ID },
  )
}

async function loginViaApi(page: Page) {
  const response = await page.request.post('/api/auth/login', {
    data: { actor: TEST_ACTOR },
  })
  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()}`)
  }
}

async function mockChainApi(page: Page) {
  await page.route(`${CHAIN_API_URL}**/**/get_table_rows`, (route) => {
    const postData = route.request().postDataJSON()

    if (postData?.table === 'orgs') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrgResponse),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ rows: [], more: false }),
    })
  })
}

type AuthFixtures = {
  authenticatedPage: Page
  adminPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await loginViaApi(page)
    await use(page)
  },
  adminPage: async ({ page }, use) => {
    await loginViaApi(page)
    await mockWharfSession(page)
    await mockChainApi(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
