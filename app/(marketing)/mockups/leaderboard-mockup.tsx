/**
 * Leaderboard Mockup
 * High-fidelity mockup showing community rankings and transparent track records
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Flame } from 'lucide-react'

const mockLeaderboard = [
  {
    rank: 1,
    username: 'SharpShooter',
    avatar: '🎯',
    winRate: '68.5%',
    roi: '+24.3%',
    streak: 8,
    totalPicks: 234,
  },
  {
    rank: 2,
    username: 'PropKing',
    avatar: '👑',
    winRate: '66.2%',
    roi: '+21.8%',
    streak: 5,
    totalPicks: 412,
  },
  {
    rank: 3,
    username: 'DataDriven',
    avatar: '📊',
    winRate: '64.8%',
    roi: '+19.4%',
    streak: 12,
    totalPicks: 189,
  },
  {
    rank: 4,
    username: 'TheAnalyst',
    avatar: '🔬',
    winRate: '63.1%',
    roi: '+17.2%',
    streak: 3,
    totalPicks: 301,
  },
  {
    rank: 5,
    username: 'BetSmarter',
    avatar: '🧠',
    winRate: '62.4%',
    roi: '+16.5%',
    streak: 7,
    totalPicks: 267,
  },
]

export function LeaderboardMockup() {
  return (
    <Card className="bg-ocean-card border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-neon-teal/10 to-transparent px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-neon-teal" />
          <div>
            <h3 className="font-semibold text-text-primary">Top Performers</h3>
            <p className="text-xs text-text-muted">Last 30 days • Minimum 50 picks</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="divide-y divide-border">
        {mockLeaderboard.map((user) => {
          const isTop3 = user.rank <= 3
          const rankColor =
            user.rank === 1
              ? 'text-neon-teal'
              : user.rank === 2
                ? 'text-text-primary'
                : user.rank === 3
                  ? 'text-coral'
                  : 'text-text-muted'

          return (
            <div
              key={user.rank}
              className={`px-6 py-4 hover:bg-ocean-deep/30 transition-colors ${
                user.rank === 1 ? 'bg-neon-teal/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {user.rank <= 3 ? (
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        user.rank === 1
                          ? 'bg-neon-teal/20 border-2 border-neon-teal'
                          : user.rank === 2
                            ? 'bg-text-primary/20 border-2 border-text-primary'
                            : 'bg-coral/20 border-2 border-coral'
                      }`}
                    >
                      <span className={`font-bold ${rankColor}`}>{user.rank}</span>
                    </div>
                  ) : (
                    <span className="text-text-muted font-medium">{user.rank}</span>
                  )}
                </div>

                {/* Avatar & Username */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-ocean-deep border border-border rounded-full flex items-center justify-center">
                    <span className="text-xl">{user.avatar}</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${isTop3 ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {user.username}
                    </p>
                    <p className="text-xs text-text-muted">{user.totalPicks} picks</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  {/* Win Rate */}
                  <div className="text-right">
                    <p className="text-xs text-text-muted mb-0.5">Win Rate</p>
                    <p className="font-semibold text-text-primary flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-positive" />
                      {user.winRate}
                    </p>
                  </div>

                  {/* ROI */}
                  <div className="text-right">
                    <p className="text-xs text-text-muted mb-0.5">ROI</p>
                    <p className="font-semibold text-positive">{user.roi}</p>
                  </div>

                  {/* Streak */}
                  <div className="text-right min-w-[60px]">
                    <p className="text-xs text-text-muted mb-0.5">Streak</p>
                    <Badge
                      variant={user.streak >= 7 ? 'info' : 'neutral'}
                      className={
                        user.streak >= 7
                          ? 'border-neon-teal/50 text-neon-teal'
                          : 'border-text-muted text-text-secondary'
                      }
                    >
                      {user.streak >= 7 && <Flame className="w-3 h-3 mr-1" />}
                      {user.streak}W
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-ocean-deep/30 border-t border-border">
        <p className="text-xs text-text-muted text-center">
          Updated every 30 minutes • All records publicly verified
        </p>
      </div>
    </Card>
  )
}
