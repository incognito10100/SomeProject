'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function QuickSeedChain({ userRole }: { userRole: string }) {
  const router = useRouter()
  const [open,   setOpen]   = useState(false)
  const [title,  setTitle]  = useState('')
  const [prompt, setPrompt] = useState('')
  const [hours,  setHours]  = useState('8')
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')

  if (!['ADMIN', 'MENTOR'].includes(userRole)) return null

  async function seed() {
    if (!title || !prompt) { setMsg('Fill in both fields.'); return }
    setSaving(true)
    const res = await fetch('/api/admin/chains', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, seedPrompt: prompt, windowHours: hours })
    })
    setSaving(false)
    if (res.ok) {
      setMsg('✓ Chain seeded!')
      setTimeout(() => { setOpen(false); router.refresh() }, 1000)
    } else {
      setMsg('Something went wrong.')
    }
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '10px 20px',
            background: '#1a1714', color: '#f5f0e8',
            border: 'none', borderRadius: '4px',
            fontFamily: 'Georgia, serif', fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          + Seed New Chain
        </button>
      ) : (
        <div style={{
          background: '#f5f0e8',
          border: '1px solid rgba(139,115,85,0.25)',
          borderRadius: '6px', padding: '24px',
        }}>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: '17px',
            marginBottom: '16px', color: '#1a1714'
          }}>
            Seed New Knowledge Chain
          </div>

          <label style={{
            display: 'block', fontFamily: 'monospace', fontSize: '9px',
            letterSpacing: '0.15em', textTransform: 'uppercase' as const,
            color: '#9e9488', marginBottom: '5px'
          }}>
            Chain Title / Question
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Is certainty ever intellectually honest?"
            style={{
              width: '100%', padding: '9px 12px', marginBottom: '12px',
              border: '1px solid rgba(139,115,85,0.25)', borderRadius: '4px',
              background: 'white', fontFamily: 'Georgia, serif', fontSize: '13px',
              outline: 'none', boxSizing: 'border-box' as const,
            }}
          />

          <label style={{
            display: 'block', fontFamily: 'monospace', fontSize: '9px',
            letterSpacing: '0.15em', textTransform: 'uppercase' as const,
            color: '#9e9488', marginBottom: '5px'
          }}>
            Opening Prompt
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Write the intellectual provocation that starts the chain..."
            style={{
              width: '100%', minHeight: '100px', padding: '9px 12px', marginBottom: '12px',
              border: '1px solid rgba(139,115,85,0.25)', borderRadius: '4px',
              background: 'white', fontFamily: 'Georgia, serif', fontSize: '13px',
              outline: 'none', resize: 'vertical' as const,
              boxSizing: 'border-box' as const,
            }}
          />

          <label style={{
            display: 'block', fontFamily: 'monospace', fontSize: '9px',
            letterSpacing: '0.15em', textTransform: 'uppercase' as const,
            color: '#9e9488', marginBottom: '5px'
          }}>
            Hours per Window
          </label>
          <input
            type="number" value={hours}
            onChange={e => setHours(e.target.value)}
            style={{
              width: '100px', padding: '9px 12px', marginBottom: '16px',
              border: '1px solid rgba(139,115,85,0.25)', borderRadius: '4px',
              background: 'white', fontFamily: 'Georgia, serif', fontSize: '13px',
              outline: 'none', boxSizing: 'border-box' as const,
            }}
          />

          {msg && (
            <div style={{
              padding: '8px 12px', marginBottom: '12px', borderRadius: '4px',
              background: msg.startsWith('✓') ? 'rgba(61,107,61,0.1)' : 'rgba(139,32,32,0.08)',
              color: msg.startsWith('✓') ? '#3d6b3d' : '#8b2020',
              fontFamily: 'Georgia, serif', fontSize: '13px',
            }}>
              {msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={seed} disabled={saving} style={{
              padding: '10px 24px', background: saving ? '#9e9488' : '#1a1714',
              color: '#f5f0e8', border: 'none', borderRadius: '4px',
              fontFamily: 'Georgia, serif', fontSize: '13px',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Seeding...' : 'Seed Chain →'}
            </button>
            <button onClick={() => setOpen(false)} style={{
              padding: '10px 20px', background: 'transparent',
              color: '#9e9488', border: '1px solid rgba(139,115,85,0.25)',
              borderRadius: '4px', fontFamily: 'Georgia, serif', fontSize: '13px',
              cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}