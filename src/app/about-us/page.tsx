import { useTranslations } from 'next-intl'

import { Link } from '@/components/ui/link'

export default function AboutUs() {
  const t = useTranslations('about')

  return (
    <>
      <header className="max-w-container-md relative mx-auto overflow-hidden px-4 py-16">
        <div className="space-y-6 md:py-32 md:text-center">
          <h1 className="text-display-1 max-md:text-display-2 text-white">
            {t('heading')}
          </h1>
          <p className="text-body-1 text-gray-3">{t('description')}</p>
        </div>
      </header>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            {t('whatAreBeamsTitle')}
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            {t('whatAreBeamsDescription')}
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            {t('whoIsItForTitle')}
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            {t('whoIsItForDescription')}
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6">
        <div className="bg-gray-1 border-gray-2 w-full space-y-4 rounded-2xl border p-4 text-center md:py-16">
          <h2 className="text-display-2 max-md:text-title-1 max-w-container-md mx-auto text-white">
            {t('ctaHeading')}
          </h2>
          <Link href="/pricing" variant="primary" size="lg">
            {t('getStarted')}
          </Link>
        </div>
      </section>
    </>
  )
}
