import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from "@/components/header-admin";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Tag } from "@/components/ui/tag";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSeriesService } from "@/services/get-series-service";

const seasonBadges = [
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
];

type SeasonPageProps = {
  params: {
    season_id: string;
  };
};

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { season_id } = await params;

  const { rows: series, more } = await getSeriesService({
    season_id: decodeURIComponent(season_id),
  });

  if (!season_id) {
    return null;
  }

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/seasons">Seasons</HeaderAdminBack>
        <HeaderAdminTitle title="Election" />
      </HeaderAdmin>
      <div className="mx-auto max-w-container-lg by-8 px-4 space-y-8 pb-8">
        <section className="space-y-4">
          <header className="flex items-center">
            <div className="flex-1 flex items-center gap-1">
              <h2 className="text-title-2 text-white">Badges</h2>
              <Tooltip content="Lorem ipsum dolor sit amed">
                <Button variant="link" size="md" square>
                  <MdOutlineInfo className="size-6" />
                </Button>
              </Tooltip>
            </div>
            <div className="flex-none">
              <Link
                href={`/admin/seasons/${season_id}/add-badges`}
                variant="secondary"
                size="md"
              >
                Add badges
              </Link>
            </div>
          </header>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Sym</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-32 text-center">
                  Rarity counts
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasonBadges.map((seasonBadge) => (
                <TableRow key={seasonBadge.symbol}>
                  <TableCell className="text-gray-3">
                    {seasonBadge.symbol}
                  </TableCell>
                  <TableCell>{seasonBadge.name}</TableCell>
                  <TableCell>{seasonBadge.rarityCounts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
        <section className="space-y-4">
          <header className="flex items-center">
            <div className="flex-1 flex items-center gap-1">
              <h2 className="text-title-2 text-white">Series</h2>
              <Tooltip content="Lorem ipsum dolor sit amed">
                <Button variant="link" size="md" square>
                  <MdOutlineInfo className="size-6" />
                </Button>
              </Tooltip>
            </div>
            <div className="flex-none">
              <Link
                href={`/admin/seasons/${season_id}/add-series`}
                variant="secondary"
                size="md"
              >
                Add series
              </Link>
            </div>
          </header>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((serie) => (
                <TableRow key={serie.id}>
                  <TableCell className="text-gray-3 text-center">
                    {serie.id}
                  </TableCell>
                  <TableCell>{serie.name}</TableCell>
                  <TableCell>Badges</TableCell>
                  <TableCell>
                    {serie.status === "init" ? (
                      <Tag variant="yellow">Paused</Tag>
                    ) : serie.status === "end" ? (
                      <Tag variant="red">Ended</Tag>
                    ) : serie.status === "active" ? (
                      <Tag variant="green">Started</Tag>
                    ) : (
                      <Tag variant="blue">Created</Tag>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    {serie.status === "init" ? (
                      <>
                        <Button variant="secondary" size="md">
                          Resume
                        </Button>
                        <Button variant="secondary" size="md">
                          End
                        </Button>
                      </>
                    ) : serie.status === "end" ? (
                      <></>
                    ) : serie.status === "active" ? (
                      <>
                        <Button variant="secondary" size="md">
                          Pause
                        </Button>
                        <Button variant="secondary" size="md">
                          End
                        </Button>
                      </>
                    ) : (
                      <Button variant="secondary" size="md">
                        Start
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </>
  );
}
