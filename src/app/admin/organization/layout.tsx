import { HeaderAdmin, HeaderAdminMenu, HeaderAdminTitle } from "@/components/header-admin";

type OrganizationLayoutProps = {
  children: React.ReactNode
}

export default async function OrganizationLayout({ children }: OrganizationLayoutProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/organization" />
        <HeaderAdminTitle title="Organization" className="max-w-container-md" />
      </HeaderAdmin>
      <div className="mx-auto max-w-container-md pb-8 px-4 min-h-[calc(100vh-24rem)]">
        {children}
      </div>
    </>
  )
}