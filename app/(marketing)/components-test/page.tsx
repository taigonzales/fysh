import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { OddsDisplay } from '@/components/ui/odds-display'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs } from '@/components/ui/tabs'
import { Mail } from 'lucide-react'

export default function ComponentsTestPage() {
  return (
    <div className="container mx-auto py-12 space-y-8">
      <h1 className="text-3xl font-bold">UI Components Test</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Cards</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card hoverable glowColor="teal">
            <p>Hoverable card with teal glow</p>
          </Card>
          <Card hoverable glowColor="coral">
            <p>Hoverable card with coral glow</p>
          </Card>
          <Card>
            <p>Regular card</p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="success">Win</Badge>
          <Badge variant="danger">Loss</Badge>
          <Badge variant="info">High</Badge>
          <Badge variant="warning">Medium</Badge>
          <Badge variant="neutral">Pending</Badge>
          <Badge variant="success" size="sm">Small</Badge>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Inputs</h2>
        <div className="max-w-md space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail className="h-5 w-5" />} />
          <Input label="Error State" type="text" error="This field is required" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Odds Display</h2>
        <div className="flex gap-4 flex-wrap">
          <OddsDisplay odds={150} />
          <OddsDisplay odds={-120} />
          <OddsDisplay odds={250} size="lg" />
          <OddsDisplay odds={-110} size="sm" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Avatars</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <Avatar name="John Doe" size="sm" />
          <Avatar name="Jane Smith" size="md" />
          <Avatar name="Bob Johnson" size="lg" />
          <Avatar name="Alice Williams" size="xl" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Skeletons</h2>
        <div className="space-y-2">
          <Skeleton width="100%" height="40px" />
          <Skeleton width="80%" height="40px" />
          <Skeleton width="60%" height="40px" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Tabs</h2>
        <Tabs
          tabs={[
            { id: 'tab1', label: 'Tab 1', content: <p>Content for Tab 1</p> },
            { id: 'tab2', label: 'Tab 2', content: <p>Content for Tab 2</p> },
            { id: 'tab3', label: 'Tab 3', content: <p>Content for Tab 3</p> },
          ]}
        />
      </section>
    </div>
  )
}
