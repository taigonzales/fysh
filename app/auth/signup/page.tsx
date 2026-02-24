'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Fish, Mail, Lock, User } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ocean-deep px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Fish className="h-12 w-12 text-neon-teal mb-2" />
          <h1 className="text-3xl font-bold text-text-primary">Join FYSH</h1>
          <p className="text-text-secondary mt-2">Start tracking smarter bets</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Username"
            type="text"
            placeholder="fishlover23"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User className="h-5 w-5" />}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-5 w-5" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
            required
          />

          {error && (
            <p className="text-sm text-negative">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Sign Up
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted text-sm">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGoogleSignup}
        >
          Continue with Google
        </Button>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-neon-teal hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}
