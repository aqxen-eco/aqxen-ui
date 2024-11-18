import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from "@/components/header-admin";
import { Link } from "@/components/ui/link";

type ActiveSubscriptionLayoutProps = {
  children: React.ReactNode;
};

export default async function ActiveSubscriptionLayout({
  children,
}: ActiveSubscriptionLayoutProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/subscription" />
        <HeaderAdminTitle
          title="Active Subscription"
          tooltip="Lorem ipsum dolor sit amed"
        >
          <Link href="/admin/my-subscriptions" variant="secondary" size="md">
            My subscriptions
          </Link>
          <Link href="/admin/buy-subscription" variant="secondary" size="md">
            Buy subscription
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto px-4 pb-8 min-h-[calc(100vh-24rem)]">
        {children}
      </div>
    </>
  );
}
