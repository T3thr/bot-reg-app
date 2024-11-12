// app/api/checkGrade/route.js
import bcrypt from 'bcryptjs'
import mongodbConnect from '@/backend/lib/mongodb'
import User from '@/backend/models/User'
import { NextResponse } from 'next/server'

export async function POST(req) {
    await mongodbConnect();

    try {
        const users = await User.find();

        await Promise.all(users.map(async (user) => {
            // Hash the password before sending it to the Heroku bot
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            await fetch("https://your-heroku-app.herokuapp.com/check-grades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user.username,
                    password: hashedPassword,
                    lineToken: user.lineToken,
                }),
            });
        }));

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
