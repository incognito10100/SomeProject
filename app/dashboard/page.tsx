import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ActivityGraph from '@/components/ActivityGraph'

export default async function DashboardPage() {

  // Get who is logged in
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = (session.user as any).id
  const role   = (session.user as any).role

  // Fetch everything this user needs for their dashboard
  // Promise.all runs all queries at the same time — faster
  const [streaks, pendingTasks, activeChain, leaderboard] = await Promise.all([

    // All 4 streak types for this user
    prisma.streak.findMany({
      where: { userId }
    }),

    // Their tasks that haven't been submitted yet
    prisma.task.findMany({
      where: {
        assignedTo: { has: userId },
        submissions: { none: { userId } }
      },
      orderBy: { dueAt: 'asc' },
      take: 5
    }),

    // The currently active knowledge chain
    prisma.knowledgeChain.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        links: {
          take: 2,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        }
      }
    }),

    // Top 5 members by total points
    prisma.user.findMany({
      orderBy: { totalPoints: 'desc' },
      take: 5,
      select: { id: true, name: true, totalPoints: true }
    })

  ])

  // Find the combined streak count specifically
  const combinedStreak = streaks.find(s => s.type === 'COMBINED')
  const readingStreak  = streaks.find(s => s.type === 'READING')
  const reflStreak     = streaks.find(s => s.type === 'REFLECTION')
  const taskStreak     = streaks.find(s => s.type === 'TASK')

  // Find this user's rank in the leaderboard
  const myRank = leaderboard.findIndex(u => u.id === userId) + 1

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Georgia, serif',
      maxWidth: '1100px'
    }}>

      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '28px',
          fontWeight: '300',
          color: '#1a1714',
          marginBottom: '4px'
        }}>
          Good morning, {session.user?.name?.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '13px', color: '#9e9488', fontStyle: 'italic' }}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric',
            month: 'long',   day: 'numeric'
          })}
        </p>
      </div>

      <ActivityGraph userId={userId} />

      {/* Streak stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Combined Streak', value: combinedStreak?.currentCount ?? 0,  unit: 'days',    best: combinedStreak?.bestCount ?? 0 },
          { label: 'Reading Streak',  value: readingStreak?.currentCount  ?? 0,  unit: 'days',    best: readingStreak?.bestCount  ?? 0 },
          { label: 'Reflection Streak', value: reflStreak?.currentCount   ?? 0,  unit: 'entries', best: reflStreak?.bestCount     ?? 0 },
          { label: 'Task Streak',     value: taskStreak?.currentCount     ?? 0,  unit: 'days',    best: taskStreak?.bestCount     ?? 0 },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#f5f0e8',
            border: '1px solid rgba(139,115,85,0.2)',
            borderRadius: '6px',
            padding: '22px 24px',
            borderTop: '2px solid #c9973a',
            position: 'relative'
          }}>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '8px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#9e9488',
              marginBottom: '10px'
            }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: '40px',
              fontWeight: '300',
              color: '#1a1714',
              lineHeight: 1
            }}>
              {stat.value}
              <span style={{ fontSize: '14px', color: '#8b7355', marginLeft: '4px' }}>
                {stat.unit}
              </span>
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9e9488',
              fontStyle: 'italic',
              marginTop: '8px'
            }}>
              Best: {stat.best} {stat.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Middle row — Tasks + Chain */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>

        {/* Pending Tasks */}
        <div style={{
          background: '#f5f0e8',
          border: '1px solid rgba(139,115,85,0.2)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(139,115,85,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '17px' }}>
              Pending Tasks
            </span>
            <a href="/tasks" style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8b7355',
              textDecoration: 'none'
            }}>
              View all →
            </a>
          </div>
          <div style={{ padding: '4px 24px 16px' }}>
            {pendingTasks.length === 0 ? (
              <p style={{
                padding: '20px 0',
                color: '#9e9488',
                fontStyle: 'italic',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                All tasks complete. Well done.
              </p>
            ) : (
              pendingTasks.map(task => {
                const isOverdue = new Date() > task.dueAt
                const daysLeft  = Math.ceil(
                  (task.dueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={task.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(139,115,85,0.12)'
                  }}>
                    <div style={{
                      width: '18px', height: '18px',
                      border: '1.5px solid rgba(139,115,85,0.4)',
                      borderRadius: '3px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '13px',
                        color: '#1a1714',
                        marginBottom: '4px'
                      }}>
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '9px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          background: 'rgba(245,240,232,0.8)',
                          border: '1px solid rgba(139,115,85,0.2)',
                          borderRadius: '2px',
                          color: '#8b7355'
                        }}>
                          {task.type}
                        </span>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '10px',
                          color: isOverdue ? '#8b2020' : daysLeft <= 1 ? '#a07830' : '#9e9488'
                        }}>
                          {isOverdue ? '⚠ Overdue'
                            : daysLeft === 0 ? '⏱ Due today'
                            : daysLeft === 1 ? '⏱ Due tomorrow'
                            : `Due ${task.dueAt.toLocaleDateString('en-IN')}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Active Chain */}
        <div style={{
          background: '#f5f0e8',
          border: '1px solid rgba(139,115,85,0.2)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(139,115,85,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '17px' }}>
              Knowledge Chain
            </span>
            <a href="/chain" style={{
              fontFamily: 'monospace', fontSize: '9px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#8b7355', textDecoration: 'none'
            }}>
              Open →
            </a>
          </div>
          <div style={{ padding: '16px 24px' }}>
            {!activeChain ? (
              <p style={{
                color: '#9e9488', fontStyle: 'italic',
                fontSize: '13px', textAlign: 'center', padding: '20px 0'
              }}>
                No active chain right now.
              </p>
            ) : (
              <>
                {/* Chain status indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    width: '7px', height: '7px',
                    borderRadius: '50%',
                    background: '#2ecc71',
                    boxShadow: '0 0 6px rgba(46,204,113,0.5)'
                  }} />
                  <span style={{
                    fontFamily: 'monospace', fontSize: '9px',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#3d6b3d'
                  }}>
                    Active — {activeChain.linkCount} links
                  </span>
                </div>

                {/* Chain title */}
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '15px',
                  fontStyle: 'italic',
                  color: '#1a1714',
                  marginBottom: '14px',
                  lineHeight: 1.4
                }}>
                  "{activeChain.title}"
                </div>

                {/* Latest link preview */}
                {activeChain.links[0] && (
                  <div style={{
                    background: 'rgba(245,240,232,0.6)',
                    borderLeft: '3px solid rgba(139,115,85,0.3)',
                    padding: '10px 14px',
                    borderRadius: '0 4px 4px 0',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      fontFamily: 'monospace', fontSize: '9px',
                      color: '#8b7355', marginBottom: '4px'
                    }}>
                      {activeChain.links[0].user.name}
                    </div>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontSize: '12px',
                      fontStyle: 'italic', color: '#3d4a5c',
                      lineHeight: 1.6,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const
                    }}>
                      {activeChain.links[0].content}
                    </div>
                  </div>
                )}

                <a href="/chain" style={{
                  display: 'block',
                  padding: '10px',
                  border: '1.5px dashed rgba(139,115,85,0.4)',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontFamily: 'Georgia, serif',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: '#8b7355',
                  textDecoration: 'none'
                }}>
                  ✦ Continue the chain
                </a>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Leaderboard strip */}
      <div style={{
        background: '#f5f0e8',
        border: '1px solid rgba(139,115,85,0.2)',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(139,115,85,0.15)'
        }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '17px' }}>
            Leaderboard
          </span>
        </div>
        <div style={{ padding: '8px 24px 16px' }}>
          {leaderboard.map((member, index) => {
            const isMe = member.id === userId
            const rankColors = ['#c9973a', '#8a9aaa', '#a0724a']
            return (
              <div key={member.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 0',
                borderBottom: '1px solid rgba(139,115,85,0.1)',
                background: isMe ? 'rgba(201,151,58,0.04)' : 'transparent'
              }}>
                <span style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '18px',
                  fontWeight: '300',
                  color: rankColors[index] ?? '#9e9488',
                  width: '24px',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: '#3d4a5c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Georgia, serif',
                  fontSize: '11px', color: '#f5f0e8',
                  flexShrink: 0
                }}>
                  {member.name.charAt(0)}
                </div>
                <span style={{
                  flex: 1,
                  fontFamily: 'Georgia, serif',
                  fontSize: '13px',
                  fontWeight: isMe ? 'bold' : 'normal'
                }}>
                  {isMe ? 'You' : member.name}
                </span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#8b7355'
                }}>
                  {member.totalPoints.toLocaleString()} pts
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}