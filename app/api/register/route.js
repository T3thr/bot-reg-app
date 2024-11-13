// app/api/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req) {
  try {
    await mongodbConnect();
    const { username, password, lineUserId } = await req.json();

    // Check if the user with the provided LINE User ID already exists
    const existingUser = await User.findOne({ lineUserId });
    if (existingUser) {
      // Return a 400 Bad Request error if user already exists
      return NextResponse.json({ error: 'User already registered.' }, { status: 400 });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database with the hashed password
    const newUser = new User({ username, password: hashedPassword, lineUserId });
    await newUser.save();

    // Return success response with status 201 Created
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    // Return a 500 Internal Server Error if something goes wrong
    return NextResponse.json({ error: 'Error registering user.' }, { status: 500 });
  }
}
