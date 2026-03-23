'use client'

import { useTranslations } from 'next-intl'

import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { SubscriptionContent } from '@/components/subscription-content'
import { Link } from '@/components/ui/link'

export default function SubscriptionPage() {
  const t = useTranslations('admin.subscription')
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/subscription" />
        <HeaderAdminTitle
          title={t('title')}
          tooltip={t('tooltip')}
        >
          <Link href="/pricing" variant="primary" size="md">
            {t('manageSubscription')}
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <SubscriptionContent />
    </>
  )
}
