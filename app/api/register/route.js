import { NextResponse } from 'next/server';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req) {
  try {
    await mongodbConnect();
    const { username, password, lineUserId } = await req.json();

    const existingUser = await User.findOne({ lineUserId });
    if (existingUser) {
      return NextResponse.json({ error: 'User already registered.' }, { status: 400 });
    }

    const newUser = new User({ username, password, lineUserId });
    await newUser.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error registering user.' }, { status: 500 });
  }
}
