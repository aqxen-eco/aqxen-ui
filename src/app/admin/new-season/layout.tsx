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
          tooltip="Lorem ipsum dolor sit amed"
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="mx-auto min-h-[calc(100vh-24rem)] max-w-container-md space-y-8 px-4 pb-8">
        {children}
      </div>
    </>
  )
}
