import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'

type NewBadgeLayoutProps = {
  children: React.ReactNode
}

export default async function NewBadgeLayout({
  children,
}: NewBadgeLayoutProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/badges">Badges</HeaderAdminBack>
        <HeaderAdminTitle
          title="New Badge"
          tooltip="Create a new custom badge. Upload your design, set the title, and write the description for this achievement."
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] space-y-8 px-4 pb-8">
        {children}
      </div>
    </>
  )
}
