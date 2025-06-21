import { OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";
import { getSession, createSession, updateSession } from "@/models/session";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/db";
import { z } from "zod";
import { getRetrieverFrom } from "@/lib/retriever";
import { generateLLM } from "@/lib/llm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const questions: { [key: number]: string } = {
  1: "1.คุณคิดว่าแผนการสอนนี้สามารถนำไปปฏิบัติได้จริงหรือไม่? มีข้อจำกัดอะไรบ้าง?",
  2: "2.คุณคาดการณ์ว่าผลลัพธ์การเรียนรู้จะเป็นอย่างไร?",
  3: "3.แผนการสอนนี้สอดคล้องกับวัตถุประสงค์หรือไม่? (โปรดระบุประเด็นสำคัญ)",
  4: "4.คุณคิดว่าโครงสร้างของแผนการสอนนี้สมเหตุสมผลหรือไม่?",
  5: "5.จุดอ่อนของแผนการสอนนี้คืออะไร?",
};

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

  const requestBody = await req.json();
  const {
    lessonTopic,
    subject,
    level,
    ageRange,
    studentType,
    learningTime,
    timeSlot,
    limitation,
    userMessage,
  } = requestBody;

  const conversation = [];

  let session = await getSession(userId); // Use userId to fetch session

  if (!session) {
    // Step 0: Validate all required fields for creating a new session
    if (
      !lessonTopic ||
      !subject ||
      !level ||
      !ageRange ||
      !studentType ||
      !learningTime ||
      !timeSlot ||
      !limitation
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
  }

  try {
    // Step 0: Generate Lesson Plan
    if (!session) {
      const task = `ออกแบบหลักสูตรการเรียนรู้ในลักษณะห้องเรียนรวม (Inclusive Classroom) สำหรับระดับการศึกษา ${level} โดยมีช่วงอายุของผู้เรียนประมาณ ${ageRange} ปี
                    ผู้เรียนในห้องเรียนนี้มีความหลากหลายและรวมถึงกลุ่มที่ต้องการการสนับสนุนพิเศษ เช่น ${studentType}
                    หลักสูตรนี้มีจุดมุ่งหมายเพื่อสอนในรายวิชา ${subject} เรื่อง ${lessonTopic} ใช้เวลาทั้งหมด ${learningTime} เดือนโดยจัดการเรียนรู้ครั้งละ ${timeSlot} ชั่วโมง/สัปดาห์
                    ข้อจำกัดและบริบทที่ควรพิจารณา: ${limitation}`; // Task logic remains the same
      const type = `JSON`;
      const field = `{
  "courseInfo": {
    "courseCode": "...",
    "courseTitle": "...",
    "credits": "...",
    "instructor": "...",
    "semester": "...",
    "academicYear": "...",
    "program": "...",
    "faculty": "..."
  },
  "courseDescription": "...",
  "courseObjectives": {
    "cognitive": [
      "..."
    ],
    "psychomotor": [
      "..."
    ],
    "affective": [
      "..."
    ]
  },
  "weeklyPlan": [
    {
      "week": "...",
      "topic": "...",
      "hours": "...",
      "teachingMethods": ["..."],
      "teachingMaterials": ["..."],
      "assessment": ["..."]
    }
  ],
  "studentCenteredLearning": [
    "..."
  ],
  "teachingAids": [
    "..."
  ],
  "useOfTechnology": [
    "..."
  ],
  "grading": {
    "continuousAssessment": "...",
    "midtermExam": "...",
    "finalExam": "..."
  },
  "references": {
    "mandatoryBooks": [
      "..."
    ],
    "additionalBooks": [
      "..."
    ]
  }
}
`;
      const lessonPlan = await callGenerateLLM(task, type, field, "generate");

      await createSession({
        userId: new ObjectId(userId),
        step: 1,
        lessonPlan,
        userResponses: {},
        aiResponses: {},
        conversation: [],
        improvedLessonPlan: "",
      });

      return NextResponse.json({
        type: "json",
        lessonPlan: lessonPlan,
        nextQuestion: questions[1],
      });
    }

    // Step 2-5: Reflection Questions
    if (session.step >= 1 && session.step <= 5) {
      console.log(
        `🧠 Step ${session.step}: Reflection for session ${userId} with user message ${requestBody.userMessage}`
      );

      session.userResponses[`step${session.step}`] = requestBody.userMessage;

      // let context = "";
      // for (let i = 1; i < session.step; i++) {
      //   if (session.userResponses[`step${i}`]) {
      //     context += `Question ${i}: ${questions[i]}\nUser Response: ${
      //       session.userResponses[`step${i}`]
      //     }\n\n`;
      //   }
      // }
      const task = `คุณกำลังประเมินแผนการสอนเพื่อปรับปรุงโดยใช้วิธีการสะท้อนคิดจากผู้ใช้
      โดยเราจะเตรียมชุดคำถามให้ผู้ใช้ได้สะท้อนคิด คุณจะต้องใช้ข้อมูลต่อไปนี้ในการสร้างคำตอบ:
        แผนการสอนเดิม:\n${JSON.stringify(session.lessonPlan, null, 2)}
        การสนทนาก่อนการถามตอบสะท้อนคิดหน้า:\n${session.conversation
          .map(
            (entry, index) =>
              `Question ${index + 1}: ${entry.question}\nUser Response: ${
                entry.userMessage
              }\nAI Response: ${entry.response}\n`
          )
          .join("\n")}
        คำถามสะท้อนคิดปัจจุบัน: "${questions[session.step]}"
        คำตอบสะท้อนคิดล่าสุดของผู้ใช้: "${requestBody.userMessage}"
        จากนี้ ให้คุณเขียนวิจาร์คำตอบสะท้อนคิดล่าสุดของผู้ใช้พร้อมทั้งเสนอแนวทางในการปรับปรุงหลักสูตร`;

      const aiResponse = await callGenerateLLM(task, "text", "คำตอบ", "followup");

      for (let i = 1; i <= session.step; i++) {
        if (session.userResponses[`step${i}`]) {
          conversation.push({
            question: questions[i],
            response: session.aiResponses[`step${i}`] || aiResponse,
            userMessage: session.userResponses[`step${i}`],
          });
        }
      }

      await updateSession(userId, {
        [`userResponses.step${session.step}`]: userMessage,
        [`aiResponses.step${session.step}`]: aiResponse,
        step: session.step + 1,
        conversation: conversation,
      });

      return NextResponse.json({
        type: "text",
        nextQuestion: questions[session.step + 1],
        conversation: conversation,
      });
    }

    // Step 6: Improved Lesson Plan
    if (session.step > 5) {
      const task = `...`; // Task logic remains the same
      const improvedLessonPlan = await callGenerateLLM(task, "JSON", "...");
      await updateSession(userId, {
        improvedLessonPlan,
        step: "completed",
      });

      return NextResponse.json({
        type: "json",
        improvedLessonPlan: JSON.parse(improvedLessonPlan),
      });
    }

    return NextResponse.json(
      { error: "Invalid step or session state." },
      { status: 400 }
    );
  } catch (error) {
    console.error(`❌ Error in session for user ${userId}:`, error.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

