'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSignup = async () => {
    setLoading(true)

    // ✅ Lazy import to avoid SSR issues during build
    const { supabase } = await import('@/app/utils/supabaseClient')

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username,
        },
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">
      <h1 className="text-4xl font-semibold mb-10">Let’s build your account.</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          className="bg-zinc-900 px-4 py-3 rounded-md outline-none border border-zinc-700"
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="bg-zinc-900 px-4 py-3 rounded-md outline-none border border-zinc-700"
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="bg-zinc-900 px-4 py-3 rounded-md outline-none border border-zinc-700"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
          onClick={handleSignup}
          disabled={loading}
          className="bg-white text-black font-semibold py-3 rounded-md hover:bg-zinc-200 transition"
        >
          {loading ? 'Creating...' : 'Join'}
        </button>

        <p className="text-sm text-center text-zinc-400 mt-2">
          Already have an account?{' '}
          <a href="/login" className="underline hover:text-white">Login here.</a>
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
