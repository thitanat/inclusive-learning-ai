import { NextRequest, NextResponse } from "next/server";
import { docsQuery } from "@/lib/docsQuery";
import { callQueryLLM } from "@/lib/queryLLM";
import { callAutoGPT } from "@/lib/autoGPT";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/db";
import { getSession, createSession, updateSession } from "@/models/session";
import jwt from "jsonwebtoken";
import { extractJSON } from "@/utils/extractJSON";

export async function POST(request: NextRequest, { params }) {
  const { configStep } = await params;
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

    switch (configStep) {
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

        // Check if session exists
        const existingSession = await getSession(userId);
        if (existingSession) {
          await updateSession(userId, {
            configStep: parseInt(configStep) + 1,
            subject: body.subject,
            lessonTopic: body.lessonTopic,
            level: body.level,
            standard: standard,
            interimIndicators: interimIndicators,
            finalIndicators: finalIndicators,
            content: response0_1,
            // Do not update createdAt for existing session
          });
        } else {
          await createSession({
            userId: new ObjectId(body.userId),
            configStep: parseInt(configStep) + 1,
            subject: body.subject,
            lessonTopic: body.lessonTopic,
            level: body.level,
            standard: standard,
            interimIndicators: interimIndicators,
            finalIndicators: finalIndicators,
            content: response0_1,
            createdAt: new Date(),
          });
        }

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

        const keyCompetencies = {
            "5.1": "ความสามารถในการสื่อสาร",
            "5.2": "ความสามารถในการคิด",
            "5.3": "ความสามารถในการแก้ปัญหา",
            "5.4": "ความสามารถในการใช้ทักษะชีวิต",
        }

        const task1_1 = `จากจุดประสงค์การเรียนรู้ที่ได้ ${JSON.stringify(response1_0)} ให้คุณช่วยระบุสาระการเรียนรรู้ 5 ข้อ 
        โดยใช้หลักสูตรการศึกษาขั้นพื้นฐาน พุทธศักราช 2560 เป็นแนวทางในการระบุสาระการเรียนรู้ ให้ตอบในรูปแบบ JSON ที่ประกอบด้วย field "เลขลำดับสาระการเรียนรู้"`
        const data1_1 = await callQueryLLM(task1_1, "1_1", false);
        const response1_1 = await extractJSON(data1_1);
        console.log("response1_1:", response1_1);

        
        await updateSession(userId, {
          configStep: parseInt(configStep) + 1,
          objectives: response1_0,
          keyCompetencies : keyCompetencies,
          learningContent: response1_1,
        });

        const response1 = {
          ...response1_0,
          "สมรรถนะผู้เรียน": keyCompetencies,
          "สาระการเรียนรู้": response1_1,
        };

        return NextResponse.json({
          response: response1,
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
        const studyHours = body.studyHours || 9; // Default to 9 hours if not provided
        const timePerClass = body.timePerClass || 3; // Default to 3 hours per class if not provided
        // สร้างข้อความประเภทนักเรียนและเปอร์เซ็นต์
        const studentTypesStr = studentTypes.length > 0
          ? studentTypes.map(
              (s: any, idx: number) =>
                `ประเภทที่ ${idx + 1}: ${s.type} (${s.percentage}%)`
            ).join(", ")
          : "ไม่ระบุประเภทนักเรียน";

        // Example: Use session.Activities and other session data to generate a lesson plan
        const task2_0 = `ออกแบบกิจกรรมการจัดการเรียนรู้แบบ UDL โดยคำนึงถึงความแตกต่างของนักเรียนแต่ละประเภทในห้อง (Inclusive Classroom)
                          โดยคุณจะต้องค้นหาความรู้เชิงลึกเกี่ยวกับเนื่อหาของบนเรียนนั้นๆ เพื่อใช้ในการออกแบบกิจกรรมการเรียนรู้ที่เหมาะสม
                          ให้ตอบกลับในรูปแบบ JSON โดยใช้ลำดับหัวข้อเริ่มจาก 8 และลงลึกตามกิจกรรม เช่น 8.1, 8.1.1 ฯลฯ

                          JSON ต้องมีโครงสร้าง:
                          - ขั้น (เช่น: นำเข้าสู่บทเรียน, จัดกิจกรรมการเรียนรู้)
                            - กิจกรรม
                              - ชื่อรายการกิจกรรม (ระบุเวลาทั้งหมดของกิจกรรมนั้น)
                                - วัตถุประสงค์ (เขียนให้สอดคล้องกับตัวชี้วัด)
                                - ขั้นตอนการดำเนินกิจกรรม (เวลา)
                                    - แยกเป็นขั้นตอนหลัก และขั้นตอนย่อยโดยละเอียด (เวลาขั้นตอนหลัก และ ขั้นตอนย่อย)
                                    เช่น:
                                      - หากเป็นการทดลอง: ระบุชื่อการทดลองจริง พร้อมวัสดุ วิธีการทดลอง วิธีเก็บข้อมูล และวิธีสรุปผล
                                      - หากเป็นการอภิปราย: ระบุคำถามอภิปรายเชิงวิเคราะห์
                                      - หากเป็นกิจกรรมสร้างสรรค์: ระบุว่าใช้กระบวนการใด เช่น Design Thinking พร้อมระยะเวลาในแต่ละเฟส
                                - สื่อ/เครื่องมือที่ใช้ (ระบุชื่อชัดเจน และลิงก์ถ้ามี)
                                - บทบาทผู้เรียน
                                - บทบาทครู
                                - แนวทางการปรับกิจกรรมสำหรับผู้เรียนที่หลากหลายประเภท (inclusive classroom)
                                    - โดยดูจากข้อมูลประเภทนักเรียนหลากหลายที่ให้มาใน อินพุต
                          ใช้ข้อมูลอินพุตต่อไปนี้:
                          - เนื้อหา: ${JSON.stringify(session.content)}
                          - ประเภทของนักเรียนที่หลากหลายและเปอร์เซ็นต์ (inclusive classroom): ${studentTypesStr}
                          - จำนวนชั่วโมงทั้งหมดในการสอน: ${studyHours} ชั่วโมง
                          - ระยะเวลาแต่ละคาบ: คาบละ ${timePerClass} ชั่วโมง

                          **ห้ามใช้ตัวอย่างกิจกรรมง่ายเกินไป เช่น วาดภาพ/จับคู่คำศัพท์ เว้นแต่มีความเกี่ยวโยงกับการวิเคราะห์หรือออกแบบทางวิทยาศาสตร์จริง เช่น “วาดกราฟแสดงความเร่ง” หรือ “จับคู่แรงกับผลในระบบจริง”
                          **ทุกกิจกรรมต้องสอดคล้องกับสาระและตัวชี้วัด และมีเป้าหมายที่ระดับวิเคราะห์ ประเมินค่า หรือสร้างสรรค์ ตาม Bloom’s Taxonomy และต้องประยุกต์ใช้ความรู้ เช่น การจำลองสถานการณ์แรง, การวิเคราะห์ระบบกลไก, หรือการออกแบบสิ่งประดิษฐ์จริง
`;

        const data2_0 = await callQueryLLM(task2_0, "2_0", false);
        const response2_0 = await extractJSON(data2_0);
        console.log("response2_0:", response2_0);

        await updateSession(userId, {
          configStep: parseInt(configStep) + 1,
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


