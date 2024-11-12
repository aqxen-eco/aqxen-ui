'use client'

import { MdOutlineInfo, MdKeyboardArrowRight } from "react-icons/md";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Tooltip } from "@/components/ui/tooltip";
import { Select, SelectItem } from "@/components/ui/select";
import { HeaderAdmin, HeaderAdminMenu, HeaderAdminTitle } from "@/components/header-admin";

const seasons = [
  {
    symbol: "ELE",
    name: "Election",
    badges: "Badges",
    lastCreatedSeries: '2025',
    lastStartedSeries: '2024',
    lastEndedSeries: '2023'
  },
  {
    symbol: "WEE",
    name: "Weekly syncs",
    badges: "Badges",
    lastCreatedSeries: 'Sept 4th',
    lastStartedSeries: 'Sept 3rd',
    lastEndedSeries: 'Sept 2nd'
  },
  {
    symbol: "COM",
    name: "Community contribution",
    badges: "Badges",
    lastCreatedSeries: '3rd cycle',
    lastStartedSeries: '2nd cycle',
    lastEndedSeries: '1st cycle'
  }
];

export default function SeasonsPage() {
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
            {seasons.map((season) => (
              <TableRow key={season.symbol}>
                <TableCell className="text-gray-3">{season.symbol}</TableCell>
                <TableCell>{season.name}</TableCell>
                <TableCell>{season.badges}</TableCell>
                <TableCell>{season.lastCreatedSeries}</TableCell>
                <TableCell>{season.lastStartedSeries}</TableCell>
                <TableCell>{season.lastEndedSeries}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/seasons/${season.symbol}`} size="md" variant="secondary" square>
                    <MdKeyboardArrowRight className="size-6" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={Object.keys(seasons[0]).length + 1}>
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
      </div>
    </>
  );
}
