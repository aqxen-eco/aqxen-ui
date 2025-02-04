'use client'

import { useQuery } from '@tanstack/react-query'

import { listBadge } from '@/api/chain/badge'
import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { TableSkeleton } from '@/components/skeleton'
import { BadgeImage } from '@/components/ui/badge-image'
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
  const { name, symbol } = useOrganization()

  const query = useQuery({
    queryKey: ['badges', name, symbol],
    queryFn: async () =>
      await listBadge({ scope: name, organization_symbol: symbol }),
  })

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
      <div className="mx-auto min-h-[calc(100vh-24rem)] max-w-container-lg px-4 pb-8">
        {query.isLoading && <TableSkeleton />}
        {(query.isSuccess || (query.data && query.data.rows.length > 0)) && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Sym</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-40 text-center">
                  Rarity counts
                </TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-gray-3">{row.symbol}</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2">
                      <BadgeImage src={row.ipfs} size="xs" />
                      <span className="text-nowrap font-sans text-body-2 font-medium text-white">
                        {row.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {row.rarity_counts}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/badges/${row.id}/send-badge`}
                      variant="secondary"
                      size="md"
                    >
                      Send
                    </Link>
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
                    <div className="flex items-center justify-center gap-2 pt-8 text-body-2 text-white">
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
    </>
  )
}
