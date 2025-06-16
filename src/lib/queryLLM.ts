import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { docsQuery } from "@/lib/docsQuery";
import { getChatPromptTemplate } from "@/lib/chatPromptTemplates";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const promptType = "query";
export async function callQueryLLM(task: string, query: string, needToRetrieve: boolean) {
  console.log("🔍 Calling Simple LLM with prompt:");
  try {
    const chatModel = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.7,
      openAIApiKey: OPENAI_API_KEY,
    });
    if (!needToRetrieve) {
      console.log("ℹ️ Skipping retrieval, using LLM directly");
      const response = await chatModel.invoke(task);
      console.log("✅ LLM response (no retrieval):", response.content);
      return response.content;
    }

    // Retrieval and document chain process
    const lessonPlanGuidelinePath = process.cwd() + "/src/data/curriculum.csv";
    const curriculumQuery = await docsQuery(lessonPlanGuidelinePath);
    const curriculumDocs = await curriculumQuery.getRelevantDocuments(task);
    console.log("📥 Retrieved relevant guideline docs");

    const prompt = getChatPromptTemplate(promptType, query);

    const documentChain = await createStuffDocumentsChain({
      llm: chatModel,
      prompt,
    });

    const response = await documentChain.invoke({
      task: task,
      context: curriculumDocs,
    });

    console.log("✅ LLM response:", response);
    return response;
  } catch (error) {
    console.error("❌ LangChain/OpenAI Error:", error);
    throw new Error("Failed to get AI response");
  }
}
