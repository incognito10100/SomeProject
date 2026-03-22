import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import AdminClient from '@/components/AdminClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const role = (session.user as any).role
  if (role !== 'ADMIN') redirect('/dashboard')

  const [users, tasks, chains, stats] = await Promise.all([

    prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, name: true, email: true,
        role: true, totalPoints: true, createdAt: true,
        _count: {
          select: { submissions: true, journals: true }
        }
      }
    }),

    prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { submissions: true } }
      }
    }),

    prisma.knowledgeChain.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { _count: { select: { links: true } } }
    }),

    Promise.all([
      prisma.user.count(),
      prisma.taskSubmission.count(),
      prisma.journal.count(),
      prisma.chainLink.count(),
    ]).then(([users, submissions, journals, chainLinks]) => ({
      users, submissions, journals, chainLinks
    }))

  ])

  return (
    <div style={{ padding: '40px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '28px',
          fontWeight: '300',
          color: '#1a1714'
        }}>
          Admin Panel
        </h1>
        <p style={{
          fontSize: '13px', color: '#9e9488',
          fontStyle: 'italic', marginTop: '4px'
        }}>
          Full control over the platform
        </p>
      </div>

      <AdminClient
        users={users}
        tasks={tasks}
        chains={chains}
        stats={stats}
      />
    </div>
  )
}