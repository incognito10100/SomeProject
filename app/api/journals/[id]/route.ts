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

  const { id }  = await params
  const userId  = (session.user as any).id

  const existing = await prisma.journal.findUnique({ where: { id } })

  if (!existing) {
    return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  if (existing.isForReview && !body.isForReview) {
    return NextResponse.json({ error: 'Entry is locked for review' }, { status: 400 })
  }

  const wordCount = body.content
    ? body.content.trim().split(/\s+/).filter(Boolean).length
    : existing.wordCount

  const updated = await prisma.journal.update({
    where: { id },
    data: {
      title:       body.title       ?? existing.title,
      content:     body.content     ?? existing.content,
      mood:        body.mood        ?? existing.mood,
      wordCount,
      isForReview: body.isForReview ?? existing.isForReview,
    }
  })

  return NextResponse.json({ success: true, journal: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id }  = await params
  const userId  = (session.user as any).id

  const existing = await prisma.journal.findUnique({ where: { id } })

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (existing.isForReview) {
    return NextResponse.json({ error: 'Cannot delete entry submitted for review' }, { status: 400 })
  }

  await prisma.journal.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
