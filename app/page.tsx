import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // If already logged in, go straight to dashboard
  if (session) {
    redirect('/dashboard')
  }

  // If not logged in, go to login page
  redirect('/login')
}