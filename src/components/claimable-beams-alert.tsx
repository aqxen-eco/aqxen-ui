'use client'

import NextLink from 'next/link'
import { MdElectricBolt } from 'react-icons/md'

import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { useChain } from '@/contexts/chain'
import { useHasClaimableBeams } from '@/hooks/use-has-claimable-beams'

export function ClaimableBeamsAlert() {
  const { actor } = useChain()
  const { hasClaimable, isLoading } = useHasClaimableBeams()

  if (isLoading || !hasClaimable) return null

  return (
    <Box className="border-gray-2 bg-gray-1 mb-4 flex items-center justify-between gap-4 rounded-xl p-4">
      <p className="text-body-2 flex items-center gap-2 text-white">
        <MdElectricBolt className="size-5 flex-none text-yellow-400" />
        You have beams available to claim!
      </p>
      <Button asChild variant="primary" size="md">
        <NextLink href={`/profile/${actor}`}>Claim Beams</NextLink>
      </Button>
    </Box>
  )
}
