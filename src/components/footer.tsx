'use client'

import NextLink from 'next/link'
import { useTranslations } from 'next-intl'

export function Footer() {
  const today = new Date()
  const year = today.getFullYear()
  const t = useTranslations('common')

  return (
    <footer className="max-w-container-lg mx-auto md:px-4">
      <div className="border-gray-2 border-t py-16">
        <nav className="text-body-2 mb-8 flex flex-wrap justify-center gap-6">
          <NextLink href="/" className="text-gray-3 hover:text-white">
            {t('home')}
          </NextLink>
          <NextLink href="/about-us" className="text-gray-3 hover:text-white">
            {t('about')}
          </NextLink>
          <NextLink
            href="/pricing"
            className="text-gray-3 hover:text-white"
          >
            {t('pricing')}
          </NextLink>
          <NextLink
            href="/organizations"
            className="text-gray-3 hover:text-white"
          >
            {t('organizations')}
          </NextLink>
          <NextLink href="/stream" className="text-gray-3 hover:text-white">
            {t('stream')}
          </NextLink>
          <NextLink href="/faq" className="text-gray-3 hover:text-white">
            {t('faq')}
          </NextLink>
          <NextLink href="/contact" className="text-gray-3 hover:text-white">
            {t('contact')}
          </NextLink>
        </nav>
        <div className="flex items-center justify-between gap-4 max-md:flex-col">
          <NextLink
            href="/"
            className="text-gray-3 flex cursor-pointer items-center gap-1.5 hover:text-white"
          >
            <img src="/img/logo.svg" alt="" className="size-6" />
            <span className="text-body-1">AqXen © {year}</span>
          </NextLink>
          <a
            href="https://detroitledger.tech/"
            target="_blank"
            rel="noreferrer"
            className="opacity-70 hover:opacity-100"
          >
            <img src="/img/dlt.svg" alt="" />
          </a>
        </div>
      </div>
    </footer>
  )
}
