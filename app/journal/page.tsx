import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import JournalEditor from '@/components/JournalEditor'

export default async function JournalPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = (session.user as any).id

  // Fetch all journal entries for this user
  const entries = await prisma.journal.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ padding: '40px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '28px',
          fontWeight: '300',
          color: '#1a1714'
        }}>
          Reflection Journal
        </h1>
        <p style={{ fontSize: '13px', color: '#9e9488', fontStyle: 'italic', marginTop: '4px' }}>
          {entries.length} entries · private to you unless submitted for review
        </p>
      </div>

      <JournalEditor entries={entries} userId={userId} />
    </div>
  )
}