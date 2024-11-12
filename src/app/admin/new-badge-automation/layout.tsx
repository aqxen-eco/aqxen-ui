import { HeaderAdmin, HeaderAdminBack, HeaderAdminTitle } from "@/components/header-admin";

type NewBadgeLayoutAutomationProps = {
  children: React.ReactNode
}

export default async function NewBadgeLayoutAutomation({ children }: NewBadgeLayoutAutomationProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/badges-automation">
          Badges
        </HeaderAdminBack>
        <HeaderAdminTitle 
          title="New Badge Automation" 
          tooltip="Lorem ipsum dolor sit amed" 
          className="max-w-container-md" 
        />
      </HeaderAdmin>
      <div className="mx-auto max-w-container-md px-4 space-y-8 min-h-[calc(100vh-24rem)] pb-8">
        {children}
      </div>
    </>
  );
}
