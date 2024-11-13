import { NextResponse } from 'next/server';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req) {
  await mongodbConnect();

  try {
    const { username, password, lineUserId } = await req.json();

    // Check if the user with the provided LINE User ID already exists
    const existingUser = await User.findOne({ lineUserId });
    if (existingUser) {
      return NextResponse.json({ error: 'User already registered.' }, { status: 409 });
    }

    // Create a new user in the database
    const newUser = new User({ username, password, lineUserId });
    await newUser.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error registering user.' }, { status: 500 });
  }
}
