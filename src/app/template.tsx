import { ChainProvider } from "@/contexts/chain";

import { AppBar } from "@/components/app-bar";
import { Footer } from "@/components/footer";

type HomeTemplateProps = {
  children: React.ReactNode
}

export default function HomeTemplate({ children }: HomeTemplateProps) {
  return (
    <ChainProvider>
      <AppBar />
      {children}
      <Footer />
    </ChainProvider>
  );
}
