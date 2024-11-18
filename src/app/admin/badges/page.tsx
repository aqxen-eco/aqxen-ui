import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from "@/components/header-admin";

import { BadgeImage } from "@/components/ui/badge-image";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Select, SelectItem } from "@/components/ui/select";
import { getBadges } from "./functions";

export default async function BadgesPage() {
  const { rows, more } = await getBadges();

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

      <div className="mx-auto max-w-container-lg pb-8 px-4 min-h-[calc(100vh-24rem)]">
        {rows.length > 0 && (
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
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-gray-3">{row.symbol}</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2">
                      <BadgeImage src={row.ipfs} size="xs" />
                      <span className="text-body-2 font-sans font-medium text-white text-nowrap capitalize">
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
            {more && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={Object.keys(rows[0]).length + 1}>
                    <div className="pt-8 flex items-center justify-center gap-2 text-body-2 text-white">
                      Page
                      <Select label="Page" placeholder="Page" defaultValue="1">
                        {["1", "2", "3", "4", "5", "6"].map((item) => (
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
  );
}
