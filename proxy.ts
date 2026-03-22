import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string
    const path = req.nextUrl.pathname

    // ── ADMIN ONLY ─────────────────────────────────────────
    // Nobody except Admin can visit /admin pages
    if (path.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // ── MENTOR + ADMIN ──────────────────────────────────────
    // Only Mentors and Admins can visit the review queue
    if (path.startsWith('/review-queue')) {
      if (!['ADMIN', 'MENTOR'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // ── ALL OTHER PROTECTED PAGES ───────────────────────────
    // If the user is logged in, let them through
    return NextResponse.next()
  },
  {
    callbacks: {
      // If there's no token at all, redirect to login
      // withAuth handles this automatically
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tasks/:path*',
    '/journal/:path*',
    '/chain/:path*',
    '/circles/:path*',
    '/library/:path*',
    '/admin/:path*',
    '/review-queue/:path*',
  ]
}