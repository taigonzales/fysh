import { ComingSoon } from '@/components/ui/coming-soon'

export const metadata = {
  title: 'Picks - FYSH',
  description: 'Post your picks, track your record, and compete on the leaderboard',
}

export default function PicksPage() {
  return (
    <ComingSoon
      title="Picks Hub"
      description="Post your sports betting picks, track your record, and build your reputation"
      features={[
        'Post picks with reasoning and confidence levels',
        'Track win/loss record with transparent stats',
        'Follow other bettors and see their picks',
        'Earn badges for accuracy streaks',
        'Export your betting history',
      ]}
    />
  )
}
