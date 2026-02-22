import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'

type NewBeamLayoutProps = {
  children: React.ReactNode
}

export default async function NewBeamLayout({
  children,
}: NewBeamLayoutProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/beams">Beams</HeaderAdminBack>
        <HeaderAdminTitle
          title="New Beam"
          tooltip="Create a new cycle-based beam badge"
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] space-y-8 px-4 pb-8">
        {children}
      </div>
    </>
  )
}
