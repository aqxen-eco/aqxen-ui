import { Name, UInt64 } from '@wharfkit/antelope'

const SIXTY_FOUR = BigInt(64)
const MASK_64 = (BigInt(1) << SIXTY_FOUR) - BigInt(1)

export function decodeActionKey(uint128Str: string) {
  const bigKey = BigInt(uint128Str)
  const contractValue = bigKey >> SIXTY_FOUR
  const actionValue = bigKey & MASK_64

  const contract = Name.from(UInt64.from(contractValue)).toString()
  const action = Name.from(UInt64.from(actionValue)).toString()

  return { contract, action }
}
