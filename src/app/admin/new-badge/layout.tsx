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
