import { NextRequest, NextResponse } from "next/server";
import { docsQuery } from "@/lib/docsQuery";
import { callQueryLLM } from "@/lib/queryLLM";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/db";
import { getSession, createSession, updateSession } from "@/models/session";
import jwt from "jsonwebtoken";
import { extractJSON } from "@/utils/extractJSON";

export async function POST(request: NextRequest, { params }) {
  const { currentStep } = await params;
  //connecting to the database
  await connectDB();
  //user authentication
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
    console.log("Decoded userId:", userId);
  } catch {
    console.error("Invalid token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Received body:", body);

    switch (currentStep) {
      case "0": {
        const task0_0 = ` วิชา: ${body.subject} เนื้อหา: ${body.lessonTopic}ระดับชั้น: ${body.level}`;
        const data0_0 = await callQueryLLM(task0_0, "0_0", true);
        const response0_0 = await extractJSON(data0_0);
        console.log("response0_0:", response0_0);
        const standard = response0_0["มาตรฐาน"];
        const interimIndicators = response0_0["ตัวชี้วัดระหว่างทาง"];
        const finalIndicators = response0_0["ตัวชี้วัดปลายทาง"];
        const task0_1 = `จากข้อมูลมาตรฐานการเรียนรู้ต่อไปนี้
        ${JSON.stringify(standard)} ตัวชี้วัดระหว่างทาง: ${JSON.stringify(interimIndicators)} ตัวชี้วัดปลายทาง: ${JSON.stringify(finalIndicators)}
        ให้คุณช่วยคิดหัวข้อเนื้อหาการเรียนอย่างละเอียด ตอบในรูปแบบ JSON โดยไม่ต้องมี field อื่นๆ แค่ใช้ field เป็นตัวเลขของแต่ละข้อเช่น 1,2,3,4 
        `;
        const data0_1 = await callQueryLLM(task0_1, "0_1", false);
        const response0_1 = await extractJSON(data0_1);
        console.log("response0_1:", response0_1);
        const response0 = {
          ...response0_0,
          "เนื้อหา": response0_1,
        };
        await createSession({
          userId: new ObjectId(body.userId),
          currentStep: parseInt(currentStep) + 1,
          subject: body.subject,
          lessonTopic: body.lessonTopic,
          level: body.level,
          standard: standard,
          interimIndicators: interimIndicators,
          finalIndicators: finalIndicators,
          content: response0_1,
          createdAt: new Date(),
        });

        return NextResponse.json({
          response: response0,
        });
      }
      case "1": { 
        console.log("case 1");
        const session = await getSession(userId);
        if (!session) {
          return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
          );
        }
        const intervalIndicators = session.interimIndicators
        const finalIndicators = session.finalIndicators

        const task1_0 = `ออกแบบจุดประสงค์การเรียนรู้ 3 ด้านโดยมี ด้านความรู้, ด้านทักษะ และด้านคุณลักษณะ
        สำหรับวิชา: ${session.subject} เนื้อหา: ${session.content} ระดับชั้น: ${session.level} โดยจะต้องตอบสนองตัวชี้วัด ${intervalIndicators} และ ${finalIndicators}
        โดยจะต้องตอบในรูปแบบ JSON เท่านั้นและประกอบไปด้วย field
        "จุดประสงค์ด้านความรู้", "จุดประสงค์ด้านทักษะ", "จุดประสงค์ด้านคุณลักษณะ" โดยแต่ละ field จะต้องเป็น array ของจุดประสงค์การเรียนรู้ที่เกี่ยวข้อง`;

        const data1_0 = await callQueryLLM(task1_0, "1_0", false);
        const response1_0 = await extractJSON(data1_0);

        await updateSession(userId, {
          currentStep: parseInt(currentStep) + 1,
          Activities: response1_0,
        });

        return NextResponse.json({
          response: response1_0,
        });
      }
      case "2": {
        const session = await getSession(userId);
        if (!session) {
          return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
          );
        }
        const numStudents = body.numStudents || 30;
        const studentTypes = body.studentTypes || [];  
        const studentTypesStr = studentTypes;

        // Example: Use session.Activities and other session data to generate a lesson plan
        const task2_0 = `ออกแบบแผนการจัดการเรียนรู้โดยใช้ข้อมูลต่อไปนี้
        วิชา: ${session.subject}
        เนื้อหา: ${session.content}
        ระดับชั้น: ${session.level}
        จุดประสงค์การเรียนรู้: ${JSON.stringify(session.Activities)}
        จำนวนนักเรียน: ${numStudents}
        ประเภทนักเรียน: ${JSON.stringify(studentTypesStr)}
        ให้ตอบกลับมาเป็น JSON ที่ประกอบด้วย field "ขั้นตอนการสอน", "กิจกรรม", "สื่อ/อุปกรณ์", "การวัดผล"`;

        const data2_0 = await callQueryLLM(task2_0, "2_0", false);
        const response2_0 = await extractJSON(data2_0);

        await updateSession(userId, {
          currentStep: parseInt(currentStep) + 1,
          numStudents: numStudents,
          studentTypes: studentTypes,
          lessonPlan: response2_0,
        });

        return NextResponse.json({
          response: response2_0,
        });
      }
      // Add more cases for other steps as needed
      default:
        return NextResponse.json(
          { error: "Invalid step" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}


