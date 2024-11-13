// api/auth/signup/route.js

import User from "@/backend/models/User";
import mongodbConnect from "@/backend/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  await mongodbConnect();

  try {
    const { username, password, lineUserId } = await req.json();

    // Check if user already exists by username or lineUserId
    const existingUser = await User.findOne({ $or: [{ username }, { lineUserId }] });

    if (existingUser) {
      const message = existingUser.username === username 
        ? "Username already taken"
        : "UserID already registered";
      return NextResponse.json({ message }, { status: 400 });
    }

    // Create a new user and hash the password in User schema pre-save hook
    const user = await User.create({ username, password, lineUserId });
    return NextResponse.json(
      {
        user: {
          id: user._id,
          username: user.username,
          password: user.password,
          role: 'user',
          lineUserId: user.lineUserId
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}
