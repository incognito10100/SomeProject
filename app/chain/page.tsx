import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ChainView from '@/components/ChainView'
import QuickSeedChain from '@/components/QuickSeedChain'   // ← add this

export default async function ChainPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = (session.user as any).id
  const role   = (session.user as any).role        // ← add this

  const chain = await prisma.knowledgeChain.findFirst({
    where:   { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      links: {
        orderBy: { position: 'asc' },
        include: { user: { select: { name: true } } }
      },
      seededBy: { select: { name: true } }
    }
  })

  const pastChains = await prisma.knowledgeChain.findMany({
    where:   { status: { in: ['BROKEN', 'COMPLETED'] } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { _count: { select: { links: true } } }
  })

  return (
    <div style={{ padding: '40px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '28px',
          fontWeight: '300', color: '#1a1714', margin: 0
        }}>
          Knowledge Chain
        </h1>
        <p style={{
          fontSize: '13px', color: '#9e9488',
          fontStyle: 'italic', marginTop: '6px'
        }}>
          Each link builds on the last · minimum 80 words per entry
        </p>
      </div>

      {/* Seed button — only visible to ADMIN and MENTOR */}
      <QuickSeedChain userRole={role} />

      <ChainView chain={chain} pastChains={pastChains} userId={userId} />
    </div>
  )
}