import { getTranslations } from 'next-intl/server'

import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { Link } from '@/components/ui/link'

type BadgesAutomationProps = {
  children: React.ReactNode
}

export default async function BadgesAutomation({
  children,
}: BadgesAutomationProps) {
  const t = await getTranslations('admin.badgeAutomation')

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/badges-automation" />
        <HeaderAdminTitle
          title={t('title')}
          tooltip={t('tooltip')}
        >
          <Link href="/admin/new-badge-automation" variant="primary" size="md">
            {t('newAutomationRule')}
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        {children}
      </div>
    </>
  )
}
