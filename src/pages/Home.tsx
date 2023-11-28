import { ReactComponent as Hero } from '@/assets/hero.svg'
import { Link } from '@/components/ui/Link'

export function Home() {
  return (
    <div className="mx-auto grid h-screen max-w-container-lg grid-cols-12 items-center gap-8 px-4">
      <div className="col-span-4 max-w-sm space-y-6">
        <h1 className="text-display-1 text-white">Eden on EOS Reputation System</h1>
        <p className="text-body-1 text-gray-3">
          Participate in enjoyable community activities, recognize fellow members, collect badges and elevate your
          reputation.
        </p>
        <Link to="/recognize" size="lg" variant="primary">
          Recognize
        </Link>
      </div>
      <div className="col-span-8 justify-self-end">
        <Hero />
      </div>
    </div>
  )
}
