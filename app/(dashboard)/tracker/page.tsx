import { ComingSoon } from '@/components/ui/coming-soon'

export const metadata = {
  title: 'Tracker - FYSH',
  description: 'Track your bets, bankroll, and betting performance over time',
}

export default function TrackerPage() {
  return (
    <ComingSoon
      title="Bet Tracker"
      description="Log bets, manage your bankroll, and analyze your betting performance"
      features={[
        'Manual bet logging with stake and odds',
        'Bankroll management and unit tracking',
        'Win/loss charts and trend analysis',
        'ROI calculation by sport, bet type, and sportsbook',
        'Export data for tax purposes',
        'Set daily/weekly betting limits',
      ]}
    />
  )
}
