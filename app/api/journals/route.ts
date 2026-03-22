import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updateStreak } from '@/lib/streaks'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const journals = await prisma.journal.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(journals)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { title, content, mood } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const journal = await prisma.journal.create({
    data: {
      userId,
      title:    title || '',
      content,
      mood:     mood || null,
      wordCount,
    }
  })

  await updateStreak(userId, 'REFLECTION')

  return NextResponse.json({ success: true, journal })
}