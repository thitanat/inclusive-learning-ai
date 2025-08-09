import { callQueryLLM } from "@/lib/queryLLM";           // ❌ Old system
import { callAgenticQueryLLM } from "@/lib/agenticQueryLLM";  // ✅ New agentic system

/**
 * Migration Guide: From Simple LLM to Agentic Workflow
 * 
 * This file shows how to migrate from the existing queryLLM system
 * to the new agentic workflow system for better performance and reliability.
 */

// ========================================
// 1. BASIC MIGRATION
// ========================================

async function migrateBasicQuery() {
  // ❌ OLD WAY: Simple query
  const oldResult = await callQueryLLM(
    "หาข้อมูลมาตรฐานการเรียนรู้สำหรับวิทยาศาสตร์ ม.1",
    "0_0",
    true
  );

  // ✅ NEW WAY: Agentic workflow
  const newResult = await callAgenticQueryLLM(
    "หาข้อมูลมาตรฐานการเรียนรู้สำหรับวิทยาศาสตร์ ม.1",
    "0_0",
    {
      subject: "วิทยาศาสตร์",
      level: "ม.1"
    }
  );

  // Enhanced result includes metadata
  console.log("Content:", newResult.content);
  console.log("Confidence:", newResult.confidence);
  console.log("Sources:", newResult.sources);
  console.log("Processing Steps:", newResult.processingSteps);
}

// ========================================
// 2. ROUTE HANDLER MIGRATION
// ========================================

// ❌ OLD WAY: Route handler
async function oldRouteHandler(body: any, sessionId: string) {
  const task = `กลุ่มสาระ: ${body.subject} เรื่อง: ${body.lessonTopic} ระดับชั้น: ${body.level}`;
  const data = await callQueryLLM(task, "0_0", true);
  
  return {
    response: data,
  };
}

// ✅ NEW WAY: Agentic route handler
async function newRouteHandler(body: any, sessionId: string) {
  const task = `กลุ่มสาระ: ${body.subject} เรื่อง: ${body.lessonTopic} ระดับชั้น: ${body.level}`;
  
  const agenticResult = await callAgenticQueryLLM(task, "0_0", {
    subject: body.subject,
    lessonTopic: body.lessonTopic,
    level: body.level,
    sessionId: sessionId,
  });

  return {
    response: agenticResult.content,
    agenticMetadata: {
      confidence: agenticResult.confidence,
      sourcesUsed: agenticResult.sources,
      processingSteps: agenticResult.processingSteps,
    }
  };
}

// ========================================
// 3. COMPLEX TASK MIGRATION
// ========================================

// ❌ OLD WAY: Multiple sequential calls
async function oldComplexTask(sessionData: any) {
  const task1 = "ออกแบบจุดประสงค์การเรียนรู้...";
  const result1 = await callQueryLLM(task1, "1_0", false);
  
  const task2 = "ออกแบบกิจกรรมการเรียนรู้...";
  const result2 = await callQueryLLM(task2, "2_0", false);
  
  return { result1, result2 };
}

// ✅ NEW WAY: Single agentic workflow with context
async function newComplexTask(sessionData: any) {
  const comprehensiveTask = `
    ออกแบบแผนการเรียนการสอนที่สมบูรณ์ ประกอบด้วย:
    1. จุดประสงค์การเรียนรู้ 3 ด้าน
    2. กิจกรรมการเรียนรู้แบบ UDL
    3. การวัดและประเมินผล
    
    สำหรับ: ${sessionData.subject} ${sessionData.level}
  `;
  
  const agenticResult = await callAgenticQueryLLM(
    comprehensiveTask, 
    "comprehensive", 
    sessionData
  );

  return {
    content: agenticResult.content,
    metadata: {
      confidence: agenticResult.confidence,
      sources: agenticResult.sources,
      processingSteps: agenticResult.processingSteps,
    }
  };
}

// ========================================
// 4. ERROR HANDLING MIGRATION
// ========================================

// ❌ OLD WAY: Basic error handling
async function oldErrorHandling(task: string) {
  try {
    const result = await callQueryLLM(task, "0_0", true);
    return result;
  } catch (error) {
    throw new Error("Failed to get AI response");
  }
}

// ✅ NEW WAY: Enhanced error handling with fallbacks
async function newErrorHandling(task: string, sessionData: any) {
  try {
    const result = await callAgenticQueryLLM(task, "0_0", sessionData);
    
    // Check confidence level for quality assurance
    if (result.confidence < 0.5) {
      console.warn("⚠️ Low confidence result:", result.confidence);
      console.warn("📚 Sources used:", result.sources);
      
      // Could implement fallback logic here
      // e.g., try different approach or request human review
    }
    
    return result;
  } catch (error) {
    console.error("❌ Agentic workflow failed:", error);
    
    // Fallback to simple LLM if agentic workflow fails
    try {
      const fallbackResult = await callQueryLLM(task, "0_0", false);
      return {
        content: fallbackResult,
        confidence: 0.3, // Lower confidence for fallback
        sources: ["Fallback LLM"],
        processingSteps: ["Fallback processing"],
      };
    } catch (fallbackError) {
      throw new Error("Both agentic and fallback processing failed");
    }
  }
}

// ========================================
// 5. PERFORMANCE COMPARISON
// ========================================

async function performanceComparison() {
  const task = "ออกแบบกิจกรรมการเรียนรู้สำหรับวิทยาศาสตร์ ม.1";
  
  console.log("🚀 Performance Comparison");
  console.log("=" .repeat(50));
  
  // Old system timing
  const oldStart = Date.now();
  const oldResult = await callQueryLLM(task, "2_0", true);
  const oldTime = Date.now() - oldStart;
  
  // New system timing
  const newStart = Date.now();
  const newResult = await callAgenticQueryLLM(task, "2_0", {
    subject: "วิทยาศาสตร์",
    level: "ม.1"
  });
  const newTime = Date.now() - newStart;
  
  console.log("📊 Results:");
  console.log(`⏱️  Old System: ${oldTime}ms`);
  console.log(`⏱️  New System: ${newTime}ms`);
  console.log(`📈 Quality Score (New): ${newResult.confidence}`);
  console.log(`📚 Sources Used: ${newResult.sources.length}`);
  console.log(`🔄 Processing Steps: ${newResult.processingSteps.length}`);
}

// ========================================
// 6. MIGRATION CHECKLIST
// ========================================

/**
 * MIGRATION CHECKLIST:
 * 
 * ✅ 1. Install dependencies (already in package.json):
 *       - @langchain/openai
 *       - @langchain/community  
 *       - zod
 * 
 * ✅ 2. Environment variables:
 *       - OPENAI_API_KEY (existing)
 *       - SERPAPI_API_KEY (for external search)
 * 
 * ✅ 3. Update imports:
 *       - Replace callQueryLLM with callAgenticQueryLLM
 *       - Import AgenticWorkflow for direct usage
 * 
 * ✅ 4. Update function signatures:
 *       - Add sessionData parameter
 *       - Handle enhanced response format
 * 
 * ✅ 5. Update error handling:
 *       - Check confidence scores
 *       - Implement fallback strategies
 * 
 * ✅ 6. Update response handling:
 *       - Extract content from result.content
 *       - Optionally use metadata for UI enhancements
 * 
 * ✅ 7. Testing:
 *       - Run testAgenticWorkflow()
 *       - Compare results with old system
 *       - Monitor confidence scores
 */

export {
  migrateBasicQuery,
  newRouteHandler,
  newComplexTask,
  newErrorHandling,
  performanceComparison,
};
