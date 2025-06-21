"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Grid, Typography, Button } from "@mui/material";
import axios from "axios";
import ChatInput from "../components/ChatInput";
import JsonResponse from "../components/JsonResponse";
import ConfigModal, { stepConfigFields } from "../components/ConfigModal"; // Renamed import
import PdfResponse from "../components/PdfResponse";
import dynamic from "next/dynamic";

const FileViewer = dynamic(() => import("react-file-viewer"), { ssr: false });

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generateTextResponse, setGenerateTextResponse] = useState("");
  const [configResponse, setConfigResponse] = useState("");
  const [generateJsonResponse, setGenerateJsonResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generateStep, setGenerateStep] = useState(0);
  const [nextQuestion, setNextQuestion] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    { question: string; userMessage: string; aiResponse?: string }[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [configStep, setConfigStep] = useState(0); // Renamed state
  const [configFields, setConfigFields] = useState({
    // Renamed state
    subject: "",
    lessonTopic: "",
    level: "",
    numStudents: "",
    studentType: [{ type: "", percentage: "" }],
    learningTime: "",
    timeSlot: "",
    limitation: "",
  });
  const [showResponse, setShowResponse] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  const [fileViewError, setFileViewError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserId(decodedToken.userId);

        axios
          .get("/api/session", {
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

            const fetchedStep = data.step || 1;
            setGenerateStep(fetchedStep);
            // Set initial config fields if they exist
            if (fetchedStep === 1) {
              setModalOpen(true);
            }
            if (!data.configStep) {
              setConfigStep(0);
            } else {
              setConfigStep(data.configStep - 1 ?? 0);
            }
            console.log(data.configStep);
            if (data.configResponse) {
              setConfigResponse(data.configResponse || {});
              console.log("Config response:", data.configResponse);
              setShowResponse(true);
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
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleConfigNextStep = async () => {
    // Renamed handler
    if (!showResponse) return;
    const nextStep = configStep + 1;
    console.log("configStep:", configStep);
    setConfigStep(nextStep);
    setShowResponse(false);
    setConfigResponse("");

    if (stepConfigFields[nextStep] && stepConfigFields[nextStep].length === 0) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `/api/chat/step/${nextStep}`,
          { ...configFields, userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = res.data;
        setConfigResponse(data.response);
        setShowResponse(true);
      } catch (error) {
        console.error("Error auto-advancing step:", error);
      }
      setLoading(false);
    }
  };

  const handleConfigFieldChange = (field: string, value: any) => {
    // Renamed handler
    setShowResponse(false);
    setConfigResponse("");
    if (field === "studentType") {
      setConfigFields((prev) => ({
        ...prev,
        studentType: value,
      }));
    } else {
      setConfigFields((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleConfigStepSubmit = async () => {
    // Renamed handler
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await axios.post(
        `/api/chat/step/${configStep}`,
        { ...configFields, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;
      setConfigResponse(data.response);
      setShowResponse(true);
    } catch (error) {
      console.error("Error advancing step:", error);
    }

    setLoading(false);
  };

  const handleConfigPreviousStep = () => {
    // Renamed handler

    if (showResponse) {
      setShowResponse(false);
      setConfigResponse("");
    } else {
      setLoading(false);
      setConfigStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleModalSubmit = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/generate",
        { ...configFields, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "arraybuffer", // Important for binary data
        }
      );

      const contentType = res.headers["content-type"];
      if (
        contentType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Handle DOCX
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = URL.createObjectURL(blob);
        setDocxUrl(url);
        setPdfUrl(null);
        setGenerateJsonResponse(null);
        setGenerateStep(2);
      } else if (contentType === "application/pdf") {
        // Handle PDF
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setDocxUrl(null);
        setGenerateJsonResponse(null);
        setGenerateStep(2);
      } else {
        // Handle JSON/text
        const text = new TextDecoder().decode(res.data);
        const data = JSON.parse(text);

        if (data.type === "json") {
          setGenerateJsonResponse(data.lessonPlan || data.improvedLessonPlan);
          setPdfUrl(null);
          setDocxUrl(null);
          setGenerateStep(2);
        } else if (data.type === "text") {
          setGenerateTextResponse(data.nextQuestion || "No further questions.");
          setPdfUrl(null);
          setDocxUrl(null);
          setGenerateJsonResponse(null);
          setGenerateStep((prev) => prev + 1);
        }

        if (data.nextQuestion) setNextQuestion(data.nextQuestion);
        if (data.summary) setGenerateTextResponse(data.summary);
        if (data.conversation) {
          setConversationHistory(data.conversation);
        }
        setGenerateJsonResponse(data.lessonPlan);
        setGenerateStep(2);
        setModalOpen(false);
      }
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

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
        <Button variant="outlined" color="warning" onClick={handleClearSession}>
          Clear Session
        </Button>
      </div>

      <ConfigModal
        open={generateStep === 1 && modalOpen}
        loading={loading}
        configStep={configStep}
        configFields={configFields}
        response={configResponse}
        showResponse={showResponse}
        onClose={() => setModalOpen(false)}
        onChange={handleConfigFieldChange}
        onStepSubmit={handleConfigStepSubmit}
        onSubmit={handleModalSubmit}
        onNextStep={handleConfigNextStep}
        onPreviousStep={handleConfigPreviousStep}
        maxWidth="lg"
        fullWidth={true}
      />

      <Grid container spacing={3}>
        {/* <Grid item xs={12} md={6}>
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            nextQuestion={nextQuestion}
            loading={loading}
            handleSubmit={handleModalSubmit}
            conversationHistory={conversationHistory}
          />
        </Grid> */}

        <Grid item xs={12} md={20}>
          {docxUrl ? (
            <>
              {/* Download button always on top */}
              <Button
                variant="contained"
                color="primary"
                href={docxUrl}
                download="curriculum.docx"
                sx={{ mb: 2 }}
              >
                Download Curriculum (.docx)
              </Button>
                <Typography variant="body1" gutterBottom>
                เอกสารอาจแสดงผลไม่ถูกต้องบนเบราว์เซอร์ กรุณากด "Download Curriculum (.docx)" เพื่อดาวน์โหลดเอกสารและเปิดด้วยโปรแกรม Microsoft Word หรือ LibreOffice
                </Typography>
              {!fileViewError ? (
                <div
                  style={{
                    width: "100%",
                    height: "80vh",
                    overflow: "auto", // Enable both x and y scrolling
                    border: "1px solid #ccc",
                  }}
                >
                  <FileViewer
                    fileType="docx"
                    filePath={docxUrl}
                    onError={() => setFileViewError(true)}
                  />
                </div>
              ) : (
                <Typography color="error" sx={{ mt: 2 }}>
                  Unable to preview DOCX. Please download the file.
                </Typography>
              )}
            </>
          ) : pdfUrl ? (
            <PdfResponse pdfUrl={pdfUrl} />
          ) : (
            <Typography>No document available.</Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
