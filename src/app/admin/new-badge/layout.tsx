import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";
import { HeaderAdmin, HeaderAdminBack, HeaderAdminTitle } from "@/components/header-admin";

type NewBadgeLayoutProps = {
  children: React.ReactNode
}

export default async function NewBadgeLayout({ children }: NewBadgeLayoutProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/badges">
          Badges
        </HeaderAdminBack>
        <HeaderAdminTitle 
          title="New Badge" 
          tooltip="Lorem ipsum dolor sit amed" 
          className="max-w-container-md" 
        />
      </HeaderAdmin>
      <div className="mx-auto max-w-container-md px-4 space-y-8">
        {children}
      </div>
    </>
  );
}
