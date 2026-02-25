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
        <HeaderAdminBack href="/admin/seasons">Season</HeaderAdminBack>
        <HeaderAdminTitle
          title="New Season"
          tooltip="Configure an upcoming season. Define the start and end dates, and set the specific engagement rules for this cycle."
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] space-y-8 px-4 pb-8">
        {children}
      </div>
    </>
  )
}
