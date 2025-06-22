import { NextRequest, NextResponse } from "next/server";
import { updateSessionById } from "@/models/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, reflection } = body;
    if (!sessionId || !reflection) {
      return NextResponse.json({ error: "Missing sessionId or reflection" }, { status: 400 });
    }
    await updateSessionById(sessionId, { reflection });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update reflection" }, { status: 500 });
  }
}