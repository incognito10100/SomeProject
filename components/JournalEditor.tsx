'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JournalEditor({
  entries,
  userId,
}: {
  entries: any[]
  userId:  string
}) {
  const router = useRouter()

  const [selected, setSelected] = useState<any | null>(entries[0] ?? null)
  const [title,    setTitle]    = useState(entries[0]?.title   ?? '')
  const [content,  setContent]  = useState(entries[0]?.content ?? '')
  const [mood,     setMood]     = useState(entries[0]?.mood    ?? '')
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const moods = ['Curious','Reflective','Uncertain','Energised','Frustrated','Grateful','Focused']

  function selectEntry(entry: any) {
    setSelected(entry)
    setTitle(entry.title   ?? '')
    setContent(entry.content ?? '')
    setMood(entry.mood     ?? '')
    setMsg('')
  }

  function newEntry() {
    setSelected(null)
    setTitle('')
    setContent('')
    setMood('')
    setMsg('')
  }

  async function save() {
    if (!content.trim()) { setMsg('Write something before saving.'); return }
    setSaving(true)
    setMsg('')

    if (!selected) {
      const res = await fetch('/api/journals', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title, content, mood })
      })
      setSaving(false)
      if (res.ok) { setMsg('✓ Entry saved.'); router.refresh() }
      else setMsg('Failed to save. Try again.')
    } else {
      if (selected.isForReview) {
        setMsg('This entry is locked for review.')
        setSaving(false)
        return
      }
      const res = await fetch(`/api/journals/${selected.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title, content, mood })
      })
      setSaving(false)
      if (res.ok) { setMsg('✓ Entry updated.'); router.refresh() }
      else setMsg('Failed to update. Try again.')
    }
  }

  async function submitForReview() {
    if (wordCount < 50) { setMsg('Write at least 50 words first.'); return }

    setSaving(true)
    setMsg('')

    // If not yet saved, save first then submit
    if (!selected) {
      const saveRes = await fetch('/api/journals', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title, content, mood })
      })
      if (!saveRes.ok) {
        setSaving(false)
        setMsg('Failed to save. Try again.')
        return
      }
      const saveData = await saveRes.json()
      const reviewRes = await fetch(`/api/journals/${saveData.journal.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title, content, mood, isForReview: true })
      })
      setSaving(false)
      if (reviewRes.ok) { setMsg('✓ Submitted for review!'); router.refresh() }
      else setMsg('Failed to submit. Try again.')
      return
    }

    if (selected.isForReview) { setMsg('Already submitted.'); setSaving(false); return }

    const res = await fetch(`/api/journals/${selected.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, content, mood, isForReview: true })
    })
    setSaving(false)
    if (res.ok) { setMsg('✓ Submitted for review!'); router.refresh() }
    else {
      const data = await res.json().catch(() => ({}))
      setMsg(data.error ?? 'Failed to submit. Try again.')
    }
  }

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 200px)' }}>

      {/* ── Left panel — entry list ──────────────────────── */}
      <div style={{
        width: '260px', flexShrink: 0, overflowY: 'auto',
        borderRight: '1px solid rgba(139,115,85,0.2)',
        paddingRight: '20px',
      }}>
        <button onClick={newEntry} style={{
          width: '100%', padding: '10px',
          background: '#1a1714', color: '#f5f0e8',
          border: 'none', borderRadius: '4px',
          fontFamily: 'Georgia, serif', fontSize: '13px',
          cursor: 'pointer', marginBottom: '16px',
        }}>
          + New Entry
        </button>

        {entries.length === 0 ? (
          <p style={{
            fontFamily: 'Georgia, serif', fontSize: '13px',
            color: '#9e9488', fontStyle: 'italic'
          }}>
            No entries yet. Start writing.
          </p>
        ) : (
          entries.map(e => (
            <div key={e.id} onClick={() => selectEntry(e)} style={{
              padding: '12px 14px', borderRadius: '4px',
              marginBottom: '6px', cursor: 'pointer',
              background: selected?.id === e.id ? '#ede8dc' : 'transparent',
              border: `1px solid ${selected?.id === e.id
                ? 'rgba(139,115,85,0.3)' : 'transparent'}`,
            }}>
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: '13px',
                fontWeight: '500', color: '#1a1714', marginBottom: '4px',
                overflow: 'hidden', whiteSpace: 'nowrap' as const,
                textOverflow: 'ellipsis',
              }}>
                {e.title || 'Untitled'}
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: '9px',
                color: '#9e9488', marginBottom: '4px',
              }}>
                {new Date(e.createdAt).toLocaleDateString('en-IN')} · {e.wordCount} words
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' as const }}>
                {e.isForReview && !e.reviewedAt && (
                  <span style={{
                    fontFamily: 'monospace', fontSize: '8px',
                    padding: '2px 6px', borderRadius: '2px',
                    background: 'rgba(201,151,58,0.1)',
                    border: '1px solid rgba(201,151,58,0.3)',
                    color: '#a07830',
                  }}>Awaiting Review</span>
                )}
                {e.reviewedAt && (
                  <span style={{
                    fontFamily: 'monospace', fontSize: '8px',
                    padding: '2px 6px', borderRadius: '2px',
                    background: 'rgba(61,107,61,0.1)',
                    border: '1px solid rgba(61,107,61,0.25)',
                    color: '#3d6b3d',
                  }}>Reviewed · {e.mentorScore}/100</span>
                )}
                {e.mood && (
                  <span style={{
                    fontFamily: 'monospace', fontSize: '8px',
                    padding: '2px 6px', borderRadius: '2px',
                    background: 'rgba(139,115,85,0.1)', color: '#8b7355',
                  }}>{e.mood}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Right panel — editor ─────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const }}>

        {/* Title input */}
        <input
          type="text"
          placeholder="Entry title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={selected?.isForReview}
          style={{
            width: '100%', padding: '10px 0',
            border: 'none',
            borderBottom: '1px solid rgba(139,115,85,0.2)',
            background: 'transparent',
            fontFamily: 'Georgia, serif', fontSize: '22px',
            fontWeight: '300', color: '#1a1714',
            outline: 'none', marginBottom: '16px',
            boxSizing: 'border-box' as const,
          }}
        />

        {/* Mood pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '16px' }}>
          {moods.map(m => (
            <button key={m}
              onClick={() => !selected?.isForReview && setMood(mood === m ? '' : m)}
              style={{
                padding: '4px 10px',
                border: `1px solid ${mood === m ? 'rgba(139,115,85,0.5)' : 'rgba(139,115,85,0.2)'}`,
                borderRadius: '12px',
                background: mood === m ? 'rgba(139,115,85,0.1)' : 'transparent',
                fontFamily: 'monospace', fontSize: '9px',
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                color: mood === m ? '#8b7355' : '#9e9488',
                cursor: selected?.isForReview ? 'default' : 'pointer',
              }}>
              {m}
            </button>
          ))}
        </div>

        {/* Content textarea */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your reflection here..."
          disabled={selected?.isForReview}
          style={{
            flex: 1, width: '100%', padding: '4px 0',
            border: 'none', background: 'transparent',
            fontFamily: 'Georgia, serif', fontSize: '15px',
            lineHeight: 1.9, color: '#1a1714',
            outline: 'none', resize: 'none' as const,
            boxSizing: 'border-box' as const,
          }}
        />

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(139,115,85,0.2)',
          paddingTop: '14px', marginTop: '14px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '12px',
          flexWrap: 'wrap' as const,
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: '10px', color: '#9e9488',
          }}>
            {wordCount} words
            {selected?.isForReview && (
              <span style={{ color: '#a07830', marginLeft: '10px' }}>
                · Locked for review
              </span>
            )}
            {selected?.reviewedAt && (
              <span style={{ color: '#3d6b3d', marginLeft: '10px' }}>
                · Score: {selected.mentorScore}/100
              </span>
            )}
          </div>

          {/* Mentor feedback */}
          {selected?.mentorNote && (
            <div style={{
              flex: 1, padding: '8px 12px',
              background: 'rgba(61,107,61,0.06)',
              border: '1px solid rgba(61,107,61,0.2)',
              borderRadius: '4px',
              fontFamily: 'Georgia, serif', fontSize: '12px',
              fontStyle: 'italic', color: '#3d6b3d',
            }}>
              Mentor: "{selected.mentorNote}"
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {!selected?.isForReview && (
              <button onClick={save} disabled={saving} style={{
                padding: '9px 20px',
                background: saving ? '#9e9488' : '#1a1714',
                color: '#f5f0e8', border: 'none', borderRadius: '4px',
                fontFamily: 'Georgia, serif', fontSize: '13px',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Saving...' : selected ? 'Save' : 'Save Entry'}
              </button>
            )}

            {!selected?.isForReview && wordCount >= 50 && (
              <button onClick={submitForReview} disabled={saving} style={{
                padding: '9px 20px',
                background: 'transparent', color: '#c9973a',
                border: '1px solid #c9973a', borderRadius: '4px',
                fontFamily: 'Georgia, serif', fontSize: '13px',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                Submit for Review →
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            marginTop: '10px', padding: '10px 14px', borderRadius: '4px',
            background: msg.startsWith('✓')
              ? 'rgba(61,107,61,0.1)' : 'rgba(139,32,32,0.08)',
            border: `1px solid ${msg.startsWith('✓')
              ? 'rgba(61,107,61,0.3)' : 'rgba(139,32,32,0.2)'}`,
            color: msg.startsWith('✓') ? '#3d6b3d' : '#8b2020',
            fontFamily: 'Georgia, serif', fontSize: '13px',
          }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}