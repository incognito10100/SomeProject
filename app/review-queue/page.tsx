import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ReviewClient from '@/components/ReviewClient'

export default async function ReviewQueuePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const role = (session.user as any).role
  if (!['ADMIN', 'MENTOR'].includes(role)) redirect('/dashboard')

  const mentorId = (session.user as any).id

  // Pending journal reviews
  const pendingJournals = await prisma.journal.findMany({
    where:   { isForReview: true, reviewedAt: null },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { name: true, email: true } } }
  })

  // Pending task submission reviews
  const pendingSubmissions = await prisma.taskSubmission.findMany({
    where:   { mentorScore: null, task: { assignedTo: { isEmpty: false } } },
    orderBy: { submittedAt: 'asc' },
    include: {
      user: { select: { name: true, email: true } },
      task: { select: { title: true, type: true, pointsValue: true, minWordCount: true } }
    }
  })

  // Recently reviewed journals
  const reviewedJournals = await prisma.journal.findMany({
    where:   { isForReview: true, reviewedAt: { not: null } },
    orderBy: { reviewedAt: 'desc' },
    take:    10,
    include: { user: { select: { name: true } } }
  })

  return (
    <div style={{ padding: '40px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '28px',
          fontWeight: '300', color: '#1a1714', margin: 0
        }}>
          Review Queue
        </h1>
        <p style={{
          fontSize: '13px', color: '#9e9488',
          fontStyle: 'italic', marginTop: '6px'
        }}>
          {pendingJournals.length} journals · {pendingSubmissions.length} task submissions awaiting review
        </p>
      </div>

      <ReviewClient
        pendingJournals={pendingJournals}
        pendingSubmissions={pendingSubmissions}
        reviewedJournals={reviewedJournals}
        mentorId={mentorId}
      />
    </div>
  )
}