'use client'

import { useTranslations } from 'next-intl'

import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('profile')

  return (
    <div className="max-w-container-md mx-auto space-y-8 py-8 max-md:pt-0 md:px-4">
      <Box className="flex flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-title-2 text-white">
          {t('errorLoadingProfile')}
        </h1>
        <p className="text-body-2 text-gray-3">
          {t('errorLoadingProfileDescription')}
        </p>
        <Button variant="secondary" onClick={reset}>
          {t('tryAgain')}
        </Button>
      </Box>
    </div>
  )
}
