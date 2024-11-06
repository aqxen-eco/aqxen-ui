import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { HeaderAdmin, HeaderAdminMenu, HeaderAdminTitle } from "@/components/header-admin";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Select, SelectItem } from "@/components/ui/select";
import { getBadges } from "./functions";

export default async function BadgesPage() {
  const badges = await getBadges();

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
    
      <div className="mx-auto max-w-container-lg by-8 px-4">
        {badges.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Sym</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-40 text-center">Rarity counts</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell className="text-gray-3">{badge.symbol}</TableCell>
                  <TableCell>{badge.name}</TableCell>
                  <TableCell className="text-center">
                    {badge.rarityCounts}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" size="md">
                      Send
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={Object.keys(badges[0]).length + 1}>
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
          </Table>
        )}
      </div>
    </>
  );
}
