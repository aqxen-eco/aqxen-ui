'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listBeamMetadata } from '@/api/chain/beams/list-beam-metadata'
import type { Badge } from '@/api/model/badge'
import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { TableSkeleton } from '@/components/skeleton'
import { BadgeDetailModal } from '@/components/ui/badge-detail-modal'
import { BadgeImage } from '@/components/ui/badge-image'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Select, SelectItem } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOrganization } from '@/contexts/organization'

export default function BadgesPage() {
  const { name, removeOrganizationSymbol } = useOrganization()
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const query = useQuery({
    queryKey: ['badges', name],
    queryFn: async () => await listBadge({ scope: name }),
  })

  const beamsQuery = useQuery({
    queryKey: ['beams', name],
    queryFn: async () => await listBeamMetadata({ scope: name }),
  })

  const filteredRows = useMemo(() => {
    if (!query.data?.rows) return []
    const beamSymbols = new Set(
      beamsQuery.data?.map((b) => b.badge_symbol) ?? [],
    )
    return query.data.rows.filter((row) => !beamSymbols.has(row.badge_symbol))
  }, [query.data, beamsQuery.data])

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/badges" />
        <HeaderAdminTitle title="Badges" tooltip="Lorem ipsum dolor sit amed">
          <Link href="/admin/new-badge" variant="primary" size="md">
            New badge
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        {query.isLoading && <TableSkeleton />}
        {query.isSuccess && filteredRows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Sym</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-40 text-center">
                  Total awarded
                </TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.badge_symbol}>
                  <TableCell className="text-gray-3">
                    {removeOrganizationSymbol(row.badge_symbol)}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-2"
                      onClick={() => setSelectedBadge(row)}
                    >
                      <BadgeImage
                        src={row.offchain_lookup_data.user.ipfs_image}
                        size="xs"
                      />
                      <span className="text-body-2 font-sans font-medium text-nowrap text-white hover:underline">
                        {row.onchain_lookup_data.user.display_name}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    {row.rarity_counts}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setSelectedBadge(row)}
                      >
                        Details
                      </Button>
                      <Link
                        href={`/admin/badges/${row.badge_symbol}/send-badge`}
                        variant="secondary"
                        size="md"
                      >
                        Send
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {query.data?.more && (
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={Object.keys(query.data.rows[0]).length + 1}
                  >
                    <div className="text-body-2 flex items-center justify-center gap-2 pt-8 text-white">
                      Page
                      <Select label="Page" placeholder="Page" defaultValue="1">
                        {['1', '2', '3', '4', '5', '6'].map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </Select>
                      of 6
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        )}
      </div>
      <BadgeDetailModal
        open={!!selectedBadge}
        onOpenChange={(open) => {
          if (!open) setSelectedBadge(null)
        }}
        badgeSymbol={selectedBadge?.badge_symbol ?? ''}
        scope={name}
        badge={selectedBadge ?? undefined}
      />
    </>
  )
}
