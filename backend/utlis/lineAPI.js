// utils/lineAPI.js
import fetch from 'node-fetch';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function sendLineMessage(userId, message) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const headers = {
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    to: userId,
    messages: [{ type: 'text', text: message }],
  });

  try {
    const response = await fetch(url, { method: 'POST', headers, body });
    if (!response.ok) throw new Error(`Failed to send message: ${response.status} - ${response.statusText}`);
  } catch (error) {
    console.error('Error sending LINE message:', error);
  }
}
