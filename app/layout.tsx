import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Intellectus',
  description: "Scholar's Platform",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Get combined streak for sidebar display
  let combinedStreak = 0

  if (session) {
    try {
      const { default: prisma } = await import('@/lib/prisma')

      const streak = await prisma.streak.findFirst({
        where: {
          userId: (session.user as any).id,
          type: 'COMBINED',
        },
      })

      combinedStreak = streak?.currentCount ?? 0
    } catch {
      combinedStreak = 0
    }
  }

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'Georgia, serif',
          background: '#faf7f2',
          minHeight: '100vh',
        }}
      >
        <SessionProvider session={session}>
          {session ? (
            <div
              style={{
                display: 'flex',
                minHeight: '100vh',
              }}
            >
              <Sidebar
                user={{
                  name: session.user?.name ?? '',
                  role: (session.user as any).role,
                }}
                streakCount={combinedStreak}
              />

              <main
                style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: 'clamp(16px, 4vw, 40px)',
                  maxWidth: '100%',
                }}
              >
                {children}
              </main>
            </div>
          ) : (
            <main
              style={{
                minHeight: '100vh',
                background: '#faf7f2',
              }}
            >
              {children}
            </main>
          )}
        </SessionProvider>
      </body>
    </html>
  )
}