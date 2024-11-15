import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'User is not authenticated' });
  }

  const { lineUserId } = session.user; // Get the LINE User ID from session

  try {
    // Replace with actual logic to fetch grades based on `lineUserId`
    const grades = await fetchGradesFromDatabase(lineUserId);

    return res.status(200).json({ success: true, grades });
  } catch (err) {
    console.error('Error fetching grades:', err);
    return res.status(500).json({ error: 'Failed to fetch grades' });
  }
}

async function fetchGradesFromDatabase(lineUserId) {
  // Simulate fetching grades from your database or external API
  return [
    { course: 'Math 101', grade: 'A+' },
    { course: 'History 202', grade: 'B' },
  ];
}
