import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {

  // Get the data sent from the registration form
  const { email, name, password, inviteCode } = await req.json()

  // Basic validation — check required fields exist
  if (!email || !name || !password) {
    return NextResponse.json(
      { error: 'Email, name and password are required' },
      { status: 400 }
    )
  }

  // Check the invite code matches your secret
  // This stops random people from registering
  if (inviteCode !== process.env.INVITE_CODE) {
    return NextResponse.json(
      { error: 'Invalid invite code' },
      { status: 403 }
    )
  }

  // Check if this email is already registered
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return NextResponse.json(
      { error: 'An account with this email already exists' },
      { status: 409 }
    )
  }

  // Hash the password — never store plain text
  // The 12 is the "salt rounds" — higher = more secure but slower
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'MEMBER', // everyone starts as a member
    }
  })

  // Create initial streak records for this user
  // Every member starts with all 4 streak types at zero
  await prisma.streak.createMany({
    data: [
      { userId: user.id, type: 'READING'    },
      { userId: user.id, type: 'REFLECTION' },
      { userId: user.id, type: 'TASK'       },
      { userId: user.id, type: 'COMBINED'   },
    ]
  })

  // Return success — don't return the password hash
  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name }
  })
}