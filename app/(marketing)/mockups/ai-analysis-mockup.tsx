/**
 * AI Analysis Mockup
 * High-fidelity mockup showing AI-powered prop analysis feature
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, TrendingUp, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react'

export function AiAnalysisMockup() {
  return (
    <Card className="bg-ocean-card border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-neon-teal/10 to-transparent px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-teal/20 rounded-lg">
              <Brain className="w-5 h-5 text-neon-teal" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">AI Analysis</h3>
              <p className="text-xs text-text-muted">Instant prop breakdown with reasoning</p>
            </div>
          </div>
          <Badge className="bg-positive/20 text-positive border-positive/50">
            High Confidence
          </Badge>
        </div>
      </div>

      {/* Key Insight */}
      <div className="px-6 py-5 bg-neon-teal/5 border-b border-neon-teal/20">
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-neon-teal flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-neon-teal mb-1">Key Insight</p>
            <p className="text-text-primary leading-relaxed">
              Stephen Curry&apos;s 3PT Over 4.5 has strong value. He&apos;s averaging 5.2 threes in
              last 10 games, and the matchup against Portland (28th in perimeter defense) creates
              optimal conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Sections */}
      <div className="px-6 py-5 space-y-5">
        {/* Matchup Analysis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Matchup Analysis
          </div>
          <ul className="space-y-2 text-sm text-text-primary ml-6">
            <li className="flex gap-2">
              <span className="text-neon-teal">•</span>
              <span>Portland allows 14.2 threes/game (3rd worst in NBA)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon-teal">•</span>
              <span>Curry shoots 42% from deep vs POR this season (7 games)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon-teal">•</span>
              <span>Warriors pace expected to be high (225+ possessions)</span>
            </li>
          </ul>
        </div>

        {/* Recent Trends */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <BarChart3 className="w-4 h-4" />
            Recent Trends
          </div>
          <ul className="space-y-2 text-sm text-text-primary ml-6">
            <li className="flex gap-2">
              <span className="text-neon-teal">•</span>
              <span>Hit in 8 of last 10 games (80% hit rate)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon-teal">•</span>
              <span>Averaging 11.4 3PT attempts when Draymond plays</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon-teal">•</span>
              <span>Career-high usage rate (32.1%) in last 5 games</span>
            </li>
          </ul>
        </div>

        {/* Value Assessment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Value Assessment
          </div>
          <div className="ml-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>Historical Hit Rate</span>
                <span className="text-positive font-semibold">80%</span>
              </div>
              <div className="h-2 bg-ocean-deep rounded-full overflow-hidden">
                <div className="h-full bg-positive" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>Expected Value (EV)</span>
                <span className="text-neon-teal font-semibold">+12.4%</span>
              </div>
              <div className="h-2 bg-ocean-deep rounded-full overflow-hidden">
                <div className="h-full bg-neon-teal" style={{ width: '62%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>Model Confidence</span>
                <span className="text-neon-teal font-semibold">87%</span>
              </div>
              <div className="h-2 bg-ocean-deep rounded-full overflow-hidden">
                <div className="h-full bg-neon-teal" style={{ width: '87%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="px-6 py-3 bg-ocean-deep/30 border-t border-border">
        <p className="text-xs text-text-muted">
          Analysis generated using 10+ data sources • Last updated 3 minutes ago
        </p>
      </div>
    </Card>
  )
}
