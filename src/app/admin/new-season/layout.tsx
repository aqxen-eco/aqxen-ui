import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";
import { HeaderAdmin, HeaderAdminBack } from "@/components/header-admin";

type NewBadgeLayoutProps = {
  children: React.ReactNode
}

export default async function NewBadgeLayout({ children }: NewBadgeLayoutProps) {
  const defaultValues = {
    name: "",
    symbol: "ASD",
    image: "",
    description: "",
    lifetimeAggregate: true,
    lifetimeStats: true,
  };

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/seasons">
          Season
        </HeaderAdminBack>
      </HeaderAdmin>
      <div className="mx-auto max-w-container-md py-8 px-4 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h1 className="text-title-1 text-white">New Season</h1>
            <Tooltip content="Lorem ipsum dolor sit amed">
              <Button variant="link" size="md" square>
                <MdOutlineInfo className="size-6" />
              </Button>
            </Tooltip>
          </div>
        </header>
        {children}
      </div>
    </>
  );
}
