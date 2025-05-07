import { ToastContainer } from 'react-toastify'

import { AppBar } from '@/components/app-bar'
import { Footer } from '@/components/footer'
import { ChainProvider } from '@/contexts/chain'
import { OrganizationProvider } from '@/contexts/organization'
import { QueryProvider } from '@/contexts/query'

type HomeTemplateProps = {
  children: React.ReactNode
}

export default function HomeTemplate({ children }: HomeTemplateProps) {
  return (
    <QueryProvider>
      <ChainProvider>
        <OrganizationProvider>
          <AppBar />
          {children}
          <Footer />
          <ToastContainer position="bottom-center" theme="dark" />
        </OrganizationProvider>
      </ChainProvider>
    </QueryProvider>
  )
}
