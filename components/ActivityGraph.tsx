'use client'

import { useEffect, useState } from 'react'

type ActivityDay = {
  date:  string
  count: number
}

export default function ActivityGraph({ userId }: { userId: string }) {
  const [data,    setData]    = useState<ActivityDay[]>([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  useEffect(() => {
    fetch('/api/activity')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Build a 52-week grid (364 days)
  const today    = new Date()
  const days: { date: string; count: number }[] = []

  for (let i = 363; i >= 0; i--) {
    const d    = new Date(today)
    d.setDate(d.getDate() - i)
    const key  = d.toISOString().split('T')[0]
    const found = data.find(x => x.date === key)
    days.push({ date: key, count: found?.count ?? 0 })
  }

  // Pad so grid starts on Sunday
  const firstDay  = new Date(days[0].date).getDay()
  const padded    = Array(firstDay).fill(null).concat(days)
  const weeks: (typeof days[0] | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const firstReal = week.find(d => d !== null)
    if (firstReal) {
      const m = new Date(firstReal.date).getMonth()
      if (m !== lastMonth) {
        monthLabels.push({ label: months[m], col: wi })
        lastMonth = m
      }
    }
  })

  function color(count: number) {
    if (count === 0) return '#ede8dc'
    if (count === 1) return '#c9d98a'
    if (count === 2) return '#8fb84a'
    if (count <= 4)  return '#5a9e2f'
    return '#3d6b1e'
  }

  const totalActive = days.filter(d => d.count > 0).length
  const totalActions = days.reduce((s, d) => s + d.count, 0)

  if (loading) return (
    <div style={{
      padding: '20px',
      background: '#f5f0e8',
      border: '1px solid rgba(139,115,85,0.2)',
      borderRadius: '6px',
      fontFamily: 'Georgia, serif', fontSize: '13px',
      color: '#9e9488', fontStyle: 'italic'
    }}>
      Loading activity...
    </div>
  )

  return (
    <div style={{
      background: '#f5f0e8',
      border: '1px solid rgba(139,115,85,0.2)',
      borderRadius: '6px',
      padding: '20px 24px',
      marginBottom: '24px',
      position: 'relative' as const,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: '14px'
      }}>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: '15px', color: '#1a1714'
        }}>
          Activity
        </div>
        <div style={{
          fontFamily: 'monospace', fontSize: '10px', color: '#9e9488'
        }}>
          {totalActions} actions · {totalActive} active days in the last year
        </div>
      </div>

      {/* Month labels */}
      <div style={{
        display: 'flex', gap: '0px',
        marginBottom: '4px', paddingLeft: '20px',
        position: 'relative' as const,
        height: '14px',
      }}>
        {monthLabels.map((m, i) => (
          <div key={i} style={{
            position: 'absolute' as const,
            left: `${m.col * 13}px`,
            fontFamily: 'monospace', fontSize: '9px',
            color: '#9e9488', letterSpacing: '0.05em',
          }}>
            {m.label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-start' }}>

        {/* Day labels */}
        <div style={{
          display: 'flex', flexDirection: 'column' as const,
          gap: '2px', marginRight: '4px', paddingTop: '0px',
        }}>
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
            <div key={i} style={{
              height: '11px',
              fontFamily: 'monospace', fontSize: '8px',
              color: '#9e9488', lineHeight: '11px',
              width: '20px', textAlign: 'right' as const,
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div style={{
          display: 'flex', gap: '2px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{
              display: 'flex', flexDirection: 'column' as const, gap: '2px'
            }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  onMouseEnter={day ? (e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect()
                    setTooltip({
                      text: `${day.count} action${day.count !== 1 ? 's' : ''} on ${day.date}`,
                      x: rect.left,
                      y: rect.top - 28,
                    })
                  } : undefined}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    width:  '11px',
                    height: '11px',
                    borderRadius: '2px',
                    background: day ? color(day.count) : 'transparent',
                    cursor: day ? 'default' : 'default',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '4px', marginTop: '10px',
        justifyContent: 'flex-end',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '9px', color: '#9e9488'
        }}>
          Less
        </span>
        {[0, 1, 2, 3, 5].map(n => (
          <div key={n} style={{
            width: '11px', height: '11px',
            borderRadius: '2px', background: color(n),
          }} />
        ))}
        <span style={{
          fontFamily: 'monospace', fontSize: '9px', color: '#9e9488'
        }}>
          More
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed' as const,
          left: tooltip.x, top: tooltip.y,
          background: '#1a1714', color: '#f5f0e8',
          padding: '4px 10px', borderRadius: '4px',
          fontFamily: 'monospace', fontSize: '10px',
          pointerEvents: 'none' as const,
          zIndex: 1000, whiteSpace: 'nowrap' as const,
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
