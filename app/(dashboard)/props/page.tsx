import { ComingSoon } from '@/components/ui/coming-soon'

export const metadata = {
  title: 'Props - FYSH',
  description: 'Find and compare player props across all major sportsbooks',
}

export default function PropsPage() {
  return (
    <ComingSoon
      title="Prop Finder"
      description="Search, filter, and compare player props across all major sportsbooks"
      features={[
        'Live odds from DraftKings, FanDuel, BetMGM, and more',
        'Filter by sport, player, prop type, and book',
        'Hit rate data and historical trends',
        'AI analysis for every prop',
        'Line movement tracking',
        'Best available odds highlighting',
      ]}
    />
  )
}
