import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back to FYSH!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-text-secondary text-sm font-medium">Total Picks</h3>
            <Badge variant="info">Active</Badge>
          </div>
          <p className="text-3xl font-bold text-text-primary">0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-text-secondary text-sm font-medium">Win Rate</h3>
            <Badge variant="success">+0%</Badge>
          </div>
          <p className="text-3xl font-bold text-text-primary">0%</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-text-secondary text-sm font-medium">ROI</h3>
            <Badge variant="neutral">N/A</Badge>
          </div>
          <p className="text-3xl font-bold text-text-primary">0%</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          🚀 Part 1 Complete!
        </h2>
        <p className="text-text-secondary">
          FYSH foundation is set up successfully. Next steps:
        </p>
        <ul className="mt-4 space-y-2 text-text-secondary">
          <li>• Part 2: Data Layer (Odds API, Cron Jobs, QuickSlip)</li>
          <li>• Part 3: AI Layer (Claude Integration)</li>
          <li>• Part 4: Frontend Features (Prop Finder, Pick Feed)</li>
          <li>• Part 5: Social Layer (Profiles, Following, Comments)</li>
          <li>• Part 6: Landing Page & Marketing</li>
        </ul>
      </Card>
    </div>
  )
}
