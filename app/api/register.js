import { NextResponse } from 'next/server';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req) {
  await mongodbConnect();
  try {
    const { username, password, lineUserId } = await req.json();
    const existingUser = await User.findOne({ lineUserId });

    if (existingUser) {
      return NextResponse.json({ error: 'User already registered.' }, { status: 400 });
    }

    const newUser = new User({ username, password, lineUserId });
    await newUser.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Error registering user.' }, { status: 500 });
  }
}
