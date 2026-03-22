import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const results: Record<string, any> = {}

  // ── Job 1: Break expired chains ─────────────────────────
  try {
    const now     = new Date()
    const expired = await prisma.knowledgeChain.findMany({
      where: { status: 'ACTIVE', nextDeadline: { lt: now } }
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
            entityId:   chain.id,
          }))
        })
      }
    }

    results.chains = { broken: expired.length }
  } catch (e: any) {
    results.chains = { error: e.message }
  }

  // ── Job 2: Reset missed streaks ──────────────────────────
  try {
    const today     = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const broken = await prisma.streak.findMany({
      where: {
        currentCount:     { gt: 0 },
        lastActivityDate: { lt: yesterday }
      }
    })

    let reset = 0
    let frozen = 0

    for (const streak of broken) {
      if (streak.freezeTokens > 0) {
        await prisma.streak.update({
          where: { id: streak.id },
          data:  { freezeTokens: { decrement: 1 } }
        })
        frozen++
      } else {
        await prisma.streak.update({
          where: { id: streak.id },
          data:  { currentCount: 0 }
        })
        reset++
      }
    }

    results.streaks = { reset, frozen }
  } catch (e: any) {
    results.streaks = { error: e.message }
  }

  // ── Job 3: Award streak bonuses ──────────────────────────
  try {
    const milestones = [
      { days: 7,  bonus: 100 },
      { days: 30, bonus: 500 },
    ]

    let bonusesAwarded = 0

    for (const { days, bonus } of milestones) {
      const qualifying = await prisma.streak.findMany({
        where: {
          type:         'COMBINED',
          currentCount: days,
        }
      })

      for (const streak of qualifying) {
        await prisma.user.update({
          where: { id: streak.userId },
          data:  { totalPoints: { increment: bonus } }
        })

        await prisma.notification.create({
          data: {
            userId: streak.userId,
            type:   'STREAK_BONUS',
            title:  `${days}-Day Streak Bonus!`,
            body:   `You earned ${bonus} bonus points for a ${days}-day streak!`,
          }
        })

        bonusesAwarded++
      }
    }

    results.bonuses = { awarded: bonusesAwarded }
  } catch (e: any) {
    results.bonuses = { error: e.message }
  }

  console.log('Scheduler ran:', results)
  return NextResponse.json({ success: true, results, ran: new Date().toISOString() })
}