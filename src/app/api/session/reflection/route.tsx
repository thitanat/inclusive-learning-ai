import { NextRequest, NextResponse } from "next/server";
import { updateSessionById } from "@/models/session";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { sessionId, reflection } = body;
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let userId;
    try {
      console.log("Verifying token:", token);
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch {
      console.error("Invalid token:", token);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    await updateSessionById(sessionId, { reflection });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update reflection" },
      { status: 500 }
    );
  }
}
