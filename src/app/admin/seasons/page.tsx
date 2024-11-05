import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";

export default async function SeasonsPage() {
  return (
    <div className="mx-auto max-w-container-lg py-8 px-4">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-1">
          <h1 className="text-title-1 text-white">Seasons</h1>
          <Tooltip content="Lorem ipsum dolor sit amed">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </div>
        <Link href="/admin/seasons/new" variant="primary" size="md">
          New season
        </Link>
      </header>
    </div>
  );
}
