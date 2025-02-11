import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'

type NewBadgeLayoutAutomationProps = {
  children: React.ReactNode
}

export default async function NewBadgeLayoutAutomation({
  children,
}: NewBadgeLayoutAutomationProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/badges-automation">
          Badges Automation
        </HeaderAdminBack>
        <HeaderAdminTitle
          title="New Badge Automation"
          tooltip="Lorem ipsum dolor sit amed"
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] space-y-8 px-4 pb-8">
        {children}
      </div>
    </>
  )
}
