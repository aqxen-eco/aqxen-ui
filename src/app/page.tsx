import { BuySubscriptionTable } from '@/components/buy-subscription-table'
import { CallToAction } from '@/components/call-to-action'

export default function HomePage() {
  return (
    <>
      <header className="max-w-container-lg relative mx-auto overflow-hidden px-4 py-16 max-md:min-h-168 md:flex md:min-h-screen md:items-center">
        <div className="space-y-6 md:max-w-sm">
          <h1 className="text-display-1 text-white">
            UpScale Reputation System
          </h1>
          <p className="text-body-1 text-gray-3">
            Participate in enjoyable community activities, recognize fellow
            members, collect badges and elevate your reputation.
          </p>
          <CallToAction />
        </div>

        <img
          src="./img/hero.svg"
          alt=""
          className="absolute -z-10 select-none max-md:bottom-0 max-md:left-1/2 max-md:-translate-x-1/2 max-md:translate-y-1/2 md:top-1/2 md:right-4 md:-translate-y-1/2"
        />
      </header>

      <section className="max-w-container-lg border-gray-2 relative mx-auto border-t px-4 py-16">
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
    </>
  )
}
