'use client'

import { useQueries } from '@tanstack/react-query'

import { listBadge } from '@/api/chain/badge/list-badge'
import { disableBadgeAutomation } from '@/api/chain/badge-automation/disable-badge-automation'
import { listBadgeAutomation } from '@/api/chain/badge-automation/list-badge-automation'
import { Badge } from '@/api/model/badge'
import { TableSkeleton } from '@/components/skeleton'
import { BadgeImage } from '@/components/ui/badge-image'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tag } from '@/components/ui/tag'
import { Tooltip } from '@/components/ui/tooltip'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

export default function BadgeAutomationPage() {
  const { actor, session } = useChain()
  const { name, symbol } = useOrganization()

  const [badgeAutomationQuery, badgesQuery] = useQueries({
    queries: [
      {
        queryKey: ['badge-automation', actor],
        queryFn: async () => await listBadgeAutomation({ scope: actor }),
      },
      {
        queryKey: ['badges', name, symbol],
        queryFn: async () =>
          await listBadge({
            scope: name,
            organization_symbol: symbol,
          }),
      },
    ],
  })

  // function handleDisable({ emission_symbol }: { emission_symbol: string }) {
  //   disableBadgeAutomation({ session: session!, emission_symbol })
  // }

  // function handleEnable() {}

  if (badgeAutomationQuery.isLoading || badgesQuery.isLoading) {
    return <TableSkeleton />
  }

  if (
    !badgeAutomationQuery.data ||
    badgeAutomationQuery.data.rows.length === 0 ||
    !badgesQuery.data ||
    badgesQuery.data.rows.length === 0
  ) {
    return null
  }

  const data = badgeAutomationQuery.data.rows.map((row) => {
    const emitAssetsBadge = row.emit_assets.map((item) => {
      const [quantity, symbol] = item.emit_asset.split(' ')
      return {
        quantity,
        symbol,
      }
    })
    const emitterCriteriaBadge = row.emitter_criteria.map((item) => {
      const [quantity, symbol] = item.value.split(' ')
      return {
        quantity,
        symbol,
      }
    })

    const { emit_assets, emitter_criteria } = badgesQuery.data.rows.reduce(
      (acc, crr) => {
        const badgeSymbol = crr.id.split(',')[1]

        const emitAssetsBadgeItem = emitAssetsBadge.find(
          (item) => item.symbol === badgeSymbol
        )
        const emitterCriteriaBadgeItem = emitterCriteriaBadge.find(
          (item) => item.symbol === badgeSymbol
        )
        if (emitAssetsBadgeItem) {
          acc.emit_assets.push({
            ...crr,
            quantity: emitAssetsBadgeItem.quantity,
          })
        }

        if (emitterCriteriaBadgeItem) {
          acc.emitter_criteria.push({
            ...crr,
            quantity: emitterCriteriaBadgeItem.quantity,
          })
        }

        return acc
      },
      {
        emit_assets: [],
        emitter_criteria: [],
      } as {
        emit_assets: ({ quantity: string } & Badge)[]
        emitter_criteria: ({ quantity: string } & Badge)[]
      }
    )

    return {
      ...row,
      emit_assets,
      emitter_criteria,
      emission_symbol_formatted: row.emission_symbol
        .split(',')[1]
        .replace(symbol.toUpperCase(), ''),
    }
  })

  // console.log('data', data)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Sym</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-40">Emitter criteria</TableHead>
          <TableHead className="w-40">Emit badges</TableHead>
          <TableHead className="w-32">Status</TableHead>
          <TableHead className="w-22" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.emission_symbol}>
            <TableCell className="text-gray-3">
              {row.emission_symbol_formatted}
            </TableCell>
            <TableCell className="space-x-2">
              <span className="inline-block">Placeholder name</span>
              {row.cyclic && <Tag>Cyclic</Tag>}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                {row.emitter_criteria.map((badge) => (
                  <Tooltip
                    key={badge.id}
                    content={`${badge.quantity} ${badge.name}`}
                  >
                    <div>
                      <BadgeImage src={badge.ipfs} size="xs" />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                {row.emit_assets.map((badge) => (
                  <Tooltip
                    key={badge.id}
                    content={`${badge.quantity} ${badge.name}`}
                  >
                    <div>
                      <BadgeImage src={badge.ipfs} size="xs" />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {row.status === 'init' && <Tag variant="green">Enabled</Tag>}
              {/* <Tag variant="red">Disabled</Tag> */}
            </TableCell>
            <TableCell className="text-right">
              {row.status === 'init' && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    disableBadgeAutomation({
                      session: session!,
                      emission_symbol: row.emission_symbol,
                    })
                  }}
                >
                  Disable
                </Button>
              )}
              {/* <Button variant="secondary" size="md">
              Enable
            </Button> */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
