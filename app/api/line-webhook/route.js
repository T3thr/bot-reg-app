// app/api/line-webhook/route.js
import { NextResponse } from 'next/server';
import { sendLineNotification } from '@/utils/lineNotification';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req) {
  const { events } = await req.json();

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text' && event.message.text === 'check grade') {
      const lineUserId = event.source.userId;

      await mongodbConnect();
      const user = await User.findOne({ lineUserId });
      if (!user) {
        await sendLineNotification(lineUserId, 'You must register on our website first.');
        continue;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/checkgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
          lineUserId
        })
      });

      const data = await response.json();
      if (data.success) {
        await sendLineNotification(lineUserId, 'Grade check complete. You can view your latest grades.');
      } else {
        await sendLineNotification(lineUserId, 'There was an error checking your grades.');
      }
    }
  }

  return NextResponse.json({ status: 'ok' });
}
