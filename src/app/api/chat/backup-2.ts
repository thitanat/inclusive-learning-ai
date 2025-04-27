import { OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";
import { getSession, createSession, updateSession } from "@/models/session";
import { connectDB } from "@/lib/db";
import { z } from "zod";
import { getRetrieverFrom } from "@/lib/retriever";
import { callLLM } from "@/lib/llm";
import jwt from "jsonwebtoken";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const questions: { [key: number]: string } = {
  1: "How practical do you think this lesson plan is? Are there any limitations?",
  2: "What do you predict the learning outcomes will be?",
  3: "Does the lesson plan align with its objectives? (Provide key points)",
  4: "Do you think the structure of this lesson makes sense?",
  5: "What are the weaknesses in this lesson plan?",
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

  const {
    sessionId,
    lessonTopic,
    subject,
    level,
    ageRange,
    studentType,
    learningTime,
    timeSlot,
    limitation,
  } = await req.json();



  let session = await getSession(sessionId);

  try {
    // Step 1: Generate Lesson Plan
    if (!session) {
      if (
        !sessionId ||
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

      console.log(`🆕 Creating new session: ${sessionId}`);

      const task = `ออกแบบหลักสูตรการเรียนรู้ในลักษณะห้องเรียนรวม (Inclusive Classroom) สำหรับระดับการศึกษา ${level} โดยมีช่วงอายุของผู้เรียนประมาณ ${ageRange} ปี
                    ผู้เรียนในห้องเรียนนี้มีความหลากหลายและรวมถึงกลุ่มที่ต้องการการสนับสนุนพิเศษ เช่น ${studentType}
                    หลักสูตรนี้มีจุดมุ่งหมายเพื่อสอนในรายวิชา ${subject} เรื่อง ${lessonTopic} ใช้เวลาทั้งหมด ${learningTime} เดือนโดยจัดการเรียนรู้ครั้งละ ${timeSlot} ชั่วโมง/สัปดาห์
                    ข้อจำกัดและบริบทที่ควรพิจารณา: ${limitation}`;
      const type = `JSON`;
      const field = `{
        "courseTitle": "...",
        "level": "...",
        "subject": "...",
        "durationHours": "...",
        "unit": [
          {
            "unitTitle": "...",
            "duration": "...",
            "competencyFocus": ["...", "..."],
            "learningOutcomes": ["..."],
            "scenarios": "...",
            "udlDesign": {
              "multipleMeansOfEngagement": "...",
              "multipleMeansOfRepresentation": "...",
              "multipleMeansOfActionExpression": "..."
            },
            "activities": [
              {
                "activityTitle": "...",
                "strategies": ["..."],
                "scaffolding": true,
                "technologySupport": ["..."],
                "inclusionSupport": ["..."]
              }
            ],
            "assessment": {
              "formative": "...",
              "summative": "...",
              "diverseAssessmentMethods": ["..."],
              "transferAssessment": {
                "vertical": "...",
                "horizontal": "..."
              }
            }
          }
        ],
        "teacherDevelopment": ["..."],
        "collaboration": {
          "withParents": "...",
          "withExperts": "...",
          "withCoTeachers": "..."
        },
        "classroomEnvironment": {
          "physicalFlexibility": true,
          "emotionalSafety": true,
          "positiveBehaviorSupport": {
            "rules": "...",
            "reinforcements": "..."
          }
        }
      }`;

      const lessonPlan = await callLLM(task, type
        , field);
      console.log("lessonPlan", lessonPlan);

      await createSession({
        userId: new ObjectId(userId),
        step: 2,
        lessonPlan,
        responses: {},
        improvedLessonPlan: "",
      });

      try {
        return NextResponse.json({
          type: "json",
          lessonPlan: lessonPlan,
          nextQuestion: questions[1],
        });
      } catch (e) {
        console.error("Invalid JSON structure:", e);
        return NextResponse.json({
          error: "Model did not return valid JSON.",
          debug: lessonPlan,
        });
      }
    }

    // Step 2-5: Reflection Questions
    if (session.step >= 2 && session.step <= 5) {
      console.log(
        `🧠 Step ${session.step}: Reflection for session ${sessionId}`
      );

      session.responses[`step${session.step}`] = userMessage;

      let context = "";
      for (let i = 2; i < session.step; i++) {
        if (session.responses[`step${i}`]) {
          context += `Question ${i}: ${questions[i]}\nUser Response: ${
            session.responses[`step${i}`]
          }\n\n`;
        }
      }

      const task = `คุณกำลังประเมินแผนการสอนโดยใช้วิธีการสะท้อนการสอน
        การสะท้อนก่อนหน้า:\n${context}
        คำถามปัจจุบัน: "${questions[session.step]}"
        คำตอบล่าสุดของผู้ใช้: "${userMessage}"
        จากนี้ ให้สร้างคำตอบ AI ที่สรุปข้อมูลเชิงลึกจากการสนทนา.`;

      const aiResponse = await callLLM(task, "text", "คำตอบ");

      

      const conversation = [];
      for (let i = 1; i <= session.step; i++) {
        if (session.responses[`step${i}`]) {
          conversation.push({
            response: aiResponse,
            userMessage: session.responses[`step${i}`],
          });
        }
      }

      await updateSession(sessionId, {
        [`responses.step${session.step}`]: userMessage,
        step: session.step + 1,
        conversation: conversation
      });

      if (session.step <= 5) {
        return NextResponse.json({
          type: "text",
          nextQuestion: questions[session.step],
          conversation,
        });
      }
    }

    // Step 6: Improved Lesson Plan
    if (session.step > 5) {
      console.log(`🔄 Improving lesson plan for session ${sessionId}`);

      const task = `วิเคราะห์ความคิดเห็นของครูต่อไปนี้และปรับปรุงแผนการสอนให้เหมาะสม:\n
        ความคิดเห็น: ${JSON.stringify(session.responses)}
        แผนการสอนเดิม: ${session.lessonPlan}`;

      const type = "JSON";
      const field = "ชื่อบทเรียน, วัตถุประสงค์, กิจกรรม, วิธีการประเมิน.";
      const improvedLessonPlan = await callLLM(task, type, field);

      await updateSession(sessionId, {
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
    console.error(`❌ Error in session ${sessionId}:`, error.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

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
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({
    step: session.step,
    conversationHistory: session.conversation || [],
    lessonPlan: session.lessonPlan || null,
    nextQuestion: session.nextQuestion || "",
  });
}
