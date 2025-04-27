import { connectDB } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const db = await connectDB();
  const existingUser = await db.collection("users").findOne({ email });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection("users").insertOne({ email, password: hashedPassword });

  return NextResponse.json({ message: "User registered successfully." });
}