// app/api/checkGrade/route.js
import { exec } from 'child_process'
import mongodbConnect from '@/backend/lib/mongodb'
import User from '@/backend/models/User'
import { NextResponse } from 'next/server'

mongodbConnect()

export async function POST(req) {
  const { username } = await req.json()

  // Fetch user details from the database
  const user = await User.findOne({ username })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }

  const { password, lineToken } = user

  // Call the Python script with the necessary arguments
  exec(`python3 /path/to/your/python/script.py ${username} ${password} ${lineToken}`, (error, stdout, stderr) => {
    if (error) {
      return NextResponse.json({ error: `Error: ${stderr}` }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: stdout })
  })
}
