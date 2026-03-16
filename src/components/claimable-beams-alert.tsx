'use client'

import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { MdElectricBolt } from 'react-icons/md'

import { Tooltip } from '@/components/ui/tooltip'
import { useChain } from '@/contexts/chain'
import { useHasClaimableBeams } from '@/hooks/use-has-claimable-beams'

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  }
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export function ClaimableBeamsAlert() {
  const { actor } = useChain()
  const { hasClaimable, secondsUntilNextClaim, isLoading } =
    useHasClaimableBeams()
  const [countdown, setCountdown] = useState(secondsUntilNextClaim)

  useEffect(() => {
    setCountdown(secondsUntilNextClaim)
  }, [secondsUntilNextClaim])

  useEffect(() => {
    if (countdown === null || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) return 0
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown !== null && countdown > 0])

  if (isLoading || secondsUntilNextClaim === null) return null

  const isClaimable = hasClaimable || countdown === 0

  if (isClaimable) {
    return (
      <NextLink
        href={`/profile/${actor}`}
        className="text-body-2 flex items-center gap-1 font-medium text-yellow-400 hover:underline"
      >
        <MdElectricBolt className="size-5 flex-none" />
        <span>Beams Claimable</span>
      </NextLink>
    )
  }

  return (
    <Tooltip content="Beams claimable in">
      <div className="text-body-2 text-gray-3 flex items-center gap-1 font-medium">
        <MdElectricBolt className="size-5 flex-none text-white" />
        <span className="font-mono tabular-nums">{formatCountdown(countdown ?? 0)}</span>
      </div>
    </Tooltip>
  )
}
