import { Fish } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-8">
        <Fish className="h-24 w-24 text-neon-teal" />
        <h1 className="text-6xl font-bold text-text-primary">FYSH</h1>
        <p className="text-xl text-text-secondary">Reel in smarter bets</p>
        <div className="mt-8 px-8 py-4 rounded-lg bg-ocean-card border border-neon-teal/30 shadow-neon-glow-sm">
          <p className="text-text-primary">Project foundation initialized ✓</p>
        </div>
      </div>
    </main>
  )
}
