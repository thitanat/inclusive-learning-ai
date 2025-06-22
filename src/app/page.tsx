"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Box,
  Backdrop,
} from "@mui/material";
import axios from "axios";
import ChatInput from "../components/ChatInput";
import JsonResponse from "../components/JsonResponse";
import ConfigModal, { stepConfigFields } from "../components/ConfigModal"; // Renamed import
import PdfResponse from "../components/PdfResponse";
import dynamic from "next/dynamic";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DownloadIcon from "@mui/icons-material/Download";
import LoginModal from "@/components/LoginModal";

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
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const router = useRouter();

  const fetchSession = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoginModalOpen(true);
        return;
      }
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
              setLoginModalOpen(true);
              return;
            }
            setGenerateStep(1);

            if (!data.configStep) {
              setConfigStep(0);
              setModalOpen(true);
            } else {
              setConfigStep(data.configStep - 1 ?? 0);
              if (data.configResponse) {
                setConfigResponse(data.configResponse || {});
                setShowResponse(true);
              }
              setModalOpen(true);
            }
          })
          .catch((error) => {
            console.error("Error fetching session data:", error);
            setLoginModalOpen(true);
          });
      } catch (error) {
        console.error("Invalid token:", error);
        setLoginModalOpen(true);
      }
    };

  useEffect(() => {
    fetchSession();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoginModalOpen(true); // Show login modal after logout
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
      <LoginModal
        open={loginModalOpen}
        onLoginSuccess={() => {
          setLoginModalOpen(false);
          fetchSession(); // <-- Fetch session after login
        }}
      />
      {/* Backdrop Spinner for Modal */}
      <Backdrop
        sx={{
          color: "#333",
          zIndex: (theme) => theme.zIndex.modal + 1,
          backgroundColor: "transparent",
          backdropFilter: "blur(6px)",
          flexDirection: "column",
        }}
        open={loading && modalOpen}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          กำลังประมวลผลข้อมูลหลักสูตร อาจใช้เวลา 2-3 นาที
        </Typography>
      </Backdrop>

      {/* Loading Spinner for page (when modal not open) */}
      {loading && !modalOpen && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ my: 4 }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Main content with blur effect when any modal is open */}
      <Box
        sx={{
          filter: loginModalOpen ? "blur(6px)" : "none",
          pointerEvents: loginModalOpen ? "none" : "auto",
          transition: "filter 0.3s",
        }}
      >
        <Box
          sx={{
            boxShadow: "0px 8px 24px rgba(0,0,0,0.18)", // Dropdown-like shadow
            borderRadius: 2,
            p: 3,
            backgroundColor: "#fff",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ flex: 1 }}>
              Inclusive Learning
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ minWidth: 0, px: 1.5 }}
              >
                Logout
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<DeleteSweepIcon />}
                onClick={handleClearSession}
                sx={{ minWidth: 0, px: 1.5 }}
              >
                Clear Session
              </Button>
            </Box>
          </Box>
        </Box>

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

        <Box
          sx={{
            boxShadow: "0px 8px 24px rgba(0,0,0,0.18)", // Dropdown-like shadow
            borderRadius: 2,
            p: 3,
            backgroundColor: "#fff",
            mb: 3,
          }}
        >
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
                    startIcon={<DownloadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Download Curriculum (.docx)
                  </Button>
                  <Typography variant="body1" gutterBottom>
                    เอกสารอาจแสดงผลไม่ถูกต้องบนเบราว์เซอร์ กรุณากด "Download
                    Curriculum (.docx)" เพื่อดาวน์โหลดเอกสารและเปิดด้วยโปรแกรม
                    Microsoft Word หรือ LibreOffice
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
        </Box>
      </Box>
    </Container>
  );
}
