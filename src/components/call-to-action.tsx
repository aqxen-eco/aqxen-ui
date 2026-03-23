'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { useChain } from '@/contexts/chain'

export function CallToAction() {
  const { isAuthenticated, login, actor } = useChain()
  const t = useTranslations('common')

  if (isAuthenticated) {
    return (
      <Link href={`/profile/${actor}`} variant="primary" size="lg">
        {t('profile')}
      </Link>
    )
  }

  return (
    <Button onClick={login} variant="primary" size="lg">
      {t('logIn')}
    </Button>
  )
}
