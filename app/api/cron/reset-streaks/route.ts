import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const today     = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Find streaks where last activity was before yesterday
  // meaning they missed a day
  const broken = await prisma.streak.findMany({
    where: {
      currentCount:    { gt: 0 },
      lastActivityDate: { lt: yesterday }
    }
  })

  for (const streak of broken) {
    // Check if they have a freeze token
    if (streak.freezeTokens > 0) {
      await prisma.streak.update({
        where: { id: streak.id },
        data:  { freezeTokens: { decrement: 1 } }
      })
    } else {
      await prisma.streak.update({
        where: { id: streak.id },
        data:  { currentCount: 0 }
      })
    }
  }

  return NextResponse.json({ reset: broken.length })
}