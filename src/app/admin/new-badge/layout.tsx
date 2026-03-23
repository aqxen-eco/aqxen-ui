import { getTranslations } from 'next-intl/server'

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
  const t = await getTranslations('admin.newBadge')

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/badges">
          {t('backLabel')}
        </HeaderAdminBack>
        <HeaderAdminTitle
          title={t('title')}
          tooltip={t('tooltip')}
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] space-y-8 px-4 pb-8">
        {children}
      </div>
    </>
  )
}
