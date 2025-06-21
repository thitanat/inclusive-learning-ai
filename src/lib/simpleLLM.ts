import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { docsQuery } from "@/lib/docsQuery";
import { getChatPromptTemplate } from "@/lib/chatPromptTemplates";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export async function callQueryLLM(
  task: string,
) {
  console.log("🔍 Calling Simple LLM with prompt:");
  try {
    const chatModel = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.7,
      openAIApiKey: OPENAI_API_KEY,
    });
    const response = await chatModel.invoke(task);
    console.log("✅ LLM response (no retrieval):", response.content);
    return response.content;
  } catch (error) {
    console.error("❌ LangChain/OpenAI Error:", error);
    throw new Error("Failed to get AI response");
  }
}
