import { Footer } from '@/components/layout/Footer'
import { Nav } from '@/components/layout/nav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  )
}
