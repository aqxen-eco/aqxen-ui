'use client'

import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { SubscriptionContent } from '@/components/subscription-content'
import { Link } from '@/components/ui/link'

export default function SubscriptionPage() {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/subscription" />
        <HeaderAdminTitle
          title="Subscription"
          tooltip="Lorem ipsum dolor sit amed"
        >
          <Link href="/admin/buy-subscription" variant="primary" size="md">
            Buy Subscription
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <SubscriptionContent />
    </>
  )
}
