import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          return null
        }

        // Return plain object — no functions, no methods
        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          role:  user.role,   // ← plain string value e.g. "ADMIN"
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      // 'user' only exists on the very first sign-in
      if (user) {
        token.id   = user.id
        token.role = (user as any).role  // store role as string in token
      }
      return token
    },

    async session({ session, token }) {
      // Copy from token into session — token.role is a STRING here
      if (session.user) {
        (session.user as any).id   = token.id   as string
        (session.user as any).role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
}