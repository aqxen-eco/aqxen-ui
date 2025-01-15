import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from "@/components/header-admin";

type BuySubscriptionProps = {
  children: React.ReactNode;
};

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
      <div className="max-w-container-lg mx-auto px-4 pb-8 min-h-[calc(100vh-24rem)]">
        {children}
      </div>
    </>
  );
}
