import { NextResponse } from "next/server";
import { getSessionsByUserId } from "@/models/session";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function GET(req: NextRequest) {
  await connectDB();
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  console.log("Fetching all sessions for user:", userId);
  const allSessions = await getSessionsByUserId(userId);
  return NextResponse.json(allSessions);
}