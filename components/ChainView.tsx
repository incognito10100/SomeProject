'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ChainView({ chain, pastChains, userId }: {
  chain: any
  pastChains: any[]
  userId: string
}) {
  const router  = useRouter()
  const [content, setContent]   = useState('')
  const [posting, setPosting]   = useState(false)
  const [error,   setError]     = useState('')

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const canPost   = wordCount >= 80

  async function postLink() {
    if (!canPost || !chain) return
    setPosting(true)
    setError('')

    const res = await fetch(`/api/chains/${chain.id}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })

    setPosting(false)

    if (res.ok) {
      setContent('')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
  }

  if (!chain) return (
    <div style={{
      textAlign: 'center', padding: '80px 40px',
      border: '1px solid rgba(139,115,85,0.2)',
      borderRadius: '6px', background: '#f5f0e8'
    }}>
      <div style={{
        fontFamily: 'Georgia, serif', fontSize: '22px',
        fontWeight: '300', color: '#1a1714', marginBottom: '10px'
      }}>
        No active chain right now
      </div>
      <p style={{
        fontFamily: 'Georgia, serif', fontSize: '13px',
        color: '#9e9488', fontStyle: 'italic'
      }}>
        Your Admin or Mentor will seed the next chain soon.
      </p>

      {/* Past chains */}
      {pastChains.length > 0 && (
        <div style={{ marginTop: '40px', textAlign: 'left' }}>
          <div style={{
            fontFamily: 'monospace', fontSize: '9px',
            letterSpacing: '0.2em', textTransform: 'uppercase' as const,
            color: '#9e9488', marginBottom: '14px'
          }}>
            Past Chains
          </div>
          {pastChains.map(c => (
            <div key={c.id} style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(139,115,85,0.1)',
              display: 'flex', justifyContent: 'space-between'
            }}>
              <span style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic', fontSize: '14px'
              }}>
                "{c.title}"
              </span>
              <span style={{
                fontFamily: 'monospace', fontSize: '9px',
                color: c.status === 'BROKEN' ? '#8b2020' : '#3d6b3d',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em'
              }}>
                {c.status} · {c._count.links} links
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Check if this user already posted in this chain
  const alreadyPosted = chain.links.some((l: any) => l.user?.name === userId)

  return (
    <div>
      {/* Chain header */}
      <div style={{
        background: '#1a1714', borderRadius: '6px',
        padding: '28px 32px', marginBottom: '24px'
      }}>
        <div style={{
          fontFamily: 'monospace', fontSize: '8px',
          letterSpacing: '0.25em', textTransform: 'uppercase' as const,
          color: '#c9973a', marginBottom: '10px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#2ecc71',
            boxShadow: '0 0 6px rgba(46,204,113,0.6)',
            display: 'inline-block'
          }} />
          Active Chain · {chain.links.length} links
        </div>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: '22px',
          fontStyle: 'italic', color: '#f5f0e8',
          fontWeight: '300', lineHeight: 1.3
        }}>
          "{chain.title}"
        </div>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: '12px',
          color: 'rgba(196,168,130,0.6)', marginTop: '8px',
          fontStyle: 'italic'
        }}>
          Seeded by {chain.seededBy?.name}
        </div>
      </div>

      {/* Seed prompt */}
      <div style={{
        background: '#f5f0e8',
        border: '1px solid rgba(139,115,85,0.2)',
        borderLeft: '3px solid #c9973a',
        borderRadius: '0 6px 6px 0',
        padding: '20px 24px', marginBottom: '16px'
      }}>
        <div style={{
          fontFamily: 'monospace', fontSize: '8px',
          letterSpacing: '0.2em', textTransform: 'uppercase' as const,
          color: '#c9973a', marginBottom: '8px'
        }}>
          Opening Prompt
        </div>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: '14px',
          fontStyle: 'italic', color: '#1a1714', lineHeight: 1.75
        }}>
          {chain.seedPrompt}
        </div>
      </div>

      {/* Chain links */}
      {chain.links.map((link: any, i: number) => (
        <div key={link.id} style={{
          background: 'white',
          border: '1px solid rgba(139,115,85,0.15)',
          borderLeft: '3px solid rgba(139,115,85,0.3)',
          borderRadius: '0 6px 6px 0',
          padding: '20px 24px', marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div style={{
              fontFamily: 'monospace', fontSize: '9px',
              color: '#8b7355', letterSpacing: '0.1em'
            }}>
              Link {i + 1} · {link.user?.name}
            </div>
            <div style={{
              fontFamily: 'monospace', fontSize: '9px', color: '#9e9488'
            }}>
              {new Date(link.createdAt).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: '14px',
            lineHeight: 1.85, color: '#1a1714'
          }}>
            {link.content}
          </div>
        </div>
      ))}

      {/* Compose area */}
      <div style={{
        background: '#f5f0e8',
        border: '1px solid rgba(139,115,85,0.2)',
        borderRadius: '6px', overflow: 'hidden',
        marginTop: '24px'
      }}>
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(139,115,85,0.15)',
          background: '#f0ebe0',
          display: 'flex', justifyContent: 'space-between'
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: '9px',
            letterSpacing: '0.15em', textTransform: 'uppercase' as const,
            color: '#9e9488'
          }}>
            Add Your Link
          </span>
          <span style={{
            fontFamily: 'monospace', fontSize: '9px',
            color: canPost ? '#3d6b3d' : '#9e9488'
          }}>
            {wordCount} / 80 words minimum
          </span>
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Continue the chain of thought. Build on what came before. Minimum 80 words."
          style={{
            width: '100%', minHeight: '160px',
            padding: '20px', border: 'none', outline: 'none',
            fontFamily: 'Georgia, serif', fontSize: '14px',
            lineHeight: 1.85, background: 'transparent',
            resize: 'vertical' as const, color: '#1a1714',
            boxSizing: 'border-box' as const
          }}
        />

        {error && (
          <div style={{
            padding: '10px 20px', color: '#8b2020',
            fontFamily: 'Georgia, serif', fontSize: '12px',
            background: 'rgba(139,32,32,0.06)'
          }}>
            {error}
          </div>
        )}

        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(139,115,85,0.15)',
          display: 'flex', justifyContent: 'flex-end'
        }}>
          <button
            onClick={postLink}
            disabled={!canPost || posting}
            style={{
              padding: '10px 24px',
              background: canPost && !posting ? '#1a1714' : '#9e9488',
              color: '#f5f0e8', border: 'none', borderRadius: '4px',
              fontFamily: 'Georgia, serif', fontSize: '13px',
              cursor: canPost && !posting ? 'pointer' : 'not-allowed'
            }}
          >
            {posting ? 'Posting...' : 'Post Link →'}
          </button>
        </div>
      </div>
    </div>
  )
}