import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const now = new Date()

  const expired = await prisma.knowledgeChain.findMany({
    where: {
      status:      'ACTIVE',
      nextDeadline: { lt: now }
    }
  })

  for (const chain of expired) {
    await prisma.knowledgeChain.update({
      where: { id: chain.id },
      data:  { status: 'BROKEN' }
    })

    const members = await prisma.user.findMany({
      where:  { role: 'MEMBER' },
      select: { id: true }
    })

    if (members.length > 0) {
      await prisma.notification.createMany({
        data: members.map(m => ({
          userId:     m.id,
          type:       'CHAIN_BROKEN',
          title:      'Knowledge Chain Broken',
          body:       `The chain "${chain.title}" broke — nobody contributed in time.`,
          entityType: 'chain',
          entityId:   chain.id
        }))
      })
    }
  }

  return NextResponse.json({
    checked: expired.length,
    broken:  expired.length
  })
}