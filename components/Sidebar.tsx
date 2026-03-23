'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useIsMobile } from '@/hooks/useIsMobile'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈', roles: ['ADMIN','MENTOR','MEMBER'] },
  { href: '/tasks', label: 'Tasks', icon: '☰', roles: ['ADMIN','MENTOR','MEMBER'] },
  { href: '/chain', label: 'Knowledge Chain', icon: '⛓', roles: ['ADMIN','MENTOR','MEMBER'] },
  { href: '/journal', label: 'Reflection Journal', icon: '✦', roles: ['ADMIN','MENTOR','MEMBER'] },
  { href: '/circles', label: 'Study Circles', icon: '◎', roles: ['ADMIN','MENTOR','MEMBER'] },
  { href: '/library', label: 'Knowledge Library', icon: '▣', roles: ['ADMIN','MENTOR','MEMBER'] },
  { href: '/review-queue', label: 'Review Queue', icon: '✎', roles: ['ADMIN','MENTOR'] },
  { href: '/admin', label: 'Admin Panel', icon: '⊞', roles: ['ADMIN'] },
]

export default function Sidebar({
  user,
  streakCount,
}: {
  user: { name: string; role: string }
  streakCount: number
}) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const filtered = navItems.filter(item =>
    item.roles.includes(user.role)
  )

  // ───── MOBILE NAV ─────
  if (isMobile) {
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '52px',
          background: '#1a1714',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 100,
          borderBottom: '1px solid rgba(201,151,58,0.2)',
        }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#f5f0e8',
            fontWeight: '300',
          }}>
            Intellectus
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {streakCount > 0 && (
              <div style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#c9973a',
              }}>
                🔥 {streakCount}
              </div>
            )}

            <button
              onClick={() => setOpen(!open)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f5f0e8',
                fontSize: '22px',
                cursor: 'pointer',
              }}
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {open && (
          <div style={{
            position: 'fixed',
            top: '52px',
            left: 0,
            right: 0,
            background: '#1a1714',
            zIndex: 99,
            borderBottom: '1px solid rgba(201,151,58,0.2)',
            padding: '8px 0',
          }}>
            {filtered.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  textDecoration: 'none',
                  background: pathname === item.href
                    ? 'rgba(201,151,58,0.1)'
                    : 'transparent',
                  borderLeft: pathname === item.href
                    ? '2px solid #c9973a'
                    : '2px solid transparent',
                }}
              >
                <span style={{ color: '#c9973a', fontSize: '16px' }}>
                  {item.icon}
                </span>

                <span style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '15px',
                  color: pathname === item.href
                    ? '#f5f0e8'
                    : 'rgba(245,240,232,0.7)',
                }}>
                  {item.label}
                </span>
              </Link>
            ))}

            <div style={{
              borderTop: '1px solid rgba(139,115,85,0.2)',
              margin: '8px 0',
            }}/>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'none',
                border: 'none',
                color: 'rgba(245,240,232,0.5)',
                fontFamily: 'Georgia, serif',
                fontSize: '15px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              ↩ Sign Out
            </button>
          </div>
        )}

        <div style={{ height: '52px' }} />
      </>
    )
  }

  // ───── DESKTOP SIDEBAR ─────
  return (
    <div style={{
      width: '240px',
      background: '#1a1714',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(201,151,58,0.15)',
    }}>
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: '20px',
          color: '#f5f0e8',
          fontWeight: '300',
        }}>
          Intellectus
        </div>

        <div style={{
          fontFamily: 'monospace',
          fontSize: '8px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#c9973a',
        }}>
          Scholar's Platform
        </div>
      </div>

      <div style={{
        padding: '12px 20px',
        margin: '0 12px 16px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '6px',
        border: '1px solid rgba(201,151,58,0.1)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#c9973a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#1a1714',
          fontWeight: 'bold',
          marginBottom: '8px',
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          color: '#f5f0e8',
        }}>
          {user.name}
        </div>

        <div style={{
          fontFamily: 'monospace',
          fontSize: '8px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#c9973a',
          marginTop: '2px',
        }}>
          {user.role}
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 8px' }}>
        {filtered.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '4px',
              marginBottom: '2px',
              textDecoration: 'none',
              background: pathname === item.href
                ? 'rgba(201,151,58,0.12)'
                : 'transparent',
              borderLeft: pathname === item.href
                ? '2px solid #c9973a'
                : '2px solid transparent',
            }}
          >
            <span style={{
              color: pathname === item.href
                ? '#c9973a'
                : 'rgba(201,151,58,0.5)',
              fontSize: '14px',
              width: '16px',
            }}>
              {item.icon}
            </span>

            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: '13px',
              color: pathname === item.href
                ? '#f5f0e8'
                : 'rgba(245,240,232,0.6)',
            }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(139,115,85,0.15)',
      }}>
        {streakCount > 0 && (
          <div style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#c9973a',
            marginBottom: '12px',
          }}>
            🔥 {streakCount} day streak
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(245,240,232,0.4)',
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ↩ Sign Out
        </button>
      </div>
    </div>
  )
}