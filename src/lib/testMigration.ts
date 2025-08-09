/**
 * Quick Testing Guide for the New Agentic Workflow System
 * 
 * Use these examples to test that the migration was successful
 */

// 1. Test the API endpoint with a real request
const testApiRequest = async () => {
  const response = await fetch('/api/chat/step/0', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token'
    },
    body: JSON.stringify({
      sessionId: 'your-session-id',
      subject: 'วิทยาศาสตร์',
      lessonTopic: 'แรงและการเคลื่อนที่',
      level: 'ม.1'
    })
  });
  
  const data = await response.json();
  
  // Check for new agentic metadata
  console.log('Response:', data.response);
  console.log('Confidence:', data.agenticMetadata.confidence);
  console.log('Sources:', data.agenticMetadata.sourcesUsed);
  console.log('Steps:', data.agenticMetadata.processingSteps);
};

// 2. Test the agentic workflow directly
import { callAgenticQueryLLM } from '@/lib/agenticQueryLLM';

const testDirectWorkflow = async () => {
  const result = await callAgenticQueryLLM(
    'ออกแบบจุดประสงค์การเรียนรู้สำหรับวิทยาศาสตร์ ม.1 เรื่องแรงและการเคลื่อนที่',
    '1_0',
    {
      subject: 'วิทยาศาสตร์',
      level: 'ม.1',
      topic: 'แรงและการเคลื่อนที่'
    }
  );
  
  console.log('Content:', result.content);
  console.log('Confidence:', result.confidence);
  console.log('Sources:', result.sources);
  console.log('Processing Steps:', result.processingSteps);
};

// 3. Test individual agents
import { AgenticWorkflow } from '@/lib/agents/agenticWorkflow';

const testIndividualWorkflow = async () => {
  const workflow = new AgenticWorkflow();
  
  const result = await workflow.executeWorkflow({
    task: 'หาข้อมูลมาตรฐานการเรียนรู้สำหรับวิทยาศาสตร์ ม.1',
    stepType: '0',
    context: 'Testing curriculum search'
  });
  
  console.log('Workflow Result:', result);
};

// 4. Compare with old system (for validation)
import { callQueryLLM } from '@/lib/queryLLM';

const compareOldVsNew = async () => {
  const task = 'ออกแบบกิจกรรมการเรียนรู้สำหรับวิทยาศาสตร์ ม.1';
  
  // Old way (if still available for comparison)
  console.log('🕐 Testing old system...');
  const oldResult = await callQueryLLM(task, '2_0', false);
  console.log('Old Result Type:', typeof oldResult);
  console.log('Old Result Length:', JSON.stringify(oldResult).length);
  
  // New way
  console.log('🚀 Testing new system...');
  const newResult = await callAgenticQueryLLM(task, '2_0', {
    subject: 'วิทยาศาสตร์',
    level: 'ม.1'
  });
  console.log('New Result Type:', typeof newResult.content);
  console.log('New Result Length:', JSON.stringify(newResult.content).length);
  console.log('New Confidence:', newResult.confidence);
  console.log('New Sources:', newResult.sources);
};

// 5. Test error handling
const testErrorHandling = async () => {
  try {
    // Test with invalid data
    const result = await callAgenticQueryLLM(
      '', // Empty task
      'invalid_step',
      {}
    );
    console.log('Unexpected success:', result);
  } catch (error) {
    console.log('✅ Error handling working:', error instanceof Error ? error.message : String(error));
  }
};

export {
  testApiRequest,
  testDirectWorkflow,
  testIndividualWorkflow,
  compareOldVsNew,
  testErrorHandling
};
