import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

// Both GET and POST requests go to the same handler
export { handler as GET, handler as POST }