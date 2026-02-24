import { Fish } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center text-center py-20">
        <Fish className="h-24 w-24 text-neon-teal mb-6 animate-pulse" />
        <h1 className="text-6xl font-bold text-text-primary mb-4">
          Reel in smarter bets
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mb-8">
          FYSH combines deep prop analytics with AI-powered insights and a thriving
          community of sharp bettors. Track your bets, discover edge, and level up your game.
        </p>
        <div className="flex gap-4">
          <Link href="/auth/signup">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" size="lg">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 grid md:grid-cols-3 gap-8">
        <Card hoverable glowColor="teal" className="p-6">
          <h3 className="text-xl font-bold text-text-primary mb-3">
            🎯 Prop Analytics
          </h3>
          <p className="text-text-secondary">
            Deep statistical analysis on every prop. Hit rates, trends, matchup data -
            everything you need to find edge.
          </p>
        </Card>

        <Card hoverable glowColor="teal" className="p-6">
          <h3 className="text-xl font-bold text-text-primary mb-3">
            🤖 AI Insights
          </h3>
          <p className="text-text-secondary">
            Claude-powered analysis highlights the best opportunities daily.
            Get the &quot;Catch of the Day&quot; and prop breakdowns.
          </p>
        </Card>

        <Card hoverable glowColor="teal" className="p-6">
          <h3 className="text-xl font-bold text-text-primary mb-3">
            📊 Bet Tracking
          </h3>
          <p className="text-text-secondary">
            Track every bet, calculate ROI, monitor CLV, and see your performance
            across all sportsbooks in one place.
          </p>
        </Card>
      </section>
    </div>
  )
}
