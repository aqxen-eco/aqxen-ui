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
          tooltip="View your current subscription plan, track your platform usage limits, and manage your billing cycle."
        >
          <Link href="/pricing" variant="primary" size="md">
            Manage Subscription
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <SubscriptionContent />
    </>
  )
}
