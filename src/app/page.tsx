"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Grid, Typography, Button } from "@mui/material";
import axios from "axios"; // Import axios
import ChatInput from "../components/ChatInput";
import JsonResponse from "../components/JsonResponse";
import LessonTopicModal, { stepcurriculumFields } from "../components/LessonTopicModal";

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [modalResponse, setModalResponse] = useState("");
  const [jsonResponse, setJsonResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [nextQuestion, setNextQuestion] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    { question: string; userMessage: string; aiResponse?: string }[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [curriculumFields, setCurriculumFields] = useState({
    subject: "",
    lessonTopic: "",
    level: "",
    numStudents: "",
    studentType: [{ type: "", percentage: "" }], // <-- Change here
    learningTime: "",
    timeSlot: "",
    limitation: "",
  });
  const [showResponse, setShowResponse] = useState(false);

  const router = useRouter();

  // Fetch session data on login or refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
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
              router.push("/login");
              return;
            }

            // Restore step and currentStep from session
            const fetchedStep = data.step || 1;
            setStep(fetchedStep);

            // Set currentStep for modal navigation
            setCurrentStep(data.currentStep ?? 0);
            //setConversationHistory(data.conversationHistory || []);
            //setJsonResponse(data.lessonPlan || null);
            //setNextQuestion(data.nextQuestion || "");

            // Open modal if step is within curriculum steps
            if (fetchedStep === 1) {
              setModalOpen(true);
            }
          })
          .catch((error) => {
            console.error("Error fetching session data:", error);
            router.push("/login");
          });
      } catch (error) {
        console.error("Invalid token:", error);
        router.push("/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    router.push("/login"); // Redirect to the login page
  };

  const handleCurriculumNextStep = async () => {
    if (!showResponse) return;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setShowResponse(false);
    setModalResponse(""); // Clear response for next step

    // If the next step has no input fields, auto-submit and show output
    if (
      stepcurriculumFields[nextStep] &&
      stepcurriculumFields[nextStep].length === 0
    ) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `/api/chat/step/${nextStep}`,
          { ...curriculumFields, userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = res.data;
        setModalResponse(data.response);
        setShowResponse(true);
      } catch (error) {
        console.error("Error auto-advancing step:", error);
      }
      setLoading(false);
    }
  };

  const handleCurriculumFieldChange = (field: string, value: any) => {
    setShowResponse(false); // Hide response if user edits input
    setModalResponse("");   // Clear previous response
    if (field === "studentType") {
      setCurriculumFields((prev) => ({
        ...prev,
        studentType: value,
      }));
    } else {
      setCurriculumFields((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCurriculumStepSubmit = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await axios.post(
        `/api/chat/step/${currentStep}`,
        { ...curriculumFields, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;
      setModalResponse(data.response); // Show response
      setShowResponse(true);
    } catch (error) {
      console.error("Error advancing step:", error);
    }

    setLoading(false);
  };

  const handleCurriculumPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleModalSubmit = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/chat",
        { ...curriculumFields, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;
      console.log("Modal submit response:", data);
      if (data.type === "json") {
        console.log("Received JSON response:", data.lessonPlan);
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
      // Handle final submission response
      setJsonResponse(data.lessonPlan);
      setStep(2);
      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting modal:", error);
    }

    setLoading(false);
  };

  const handleClearSession = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/auth/clear_session",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Session cleared successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom align="center">
        Inclusive Learning
      </Typography>

      {/* Logout and Clear Session Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={handleClearSession}
        >
          Clear Session
        </Button>
      </div>

      <LessonTopicModal
        open={step === 1 && modalOpen}
        loading={loading}
        currentStep={currentStep}
        curriculumFields={curriculumFields}
        response={modalResponse}
        showResponse={showResponse}
        onClose={() => setModalOpen(false)}
        onChange={handleCurriculumFieldChange}
        onStepSubmit={handleCurriculumStepSubmit}
        onSubmit={handleModalSubmit}
        onNextStep={handleCurriculumNextStep}
        onPreviousStep={handleCurriculumPreviousStep}
        maxWidth="lg"
        fullWidth={true}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            nextQuestion={nextQuestion}
            loading={loading}
            handleSubmit={handleModalSubmit}
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
