'use client'

import { differenceInMinutes, parseISO } from 'date-fns'
import { redirect } from 'next/navigation'

import { BuySubscriptionTable } from '@/components/buy-subscription-table'
import { HeaderAdmin, HeaderAdminTitle } from '@/components/header-admin'
import { useOrganization } from '@/contexts/organization'
import { useGetSubscription } from '@/hooks/query/use-get-subscription'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { hasOrganization, isPending } = useOrganization()
  const { data, query } = useGetSubscription()

  if (isPending || query.isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <img src={'/img/logo.svg'} alt="" className="size-14 animate-pulse" />
      </div>
    )
  }

  const today = new Date()
  const expiryTime = parseISO(data?.active?.[0].expiry_time as string)
  const resultInMinutes = differenceInMinutes(expiryTime, today)
  const expired = resultInMinutes <= 0

  if (!hasOrganization) {
    return redirect('/')
  }

  if (expired && data?.upcoming.length === 0) {
    return (
      <>
        <HeaderAdmin>
          <HeaderAdminTitle
            title="Subscription"
            tooltip="Lorem ipsum dolor sit amed"
          />
        </HeaderAdmin>
        <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
          <BuySubscriptionTable />
        </div>
      </>
    )
  }

  return children
}
