import { HeroSection } from './sections/hero-section'
import { SocialProofBar } from './sections/social-proof-bar'
import { FeatureShowcase } from './sections/feature-showcase'
import { HowItWorks } from './sections/how-it-works'
import { ComparisonSection } from './sections/comparison-section'
import { PricingSection } from './sections/pricing-section'
import { WaitlistSection } from './sections/waitlist-section'
import { FAQSection } from './sections/faq-section'
import { FooterCTA } from './sections/footer-cta'

export const metadata = {
  title: 'FYSH - AI-Powered Sports Betting Research',
  description:
    'Advanced prop analytics, AI insights, and transparent track records. Built for serious bettors who demand data-driven decisions.',
  keywords: [
    'sports betting',
    'prop betting',
    'AI sports analysis',
    'betting analytics',
    'sports betting research',
    'prop finder',
    'betting tracker',
    'CLV tracking',
    'NBA props',
    'NFL props',
  ],
  authors: [{ name: 'FYSH' }],
  creator: 'FYSH',
  publisher: 'FYSH',
  openGraph: {
    title: 'FYSH - AI-Powered Sports Betting Research',
    description:
      'Advanced prop analytics, AI insights, and transparent track records. Built for serious bettors.',
    url: 'https://fysh.bet',
    siteName: 'FYSH',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FYSH - AI-Powered Sports Betting Research',
    description:
      'Advanced prop analytics, AI insights, and transparent track records. Built for serious bettors.',
    creator: '@fyshbet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <SocialProofBar />
      <FeatureShowcase />
      <HowItWorks />
      <ComparisonSection />
      <PricingSection />
      <WaitlistSection />
      <FAQSection />
      <FooterCTA />
    </>
  )
}
