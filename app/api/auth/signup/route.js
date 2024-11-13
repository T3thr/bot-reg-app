// api/auth/signup/route.js

import User from "@/backend/models/User";
import mongodbConnect from "@/backend/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  await mongodbConnect();

  const { name,username , email, password } = await req.json();

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  const existingUsername = await User.findOne({ username });
  
  if (existingUser) {
    return NextResponse.json(
      { message: "Email already registered" },
      { status: 400 }
    );
  }

  if (existingUsername) {
    return NextResponse.json(
      { message: "Username already taken" },
      { status: 400 }
    );
  }

  try {
    // Create new user (password will be hashed by the model's pre-save hook)
    const user = await User.create({ name, username, email, password });
    

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        role: 'user',
      },
    }, { status: 201 });
    

  } catch (error) {
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}
