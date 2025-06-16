import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/models/session";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/db";

export async function POST(request: NextRequest, { params }) {
    await connectDB();
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
    const token = request.headers.get("Authorization")?.split(" ")[1];
    console.log("Received token:", token);
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }
  try {
   

    // Decrypt user id from token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded?.userId || decoded?.id || decoded?.sub;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in token" }, { status: 400 });
    }

    // Remove all sessions for this user
    await deleteSession(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}