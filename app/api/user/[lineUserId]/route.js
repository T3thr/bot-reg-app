// pages/api/user/[lineUserId].js
import User from '@/backend/models/User'; // Import User model
import mongodbConnect from '@/backend/lib/mongodb'; // Import the mongodb connection function

// Connect to MongoDB before processing the request
export default async function handler(req, res) {
  const { lineUserId } = req.query;

  if (!lineUserId) {
    return res.status(400).json({ error: 'lineUserId is required' });
  }

  try {
    // Connect to the database
    await mongodbConnect();

    // Fetch the user by lineUserId
    const user = await User.findOne({ lineUserId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data as a response
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the user data' });
  }
}
