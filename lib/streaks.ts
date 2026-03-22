import prisma from './prisma'

export async function updateStreak (userId: string, type: 'READING' | 'REFLECTION' | 'TASK' | 'COMBINED') {
  const today     = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type } }
  })

  if (!streak) return

  const last = streak.lastActivityDate
    ? new Date(streak.lastActivityDate)
    : null

  if (last) {
    last.setHours(0, 0, 0, 0)
    // Already active today — don't increment
    if (last.getTime() === today.getTime()) return
  }

  // Continuing from yesterday OR starting fresh
  const continuing = last && last.getTime() === yesterday.getTime()
  const newCount   = continuing ? streak.currentCount + 1 : 1

  await prisma.streak.update({
    where: { userId_type: { userId, type } },
    data: {
      currentCount:     newCount,
      bestCount:        Math.max(newCount, streak.bestCount),
      lastActivityDate: today,
    }
  })

  // Also update COMBINED streak whenever any type is updated
  if (type !== 'COMBINED') {
    await updateStreak(userId, 'COMBINED')
  }
}