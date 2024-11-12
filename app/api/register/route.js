// app/api/register/route.js
import bcrypt from 'bcryptjs'
import mongodbConnect from '@/backend/lib/mongodb'
import User from '@/backend/models/User'
import { NextResponse } from 'next/server'

mongodbConnect()

export async function POST(req) {
  const { username, password, lineUserId } = await req.json()

  if (!username || !password || !lineUserId) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const userExists = await User.findOne({ username })
  if (userExists) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = new User({ username, password: hashedPassword, lineUserId })
  await newUser.save()

  // Notify user of successful registration
  await sendLineMessage(lineUserId, 'Registration successful! You will start receiving grade notifications.')

  return NextResponse.json({ success: true })
}

async function sendLineMessage(lineUserId, message) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: 'text', text: message }]
    }),
  })
  
  if (!response.ok) {
    console.error('Failed to send message:', await response.text())
  }
}
