/**
 * Catch of the Day Mockup
 * High-fidelity mockup showing AI-curated daily pick feature
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, Target } from 'lucide-react'

export function CatchOfDayMockup() {
  return (
    <Card className="relative overflow-hidden bg-ocean-card border-neon-teal/30 shadow-neon-glow">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-teal/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant="info" className="bg-neon-teal/20 text-neon-teal border-neon-teal/50">
            <Sparkles className="w-3 h-3 mr-1" />
            CATCH OF THE DAY
          </Badge>
          <span className="text-sm text-text-secondary">Updated 2h ago</span>
        </div>

        {/* Player Info */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-text-primary">Damian Lillard</h3>
            <span className="text-text-secondary">Milwaukee Bucks</span>
          </div>
          <p className="text-sm text-text-muted">vs. Boston Celtics • Tonight 7:30 PM ET</p>
        </div>

        {/* Prop Details */}
        <div className="bg-ocean-deep/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Prop</p>
              <p className="text-lg font-semibold text-text-primary">Points Over 24.5</p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-sm">Odds</p>
              <p className="text-xl font-bold text-neon-teal">-110</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-positive" />
              <div>
                <p className="text-xs text-text-muted">Hit Rate (L10)</p>
                <p className="font-semibold text-text-primary">78%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-neon-teal" />
              <div>
                <p className="text-xs text-text-muted">Avg vs Line</p>
                <p className="font-semibold text-text-primary">+3.2</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Snippet */}
        <div className="bg-neon-teal/5 border border-neon-teal/20 rounded-lg p-3">
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="text-neon-teal font-semibold">AI Analysis: </span>
            Lillard averaging 27.3 PPG in last 10 games. Boston allows 3rd highest points to PGs.
            High usage expected with Middleton out.
          </p>
        </div>

        {/* CTA */}
        <Button className="w-full bg-neon-teal hover:bg-neon-teal-muted text-ocean-deep font-semibold">
          View Full Analysis
        </Button>
      </div>
    </Card>
  )
}
