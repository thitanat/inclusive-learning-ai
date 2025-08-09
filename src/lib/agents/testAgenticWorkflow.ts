import { AgenticWorkflow } from "@/lib/agents/agenticWorkflow";

/**
 * Test file to demonstrate the agentic workflow system
 * This shows how the three agents work together to process educational tasks
 */

async function testAgenticWorkflow() {
  console.log("🧪 กำลังทดสอบระบบ Agentic Workflow");
  console.log("=" .repeat(50));

  const workflow = new AgenticWorkflow();

  // Test Case 1: Simple curriculum query (should use document search)
  console.log("\n📚 กรณีทดสอบที่ 1: การค้นหาหลักสูตร");
  console.log("-".repeat(30));
  
  try {
    const result1 = await workflow.executeWorkflow({
      task: "หาข้อมูลมาตรฐานการเรียนรู้สำหรับวิทยาศาสตร์ ม.1 เรื่องแรงและการเคลื่อนที่",
      stepType: "0",
      context: "กำลังค้นหาข้อมูลหลักสูตร",
    });

    console.log("✅ ผลลัพธ์ 1:");
    console.log("📊 ความมั่นใจ:", result1.confidence);
    console.log("📚 แหล่งข้อมูล:", result1.sourcesUsed);
    console.log("🔄 ขั้นตอน:", result1.processingSteps);
    console.log("📝 ผลลัพธ์ (200 ตัวอักษรแรก):", result1.result.substring(0, 200) + "...");
    
  } catch (error) {
    console.error("❌ กรณีทดสอบที่ 1 ล้มเหลว:", error instanceof Error ? error.message : error);
  }

  // Test Case 2: Learning objective design (might use both document and information search)
  console.log("\n🎯 กรณีทดสอบที่ 2: จุดประสงค์การเรียนรู้");
  console.log("-".repeat(30));
  
  try {
    const result2 = await workflow.executeWorkflow({
      task: "ออกแบบจุดประสงค์การเรียนรู้ 3 ด้าน สำหรับเรื่องแรงและการเคลื่อนที่ ม.1",
      stepType: "1",
      sessionData: {
        subject: "วิทยาศาสตร์",
        level: "ม.1",
        topic: "แรงและการเคลื่อนที่"
      },
    });

    console.log("✅ ผลลัพธ์ 2:");
    console.log("📊 ความมั่นใจ:", result2.confidence);
    console.log("📚 แหล่งข้อมูล:", result2.sourcesUsed);
    console.log("🔄 ขั้นตอน:", result2.processingSteps);
    console.log("📝 ผลลัพธ์ (200 ตัวอักษรแรก):", result2.result.substring(0, 200) + "...");
    
  } catch (error) {
    console.error("❌ กรณีทดสอบที่ 2 ล้มเหลว:", error instanceof Error ? error.message : String(error));
  }

  // Test Case 3: Activity design (complex task requiring multiple sources)
  console.log("\n🎲 กรณีทดสอบที่ 3: การออกแบบกิจกรรม");
  console.log("-".repeat(30));
  
  try {
    const result3 = await workflow.executeWorkflow({
      task: "ออกแบบกิจกรรมการเรียนรู้แบบ UDL สำหรับห้องเรียนรวม เรื่องแรงและการเคลื่อนที่",
      stepType: "2",
      sessionData: {
        subject: "วิทยาศาสตร์",
        level: "ม.1",
        numStudents: 30,
        studyPeriod: 9,
        studentType: [
          { type: "นักเรียนปกติ", percentage: 70 },
          { type: "นักเรียนที่มีความสามารถพิเศษ", percentage: 15 },
          { type: "นักเรียนที่ต้องการความช่วยเหลือพิเศษ", percentage: 15 }
        ]
      },
    });

    console.log("✅ ผลลัพธ์ 3:");
    console.log("📊 ความมั่นใจ:", result3.confidence);
    console.log("📚 แหล่งข้อมูล:", result3.sourcesUsed);
    console.log("🔄 ขั้นตอน:", result3.processingSteps);
    console.log("📝 ผลลัพธ์ (300 ตัวอักษรแรก):", result3.result.substring(0, 300) + "...");
    
  } catch (error) {
    console.error("❌ กรณีทดสอบที่ 3 ล้มเหลว:", error instanceof Error ? error.message : String(error));
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 การทดสอบ Agentic Workflow เสร็จสิ้น!");
}

// Export for testing
export { testAgenticWorkflow };

// Uncomment the following line to run the test when this file is executed directly
// testAgenticWorkflow().catch(console.error);
