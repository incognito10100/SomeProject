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

  const { title, author, category, type, externalUrl } = await req.json()

  const item = await prisma.libraryItem.create({
    data: {
      title, author, category, type,
      externalUrl,
      addedById: (session.user as any).id
    }
  })

  return NextResponse.json({ success: true, item })
}