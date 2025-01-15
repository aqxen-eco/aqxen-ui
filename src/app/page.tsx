import { CallToAction } from '@/components/call-to-action'

export default function HomePage() {
  return (
    <header className="relative mx-auto max-w-container-lg overflow-hidden px-4 py-16 mobile:min-h-[42rem] desktop:flex desktop:min-h-screen desktop:items-center">
      <div className="space-y-6 desktop:max-w-sm">
        <h1 className="text-display-1 text-white">UpScale Reputation System</h1>
        <p className="text-body-1 text-gray-3">
          Participate in enjoyable community activities, recognize fellow
          members, collect badges and elevate your reputation.
        </p>
        <CallToAction />
      </div>

      <img
        src="./img/hero.svg"
        alt=""
        className="absolute -z-10 mobile:bottom-0 mobile:left-1/2 mobile:-translate-x-1/2 mobile:translate-y-1/2 desktop:right-4 desktop:top-1/2 desktop:-translate-y-1/2"
      />
    </header>
  )
}
