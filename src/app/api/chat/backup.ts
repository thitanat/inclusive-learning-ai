import axios from "axios";
import { NextResponse } from "next/server";
import { getSession, createSession, updateSession } from "@/models/session";
import { connectDB } from "@/lib/db";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// Reflection questions mapped by step
const questions: { [key: number]: string } = {
  1: "How practical do you think this lesson plan is? Are there any limitations?",
  2: "What do you predict the learning outcomes will be?",
  3: "Does the lesson plan align with its objectives? (Provide key points)",
  4: "Do you think the structure of this lesson makes sense?",
  5: "What are the weaknesses in this lesson plan?",
};

// OpenAI API Call Using Axios
async function callOpenAI(prompt: string) {
  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch AI response");
  }
}

// ✅ Export POST Method for Next.js API Route
export async function POST(req: Request) {
  await connectDB();
  const { sessionId, userMessage } = await req.json();

  if (!sessionId || !userMessage) {
    return NextResponse.json({ error: "Missing sessionId or userMessage." }, { status: 400 });
  }

  let session = await getSession(sessionId);

  try {
    // **Step 1: Generate Lesson Plan (JSON)**
    if (!session) {
      console.log(`🆕 Creating new session: ${sessionId}`);

      const prompt = `Create a structured lesson plan for "${userMessage}" using UDL, MTSS, and Bloom's Taxonomy.
                      Respond in JSON format with the following keys: "lesson_title", "objectives", "activities", "assessment_methods".`;

      const lessonPlan = await callOpenAI(prompt);

      await createSession({
        sessionId,
        step: 2,
        lessonPlan,
        responses: {},
        improvedLessonPlan: "",
      });

      return NextResponse.json({ type: "json", lessonPlan: JSON.parse(lessonPlan), nextQuestion: questions[1], });
    }

    // **Steps 2-6: Reflection Questions with AI Response**
    if (session.step >= 2 && session.step <= 5) {
      console.log(`✍️ AI answering reflection step ${session.step} for session: ${sessionId}`);

      session.responses[`step${session.step}`] = userMessage;

      // Build context using previous responses
      let context = "";
      for (let i = 2; i < session.step; i++) {
        if (session.responses[`step${i}`]) {
          context += `Question ${i}: ${questions[i]}\nUser Response: ${session.responses[`step${i}`]}\n\n`;
        }
      }

      // Create AI prompt using context
      const aiPrompt = `You are evaluating a lesson plan using reflective teaching methods.
        Previous reflections:\n${context}
        Current question: "${questions[session.step]}"
        User's latest response: "${userMessage}"
        Based on this, provide an AI response summarizing insights from the discussion.`;

      const aiResponse = await callOpenAI(aiPrompt);

      await updateSession(sessionId, {
        [`responses.step${session.step}`]: userMessage,
        step: session.step + 1,
      });

      if (session.step <= 5) {
        return NextResponse.json({
          type: "text",
          summary: aiResponse,
          nextQuestion: questions[session.step],
        });
      }
    }

    // **Final Step: Generate Improved Lesson Plan (JSON)**
    if (session.step > 5) {
      console.log(`🔄 Generating improved lesson plan for session: ${sessionId}`);
      const prompt = `Analyze the following teacher feedback and improve the lesson plan accordingly:\n
                      Feedback: ${JSON.stringify(session.responses)}
                      Original Lesson Plan: ${session.lessonPlan}
                      Respond in JSON format with the following keys: "lesson_title", "objectives", "activities", "assessment_methods".`;

      const improvedLessonPlan = await callOpenAI(prompt);

      await updateSession(sessionId, {
        improvedLessonPlan,
        step: "completed",
      });

      return NextResponse.json({ type: "json", improvedLessonPlan: JSON.parse(improvedLessonPlan) });
    }

    return NextResponse.json({ error: "Invalid step or session state." }, { status: 400 });
  } catch (error) {
    console.error(`❌ Error processing session ${sessionId}:`, error.message);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
