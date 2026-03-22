import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role
  if (!['ADMIN', 'MENTOR'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { mentorScore, mentorNote, mentorId } = await req.json()

  const journal = await prisma.journal.update({
    where: { id },
    data: {
      mentorScore,
      mentorNote,
      mentorId,
      reviewedAt: new Date(),
    }
  })

  await prisma.notification.create({
    data: {
      userId:     journal.userId,
      type:       'JOURNAL_REVIEWED',
      title:      'Journal Reviewed',
      body:       `Your entry "${journal.title || 'Untitled'}" was reviewed. Score: ${mentorScore}/100`,
      entityType: 'journal',
      entityId:   journal.id,
    }
  })

  return NextResponse.json({ success: true })
}