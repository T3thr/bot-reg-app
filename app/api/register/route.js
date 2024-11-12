// app/api/register/route.js
import bcrypt from 'bcryptjs'
import mongodbConnect from '@/backend/lib/mongodb'
import User from '@/backend/models/User'
import { NextResponse } from 'next/server'

mongodbConnect()

export async function POST(req) {
  const { username, password, lineToken } = await req.json()

  // Validate input
  if (!username || !password || !lineToken) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  // Check if user already exists
  const userExists = await User.findOne({ username })
  if (userExists) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create a new user
  const newUser = new User({ username, password: hashedPassword, lineToken })
  await newUser.save()

  return NextResponse.json({ success: true })
}
