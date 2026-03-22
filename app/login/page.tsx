'use client'
// 'use client' means this component runs in the browser
// It needs to because it handles button clicks and form input

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  // State variables — these track what's in the form fields
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // This runs when the user clicks the Login button
  async function handleLogin() {
    setLoading(true)
    setError('')

    // signIn comes from NextAuth — it calls your authorize function
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // we handle redirect ourselves below
    })

    setLoading(false)

    if (result?.error) {
      // Login failed — show error message
      setError('Incorrect email or password. Please try again.')
    } else {
      // Login succeeded — go to dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf7f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif'
    }}>
      <div style={{
        width: '400px',
        border: '1px solid rgba(139,115,85,0.2)',
        borderRadius: '8px',
        padding: '48px 40px',
        background: 'white'
      }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '28px', fontWeight: '300', color: '#1a1714' }}>
            Intellectus
          </div>
          <div style={{ fontSize: '12px', color: '#9e9488', marginTop: '6px' }}>
            Sign in to your account
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(139,32,32,0.06)',
            border: '1px solid rgba(139,32,32,0.2)',
            borderRadius: '4px',
            padding: '10px 14px',
            color: '#8b2020',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Email field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#9e9488',
            marginBottom: '6px'
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid rgba(139,115,85,0.25)',
              borderRadius: '4px',
              fontSize: '14px',
              outline: 'none',
              background: '#faf7f2',
              fontFamily: 'Georgia, serif'
            }}
            placeholder="you@email.com"
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#9e9488',
            marginBottom: '6px'
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid rgba(139,115,85,0.25)',
              borderRadius: '4px',
              fontSize: '14px',
              outline: 'none',
              background: '#faf7f2',
              fontFamily: 'Georgia, serif'
            }}
            placeholder="••••••••"
          />
        </div>

        {/* Login button */}
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
            fontSize: '13px',
            fontFamily: 'Georgia, serif',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Link to registration */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '12px', color: '#9e9488' }}>
            No account yet?{' '}
          </span>
          <a href="/register" style={{ fontSize: '12px', color: '#8b7355' }}>
            Request Access
          </a>
        </div>

      </div>
    </div>
  )
}