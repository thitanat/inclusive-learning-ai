"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Grid, Typography } from "@mui/material";
import axios from "axios"; // Import axios
import ChatInput from "../components/ChatInput";
import JsonResponse from "../components/JsonResponse";
import LessonTopicModal from "../components/LessonTopicModal";

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [jsonResponse, setJsonResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [nextQuestion, setNextQuestion] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    { question: string; userMessage: string; aiResponse?: string }[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);

  // New fields
  const [lessonTopic, setLessonTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [studentType, setStudentType] = useState("");
  const [learningTime, setLearningTime] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [limitation, setLimitation] = useState("");

  const router = useRouter();

  // Fetch session data on login or refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      router.push("/login");
    } else {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT to extract userId
      setUserId(decodedToken.userId);

      // Fetch session data from the server
      axios
        .get("/api/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const data = res.data;
          if (data.error) {
            console.error(data.error);
            return;
          }

          // Update state with session data
          const fetchedStep = data.step || 1;
          setStep(fetchedStep);
          setConversationHistory(data.conversationHistory || []);
          setJsonResponse(data.lessonPlan || null);
          setNextQuestion(data.nextQuestion || "");

          // Open modal only if step is 1
          if (fetchedStep === 1) {
            setModalOpen(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
        });
    }
  }, [router]);

  const handleModalSubmit = async () => {
    if (
      !lessonTopic.trim() ||
      !subject.trim() ||
      !level.trim() ||
      !ageRange.trim() ||
      !studentType.trim() ||
      !learningTime.trim() ||
      !timeSlot.trim() ||
      !limitation.trim()
    )
      return;

    setLoading(true);
    setModalOpen(false);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/chat",
        {
          userId,
          lessonTopic,
          subject,
          level,
          ageRange,
          studentType,
          learningTime,
          timeSlot,
          limitation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;

      if (data.type === "json") {
        setJsonResponse(data.lessonPlan);
        setStep(2);
        setNextQuestion(data.nextQuestion || "");
      }
    } catch (error) {
      setTextResponse("Error fetching response.");
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || step === 1) return;

    setLoading(true);
    setTextResponse("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/chat",
        { userId, userMessage: prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;

      if (data.type === "json") {
        setJsonResponse(data.lessonPlan || data.improvedLessonPlan);
        setStep(2);
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

    setPrompt("");
    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom align="center">
        Inclusive Learning - AI Lesson Plan Generator
      </Typography>

      <LessonTopicModal
        open={step === 1 && modalOpen} // Ensure modal only opens when step is 1
        loading={loading}
        lessonTopic={lessonTopic}
        subject={subject}
        level={level}
        ageRange={ageRange}
        studentType={studentType}
        learningTime={learningTime}
        timeSlot={timeSlot}
        limitation={limitation}
        onClose={() => setModalOpen(false)}
        onChange={(field, value) => {
          switch (field) {
            case "lessonTopic":
              setLessonTopic(value);
              break;
            case "subject":
              setSubject(value);
              break;
            case "level":
              setLevel(value);
              break;
            case "ageRange":
              setAgeRange(value);
              break;
            case "studentType":
              setStudentType(value);
              break;
            case "learningTime":
              setLearningTime(value);
              break;
            case "timeSlot":
              setTimeSlot(value);
              break;
            case "limitation":
              setLimitation(value);
              break;
            default:
              break;
          }
        }}
        onSubmit={handleModalSubmit}
      />

      <Grid container spacing={3}>
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

        <Grid item xs={12} md={6}>
          <JsonResponse jsonResponse={jsonResponse} />
        </Grid>
      </Grid>
    </Container>
  );
}
