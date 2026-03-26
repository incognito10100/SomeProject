import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ActivityGraph from '@/components/ActivityGraph'

export default async function DashboardPage() {

  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = (session.user as any).id

  const [streaks, pendingTasks, activeChain, leaderboard] = await Promise.all([

    prisma.streak.findMany({
      where: { userId }
    }),

    prisma.task.findMany({
      where: {
        assignedTo: { has: userId },
        submissions: { none: { userId } }
      },
      orderBy: { dueAt: 'asc' },
      take: 5
    }),

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

    prisma.user.findMany({
      orderBy: { totalPoints: 'desc' },
      take: 5,
      select: { id: true, name: true, totalPoints: true }
    })

  ])

  const combinedStreak = streaks.find(s => s.type === 'COMBINED')
  const readingStreak = streaks.find(s => s.type === 'READING')
  const reflStreak = streaks.find(s => s.type === 'REFLECTION')
  const taskStreak = streaks.find(s => s.type === 'TASK')

  const myRank = leaderboard.findIndex(u => u.id === userId) + 1

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
      ? 'Good afternoon'
      : 'Good evening'

  return (

    <div
      style={{
        padding: '48px 32px',
        maxWidth: '1100px',
        margin: '0 auto',
        fontFamily: 'Georgia, serif'
      }}
    >

      {/* Header */}

      <div style={{ marginBottom: '36px' }}>

        <h1
          style={{
            fontSize: '30px',
            fontWeight: '300',
            marginBottom: '6px',
            letterSpacing: '-0.01em'
          }}
        >
          {greeting}, {session.user?.name?.split(' ')[0]}
        </h1>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: '#9e9488',
              fontStyle: 'italic'
            }}
          >
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          {/* Streak flame */}

          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#8b7355',
              background: 'rgba(201,151,58,0.08)',
              padding: '3px 8px',
              borderRadius: '4px'
            }}
          >
            🔥 {combinedStreak?.currentCount ?? 0} day streak
          </div>

        </div>

      </div>

      {/* Activity */}

      <ActivityGraph userId={userId} />

      {/* Streak Cards */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '18px',
          marginBottom: '36px'
        }}
      >

        {[
          {
            label: 'Combined Streak',
            value: combinedStreak?.currentCount ?? 0,
            unit: 'days',
            best: combinedStreak?.bestCount ?? 0
          },
          {
            label: 'Reading Streak',
            value: readingStreak?.currentCount ?? 0,
            unit: 'days',
            best: readingStreak?.bestCount ?? 0
          },
          {
            label: 'Reflection Streak',
            value: reflStreak?.currentCount ?? 0,
            unit: 'entries',
            best: reflStreak?.bestCount ?? 0
          },
          {
            label: 'Task Streak',
            value: taskStreak?.currentCount ?? 0,
            unit: 'days',
            best: taskStreak?.bestCount ?? 0
          }
        ].map((stat, i) => (

          <div
            key={i}
            style={{
              background: '#f5f0e8',
              border: '1px solid rgba(139,115,85,0.2)',
              borderRadius: '8px',
              padding: '22px',
              borderTop: '2px solid #c9973a',
              transition: 'box-shadow 0.15s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >

            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '8px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#9e9488',
                marginBottom: '12px'
              }}
            >
              {stat.label}
            </div>

            <div
              style={{
                fontSize: '40px',
                fontWeight: '300',
                lineHeight: 1
              }}
            >
              {stat.value}
              <span
                style={{
                  fontSize: '14px',
                  marginLeft: '4px',
                  color: '#8b7355'
                }}
              >
                {stat.unit}
              </span>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#9e9488',
                marginTop: '8px',
                fontStyle: 'italic'
              }}
            >
              Best: {stat.best} {stat.unit}
            </div>

          </div>

        ))}

      </div>

      {/* Middle Section */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))',
          gap: '20px',
          marginBottom: '28px'
        }}
      >

        {/* Pending Tasks */}

        <div
          style={{
            background: '#f5f0e8',
            border: '1px solid rgba(139,115,85,0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >

          <SectionHeader title="Pending Tasks" link="/tasks" />

          <div style={{ padding: '12px 24px 18px' }}>

            {pendingTasks.length === 0 ? (

              <Empty text="All tasks complete. Well done." />

            ) : (

              pendingTasks.map(task => {

                const isOverdue = new Date() > task.dueAt

                return (

                  <TaskRow
                    key={task.id}
                    title={task.title}
                    type={task.type}
                    due={task.dueAt}
                    overdue={isOverdue}
                  />

                )

              })

            )}

          </div>

        </div>

        {/* Knowledge Chain */}

        <div
          style={{
            background: '#f5f0e8',
            border: '1px solid rgba(139,115,85,0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >

          <SectionHeader title="Knowledge Chain" link="/chain" />

          <div style={{ padding: '18px 24px' }}>

            {!activeChain ? (

              <Empty text="No active chain right now." />

            ) : (

              <>

                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    marginBottom: '10px',
                    color: '#3d6b3d'
                  }}
                >
                  ● Active — {activeChain.linkCount} links
                </div>

                <div
                  style={{
                    fontSize: '15px',
                    fontStyle: 'italic',
                    marginBottom: '14px'
                  }}
                >
                  "{activeChain.title}"
                </div>

                {activeChain.links[0] && (

                  <div
                    style={{
                      borderLeft: '3px solid rgba(139,115,85,0.3)',
                      padding: '10px 14px',
                      background: 'rgba(245,240,232,0.6)'
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        marginBottom: '4px'
                      }}
                    >
                      {activeChain.links[0].user.name}
                    </div>

                    <div style={{ fontSize: '12px', fontStyle: 'italic' }}>
                      {activeChain.links[0].content}
                    </div>

                  </div>

                )}

              </>

            )}

          </div>

        </div>

      </div>

      {/* Leaderboard */}

      <div
        style={{
          background: '#f5f0e8',
          border: '1px solid rgba(139,115,85,0.2)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >

        <SectionHeader title="Leaderboard" />

        <div style={{ padding: '10px 24px 16px' }}>

          {leaderboard.map((member, i) => {

            const isMe = member.id === userId

            return (

              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 0',
                  background: isMe
                    ? 'rgba(201,151,58,0.05)'
                    : 'transparent'
                }}
              >

                <span style={{ width: '24px' }}>{i + 1}</span>

                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#3d4a5c',
                    color: '#f5f0e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px'
                  }}
                >
                  {member.name.charAt(0)}
                </div>

                <span style={{ flex: 1 }}>
                  {isMe ? 'You' : member.name}
                </span>

                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#8b7355'
                  }}
                >
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

function SectionHeader({ title, link }: any) {

  return (

    <div
      style={{
        padding: '18px 24px',
        borderBottom: '1px solid rgba(139,115,85,0.15)',
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >

      <span style={{ fontSize: '17px' }}>{title}</span>

      {link && (

        <a
          href={link}
          style={{
            fontFamily: 'monospace',
            fontSize: '9px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8b7355',
            textDecoration: 'none'
          }}
        >
          View →
        </a>

      )}

    </div>

  )
}

function Empty({ text }: any) {

  return (

    <p
      style={{
        padding: '20px 0',
        textAlign: 'center',
        color: '#9e9488',
        fontStyle: 'italic',
        fontSize: '13px'
      }}
    >
      {text}
    </p>

  )
}

function TaskRow({ title, type, due, overdue }: any) {

  return (

    <div
      style={{
        display: 'flex',
        gap: '14px',
        padding: '12px 0',
        borderBottom: '1px solid rgba(139,115,85,0.12)'
      }}
    >

      <div
        style={{
          width: '18px',
          height: '18px',
          border: '1.5px solid rgba(139,115,85,0.4)',
          borderRadius: '3px'
        }}
      />

      <div style={{ flex: 1 }}>

        <div style={{ fontSize: '13px' }}>{title}</div>

        <div style={{ fontSize: '10px', color: '#9e9488' }}>
          {type} · {due.toLocaleDateString()}
        </div>

      </div>

      {overdue && (

        <span style={{ color: '#8b2020', fontSize: '11px' }}>
          Overdue
        </span>

      )}

    </div>

  )
}
