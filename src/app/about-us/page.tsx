import { Link } from '@/components/ui/link'

export default function AboutUs() {
  return (
    <>
      <header className="max-w-container-md relative mx-auto overflow-hidden px-4 py-16">
        <div className="space-y-6 md:py-32 md:text-center">
          <h1 className="text-display-1 max-md:text-display-2 text-white">
            The AqXen Ecosystem&apos;s Commitment to Progress
          </h1>
          <p className="text-body-1 text-gray-3">
            AqXen Socials was created as a core component of the AqXen Ecosystem
            with one driving mission: to make positive contribution visible,
            measurable, and rewarding. We believe that when people are
            recognized for doing, they are motivated to do more.
          </p>
        </div>
      </header>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            What are &apos;Beams&apos;?
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            A &apos;Beam&apos; is recognition by your peers for a productive
            action you&apos;ve taken and posted about. It&apos;s not a like or a
            share, it&apos;s genuine recognition for moving the needle. Every
            Beam you give or receive contributes to a verifiable, positive
            reputation score within your community. This score isn&apos;t based
            on popularity; it&apos;s based on action.
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            Who is AqXen Socials For?
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            We empower non-profits, corporate teams, educational institutions,
            and community groups to cultivate environments where every member
            feels valued, understood, and motivated by a clear, shared vision.
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6">
        <div className="bg-gray-1 border-gray-2 w-full space-y-4 rounded-2xl border p-4 text-center md:py-16">
          <h2 className="text-display-2 max-md:text-title-1 max-w-container-md mx-auto text-white">
            Learn how to integrate AqXen Socials into your organization&apos;s
            strategy.
          </h2>
          <Link href="/subscriptions" variant="primary" size="lg">
            Get Started
          </Link>
        </div>
      </section>
    </>
  )
}
