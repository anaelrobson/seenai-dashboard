'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)

    const { supabase } = await import('@/lib/supabase')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">
      <h1 className="text-4xl font-semibold mb-10">Welcome back.</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          className="bg-zinc-900 px-4 py-3 rounded-md outline-none border border-zinc-700"
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="bg-zinc-900 px-4 py-3 rounded-md outline-none border border-zinc-700"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-white text-black font-semibold py-3 rounded-md hover:bg-zinc-200 transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-sm text-center text-zinc-400 mt-2">
          Don’t have an account?{' '}
          <a href="/signup" className="underline hover:text-white">Sign up here.</a>
        </p>
      </div>

      <a
        href="https://seen-ai.com"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 right-6 opacity-60 hover:opacity-100 hover:scale-110 transition-transform duration-300"
      >
        <Image src="/seenailogo.png" alt="SeenAI logo" width={48} height={48} />
      </a>
    </div>
  )
}
