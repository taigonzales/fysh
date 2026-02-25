import { ComingSoon } from '@/components/ui/coming-soon'

export const metadata = {
  title: 'Leaderboard - FYSH',
  description: 'Community rankings and transparent betting records',
}

export default function LeaderboardPage() {
  return (
    <ComingSoon
      title="Leaderboard"
      description="See who's winning and follow the sharpest bettors in the community"
      features={[
        'Weekly and all-time rankings',
        'Win rate, ROI, and streak tracking',
        'Filter by sport and bet type',
        'Follow top performers',
        'Verified, transparent records (no stat padding)',
        'Climb ranks and earn reputation',
      ]}
    />
  )
}
