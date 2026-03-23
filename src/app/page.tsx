import { useTranslations } from 'next-intl'

import { CallToAction } from '@/components/call-to-action'

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <header className="max-w-container-lg relative mx-auto overflow-hidden px-4 py-16 max-md:min-h-168 md:flex md:min-h-screen md:items-center">
      <div className="space-y-6 md:max-w-md">
        <h1 className="text-display-1 text-white">{t('heading')}</h1>
        <p className="text-body-1 text-gray-3">{t('description')}</p>
        <CallToAction />
      </div>

      <img
        src="./img/hero.svg"
        alt=""
        className="absolute -z-10 select-none max-md:bottom-0 max-md:left-1/2 max-md:-translate-x-1/2 max-md:translate-y-1/2 md:top-1/2 md:right-4 md:-translate-y-1/2"
      />
    </header>
  )
}
