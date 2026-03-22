'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const card = {
  background: '#f5f0e8',
  border: '1px solid rgba(139,115,85,0.2)',
  borderRadius: '6px',
  marginBottom: '16px',
  overflow: 'hidden' as const,
}

const label = {
  fontFamily: 'monospace' as const,
  fontSize: '9px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#9e9488',
}

export default function ReviewClient({
  pendingJournals,
  pendingSubmissions,
  reviewedJournals,
  mentorId,
}: {
  pendingJournals:    any[]
  pendingSubmissions: any[]
  reviewedJournals:   any[]
  mentorId:           string
}) {
  const router = useRouter()

  const [activeTab, setActiveTab]   = useState<'journals' | 'tasks'>('journals')
  const [selected,  setSelected]    = useState<any | null>(null)
  const [type,      setType]        = useState<'journal' | 'task' | null>(null)
  const [score,     setScore]       = useState('')
  const [feedback,  setFeedback]    = useState('')
  const [saving,    setSaving]      = useState(false)
  const [msg,       setMsg]         = useState('')

  function openJournal(j: any) {
    setSelected(j)
    setType('journal')
    setScore(j.mentorScore?.toString() ?? '')
    setFeedback(j.mentorNote ?? '')
    setMsg('')
  }

  function openSubmission(s: any) {
    setSelected(s)
    setType('task')
    setScore(s.mentorScore?.toString() ?? '')
    setFeedback(s.mentorFeedback ?? '')
    setMsg('')
  }

  function closePanel() {
    setSelected(null)
    setType(null)
    setScore('')
    setFeedback('')
    setMsg('')
  }

  async function saveReview() {
    if (!selected || !score) {
      setMsg('Please enter a score before saving.')
      return
    }

    const numScore = parseInt(score)
    if (numScore < 0 || numScore > 100) {
      setMsg('Score must be between 0 and 100.')
      return
    }

    setSaving(true)
    setMsg('')

    if (type === 'journal') {
      const res = await fetch(`/api/review/journal/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorScore:    numScore,
          mentorNote:     feedback,
          mentorId,
        })
      })

      setSaving(false)
      if (res.ok) {
        setMsg('✓ Journal reviewed successfully!')
        setTimeout(() => { closePanel(); router.refresh() }, 1200)
      } else {
        setMsg('Something went wrong. Try again.')
      }

    } else if (type === 'task') {
      const res = await fetch(`/api/review/submission/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorScore:    numScore,
          mentorFeedback: feedback,
        })
      })

      setSaving(false)
      if (res.ok) {
        setMsg('✓ Submission reviewed successfully!')
        setTimeout(() => { closePanel(); router.refresh() }, 1200)
      } else {
        setMsg('Something went wrong. Try again.')
      }
    }
  }

  const tabBtn = (t: 'journals' | 'tasks') => ({
    padding: '9px 20px',
    border: '1px solid',
    borderColor: activeTab === t ? '#1a1714' : 'rgba(139,115,85,0.25)',
    background: activeTab === t ? '#1a1714' : 'transparent',
    color: activeTab === t ? '#f5f0e8' : '#9e9488',
    borderRadius: '4px',
    fontFamily: 'monospace' as const,
    fontSize: '9px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer' as const,
  })

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* ── Left panel — list ────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('journals')} style={tabBtn('journals')}>
            ✦ Journals ({pendingJournals.length})
          </button>
          <button onClick={() => setActiveTab('tasks')} style={tabBtn('tasks')}>
            ☰ Task Submissions ({pendingSubmissions.length})
          </button>
        </div>

        {/* ── Journal list ─────────────────────────────── */}
        {activeTab === 'journals' && (
          <div>
            {pendingJournals.length === 0 ? (
              <div style={{
                ...card,
                padding: '40px 24px',
                textAlign: 'center' as const
              }}>
                <p style={{
                  fontFamily: 'Georgia, serif', fontSize: '14px',
                  color: '#9e9488', fontStyle: 'italic', margin: 0
                }}>
                  No journals awaiting review. All caught up. ✓
                </p>
              </div>
            ) : (
              pendingJournals.map(j => (
                <div
                  key={j.id}
                  onClick={() => openJournal(j)}
                  style={{
                    ...card,
                    padding: '18px 22px',
                    cursor: 'pointer',
                    borderLeft: selected?.id === j.id
                      ? '3px solid #c9973a' : '3px solid transparent',
                    background: selected?.id === j.id ? '#ede8dc' : '#f5f0e8',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '15px', fontWeight: '500', color: '#1a1714'
                    }}>
                      {j.title || 'Untitled Entry'}
                    </div>
                    <span style={{
                      ...label,
                      padding: '3px 8px',
                      background: 'rgba(201,151,58,0.1)',
                      border: '1px solid rgba(201,151,58,0.3)',
                      color: '#a07830',
                      borderRadius: '2px',
                      flexShrink: 0,
                      marginLeft: '12px'
                    }}>
                      Pending
                    </span>
                  </div>
                  <div style={{ ...label, marginBottom: '6px' }}>
                    {j.user.name} · {j.wordCount} words · {new Date(j.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  <div style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '12px', fontStyle: 'italic',
                    color: '#8b7355', lineHeight: 1.6,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {j.content}
                  </div>
                </div>
              ))
            )}

            {/* Recently reviewed */}
            {reviewedJournals.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <div style={{ ...label, marginBottom: '12px', display: 'block' }}>
                  Recently Reviewed
                </div>
                {reviewedJournals.map(j => (
                  <div key={j.id} style={{
                    ...card,
                    padding: '14px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '14px', color: '#1a1714'
                      }}>
                        {j.title || 'Untitled'}
                      </div>
                      <div style={{ ...label, marginTop: '3px' }}>
                        {j.user.name} · {new Date(j.reviewedAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '16px',
                      color: '#3d6b3d',
                      fontWeight: 'bold'
                    }}>
                      {j.mentorScore}/100
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Task submission list ──────────────────────── */}
        {activeTab === 'tasks' && (
          <div>
            {pendingSubmissions.length === 0 ? (
              <div style={{
                ...card,
                padding: '40px 24px',
                textAlign: 'center' as const
              }}>
                <p style={{
                  fontFamily: 'Georgia, serif', fontSize: '14px',
                  color: '#9e9488', fontStyle: 'italic', margin: 0
                }}>
                  No task submissions awaiting review. All caught up. ✓
                </p>
              </div>
            ) : (
              pendingSubmissions.map(s => (
                <div
                  key={s.id}
                  onClick={() => openSubmission(s)}
                  style={{
                    ...card,
                    padding: '18px 22px',
                    cursor: 'pointer',
                    borderLeft: selected?.id === s.id
                      ? '3px solid #c9973a' : '3px solid transparent',
                    background: selected?.id === s.id ? '#ede8dc' : '#f5f0e8',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '15px', fontWeight: '500', color: '#1a1714'
                    }}>
                      {s.task.title}
                    </div>
                    <span style={{
                      ...label,
                      padding: '3px 8px',
                      background: s.isLate
                        ? 'rgba(139,32,32,0.08)' : 'rgba(61,107,61,0.1)',
                      border: `1px solid ${s.isLate
                        ? 'rgba(139,32,32,0.2)' : 'rgba(61,107,61,0.25)'}`,
                      color: s.isLate ? '#8b2020' : '#3d6b3d',
                      borderRadius: '2px',
                      flexShrink: 0,
                      marginLeft: '12px'
                    }}>
                      {s.isLate ? 'Late' : 'On Time'}
                    </span>
                  </div>
                  <div style={{ ...label, marginBottom: '6px' }}>
                    {s.user.name} · {s.wordCount} words · {new Date(s.submittedAt).toLocaleDateString('en-IN')}
                  </div>
                  <div style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '12px', fontStyle: 'italic',
                    color: '#8b7355', lineHeight: 1.6,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {s.content}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Right panel — full reading + scoring ─────────── */}
      {selected && (
        <div style={{
          width: '420px',
          flexShrink: 0,
          position: 'sticky' as const,
          top: '24px',
        }}>
          <div style={{
            background: 'white',
            border: '1px solid rgba(139,115,85,0.2)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>

            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: '#1a1714',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '15px', color: '#f5f0e8',
                  fontWeight: '500', marginBottom: '4px'
                }}>
                  {type === 'journal'
                    ? (selected.title || 'Untitled Entry')
                    : selected.task.title}
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: '9px',
                  color: 'rgba(196,168,130,0.7)',
                  letterSpacing: '0.12em'
                }}>
                  {selected.user.name} · {selected.wordCount} words
                  {type === 'task' && ` · ${selected.task.type}`}
                </div>
              </div>
              <button
                onClick={closePanel}
                style={{
                  background: 'none', border: 'none',
                  color: '#9e9488', fontSize: '18px',
                  cursor: 'pointer', padding: '0 0 0 12px',
                  lineHeight: 1, flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>

            {/* Full content */}
            <div style={{
              padding: '20px',
              maxHeight: '320px',
              overflowY: 'auto',
              borderBottom: '1px solid rgba(139,115,85,0.15)',
            }}>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: '13px', lineHeight: 1.9,
                color: '#1a1714',
                whiteSpace: 'pre-wrap' as const,
              }}>
                {selected.content}
              </div>
            </div>

            {/* Scoring */}
            <div style={{ padding: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '14px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ ...label, display: 'block', marginBottom: '6px' }}>
                    Score (0 – 100)
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    placeholder="e.g. 82"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid rgba(139,115,85,0.3)',
                      borderRadius: '4px',
                      background: '#faf7f2',
                      fontFamily: 'Georgia, serif',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#1a1714',
                      outline: 'none',
                      boxSizing: 'border-box' as const,
                    }}
                  />
                </div>

                {/* Score preview badge */}
                {score && (
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: parseInt(score) >= 80
                      ? 'rgba(61,107,61,0.1)' : parseInt(score) >= 60
                      ? 'rgba(201,151,58,0.1)' : 'rgba(139,32,32,0.08)',
                    border: `2px solid ${parseInt(score) >= 80
                      ? '#3d6b3d' : parseInt(score) >= 60
                      ? '#c9973a' : '#8b2020'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '18px',
                  }}>
                    <span style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: parseInt(score) >= 80
                        ? '#3d6b3d' : parseInt(score) >= 60
                        ? '#c9973a' : '#8b2020',
                    }}>
                      {score}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ ...label, display: 'block', marginBottom: '6px' }}>
                Feedback (optional but encouraged)
              </div>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="What did they do well? What could be deeper? Be specific."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px 12px',
                  border: '1px solid rgba(139,115,85,0.3)',
                  borderRadius: '4px',
                  background: '#faf7f2',
                  fontFamily: 'Georgia, serif',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: '#1a1714',
                  outline: 'none',
                  resize: 'vertical' as const,
                  boxSizing: 'border-box' as const,
                  marginBottom: '14px',
                }}
              />

              {msg && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  background: msg.startsWith('✓')
                    ? 'rgba(61,107,61,0.1)' : 'rgba(139,32,32,0.08)',
                  border: `1px solid ${msg.startsWith('✓')
                    ? 'rgba(61,107,61,0.3)' : 'rgba(139,32,32,0.2)'}`,
                  color: msg.startsWith('✓') ? '#3d6b3d' : '#8b2020',
                  fontFamily: 'Georgia, serif',
                  fontSize: '13px',
                }}>
                  {msg}
                </div>
              )}

              <button
                onClick={saveReview}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: saving ? '#9e9488' : '#1a1714',
                  color: '#f5f0e8',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: 'Georgia, serif',
                  fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Review →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}