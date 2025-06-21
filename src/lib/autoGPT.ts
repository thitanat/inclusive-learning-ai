import { ChatOpenAI } from "@langchain/openai";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { getChatPromptTemplate } from "@/lib/chatPromptTemplates";
import { AutoGPT } from "langchain/experimental/autogpt";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export async function callAutoGPT(
  task: string,
) {
  console.log("🔍 Calling AutoGPT");
  try {
    const tools = [
      new SerpAPI(process.env.SERPAPI_API_KEY || "", {
        engine: "google",
        hl: "th",
        gl: "th",
      }),
    ]

    const chatModel = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.7,
      openAIApiKey: OPENAI_API_KEY,
    });

    const autogpt = AutoGPT.fromLLMAndTools(
      chatModel,
      tools,
      {
        memory: new MemoryVectorStore(new OpenAIEmbeddings()).asRetriever(),
        aiName: "AI ผู้ออกแบบกิจกรรมการเรียนรู้",
        aiRole: "ออกแบบกิจกรรมการเรียนรู้",
        humanInTheLoop: true,
        maxIterations: 10,
      }
    );
    const response = await autogpt.run([task]);
    console.log("✅ LLM response (no retrieval):", response);
    return response;
  } catch (error) {
    console.error("❌ LangChain/OpenAI Error:", error);
    throw new Error("Failed to get AI response");
  }
}
