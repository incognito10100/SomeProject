'use client'

import { useEffect, useState } from 'react'

type ActivityDay = {
  date: string
  count: number
}

export default function ActivityGraph({ userId }: { userId: string }) {

  const [data, setData] = useState<ActivityDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/activity')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const today = new Date()
  const days: ActivityDay[] = []

  for (let i = 363; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]

    const found = data.find(x => x.date === key)

    days.push({
      date: key,
      count: found?.count ?? 0
    })
  }

  const weeks: ActivityDay[][] = []

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  function color(count: number) {
    if (count === 0) return '#ede8dc'
    if (count === 1) return '#c9d98a'
    if (count === 2) return '#8fb84a'
    if (count <= 4) return '#5a9e2f'
    return '#3d6b1e'
  }

  const totalActions = days.reduce((s, d) => s + d.count, 0)
  const activeDays = days.filter(d => d.count > 0).length

  if (loading) {
    return (
      <div style={{ padding: 20, fontStyle: 'italic', color: '#9e9488' }}>
        Loading activity...
      </div>
    )
  }

  return (
    <div style={{
      background: '#f5f0e8',
      border: '1px solid rgba(139,115,85,0.2)',
      borderRadius: 6,
      padding: '20px 24px',
      marginBottom: 24
    }}>

      {/* Header */}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 12
      }}>
        <div style={{ fontSize: 15 }}>Activity</div>

        <div style={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#9e9488'
        }}>
          {totalActions} actions · {activeDays} active days
        </div>
      </div>

      {/* Scroll area */}

      <div style={{
        overflowX: 'auto'
      }}>

        <div style={{ minWidth: 720 }}>

          {/* Month row */}

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${weeks.length}, 13px)`,
            marginBottom: 6
          }}>
            {weeks.map((week, i) => {

              const d = new Date(week[0].date)
              const label = d.getDate() <= 7 ? months[d.getMonth()] : ''

              return (
                <div key={i} style={{
                  fontSize: 9,
                  fontFamily: 'monospace',
                  color: '#9e9488'
                }}>
                  {label}
                </div>
              )
            })}
          </div>

          {/* Grid */}

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${weeks.length}, 13px)`,
            gap: 2
          }}>

            {weeks.map((week, wi) => (
              <div key={wi} style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 11px)',
                gap: 2
              }}>

                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.count} actions on ${day.date}`}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 2,
                      background: color(day.count)
                    }}
                  />
                ))}

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  )
}
