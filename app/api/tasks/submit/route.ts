import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updateStreak } from '@/lib/streaks'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const { taskId, content } = await req.json()

  if (!taskId || !content?.trim()) {
    return NextResponse.json({ error: 'Missing taskId or content' }, { status: 400 })
  }

  // Find the task
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  })

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Check word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  if (task.minWordCount && wordCount < task.minWordCount) {
    return NextResponse.json(
      { error: `Minimum ${task.minWordCount} words required. You have ${wordCount}.` },
      { status: 400 }
    )
  }

  // Check not already submitted
  const existing = await prisma.taskSubmission.findFirst({
    where: { taskId, userId }
  })

  if (existing) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
  }

  // Check if late
  const isLate = new Date() > new Date(task.dueAt)

  // Calculate points
  const now         = new Date()
  const hoursToDeadline = (new Date(task.dueAt).getTime() - now.getTime()) / (1000 * 60 * 60)
  const isEarly     = hoursToDeadline > 24
  const points      = isLate ? 20 : isEarly ? task.pointsValue + 20 : task.pointsValue

  // Create submission
  const submission = await prisma.taskSubmission.create({
    data: {
      taskId,
      userId,
      content,
      wordCount,
      isLate,
      submittedAt: new Date(),
    }
  })

  // Add points
  await prisma.user.update({
    where: { id: userId },
    data:  { totalPoints: { increment: points } }
  })

  // Update streaks
  await updateStreak(userId, 'TASK')
  if (task.type === 'READING')    await updateStreak(userId, 'READING')
  if (task.type === 'REFLECTION') await updateStreak(userId, 'REFLECTION')

  return NextResponse.json({ success: true, submission, pointsAwarded: points })
}