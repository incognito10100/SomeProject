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
  const { mentorScore, mentorFeedback } = await req.json()

  const submission = await prisma.taskSubmission.update({
    where: { id },
    data: {
      mentorScore,
      mentorFeedback,
      reviewedAt: new Date(),
    }
  })

  const task = await prisma.task.findUnique({
    where:  { id: submission.taskId },
    select: { title: true }
  })

  await prisma.notification.create({
    data: {
      userId:     submission.userId,
      type:       'TASK_REVIEWED',
      title:      'Task Submission Reviewed',
      body:       `Your submission for "${task?.title}" was reviewed. Score: ${mentorScore}/100`,
      entityType: 'task',
      entityId:   submission.taskId,
    }
  })

  return NextResponse.json({ success: true })
}