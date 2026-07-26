import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { TownHallSection } from '@/components/sections/TownHallSection'
import { CivictSection } from '@/components/sections/CivictSection'
import { CandidatesSection } from '@/components/sections/CandidateSection'
import { CtaSection } from '@/components/sections/CtaSection'
import { ScrollReveal } from '@/components/sections/ScrollReveal'

export default function LandingPage() {
  return (
    <main className="pt-14">
      <ScrollReveal><HeroSection /></ScrollReveal>
      <ScrollReveal><FeaturesSection /></ScrollReveal>
      <ScrollReveal><TownHallSection /></ScrollReveal>
      <ScrollReveal><CivictSection /></ScrollReveal>
      <ScrollReveal><CandidatesSection /></ScrollReveal>
      <ScrollReveal><CtaSection /></ScrollReveal>
    </main>
  )
}
