'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', inviteCode: ''
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleRegister() {
    setLoading(true)
    setError('')

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error)
    } else {
      // Account created — redirect to login
      router.push('/login?registered=true')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid rgba(139,115,85,0.25)',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    background: '#faf7f2',
    fontFamily: 'Georgia, serif',
    marginBottom: '16px'
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: '11px',
    fontFamily: 'monospace',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#9e9488',
    marginBottom: '6px'
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

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '24px', fontWeight: '300' }}>
            Join Intellectus
          </div>
          <div style={{ fontSize: '12px', color: '#9e9488', marginTop: '6px' }}>
            You need an invite code from your Admin
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(139,32,32,0.06)',
            border: '1px solid rgba(139,32,32,0.2)',
            borderRadius: '4px', padding: '10px 14px',
            color: '#8b2020', fontSize: '13px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <label style={labelStyle}>Full Name</label>
        <input style={inputStyle} type="text" placeholder="Your full name"
          value={form.name} onChange={e => updateField('name', e.target.value)} />

        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" placeholder="you@email.com"
          value={form.email} onChange={e => updateField('email', e.target.value)} />

        <label style={labelStyle}>Password</label>
        <input style={inputStyle} type="password" placeholder="Choose a strong password"
          value={form.password} onChange={e => updateField('password', e.target.value)} />

        <label style={labelStyle}>Invite Code</label>
        <input style={inputStyle} type="text" placeholder="Given to you by your Admin"
          value={form.inviteCode} onChange={e => updateField('inviteCode', e.target.value)} />

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: loading ? '#9e9488' : '#1a1714',
            color: '#f5f0e8', border: 'none',
            borderRadius: '4px', fontSize: '13px',
            fontFamily: 'Georgia, serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '4px'
          }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a href="/login" style={{ fontSize: '12px', color: '#8b7355' }}>
            Already have an account? Sign in
          </a>
        </div>

      </div>
    </div>
  )
}