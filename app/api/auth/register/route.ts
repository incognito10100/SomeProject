import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, inviteCode } = await req.json()

    // Validate all fields present
    if (!name || !email || !password || !inviteCode) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check invite code
    if (inviteCode !== process.env.INVITE_CODE) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      )
    }

    // Check email not already taken
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name:     name.trim(),
        email:    email.toLowerCase().trim(),
        password: hashed,
        role:     'MEMBER',
      }
    })

    // Create 4 streak records
    await prisma.streak.createMany({
      data: [
        { userId: user.id, type: 'READING'    },
        { userId: user.id, type: 'REFLECTION' },
        { userId: user.id, type: 'TASK'       },
        { userId: user.id, type: 'COMBINED'   },
      ]
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}