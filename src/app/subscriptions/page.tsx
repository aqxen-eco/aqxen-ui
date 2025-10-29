import { BuySubscriptionTable } from '@/components/buy-subscription-table'

export default function SubscriptionsPage() {
  return (
    <section className="max-w-container-lg relative mx-auto px-4 py-16">
      <img
        src="./img/gradient.png"
        alt=""
        className="w-container-lg absolute top-0 left-0 -z-10 block select-none"
      />
      <header className="space-y-4 text-center max-md:pb-16 md:py-16">
        <h2 className="text-display-2 text-white">Buy subscriptions</h2>
        <p className="text-body-1 text-gray-3">
          Sign in with your wallet and buy a package to start using it
          immediately
        </p>
      </header>
      <BuySubscriptionTable />
    </section>
  )
}
