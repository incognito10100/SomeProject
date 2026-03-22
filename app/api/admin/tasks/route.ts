import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, description, type, dueAt, pointsValue, minWordCount, assignedTo } = await req.json()

  const task = await prisma.task.create({
    data: {
      title,
      description,
      type,
      dueAt:        new Date(dueAt),
      pointsValue:  parseInt(pointsValue),
      minWordCount: minWordCount ? parseInt(minWordCount) : null,
      assignedTo,
      createdById:  (session.user as any).id
    }
  })

  if (assignedTo.length > 0) {
    await prisma.notification.createMany({
      data: assignedTo.map((userId: string) => ({
        userId,
        type:       'NEW_TASK',
        title:      'New Task Assigned',
        body:       `"${title}" has been assigned to you.`,
        entityType: 'task',
        entityId:   task.id
      }))
    })
  }

  return NextResponse.json({ success: true, task })
}