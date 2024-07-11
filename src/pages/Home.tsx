import { ReactComponent as Hero } from '@/assets/hero.svg'
import { Button } from '@/components/ui/Button'
import { Link } from '@/components/ui/Link'
import { useChain } from '@/hooks/useChain'

export function Home() {
  const { isAuthenticated, login, actor } = useChain()

  return (
    <header className="relative mx-auto max-w-container-lg overflow-hidden px-4 py-16 mobile:min-h-[42rem] desktop:flex desktop:min-h-screen desktop:items-center">
      <div className="space-y-6 desktop:max-w-sm">
        <h1 className="text-display-1 text-white">UpScale Reputation System</h1>
        <p className="text-body-1 text-gray-3">
          Participate in enjoyable community activities, recognize fellow members, collect badges and elevate your
          reputation.
        </p>
        {/* Enable when Recognize is available and replace actions below */}
        {/* <Link to="/recognize" size="lg" variant="primary">
          Recognize
        </Link> */}
        {isAuthenticated ? (
          <Link to={'/profile/' + actor} variant="primary">
            Profile
          </Link>
        ) : (
          <Button onClick={login} variant="primary">
            Log in
          </Button>
        )}
      </div>
      <Hero className="absolute -z-10 mobile:bottom-0 mobile:left-1/2 mobile:-translate-x-1/2 mobile:translate-y-1/2 desktop:right-4 desktop:top-1/2 desktop:-translate-y-1/2" />
    </header>
  )
}
