'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email:    email.toLowerCase().trim(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Incorrect email or password.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f0e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        border: '1px solid rgba(139,115,85,0.2)',
        borderRadius: '8px',
        padding: '40px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            fontWeight: '300',
            color: '#1a1714',
            marginBottom: '6px',
          }}>
            Intellectus
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '9px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase' as const,
            color: '#c9973a',
          }}>
            Scholar's Platform
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontFamily: 'monospace',
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: '#9e9488',
            marginBottom: '6px',
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="your@email.com"
            autoComplete="email"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid rgba(139,115,85,0.25)',
              borderRadius: '4px',
              background: '#faf7f2',
              fontFamily: 'Georgia, serif',
              fontSize: '14px',
              color: '#1a1714',
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontFamily: 'monospace',
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: '#9e9488',
            marginBottom: '6px',
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Your password"
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid rgba(139,115,85,0.25)',
              borderRadius: '4px',
              background: '#faf7f2',
              fontFamily: 'Georgia, serif',
              fontSize: '14px',
              color: '#1a1714',
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px',
            marginBottom: '16px',
            background: 'rgba(139,32,32,0.08)',
            border: '1px solid rgba(139,32,32,0.2)',
            borderRadius: '4px',
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#8b2020',
          }}>
            {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#9e9488' : '#1a1714',
            color: '#f5f0e8',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        {/* Register link */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#9e9488',
          }}>
            No account?{' '}
          </span>
          <a href="/register" style={{
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#c9973a',
            textDecoration: 'none',
          }}>
            Register with invite code
          </a>
        </div>
      </div>
    </div>
  )
}