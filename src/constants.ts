export const ORG = 'neworgneworg'
export const ORG_SYMBOL = 'NEWO'

const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
  ? 'mainnet'
  : 'testnet'

export const CHAIN_API_URL =
  NETWORK === 'mainnet'
    ? 'https://eos.eosusa.io/'
    : 'https://jungle.eosusa.io/'

export const TOKEN_CONTRACT =
  NETWORK === 'mainnet' ? 'core.vaulta' : 'eosio.token'

export const TOKEN_SYMBOL = NETWORK === 'mainnet' ? 'A' : 'EOS'

export const COINGECKO_ID = NETWORK === 'mainnet' ? 'vaulta' : 'eos'

export const IPFS_IMAGE_SOURCE = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/`

export const I64 = 'i64'

const testnetContracts = {
  ORGANIZATION: 'organizatdev',
  BILLING: 'billingdevde',
  SIMPLE_MANAGER: 'simmanagedev',
  ANDEMITTER_MANAGER: 'aemanagerdev',
  BOUNDED_AGG_MANAGER: 'bamanagerdev',
  BADGE_DATA: 'badgedatadev',
  AUTHORITY: 'authoritydev',
  SIMPLEBADGE: 'simplebaddev',
  CUMULATIVE: 'cumulativdev',
  STATISTICS: 'statisticdev',
  ANDEMITTER: 'andemittedev',
  BOUNDED_AGG: 'boundedagdev',
  BOUNDED_STATS: 'boundedstdev',
  BEAMS: 'beamsdevdevd',
  BEAMS_MANAGER: 'beamsmanadev',
} as const

const mainnetContracts = {
  ORGANIZATION: 'org.rep',
  BILLING: 'bill.rep',
  SIMPLE_MANAGER: 'simman.rep',
  ANDEMITTER_MANAGER: 'aeman.rep',
  BOUNDED_AGG_MANAGER: 'baman.rep',
  BADGE_DATA: 'baddat.rep',
  AUTHORITY: 'auth.rep',
  SIMPLEBADGE: 'simbad.rep',
  CUMULATIVE: 'cumulat.rep',
  STATISTICS: 'stats.rep',
  ANDEMITTER: 'andemit.rep',
  BOUNDED_AGG: 'bagg.rep',
  BOUNDED_STATS: 'bstats.rep',
  BEAMS: 'beams.rep',
  BEAMS_MANAGER: 'beamman.rep',
} as const

export const Contract =
  NETWORK === 'mainnet' ? mainnetContracts : testnetContracts

export const HIDDEN_ORGS: string[] =
  NETWORK === 'mainnet' ? ['loyalnine313', 'ayellowlemon'] : []
