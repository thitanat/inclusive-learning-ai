import { NextResponse } from "next/server";
import { getSession } from "@/models/session";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function GET(req: Request) {
  console.log("GET request received");
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

  const session = await getSession(userId);
  if (!session) {
    return NextResponse.json({ currentStep: 0, lessonPlan: null }, { status: 200 });
  }

  let configResponse = {};

  switch (session.configStep) {
    case 1:
      configResponse = {
        "มาตรฐาน": session.standard || {},
        "ตัวชี้วัดระหว่างทาง": session.interimIndicators || {},
        "ตัวชีวัดปลายทาง": session.finalIndicators || {},
        "เนื้อหา": session.content || {},
      };
      break;
    case 2:
      configResponse = {
        "วัตถุประสงค์": session.objectives || {},
        "สมรรถนะผู้เรียน": session.keyCompetencies || {},
        "สาระการเรียนรู้": session.learningContent|| {},
      };
      break;
    default:
      configResponse = {};
  }

  return NextResponse.json({
    configStep: session.configStep || 0,
    configResponse: configResponse || {},
    generateStep: session.generateStep || 0,
    lessonPlan: session.lessonPlan || null,
    conversationHistory: session.conversation || [],
  });
}