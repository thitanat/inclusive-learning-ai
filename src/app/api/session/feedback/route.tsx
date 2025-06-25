import { NextRequest, NextResponse } from "next/server";
import { updateSessionById } from "@/models/session";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Use your actual secret

export async function POST(req: NextRequest) {
 await connectDB();
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    console.error("No token provided");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch {
    console.error("Invalid token:", token);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
 
  const { sessionId, feedbackField, feedback } = await req.json();
  if (!sessionId || !feedbackField) {
    return NextResponse.json({ error: "Missing sessionId or feedbackField" }, { status: 400 });
  }
  try {
    await updateSessionById(sessionId, { [feedbackField]: feedback });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}