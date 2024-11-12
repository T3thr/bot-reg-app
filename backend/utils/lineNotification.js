// utils/lineNotification.js
import fetch from 'node-fetch';

export async function sendLineNotification(lineUserId, message, grades) {
  const lineMessage = grades ? `${message}\n${JSON.stringify(grades)}` : message;
  const data = {
    to: lineUserId,
    messages: [{ type: 'text', text: lineMessage }]
  };

  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}
