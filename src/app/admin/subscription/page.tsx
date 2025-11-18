'use client'

import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { SubscriptionContent } from '@/components/subscription-content'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Tooltip } from '@/components/ui/tooltip'
import { useGetSubscription } from '@/hooks/query/use-get-subscription'

export default function SubscriptionPage() {
  const { data } = useGetSubscription()

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/subscription" />
        <HeaderAdminTitle
          title="Subscription"
          tooltip="Lorem ipsum dolor sit amed"
        >
          {data?.upcoming && data?.upcoming.length === 1 ? (
            <Tooltip content="Lorem ipsum dolor sit amet">
              <Button variant="primary" size="md" disabled>
                Buy Subscription
              </Button>
            </Tooltip>
          ) : (
            <Link href="/admin/buy-subscription" variant="primary" size="md">
              Buy Subscription
            </Link>
          )}
        </HeaderAdminTitle>
      </HeaderAdmin>
      <SubscriptionContent />
    </>
  )
}
