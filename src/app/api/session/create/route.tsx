import { NextResponse } from "next/server";
import { createSession } from "@/models/session";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function POST(req: Request) {
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

  const body = await req.json();
  // Accept configStep from body, default to 0
  const configStep = body.configStep ?? 0;

  const result = await createSession({
    userId,
    configStep,
    createdAt: new Date(),
  });

  return NextResponse.json({ 
    insertedId: result.insertedId?.toString(),
    configStep: 0 });
}