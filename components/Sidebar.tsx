'use client'

import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',         icon: '◈', role: null     },
  { href: '/tasks',        label: 'Tasks',              icon: '☰', role: null     },
  { href: '/chain',        label: 'Knowledge Chain',    icon: '⬡', role: null     },
  { href: '/journal',      label: 'Reflection Journal', icon: '✦', role: null     },
  { href: '/circles',      label: 'Study Circles',      icon: '◎', role: null     },
  { href: '/library',      label: 'Knowledge Library',  icon: '▣', role: null     },
  { href: '/review-queue', label: 'Review Queue',       icon: '✎', role: 'MENTOR' },
  { href: '/admin',        label: 'Admin Panel',        icon: '⊞', role: 'ADMIN'  },
]

type Props = {
  userName:       string
  userRole:       string
  combinedStreak: number
}

export default function Sidebar({ userName, userRole, combinedStreak }: Props) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(item => {
    if (!item.role) return true
    if (item.role === 'ADMIN'  && userRole === 'ADMIN') return true
    if (item.role === 'MENTOR' && ['ADMIN', 'MENTOR'].includes(userRole)) return true
    return false
  })

  return (
    <nav style={{
      width:      '260px',
      minHeight:  '100vh',
      background: '#1a1714',
      color:      '#f5f0e8',
      display:    'flex',
      flexDirection: 'column',
      position:   'fixed',
      left: 0,
      top:  0,
      zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.06)'
    }}>

      {/* ── Logo ─────────────────────────────────── */}
      <div style={{
        padding:      '32px 28px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{
          fontFamily:    'Georgia, serif',
          fontSize:      '24px',
          fontWeight:    '300',
          color:         '#f5f0e8',
          letterSpacing: '0.04em'
        }}>
          Intellectus
        </div>
        <div style={{
          fontFamily:    'monospace',
          fontSize:      '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color:         '#c4a882',
          marginTop:     '4px'
        }}>
          Scholar's Platform
        </div>
      </div>

      {/* ── User info ────────────────────────────── */}
      <div style={{
        padding:      '18px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display:      'flex',
        alignItems:   'center',
        gap:          '12px'
      }}>
        <div style={{
          width:          '36px',
          height:         '36px',
          borderRadius:   '50%',
          background:     'linear-gradient(135deg, #8b7355, #a07830)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     'Georgia, serif',
          fontSize:       '14px',
          color:          '#f5f0e8',
          flexShrink:     0
        }}>
          {userName ? userName.charAt(0).toUpperCase() : '?'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily:    'Georgia, serif',
            fontSize:      '14px',
            color:         '#f5f0e8',
            whiteSpace:    'nowrap',
            overflow:      'hidden',
            textOverflow:  'ellipsis'
          }}>
            {userName}
          </div>
          <div style={{
            fontFamily:    'monospace',
            fontSize:      '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color:         '#c9973a',
            marginTop:     '2px'
          }}>
            {userRole}
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <div style={{ flex: 1, padding: '12px 0' }}>
        {visibleItems.map(item => {
          const isActive = pathname === item.href ||
                           pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '12px',
                padding:        '10px 28px',
                color:          isActive ? '#f5f0e8' : 'rgba(196,168,130,0.65)',
                textDecoration: 'none',
                borderLeft:     isActive ? '2px solid #c9973a' : '2px solid transparent',
                background:     isActive ? 'rgba(201,151,58,0.1)' : 'transparent',
                fontFamily:     'Georgia, serif',
                fontSize:       '13px',
              }}
            >
              <span style={{ fontSize: '14px', opacity: isActive ? 1 : 0.7 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* ── Streak ───────────────────────────────── */}
      <div style={{
        padding:    '20px 28px',
        borderTop:  '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(201,151,58,0.05)'
      }}>
        <div style={{
          fontFamily:    'monospace',
          fontSize:      '8px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color:         '#c9973a',
          marginBottom:  '8px'
        }}>
          Current Streak
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontSize:   '32px',
            fontWeight: '300',
            color:      '#f5f0e8',
            lineHeight: 1
          }}>
            {combinedStreak}
          </span>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontSize:   '12px',
            color:      '#c4a882'
          }}>
            days
          </span>
        </div>
      </div>

      {/* ── Sign out ─────────────────────────────── */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          padding:    '14px 28px',
          background: 'transparent',
          border:     'none',
          borderTop:  '1px solid rgba(255,255,255,0.06)',
          color:      'rgba(196,168,130,0.45)',
          fontFamily: 'Georgia, serif',
          fontSize:   '12px',
          cursor:     'pointer',
          textAlign:  'left',
        }}
      >
        ← Sign Out
      </button>

    </nav>
  )
}