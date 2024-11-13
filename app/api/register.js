import { NextResponse } from 'next/server';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req, res) {
    await mongodbConnect();
    try {
      const { username, password, lineUserId } = await req.json();
      const existingUser = await User.findOne({ lineUserId });
  
      if (existingUser) {
        return new Response(JSON.stringify({ error: 'User already registered.' }), { status: 400 });
      }
  
      const newUser = new User({ username, password, lineUserId });
      await newUser.save();
  
      return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (error) {
      console.error('Error registering user:', error);
      return new Response(JSON.stringify({ error: 'Error registering user.' }), { status: 500 });
    }
  }
  
  export const config = {
    runtime: 'experimental-edge', // Adjust if necessary based on your Vercel configuration
  };
  