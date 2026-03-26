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
  const weekdays = ['Mon','','Wed','','Fri','','']

  function color(count: number) {
    if (count === 0) return '#ece6dc'
    if (count === 1) return '#d8e7b5'
    if (count === 2) return '#b6d47a'
    if (count <= 4) return '#8fb84a'
    return '#5a9e2f'
  }

  const total = days.reduce((s,d)=>s+d.count,0)
  const active = days.filter(d=>d.count>0).length

  if (loading) {
    return <div style={{padding:20}}>Loading activity...</div>
  }

  return (

    <div style={{
      background:'#f5f0e8',
      border:'1px solid rgba(139,115,85,0.2)',
      borderRadius:6,
      padding:'22px 24px',
      marginBottom:30
    }}>

      {/* Header */}

      <div style={{
        display:'flex',
        justifyContent:'space-between',
        marginBottom:14
      }}>
        <div style={{
          fontFamily:'Georgia, serif',
          fontSize:17
        }}>
          Activity
        </div>

        <div style={{
          fontFamily:'monospace',
          fontSize:10,
          color:'#9e9488'
        }}>
          {total} actions · {active} active days
        </div>
      </div>

      <div style={{overflowX:'auto'}}>

        <div style={{minWidth:760}}>

          {/* Month labels */}

          <div style={{
            display:'grid',
            gridTemplateColumns:`40px repeat(${weeks.length}, 14px)`,
            marginBottom:6
          }}>
            <div></div>

            {weeks.map((week,i)=>{
              const d = new Date(week[0].date)
              const label = d.getDate() <= 7 ? months[d.getMonth()] : ''
              return (
                <div key={i} style={{
                  fontSize:9,
                  fontFamily:'monospace',
                  color:'#9e9488'
                }}>
                  {label}
                </div>
              )
            })}
          </div>

          {/* Grid */}

          <div style={{
            display:'grid',
            gridTemplateColumns:`40px repeat(${weeks.length}, 14px)`
          }}>

            {/* Weekday labels */}

            <div style={{
              display:'grid',
              gridTemplateRows:'repeat(7,12px)',
              gap:3,
              fontSize:9,
              fontFamily:'monospace',
              color:'#9e9488',
              marginRight:6
            }}>
              {weekdays.map((d,i)=>(
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Squares */}

            {weeks.map((week,wi)=>(
              <div key={wi} style={{
                display:'grid',
                gridTemplateRows:'repeat(7,12px)',
                gap:3
              }}>

                {week.map((day,di)=>(
                  <div
                    key={di}
                    title={`${day.count} actions on ${new Date(day.date).toLocaleDateString()}`}
                    style={{
                      width:12,
                      height:12,
                      borderRadius:2,
                      background:color(day.count),
                      transition:'transform 0.1s ease'
                    }}
                    onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.15)'}
                    onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}
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
