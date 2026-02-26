import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'

type BuySubscriptionProps = {
  children: React.ReactNode
}

export default async function BuySubscription({
  children,
}: BuySubscriptionProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/subscription">
          Subscription
        </HeaderAdminBack>
        <HeaderAdminTitle
          title="Buy Subscription"
          tooltip="Explore available tiers, upgrade your current plan, or purchase add-ons to unlock advanced platform features."
        />
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        {children}
      </div>
    </>
  )
}
