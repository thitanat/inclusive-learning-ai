import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { docsQuery } from "@/lib/docsQuery";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface DocumentQueryInput {
  query: string;
  documentPath?: string;
  queryType: "curriculum" | "standard" | "guideline" | "template";
  context: string;
}

const DocumentQueryOutputSchema = z.object({
  relevantDocuments: z.array(z.object({
    content: z.string(),
    metadata: z.record(z.any()),
    relevanceScore: z.number().min(0).max(1),
  })).describe("อาร์เรย์ของส่วนเอกสารที่เกี่ยวข้อง"),
  synthesizedAnswer: z.string().describe("คำตอบที่สังเคราะห์จากเนื้อหาเอกสาร"),
  sourceReferences: z.array(z.string()).describe("การอ้างอิงไปยังส่วนเฉพาะของเอกสาร"),
  confidence: z.number().min(0).max(1).describe("ความมั่นใจในคำตอบจากเนื้อหาเอกสาร"),
  needsMoreDocuments: z.boolean().describe("ต้องการเอกสารเพิ่มเติมหรือไม่"),
});

type DocumentQueryOutput = z.infer<typeof DocumentQueryOutputSchema>;

export class DocumentQueryAgent {
  private llm: ChatOpenAI;
  private parser: StructuredOutputParser<typeof DocumentQueryOutputSchema>;
  private defaultCurriculumPath: string;

  constructor() {
    this.llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.3,
      openAIApiKey: OPENAI_API_KEY,
    });

    this.parser = StructuredOutputParser.fromZodSchema(DocumentQueryOutputSchema);
    this.defaultCurriculumPath = process.cwd() + "/src/data/curriculum.csv";
  }

  async queryDocuments(input: DocumentQueryInput): Promise<DocumentQueryOutput> {
    console.log("📚 Document Query Agent: เริ่มค้นหาเอกสาร...");
    console.log("🔍 คำค้นหา:", input.query);
    console.log("📄 ประเภทการค้นหา:", input.queryType);

    try {
      // Determine document path
      const documentPath = input.documentPath || this.getDefaultDocumentPath(input.queryType);
      console.log("📁 ใช้เอกสาร:", documentPath);

      // Get document retriever
      const retriever = await docsQuery(documentPath, input.query);
      
      // Retrieve relevant documents
      const relevantDocs = await retriever.getRelevantDocuments(input.query);
      console.log(`📥 ได้รับข้อมูลเอกสาร ${relevantDocs.length} ส่วน`);

      // Process and analyze documents
      const analysis = await this.analyzeDocuments(relevantDocs, input);

      console.log("✅ Document Query Agent: การวิเคราะห์เสร็จสิ้น");
      console.log("📊 ความมั่นใจ:", analysis.confidence);

      return analysis;

    } catch (error) {
      console.error("❌ Document Query Agent Error:", error);
      
      // Fallback response
      return {
        relevantDocuments: [],
        synthesizedAnswer: "ไม่สามารถค้นหาข้อมูลในเอกสารได้",
        sourceReferences: [],
        confidence: 0.1,
        needsMoreDocuments: true,
      };
    }
  }

  private getDefaultDocumentPath(queryType: string): string {
    switch (queryType) {
      case "curriculum":
      case "standard":
      case "guideline":
        return this.defaultCurriculumPath;
      case "template":
        return process.cwd() + "/src/data/curriculum_template.docx";
      default:
        return this.defaultCurriculumPath;
    }
  }

  private async analyzeDocuments(
    documents: any[],
    input: DocumentQueryInput
  ): Promise<DocumentQueryOutput> {
    const analysisPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `คุณคือผู้เชี่ยวชาญในการวิเคราะห์เอกสารหลักสูตรการศึกษาไทย
        งานของคุณคือวิเคราะห์เนื้อหาเอกสารและให้คำตอบที่ครอบคลุมต่อคำถาม
        เกี่ยวกับมาตรฐานหลักสูตร จุดประสงค์การเรียนรู้ และแนวทางการศึกษา
        
        คุณต้อง:
        1. ใช้เฉพาะข้อมูลที่มีในเอกสารที่ให้มา
        2. ให้ข้อมูลอ้างอิงที่ถูกต้อง
        3. ประเมินความมั่นใจจากความครอบคลุมของเอกสาร
        4. แจ้งหากต้องการเอกสารเพิ่มเติม
        
        ตอบเป็นภาษาไทยสำหรับเนื้อหาการศึกษาเสมอ
        
        {format_instructions}`
      ],
      [
        "human",
        `เอกสาร: {documents}
        คำถาม: {query}
        ประเภทคำถาม: {queryType}
        บริบท: {context}
        
        กรุณาวิเคราะห์เอกสารเหล่านี้และให้คำตอบที่ครอบคลุมต่อคำถาม
        โดยเน้นการสกัดข้อมูลที่เกี่ยวข้องที่สุดสำหรับการพัฒนาหลักสูตรการศึกษาไทย`
      ]
    ]);

    // Prepare document content for analysis
    const documentContent = documents.map((doc, index) => ({
      id: index,
      content: doc.pageContent,
      metadata: doc.metadata,
    }));

    const formattedPrompt = await analysisPrompt.format({
      documents: JSON.stringify(documentContent),
      query: input.query,
      queryType: input.queryType,
      context: input.context,
      format_instructions: this.parser.getFormatInstructions(),
    });

    const response = await this.llm.invoke(formattedPrompt);
    return await this.parser.parse(response.content as string) as DocumentQueryOutput;
  }

  async querySpecificDocument(
    documentPath: string,
    query: string,
    column: string = "content"
  ): Promise<any[]> {
    console.log(`📚 กำลังค้นหาเอกสารเฉพาะ: ${documentPath}`);
    
    const retriever = await docsQuery(documentPath, query, column);
    const docs = await retriever.getRelevantDocuments(query);
    
    console.log(`📥 ได้รับข้อมูล ${docs.length} ส่วนจากเอกสารเฉพาะ`);
    return docs;
  }
}
