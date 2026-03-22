import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId  = (session.user as any).id
  const yearAgo = new Date()
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  // Fetch all activity in the past year
  const [submissions, journals, chainLinks] = await Promise.all([
    prisma.taskSubmission.findMany({
      where:  { userId, submittedAt: { gte: yearAgo } },
      select: { submittedAt: true }
    }),
    prisma.journal.findMany({
      where:  { userId, createdAt: { gte: yearAgo } },
      select: { createdAt: true }
    }),
    prisma.chainLink.findMany({
      where:  { userId, createdAt: { gte: yearAgo } },
      select: { createdAt: true }
    }),
  ])

  // Count actions per day
  const counts: Record<string, number> = {}

  const add = (date: Date) => {
    const key = date.toISOString().split('T')[0]
    counts[key] = (counts[key] ?? 0) + 1
  }

  submissions.forEach(s => add(s.submittedAt))
  journals.forEach(j   => add(j.createdAt))
  chainLinks.forEach(c => add(c.createdAt))

  const result = Object.entries(counts).map(([date, count]) => ({ date, count }))

  return NextResponse.json(result)
}