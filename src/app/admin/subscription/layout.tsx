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
          className="max-w-container-md" 
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto px-4 pb-8">
        {children}
      </div>
    </>
  )
}