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
          tooltip="Lorem ipsum dolor sit amed"
        />
      </HeaderAdmin>
      <div className="mx-auto min-h-[calc(100vh-24rem)] max-w-container-lg px-4 pb-8">
        {children}
      </div>
    </>
  )
}
