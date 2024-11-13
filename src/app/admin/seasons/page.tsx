import { MdKeyboardArrowRight, MdOutlineInfo } from "react-icons/md";

import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from "@/components/header-admin";
import { BadgeImage } from "@/components/ui/badge-image";
import { Link } from "@/components/ui/link";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { getSeasons } from "./functions";

export default async function SeasonsPage() {
  const { rows, more } = await getSeasons();

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/seasons" />
        <HeaderAdminTitle title="Seasons" tooltip="Lorem ipsum dolor sit amed">
          <Link href="/admin/new-season" variant="primary" size="md">
            New season
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="mx-auto max-w-container-lg pb-8 px-4 min-h-[calc(100vh-24rem)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Sym</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Badges</TableHead>
              <TableHead>Last created series</TableHead>
              <TableHead>Last started series</TableHead>
              <TableHead>Last ended series</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((season) => (
              <TableRow key={season.id}>
                <TableCell className="text-gray-3">{season.symbol}</TableCell>
                <TableCell>{season.name}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {season.badges.map((badge) => (
                      <Tooltip
                        content={badge.name}
                        key={badge.id}
                        className="capitalize"
                      >
                        <BadgeImage src={badge.ipfs} size="xs" />
                      </Tooltip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{season.last_created_series[0]?.name}</TableCell>
                <TableCell>{season.last_started_series[0]?.name}</TableCell>
                <TableCell>{season.last_ended_series[0]?.name}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/seasons/${season.id}`}
                    size="md"
                    variant="secondary"
                    square
                  >
                    <MdKeyboardArrowRight className="size-6" />
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
      </div>
    </>
  );
}
