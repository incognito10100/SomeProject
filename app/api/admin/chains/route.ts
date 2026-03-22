import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role
  if (!['ADMIN', 'MENTOR'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, seedPrompt, windowHours } = await req.json()

  const deadline = new Date()
  deadline.setHours(deadline.getHours() + parseInt(windowHours))

  const chain = await prisma.knowledgeChain.create({
    data: {
      title,
      seedPrompt,
      windowHours:  parseInt(windowHours),
      nextDeadline: deadline,
      seededById:   (session.user as any).id,
      status:       'ACTIVE'
    }
  })

  const allMembers = await prisma.user.findMany({
    where:  { role: 'MEMBER' },
    select: { id: true }
  })

  if (allMembers.length > 0) {
    await prisma.notification.createMany({
      data: allMembers.map(m => ({
        userId:     m.id,
        type:       'NEW_CHAIN',
        title:      'New Knowledge Chain Started',
        body:       `A new chain has been seeded: "${title}"`,
        entityType: 'chain',
        entityId:   chain.id
      }))
    })
  }

  return NextResponse.json({ success: true, chain })
}