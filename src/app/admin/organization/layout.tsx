import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'

type OrganizationLayoutProps = {
  children: React.ReactNode
}

export default async function OrganizationLayout({
  children,
}: OrganizationLayoutProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/organization" />
        <HeaderAdminTitle title="Organization" className="max-w-container-md" />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        {children}
      </div>
    </>
  )
}
