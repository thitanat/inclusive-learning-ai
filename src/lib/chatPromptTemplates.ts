import { ChatPromptTemplate } from "@langchain/core/prompts";

export function getChatPromptTemplate(type: string, query: number) {
  switch (type) {
    case "query":
      switch (query) {
        case "0_0":
          return ChatPromptTemplate.fromMessages([
            [
              "system",
              "คุณคือผู้ช่วยที่ตอบคำถามจากข้อมูลในไฟล์ CSV ที่ให้เท่านั้นห้ามแต่งหรือสมมติข้อมูลเองโดยเด็ดขาดหากไม่มีข้อมูลใน CSV ให้ตอบว่า 'ไม่พบข้อมูล' เท่านั้น โดยตอบในรูปแบบ JSON ภาษาไทยเท่านั้น",
            ],
            [
              "human",
              `จากหนังสือคู่หลักสูตร {context} ต่อไปนี้ให้คุณหาค้นหา มาตรฐาน และ ตัวชี้วัด ที่ตรงกับ
               บริบทเนื้อหาต่อไปนี้ {task} มากที่สุดอย่างละหนึ่ง หลังจากให้ตอบในรูป แบบ json โดยมี field 
               'มาตรฐาน' ซึ่งระบุทั้งชื่อมาตรฐานและเลขมาตรฐานใน value
               'ตัวชี้วัดระหว่างทาง' ซึ่งระบุทั้งชื่อและเลขตัวชี้วัดใน value
               'ตัวชี้วัดปลายทาง' ซึ่งระบุทั้งชื่อและเลขตัวชี้วัดใน value
              `,
            ],
          ]);
        case "0_1":
          return ChatPromptTemplate.fromMessages([
            [
              "system",
              "คุณคือผู้เชี่ยวชาญด้านการศึกษาและผู้ออกแบบแผนการสอน ตอบเป็นภาษาไทยเท่านั้น",
            ],
            [
              "human",
              `จากหนังสือคู่มือ {context} เจาะจงสำหรับ "{task}" ให้คุณช่วยคิดหัวข้อเนื้อหารายวิชาอย่างละเอียด ตอบในรูปแบบ json โดยไม่ต้องมี field อื่นๆ แค่ใช้ field เป็นตัวเลขของแต่ละข้อเช่น 1,2,3,4`,
            ],
          ]);
        case "1_0":
          return ChatPromptTemplate.fromMessages([
            [
              "system",
              "คุณคือผู้เชี่ยวชาญด้านการศึกษาและผู้ออกแบบแผนการสอน ตอบเป็นภาษาไทยเท่านั้น",
            ],
            [
              "human",
              `จาก "{task}" ให้คุณช่วยออกแบบกิจกรรมการเรียนการสอน โดยคำนึงถึงลักษณะของนักเรียนที่ระบุ ตอบในรูปแบบ json โดยใช้ field เป็นตัวเลขของแต่ละชั่วโมง เช่น 1,2,3,4`,
            ],
          ]);
        // Add more cases for other query numbers as needed
        default:
          throw new Error("Unknown query type");
      }
      
    // Add more cases for other types as needed
    default:
      throw new Error("Unknown prompt type");
  }
}