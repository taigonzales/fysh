import Link from 'next/link'
import { Fish } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-ocean-dark mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Fish className="h-6 w-6 text-neon-teal" />
            <span className="text-lg font-bold text-text-primary">FYSH</span>
          </div>

          <div className="flex gap-6 text-sm text-text-secondary">
            <Link href="/about" className="hover:text-text-primary transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-text-primary transition-colors">
              Contact
            </Link>
          </div>

          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} FYSH. Reel in smarter bets.
          </p>
        </div>
      </div>
    </footer>
  )
}
