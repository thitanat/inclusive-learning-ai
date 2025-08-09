import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface TaskProcessorInput {
  task: string;
  context?: any;
  stepType: string;
  sessionData?: any;
}

const TaskProcessorOutputSchema = z.object({
  processedTask: z.string().describe("งานที่ได้รับการประมวลผลและปรับแต่งแล้ว"),
  nextActions: z.array(z.string()).describe("รายการขั้นตอนต่อไปที่ต้องดำเนินการ"),
  needsDocumentSearch: z.boolean().describe("ต้องการการค้นหาเอกสารหรือไม่"),
  needsInformationSearch: z.boolean().describe("ต้องการการค้นหาข้อมูลภายนอกหรือไม่"),
  responseFormat: z.enum(["JSON", "TEXT"]).describe("รูปแบบการตอบที่คาดหวัง"),
});

type TaskProcessorOutput = z.infer<typeof TaskProcessorOutputSchema>;

export class TaskProcessorAgent {
  private llm: ChatOpenAI;
  private parser: StructuredOutputParser<typeof TaskProcessorOutputSchema>;

  constructor() {
    this.llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.3,
      openAIApiKey: OPENAI_API_KEY,
    });

    this.parser = StructuredOutputParser.fromZodSchema(TaskProcessorOutputSchema);
  }

  async processTask(input: TaskProcessorInput): Promise<TaskProcessorOutput> {
    console.log("🔄 Task Processor Agent: กำลังวิเคราะห์งาน...");

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system", 
        `คุณคือ Task Processor Agent ที่เชี่ยวชาญในการวิเคราะห์งานสร้างเนื้อหาการศึกษา
        บทบาทของคุณคือ:
        1. วิเคราะห์งานที่เข้ามาและปรับแต่งให้เหมาะสมสำหรับการประมวลผล
        2. ตัดสินใจว่าต้องการข้อมูลหรือเอกสารเพิ่มเติมอะไรบ้าง
        3. วางแผนกลยุทธ์การดำเนินงาน
        4. ระบุรูปแบบการตอบที่คาดหวัง
        
        คุณทำงานกับหลักสูตรการศึกษาไทยและงานวางแผนการเรียนการสอน
        ตอบเป็นภาษาไทยเมื่อจำเป็น และใช้รูปแบบ JSON ที่กำหนดเสมอ
        
        {format_instructions}`
      ],
      [
        "human",
        `ประเภทงาน: {stepType}
        รายละเอียดงาน: {task}
        บริบทของเซสชัน: {context}
        
        กรุณาวิเคราะห์งานนี้และกำหนดกลยุทธ์การประมวลผล`
      ]
    ]);

    const formattedPrompt = await prompt.format({
      stepType: input.stepType,
      task: input.task,
      context: JSON.stringify(input.sessionData || {}),
      format_instructions: this.parser.getFormatInstructions(),
    });

    const response = await this.llm.invoke(formattedPrompt);
    const parsedResponse = await this.parser.parse(response.content as string) as TaskProcessorOutput;

    console.log("✅ Task Processor Agent: การวิเคราะห์งานเสร็จสิ้น");
    console.log("📋 งานที่ประมวลผลแล้ว:", parsedResponse.processedTask);
    console.log("🔍 ต้องการค้นหาเอกสาร:", parsedResponse.needsDocumentSearch);
    console.log("🌐 ต้องการค้นหาข้อมูล:", parsedResponse.needsInformationSearch);

    return parsedResponse;
  }
}
