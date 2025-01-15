import { APIClient } from '@wharfkit/antelope'

import { CHAIN_API_URL } from '@/constants'

export const jungleClient = new APIClient({
  url: CHAIN_API_URL,
})
