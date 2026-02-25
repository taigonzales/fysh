import Link from 'next/link'
import { Fish, Twitter, Github, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-ocean-deep">
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Fish className="h-7 w-7 text-neon-teal" />
              <span className="text-xl font-bold text-text-primary">FYSH</span>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              AI-powered sports betting research for serious bettors.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://twitter.com/fyshbet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-neon-teal transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/fysh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-neon-teal transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/fysh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-neon-teal transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@fysh.bet"
                className="text-text-muted hover:text-neon-teal transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/features" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/blog" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-text-secondary hover:text-neon-teal transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-text-secondary hover:text-neon-teal transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/responsible-gaming" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-text-secondary hover:text-neon-teal transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {currentYear} FYSH. All rights reserved.
          </p>
          <p className="text-xs text-text-muted max-w-md text-center md:text-right">
            Must be 21+ to bet. If you or someone you know has a gambling problem, call 1-800-GAMBLER.
          </p>
        </div>
      </div>
    </footer>
  )
}
