import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Assuming you are using MongoDB for storing user data
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'yourDatabaseName'; // Replace with your database name
const collectionName = 'users'; // Assuming the user collection is named 'users'

export async function GET(request) {
  // Get the `lineUserId` from the URL query string
  const { searchParams } = new URL(request.url);
  const lineUserId = searchParams.get('lineUserId');

  if (!lineUserId) {
    return NextResponse.json({ error: 'LINE User ID is required.' }, { status: 400 });
  }

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection(collectionName);

    // Fetch the user's credentials (e.g., username, password, etc.) based on `lineUserId`
    const user = await usersCollection.findOne({ lineUserId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Assuming you have a function to scrape grades or retrieve grades from an external source
    const grades = await fetchGradesFromExternalSource(user.username, user.password);

    // Return grades to the frontend
    return NextResponse.json({ success: true, grades });

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades.' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Assuming this function fetches grade data from an external source
async function fetchGradesFromExternalSource(username, password) {
  // Implement the logic to scrape or fetch grades using the username and password
  // You can use libraries like puppeteer, axios, or a similar approach to scrape grade data
  // Here's a simple mock example:

  // Mocked response for demo purposes
  return [
    { subject: 'Math', grade: 'A' },
    { subject: 'Science', grade: 'B+' },
    { subject: 'History', grade: 'A-' },
  ];
}
