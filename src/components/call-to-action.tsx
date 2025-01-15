'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { useChain } from '@/contexts/chain'

export function CallToAction() {
  const { isAuthenticated, login, actor } = useChain()

  if (isAuthenticated) {
    return (
      <Link href={`/profile/${actor}`} variant="primary" size="lg">
        Profile
      </Link>
    )
  }

  return (
    <Button onClick={login} variant="primary" size="lg">
      Log in
    </Button>
  )
}
