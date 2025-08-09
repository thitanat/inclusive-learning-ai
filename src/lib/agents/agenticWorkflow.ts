import { TaskProcessorAgent } from "./taskProcessorAgent";
import { InformationSearchAgent } from "./informationSearchAgent";
import { DocumentQueryAgent } from "./documentQueryAgent";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface AgenticWorkflowInput {
  task: string;
  stepType: string;
  sessionData?: any;
  context?: string;
}

interface AgenticWorkflowOutput {
  result: string;
  confidence: number;
  sourcesUsed: string[];
  processingSteps: string[];
}

export class AgenticWorkflow {
  private taskProcessor: TaskProcessorAgent;
  private informationSearcher: InformationSearchAgent;
  private documentQuerier: DocumentQueryAgent;
  private finalProcessor: ChatOpenAI;

  constructor() {
    this.taskProcessor = new TaskProcessorAgent();
    this.informationSearcher = new InformationSearchAgent();
    this.documentQuerier = new DocumentQueryAgent();
    this.finalProcessor = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.7,
      openAIApiKey: OPENAI_API_KEY,
    });
  }

  async executeWorkflow(input: AgenticWorkflowInput): Promise<AgenticWorkflowOutput> {
    console.log("🚀 เริ่ม Agentic Workflow...");
    console.log("📋 งาน:", input.task);
    console.log("🔄 ประเภทขั้นตอน:", input.stepType);

    const processingSteps: string[] = [];
    const sourcesUsed: string[] = [];
    let confidence = 0;

    try {
      // Step 1: Task Processing and Analysis
      console.log("\n=== ขั้นตอนที่ 1: การประมวลผลงาน ===");
      processingSteps.push("การวิเคราะห์งานและการวางแผน");
      
      const taskAnalysis = await this.taskProcessor.processTask({
        task: input.task,
        stepType: input.stepType,
        sessionData: input.sessionData,
        context: input.context,
      });

      // Step 2: Document Query (if needed)
      let documentResults: any = null;
      if (taskAnalysis.needsDocumentSearch) {
        console.log("\n=== ขั้นตอนที่ 2: การค้นหาเอกสาร ===");
        processingSteps.push("การค้นหาและวิเคราะห์เอกสาร");
        sourcesUsed.push("เอกสารหลักสูตร");

        documentResults = await this.documentQuerier.queryDocuments({
          query: taskAnalysis.processedTask,
          queryType: this.getDocumentQueryType(input.stepType),
          context: input.context || "",
        });

        confidence = Math.max(confidence, documentResults.confidence);
      }

      // Step 3: Information Search (if needed)
      let informationResults: any = null;
      if (taskAnalysis.needsInformationSearch) {
        console.log("\n=== ขั้นตอนที่ 3: การค้นหาข้อมูล ===");
        processingSteps.push("การค้นหาข้อมูลภายนอก");
        sourcesUsed.push("แหล่งข้อมูลการศึกษาภายนอก");

        informationResults = await this.informationSearcher.searchInformation({
          query: taskAnalysis.processedTask,
          context: input.context || "",
          searchType: this.getSearchType(input.stepType),
        });

        confidence = Math.max(confidence, informationResults.confidence);
      }

      // Step 4: Final Processing and Synthesis
      console.log("\n=== ขั้นตอนที่ 4: การสังเคราะห์สุดท้าย ===");
      processingSteps.push("การสังเคราะห์ข้อมูลและการสร้างคำตอบ");

      const finalResult = await this.synthesizeFinalResponse({
        taskAnalysis,
        documentResults,
        informationResults,
        originalInput: input,
      });

      console.log("✅ Agentic Workflow เสร็จสิ้นสำเร็จ");
      
      return {
        result: finalResult,
        confidence: Math.max(confidence, 0.5), // Ensure minimum confidence
        sourcesUsed,
        processingSteps,
      };

    } catch (error) {
      console.error("❌ Agentic Workflow Error:", error);
      
      return {
        result: "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง",
        confidence: 0.1,
        sourcesUsed: [],
        processingSteps: [...processingSteps, "เกิดข้อผิดพลาดระหว่างการประมวลผล"],
      };
    }
  }

  private async synthesizeFinalResponse(data: {
    taskAnalysis: any;
    documentResults: any;
    informationResults: any;
    originalInput: AgenticWorkflowInput;
  }): Promise<string> {
    const synthesisPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `คุณคือผู้เชี่ยวชาญในการสังเคราะห์เนื้อหาการศึกษาไทย
        งานของคุณคือรวมข้อมูลจากแหล่งต่าง ๆ เพื่อสร้างเนื้อหาการศึกษา
        ที่ครอบคลุมและเป็นไปตามมาตรฐานหลักสูตรไทย
        
        คุณต้อง:
        1. สังเคราะห์ข้อมูลจากแหล่งข้อมูลทั้งหมดที่มี
        2. ให้เนื้อหาเหมาะสมกับบริบทการศึกษาไทย
        3. ปฏิบัติตามรูปแบบการตอบที่กำหนด
        4. รักษาความถูกต้องและความเกี่ยวข้องทางการศึกษา
        5. ตอบเป็นภาษาไทยสำหรับเนื้อหาการศึกษา
        
        รูปแบบการตอบควรเป็นไปตาม: {responseFormat}`
      ],
      [
        "human",
        `งานเดิม: {originalTask}
        ประเภทขั้นตอน: {stepType}
        งานที่ประมวลผลแล้ว: {processedTask}
        
        ผลลัพธ์จากเอกสาร: {documentResults}
        ผลการค้นหาข้อมูล: {informationResults}
        
        บริบทเซสชัน: {sessionContext}
        
        กรุณาสังเคราะห์ข้อมูลทั้งหมดนี้เพื่อให้คำตอบที่ครอบคลุม
        ต่องานเดิม โดยเน้นการสร้างเนื้อหาการศึกษาที่ปฏิบัติได้จริง
        และสอดคล้องกับมาตรฐานหลักสูตรไทย`
      ]
    ]);

    const formattedPrompt = await synthesisPrompt.format({
      originalTask: data.originalInput.task,
      stepType: data.originalInput.stepType,
      processedTask: data.taskAnalysis.processedTask,
      documentResults: JSON.stringify(data.documentResults || {}),
      informationResults: JSON.stringify(data.informationResults || {}),
      sessionContext: JSON.stringify(data.originalInput.sessionData || {}),
      responseFormat: data.taskAnalysis.responseFormat,
    });

    const response = await this.finalProcessor.invoke(formattedPrompt);
    return response.content as string;
  }

  private getDocumentQueryType(stepType: string): "curriculum" | "standard" | "guideline" | "template" {
    switch (stepType) {
      case "0":
        return "curriculum";
      case "1":
        return "standard";
      case "2":
      case "3":
        return "guideline";
      default:
        return "curriculum";
    }
  }

  private getSearchType(stepType: string): "educational" | "curriculum" | "methodology" | "general" {
    switch (stepType) {
      case "0":
      case "1":
        return "curriculum";
      case "2":
        return "methodology";
      case "3":
        return "educational";
      default:
        return "educational";
    }
  }
}
