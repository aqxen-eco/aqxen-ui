'use client'

import { MdWorkspacePremium } from 'react-icons/md'

import { Tooltip } from '@/components/ui/tooltip'

import type { ReputationBreakdown } from './functions'

type ReputationTooltipProps = {
  total: number
  breakdown: ReputationBreakdown
}

export function ReputationTooltip({
  total,
  breakdown,
}: ReputationTooltipProps) {
  return (
    <Tooltip
      className="min-w-40"
      content={
        breakdown.length === 0 ? (
          <span className="text-gray-3">No beam contributions</span>
        ) : (
          <div className="space-y-1">
            {breakdown.map((row) => (
              <div key={row.name} className="flex justify-between gap-4">
                <span className="text-white">{row.name}</span>
                <span className="text-gray-3 tabular-nums">{row.score}</span>
              </div>
            ))}
            <div className="border-gray-2 my-1 border-t" />
            <div className="flex justify-between gap-4">
              <span className="font-medium text-white">Total</span>
              <span className="font-medium text-white tabular-nums">
                {total}
              </span>
            </div>
          </div>
        )
      }
    >
      <span className="text-gray-3 flex cursor-default items-center gap-0.5">
        <MdWorkspacePremium className="size-5" />
        <span className="text-body-2">{total}</span>
      </span>
    </Tooltip>
  )
}
