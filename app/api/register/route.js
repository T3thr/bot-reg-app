// app/api/register/route.js
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req, res) {
  try {
    await mongodbConnect();
    const { username, password, lineUserId } = await req.json();

    const existingUser = await User.findOne({ lineUserId });
    if (existingUser) {
      res.status(400).json({ error: 'User already registered.' });
      return;
    }

    const newUser = new User({ username, password, lineUserId });
    await newUser.save();

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user.' });
  }
}
