import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

interface InformationSearchInput {
  query: string;
  context: string;
  searchType: "educational" | "curriculum" | "methodology" | "general";
}

const InformationSearchOutputSchema = z.object({
  searchResults: z.array(z.object({
    title: z.string(),
    snippet: z.string(),
    relevance: z.number().min(0).max(1),
  })).describe("อาร์เรย์ของผลการค้นหาที่เกี่ยวข้อง"),
  synthesizedInformation: z.string().describe("ข้อมูลที่สังเคราะห์จากผลการค้นหา"),
  additionalContext: z.string().describe("บริบทเพิ่มเติมที่อาจมีประโยชน์"),
  confidence: z.number().min(0).max(1).describe("ระดับความมั่นใจในข้อมูล"),
});

type InformationSearchOutput = z.infer<typeof InformationSearchOutputSchema>;

export class InformationSearchAgent {
  private llm: ChatOpenAI;
  private searchTool: SerpAPI;
  private parser: StructuredOutputParser<typeof InformationSearchOutputSchema>;

  constructor() {
    this.llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.3,
      openAIApiKey: OPENAI_API_KEY,
    });

    this.searchTool = new SerpAPI(SERPAPI_API_KEY || "", {
      hl: "th",
      gl: "th",
    });

    this.parser = StructuredOutputParser.fromZodSchema(InformationSearchOutputSchema);
  }

  async searchInformation(input: InformationSearchInput): Promise<InformationSearchOutput> {
    console.log("🌐 Information Search Agent: เริ่มค้นหาข้อมูล...");
    console.log("🔍 คำค้นหา:", input.query);

    try {
      // Enhance the search query based on context and type
      const enhancedQuery = await this.enhanceSearchQuery(input);
      console.log("📈 คำค้นหาที่ปรับปรุง:", enhancedQuery);

      // Perform the search
      const searchResults = await this.searchTool.call(enhancedQuery);
      console.log("📥 ได้รับผลการค้นหาแล้ว");

      // Process and synthesize the information
      const synthesizedInfo = await this.synthesizeInformation(searchResults, input);

      console.log("✅ Information Search Agent: การค้นหาเสร็จสิ้น");
      return synthesizedInfo;

    } catch (error) {
      console.error("❌ Information Search Agent Error:", error);
      
      // Fallback response
      return {
        searchResults: [],
        synthesizedInformation: "ไม่สามารถค้นหาข้อมูลได้ในขณะนี้",
        additionalContext: "กรุณาลองใหม่อีกครั้งหรือใช้ข้อมูลที่มีอยู่แล้ว",
        confidence: 0.1,
      };
    }
  }

  private async enhanceSearchQuery(input: InformationSearchInput): Promise<string> {
    const queryEnhancementPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `คุณคือผู้เชี่ยวชาญในการปรับปรุงคำค้นหาสำหรับเนื้อหาการศึกษาไทย
        งานของคุณคือปรับปรุงคำค้นหาให้ได้ผลลัพธ์ที่เกี่ยวข้องที่สุด
        พิจารณาประเภทการค้นหาและบริบทเพื่อสร้างคำค้นหาที่ดีขึ้น`
      ],
      [
        "human",
        `คำค้นหาเดิม: {query}
        บริบท: {context}
        ประเภทการค้นหา: {searchType}
        
        สร้างคำค้นหาที่ปรับปรุงแล้วเป็นภาษาไทยที่จะให้ผลลัพธ์การศึกษาที่เกี่ยวข้องที่สุด
        ส่งคืนเฉพaะคำค้นหาที่ปรับปรุงแล้วเท่านั้น`
      ]
    ]);

    const formattedPrompt = await queryEnhancementPrompt.format({
      query: input.query,
      context: input.context,
      searchType: input.searchType,
    });

    const response = await this.llm.invoke(formattedPrompt);
    return response.content as string;
  }

  private async synthesizeInformation(
    searchResults: string, 
    input: InformationSearchInput
  ): Promise<InformationSearchOutput> {
    const synthesisPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `คุณคือผู้เชี่ยวชาญในการสังเคราะห์ข้อมูลสำหรับเนื้อหาการศึกษาไทย
        งานของคุณคือวิเคราะห์ผลการค้นหาและสกัดข้อมูลที่เกี่ยวข้องที่สุด
        สำหรับการวางแผนการเรียนการสอนและการพัฒนาหลักสูตร
        
        {format_instructions}`
      ],
      [
        "human",
        `ผลการค้นหา: {searchResults}
        คำค้นหาเดิม: {query}
        บริบท: {context}
        ประเภทการค้นหา: {searchType}
        
        กรุณาวิเคราะห์ผลการค้นหาเหล่านี้และให้การสังเคราะห์ข้อมูลที่ครอบคลุม
        ที่เกี่ยวข้องกับการพัฒนาหลักสูตรการศึกษาไทย`
      ]
    ]);

    const formattedPrompt = await synthesisPrompt.format({
      searchResults: searchResults,
      query: input.query,
      context: input.context,
      searchType: input.searchType,
      format_instructions: this.parser.getFormatInstructions(),
    });

    const response = await this.llm.invoke(formattedPrompt);
    return await this.parser.parse(response.content as string) as InformationSearchOutput;
  }
}
