import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function CirclesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const circles = await prisma.studyCircle.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ padding: '40px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '28px',
          fontWeight: '300', color: '#1a1714', margin: 0
        }}>
          Study Circles
        </h1>
        <p style={{
          fontSize: '13px', color: '#9e9488',
          fontStyle: 'italic', marginTop: '6px'
        }}>
          {circles.length} active circles
        </p>
      </div>

      {circles.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          border: '1px solid rgba(139,115,85,0.2)',
          borderRadius: '6px', background: '#f5f0e8'
        }}>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: '20px',
            fontWeight: '300', color: '#1a1714', marginBottom: '8px'
          }}>
            No study circles yet
          </div>
          <p style={{
            fontFamily: 'Georgia, serif', fontSize: '13px',
            color: '#9e9488', fontStyle: 'italic'
          }}>
            Your Admin will create study circles soon.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          {circles.map(circle => (
            <div key={circle.id} style={{
              background: '#f5f0e8',
              border: '1px solid rgba(139,115,85,0.2)',
              borderRadius: '6px', padding: '24px'
            }}>
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: '18px',
                fontWeight: '500', color: '#1a1714', marginBottom: '8px'
              }}>
                {circle.name}
              </div>
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: '13px',
                fontStyle: 'italic', color: '#8b7355', marginBottom: '16px'
              }}>
                {circle.topic}
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: '9px',
                letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                color: '#9e9488'
              }}>
                {circle.memberIds.length} members
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}