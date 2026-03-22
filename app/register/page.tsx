'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name:       '',
    email:      '',
    password:   '',
    inviteCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit() {
    if (!form.name || !form.email || !form.password || !form.inviteCode) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Try again.')
        setLoading(false)
        return
      }

      // Success — go to login
      router.push('/login?registered=true')

    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
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
        maxWidth: '420px',
        background: 'white',
        border: '1px solid rgba(139,115,85,0.2)',
        borderRadius: '8px',
        padding: '40px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
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
            Create Account
          </div>
        </div>

        {/* Fields */}
        {[
          { key: 'name',       label: 'Full Name',    type: 'text',     placeholder: 'Your full name' },
          { key: 'email',      label: 'Email',        type: 'email',    placeholder: 'your@email.com' },
          { key: 'password',   label: 'Password',     type: 'password', placeholder: 'Choose a strong password' },
          { key: 'inviteCode', label: 'Invite Code',  type: 'text',     placeholder: 'Enter your invite code' },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'monospace',
              fontSize: '9px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: '#9e9488',
              marginBottom: '6px',
            }}>
              {field.label}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.key as keyof typeof form]}
              onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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
        ))}

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

        {/* Submit */}
        <button
          onClick={handleSubmit}
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
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>

        {/* Login link */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#9e9488',
          }}>
            Already have an account?{' '}
          </span>
          <a href="/login" style={{
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#c9973a',
            textDecoration: 'none',
          }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}