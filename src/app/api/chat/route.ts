import { OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";
import { getSession, createSession, updateSession } from "@/models/session";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/db";
import { z } from "zod";
import { getRetrieverFrom } from "@/lib/retriever";
import { callLLM } from "@/lib/llm";
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
                    ข้อจำกัดและบริบทที่ควรพิจารณา: ${limitation}
                    โดยมีรายละเอียดครบทุกหัวข้อ (1–10.3) ต่อไปนี้ ให้เนื้อหามีความละเอียดและเหมาะสมกับนักเรียน
                    1. สาระสำคัญ: (หลักการสำคัญของบทเรียน)
                    2. มาตรฐานการเรียนรู้: (อ้างอิงตามตัวชี้วัดของกลุ่มสาระ เช่น ส 1.1)
                    3. ตัวชี้วัด: (เช่น ส 1.1 ม.4–6/1 พร้อมคำอธิบาย)
                    4. จุดประสงค์การเรียนรู้:
                      4.1 ความรู้: (เช่น อธิบายองค์ประกอบของศาสนา)
                      4.2 ทักษะ/กระบวนการ: (เช่น วิเคราะห์ข้อมูล สื่อสาร อภิปรายกลุ่ม)
                      4.3 คุณลักษณะอันพึงประสงค์: (เช่น มีวินัย ใฝ่เรียนรู้)
                    5. สมรรถนะสำคัญ: (เลือกจาก: การคิด การสื่อสาร การแก้ปัญหา การใช้เทคโนโลยี ฯลฯ)
                    6. สาระการเรียนรู้: (แจกแจงเนื้อหาเป็นหัวข้อย่อย)
                    7. ชิ้นงาน/ภาระงาน: (ระบุสิ่งที่ผู้เรียนต้องทำ เช่น แบบฝึกหัด การเขียนรายงาน การนำเสนอ)
                    8. กระบวนการจัดกิจกรรมการเรียนรู้ (Blended Learning + Inquiry 5E):
                      8.1 ขั้นนำเข้าสู่บทเรียน: (เช่น ใช้สื่อกระตุ้น แนะนำวัตถุประสงค์)
                      8.2 ขั้นสร้างความสนใจ (Engagement): ระยะเวลา / กิจกรรม
                      8.3 ขั้นสำรวจและค้นหา (Exploration): ระยะเวลา / กิจกรรม
                      8.4 ขั้นอธิบายและลงข้อสรุป (Explanation): ระยะเวลา / กิจกรรม
                      8.5 ขั้นขยายความรู้ (Elaboration): ระยะเวลา / กิจกรรม
                      8.6 ขั้นประเมิน (Evaluation): ระยะเวลา / กิจกรรม
                      (แยกระหว่าง Face to Face และ Online หากมี)
                    9. สื่อ / อุปกรณ์ / แหล่งเรียนรู้: (ระบุอย่างละเอียด)
                    10. กระบวนการวัดและประเมินผล:
                      10.1 วิธีวัดผล: (เช่น แบบทดสอบ การสังเกต)
                      10.2 เครื่องมือวัดผล: (แบบประเมิน / แบบสังเกต / แบบฝึกหัด)
                      10.3 เกณฑ์การประเมินผล: (คะแนนเต็ม / ระดับความสามารถ / ร้อยละที่ผ่านเกณฑ์)`; // Task logic remains the same
      const type = `JSON`;
      const field = `{
  "courseTitle": "",
  "gradeLevel": "",
  "subject": "",
  "totalHours": 0,
  "lesson": {
    "lessonNumber": 0,
    "lessonTitle": "",
    "hours": 0,
    "teachingDates": [],
    "teacher": "",
    "1_essentialUnderstanding": "",
    "2_standards": [],
    "3_indicators": [],
    "4_learningObjectives": {
      "4_1_knowledge": [],
      "4_2_skills": [],
      "4_3_attributes": []
    },
    "5_keyCompetencies": [],
    "6_contents": [],
    "7_assignments": [],
    "8_learningProcess": {
      "model": "",
      "8_1_introduction": {
        "mode": "",
        "activities": []
      },
      "8_2_mainActivities": {
        "8_2_1_engagement": {
          "duration": "",
          "mode": "",
          "activities": []
        },
        "8_2_2_exploration": {
          "duration": "",
          "mode": "",
          "activities": []
        },
        "8_2_3_explanation": {
          "duration": "",
          "activities": []
        },
        "8_2_4_elaboration": {
          "duration": "",
          "activities": []
        },
        "8_2_5_evaluation": {
          "duration": "",
          "mode": "",
          "activities": []
        }
      }
    },
    "9_materials": [],
    "10_assessment": {
      "10_1_methods": [],
      "10_2_tools": [],
      "10_3_criteria": {
        "passingScore": "",
        "scoringDetails": {}
      }
    }
  }
}


`;
      const lessonPlan = await callLLM(task, type, field, "generate");

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
        จากนี้ ให้คุณเขียนวิจารย์คำตอบสะท้อนคิดล่าสุดของผู้ใช้พร้อมทั้งเสนอแนวทางในการปรับปรุงหลักสูตร`;

      const aiResponse = await callLLM(task, "text", "คำตอบ", "followup");

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
      const improvedLessonPlan = await callLLM(task, "JSON", "...");
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
    return NextResponse.json({ step: 1, lessonPlan: null }, { status: 200 });
  }
  return NextResponse.json({
    step: session.step || 1,
    lessonPlan: session.lessonPlan || null,
    conversationHistory: session.conversation || [],
  });
}
