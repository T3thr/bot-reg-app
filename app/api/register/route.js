// app/api/register/route.js
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req) {
  try {
    await mongodbConnect();
    const { username, password, lineUserId } = await req.json();

    // Check if the user with the provided LINE User ID already exists
    const existingUser = await User.findOne({ lineUserId });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'User already registered.' }),
        { status: 400 }
      );
    }

    // Create a new user in the database
    const newUser = new User({ username, password, lineUserId });
    await newUser.save();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Error registering user.' }),
      { status: 500 }
    );
  }
}
