import { PinataSDK } from 'pinata'

export function getPinataClient() {
  const jwt = process.env.PINATA_JWT
  if (!jwt) throw new Error('PINATA_JWT not configured')

  return new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  })
}
