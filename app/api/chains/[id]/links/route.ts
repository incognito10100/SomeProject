import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updateStreak } from '@/lib/streaks'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId  = (session.user as any).id
  const { content } = await req.json()

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  if (wordCount < 80) {
    return NextResponse.json({ error: 'Minimum 80 words required' }, { status: 400 })
  }

  const chain = await prisma.knowledgeChain.findUnique({ where: { id } })

  if (!chain || chain.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Chain is not active' }, { status: 400 })
  }

  const alreadyPosted = await prisma.chainLink.findFirst({
    where: { chainId: id, userId }
  })

  if (alreadyPosted) {
    return NextResponse.json({ error: 'You have already posted a link in this chain' }, { status: 400 })
  }

  const link = await prisma.chainLink.create({
    data: {
      chainId:  id,
      userId,
      content,
      position: chain.linkCount + 1
    }
  })

  await prisma.knowledgeChain.update({
    where: { id },
    data: {
      linkCount:    { increment: 1 },
      nextDeadline: new Date(Date.now() + chain.windowHours * 60 * 60 * 1000)
    }
  })

  await prisma.user.update({
    where: { id: userId },
    data:  { totalPoints: { increment: 40 } }
  })

  await updateStreak(userId, 'READING')

  return NextResponse.json({ success: true, link })
}