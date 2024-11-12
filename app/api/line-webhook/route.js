// app/api/line-webhook/route.js
import { NextResponse } from 'next/server'

export async function POST(req) {
  const body = await req.json()

  // Extract user information and command from the LINE webhook payload
  const events = body.events
  const userId = events[0].source.userId
  const message = events[0].message.text

  // Check if the message is a "check grades" command
  if (message.toLowerCase().includes('check grades')) {
    // Trigger grade scraping (adapted from Python logic)
    const grades = await scrapeGrades(userId)
    
    // Send grade results back to the user
    await sendLineMessage(userId, `Here are your grades:\n${grades}`)

    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ success: false, message: 'No valid command received' })
  }
}

async function scrapeGrades(userId) {
  // This would call your existing scraping function (adapted for Node.js)
  // For now, let's simulate a response for the user
  const grades = "Semester 1: A, B, C, D"
  return grades
}

async function sendLineMessage(userId, message) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text: message }]
    }),
  })

  if (!response.ok) {
    console.error('Failed to send message:', await response.text())
  }
}
