import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";
import { NewBadgeForm } from "./new-badge-form";

export default async function NewBadgePage() {
  const defaultValues = {
    name: "",
    symbol: "ASD",
    image: "",
    description: "",
    lifetimeAggregate: true,
    lifetimeStats: true,
  };

  return (
    <div className="mx-auto max-w-container-md py-8 px-4 space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h1 className="text-title-1 text-white">New Badge</h1>
          <Tooltip content="Lorem ipsum dolor sit amed">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </div>
      </header>
      <NewBadgeForm defaultValues={defaultValues} />
    </div>
  );
}
