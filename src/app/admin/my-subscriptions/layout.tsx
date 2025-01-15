import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'

type MySubscriptionsLayoutProps = {
  children: React.ReactNode
}

export default async function MySubscriptionsLayout({
  children,
}: MySubscriptionsLayoutProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/subscription">
          Active Subscription
        </HeaderAdminBack>
        <HeaderAdminTitle
          title="My Subscriptions"
          tooltip="Lorem ipsum dolor sit amed"
        />
      </HeaderAdmin>
      <div className="mx-auto min-h-[calc(100vh-24rem)] max-w-container-lg space-y-8 px-4 pb-8">
        {children}
      </div>
    </>
  )
}
