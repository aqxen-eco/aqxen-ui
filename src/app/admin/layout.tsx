'use client'

import { redirect } from 'next/navigation'

import { useOrganization } from '@/contexts/organization'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { hasOrganization, isPending } = useOrganization()

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <img src={'/img/logo.svg'} alt="" className="size-14 animate-pulse" />
      </div>
    )
  }

  if (!hasOrganization) {
    return redirect('/')
  }

  return children
}
