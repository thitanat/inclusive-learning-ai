"use client";

import { useState, useEffect } from "react";
import { Container, Grid, Typography } from "@mui/material";
import ChatInput from "../components/ChatInput";
import JsonResponse from "../components/JsonResponse";
import LessonTopicModal from "../components/LessonTopicModal";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [jsonResponse, setJsonResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [nextQuestion, setNextQuestion] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    { question: string; userMessage: string; aiResponse?: string }[]
  >([]);
  const [modalOpen, setModalOpen] = useState(true); // Modal state for step 1
  const [lessonTopic, setLessonTopic] = useState(""); // Input for lesson topic

  // Generate a new session ID when the page loads
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session-${Date.now()}`;
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  const handleModalSubmit = async () => {
    if (!lessonTopic.trim()) return;

    setLoading(true);
    setModalOpen(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage: lessonTopic }),
      });

      const data = await res.json();

      if (data.type === "json") {
        setJsonResponse(data.lessonPlan);
        setStep(2); // Move to reflection questions
        setNextQuestion(data.nextQuestion || "");
      }
    } catch (error) {
      setTextResponse("Error fetching response.");
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || step === 1) return;

    setLoading(true);
    setTextResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage: prompt }),
      });

      const data = await res.json();

      if (data.type === "json") {
        setJsonResponse(data.lessonPlan || data.improvedLessonPlan); // Update JSON response
        setStep(2); // Move to reflection questions
      } else if (data.type === "text") {
        setTextResponse(data.nextQuestion || "No further questions.");
        setStep((prev) => prev + 1);
      }

      if (data.nextQuestion) setNextQuestion(data.nextQuestion);
      if (data.summary) setTextResponse(data.summary);
      if (data.conversation) {
        setConversationHistory(data.conversation);
      }
    } catch (error) {
      setTextResponse("Error fetching response.");
    }

    setPrompt(""); // Reset prompt
    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom align="center">
        Inclusive Learning - AI Lesson Plan Generator
      </Typography>

      {/* Modal for Step 1 */}
      <LessonTopicModal
        open={modalOpen}
        loading={loading}
        lessonTopic={lessonTopic}
        onClose={() => setModalOpen(false)}
        onChange={(e) => setLessonTopic(e.target.value)}
        onSubmit={handleModalSubmit}
      />

      <Grid container spacing={3}>
        {/* Input & Text Response */}
        <Grid item xs={12} md={6}>
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            nextQuestion={nextQuestion}
            loading={loading}
            handleSubmit={handleSubmit}
            conversationHistory={conversationHistory}
          />
        </Grid>

        {/* JSON Response */}
        <Grid item xs={12} md={6}>
          <JsonResponse jsonResponse={jsonResponse} />
        </Grid>
      </Grid>
    </Container>
  );
}
