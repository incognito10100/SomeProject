import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chain = await prisma.knowledgeChain.findFirst({
    where:   { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      links: {
        orderBy: { position: 'asc' },
        include: { user: { select: { name: true } } }
      },
      seededBy: { select: { name: true } }
    }
  })

  return NextResponse.json(chain)
}