import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

mongodbConnect();

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const userExists = await User.findOne({ username });
    if (userExists) return NextResponse.json({ success: false, message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, password: hashedPassword }).save();

    return NextResponse.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, message: 'Registration failed' });
  }
}
