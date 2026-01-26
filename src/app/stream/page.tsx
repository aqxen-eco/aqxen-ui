'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { useChain } from '@/contexts/chain'

export default function Stream() {
  const { isAuthenticated, actor, login } = useChain()

  return (
    <>
      <header className="max-w-container-md relative mx-auto overflow-hidden px-4 py-16">
        <div className="space-y-6 md:py-32 md:text-center">
          <h1 className="text-display-1 max-md:text-display-2 text-white">
            Welcome to the AqXen Stream: Progress in Action
          </h1>
          <p className="text-body-1 text-gray-3">
            The first social activity stream focused purely on celebrating
            achievements and driving organizational success.
          </p>
        </div>
      </header>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            A Stream Free From Noise.
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            Unlike other platforms, the AqXen Stream is designed to be
            motivating, not distracting. You will only see posts aligned with
            your interests, validated with &apos;Beams&apos; from your
            colleagues, teammates, or fellow community member. All focused on
            positive steps toward shared goals.
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            What You&apos;ll Find Here
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            1. Real-Time Recognition: See who is making an impact, right now.
          </p>
          <p className="text-body-1 text-gray-3">
            2. Community Goals: Posts are tied to measurable objectives.
          </p>
          <p className="text-body-1 text-gray-3">
            3. Reputation Tally: Instantly see your Beams and reputation score
            grow.
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6">
        <div className="bg-gray-1 border-gray-2 w-full space-y-4 rounded-2xl border p-4 text-center md:py-16">
          <h2 className="text-display-2 max-md:text-title-1 max-w-container-md mx-auto text-white">
            Ready to See Real Progress?
          </h2>
          {isAuthenticated ? (
            <Link href={`/profile/${actor}`} variant="primary" size="lg">
              Profile
            </Link>
          ) : (
            <Button onClick={login} variant="primary" size="lg">
              Log in to the AqXen Stream
            </Button>
          )}
        </div>
      </section>
    </>
  )
}
