import { HeaderAdmin, HeaderAdminMenu, HeaderAdminTitle } from "@/components/header-admin";

type SubscriptionLayoutProps = {
  children: React.ReactNode
}

export default async function SubscriptionLayout({ children }: SubscriptionLayoutProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/subscription" />
        <HeaderAdminTitle 
          title="Subscription" 
          tooltip="Lorem ipsum dolor sit amed" 
        />
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto px-4 pb-8 min-h-[calc(100vh-24rem)]">
        {children}
      </div>
    </>
  )
}