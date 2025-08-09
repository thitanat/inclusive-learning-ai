import { AgenticWorkflow } from "@/lib/agents/agenticWorkflow";
import { ChatOpenAI } from "@langchain/openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Legacy function interface maintained for backward compatibility
export async function callQueryLLM(task: string, query: string, needToRetrieve: boolean) {
  console.log("🔍 Calling Agentic Query LLM with prompt:");
  console.log("📝 Task:", task);
  console.log("🔢 Query:", query);
  console.log("📚 Need to retrieve:", needToRetrieve);

  try {
    if (!needToRetrieve) {
      console.log("ℹ️ Skipping retrieval, using LLM directly");
      const chatModel = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0.7,
        openAIApiKey: OPENAI_API_KEY,
      });
      const response = await chatModel.invoke(task);
      console.log("✅ LLM response (no retrieval):", response.content);
      return response.content;
    }

    // Use the new agentic workflow
    const agenticWorkflow = new AgenticWorkflow();
    
    const result = await agenticWorkflow.executeWorkflow({
      task: task,
      stepType: query,
      context: `Query type: ${query}, Retrieval needed: ${needToRetrieve}`,
    });

    console.log("✅ Agentic workflow response completed");
    console.log("📊 Confidence:", result.confidence);
    console.log("📚 Sources used:", result.sourcesUsed);
    console.log("🔄 Processing steps:", result.processingSteps);

    return result.result;

  } catch (error) {
    console.error("❌ Agentic Query LLM Error:", error);
    throw new Error("Failed to get AI response from agentic workflow");
  }
}

// New enhanced agentic function with full workflow control
export async function callAgenticQueryLLM(
  task: string, 
  stepType: string, 
  sessionData?: any,
  options?: {
    forceDocumentSearch?: boolean;
    forceInformationSearch?: boolean;
    documentPath?: string;
  }
) {
  console.log("🚀 Calling Enhanced Agentic Query LLM");
  console.log("📝 Task:", task);
  console.log("🔄 Step Type:", stepType);

  try {
    const agenticWorkflow = new AgenticWorkflow();
    
    const result = await agenticWorkflow.executeWorkflow({
      task: task,
      stepType: stepType,
      sessionData: sessionData,
      context: `Step: ${stepType}, Session: ${JSON.stringify(sessionData)}`,
    });

    console.log("✅ Enhanced agentic workflow completed");
    console.log("📊 Final confidence:", result.confidence);
    console.log("📚 All sources:", result.sourcesUsed);
    console.log("🔄 All steps:", result.processingSteps);

    return {
      content: result.result,
      confidence: result.confidence,
      sources: result.sourcesUsed,
      processingSteps: result.processingSteps,
    };

  } catch (error) {
    console.error("❌ Enhanced Agentic Query LLM Error:", error);
    throw new Error("Failed to get AI response from enhanced agentic workflow");
  }
}
