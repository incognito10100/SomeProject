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

  const { userId, role } = await req.json()

  if (!userId || !role) {
    return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data:  { role }
  })

  return NextResponse.json({ success: true, role: updated.role })
}