/**
 * Prop Finder Mockup
 * High-fidelity mockup showing prop comparison and filtering feature
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Filter, ArrowUpDown, ExternalLink } from 'lucide-react'

const mockProps = [
  {
    player: 'Nikola Jokic',
    team: 'DEN',
    prop: 'Pts+Reb+Ast',
    line: 54.5,
    over: -115,
    under: -105,
    hitRate: '82%',
    sportsbook: 'FanDuel',
  },
  {
    player: 'Luka Doncic',
    team: 'DAL',
    prop: 'Points',
    line: 32.5,
    over: -110,
    under: -110,
    hitRate: '75%',
    sportsbook: 'DraftKings',
  },
  {
    player: 'Joel Embiid',
    team: 'PHI',
    prop: 'Rebounds',
    line: 10.5,
    over: +105,
    under: -125,
    hitRate: '68%',
    sportsbook: 'Caesars',
  },
  {
    player: 'Jayson Tatum',
    team: 'BOS',
    prop: 'Assists',
    line: 4.5,
    over: -120,
    under: +100,
    hitRate: '71%',
    sportsbook: 'FanDuel',
  },
]

export function PropFinderMockup() {
  return (
    <Card className="bg-ocean-card border-border overflow-hidden">
      {/* Header with Filters */}
      <div className="bg-ocean-deep/50 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-text-secondary" />
          <Badge variant="neutral" className="border-neon-teal/50 text-neon-teal">
            NBA
          </Badge>
          <Badge variant="neutral" className="border-text-muted text-text-secondary">
            All Props
          </Badge>
          <Badge variant="neutral" className="border-text-muted text-text-secondary">
            All Books
          </Badge>
          <span className="ml-auto text-sm text-text-muted">348 props found</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-ocean-deep/30 text-left text-xs text-text-secondary">
            <tr>
              <th className="px-6 py-3 font-medium">
                <div className="flex items-center gap-1">
                  Player
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 font-medium">Prop</th>
              <th className="px-4 py-3 font-medium text-right">Line</th>
              <th className="px-4 py-3 font-medium text-right">Over</th>
              <th className="px-4 py-3 font-medium text-right">Under</th>
              <th className="px-4 py-3 font-medium text-right">
                <div className="flex items-center justify-end gap-1">
                  Hit Rate
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 font-medium">Book</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockProps.map((prop, idx) => (
              <tr
                key={idx}
                className="hover:bg-ocean-deep/30 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-text-primary">{prop.player}</p>
                      <p className="text-xs text-text-muted">{prop.team}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-text-secondary text-sm">{prop.prop}</td>
                <td className="px-4 py-4 text-right font-semibold text-text-primary">
                  {prop.line}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={prop.over > 0 ? 'text-positive' : 'text-text-primary'}>
                    {prop.over > 0 ? '+' : ''}
                    {prop.over}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={prop.under > 0 ? 'text-positive' : 'text-text-primary'}>
                    {prop.under > 0 ? '+' : ''}
                    {prop.under}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Badge
                    variant="neutral"
                    className={
                      parseInt(prop.hitRate) >= 75
                        ? 'border-positive/50 text-positive'
                        : 'border-text-muted text-text-secondary'
                    }
                  >
                    {prop.hitRate}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    {prop.sportsbook}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-ocean-deep/30 px-6 py-3 border-t border-border">
        <p className="text-xs text-text-muted text-center">
          Showing 4 of 348 props • Updated 5 minutes ago
        </p>
      </div>
    </Card>
  )
}
