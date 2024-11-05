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
import { Select, SelectItem } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";

const badges = [
  {
    symbol: "CHA",
    name: "Charity",
    rarityCounts: "17",
  },
  {
    symbol: "TRA",
    name: "Transparency",
    rarityCounts: "22",
  },
  {
    symbol: "ELE",
    name: "Election",
    rarityCounts: "1",
  },
  {
    symbol: "DCM",
    name: "Documentation",
    rarityCounts: "7",
  },
  {
    symbol: "TKN",
    name: "Token",
    rarityCounts: "2",
  },
  {
    symbol: "RSP",
    name: "Charity",
    rarityCounts: "20",
  },
  {
    symbol: "PAR",
    name: "Participation",
    rarityCounts: "18",
  },
  {
    symbol: "RES",
    name: "Responsibility",
    rarityCounts: "0",
  },
];

export default async function BadgesPage() {
  return (
    <div className="mx-auto max-w-container-lg py-8 px-4">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-1">
          <h1 className="text-title-1 text-white">Badges</h1>
          <Tooltip content="Lorem ipsum dolor sit amed">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </div>
        <Link href="/admin/badges/new" variant="primary" size="md">
          New badge
        </Link>
      </header>

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
          {badges.map((invoice) => (
            <TableRow key={invoice.symbol}>
              <TableCell className="text-gray-3">{invoice.symbol}</TableCell>
              <TableCell>{invoice.name}</TableCell>
              <TableCell className="text-center">
                {invoice.rarityCounts}
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
            <TableCell colSpan={4}>
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
  );
}
