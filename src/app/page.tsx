"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Typography,
  Button,
  Backdrop,
  CircularProgress,
  Box,
} from "@mui/material";
import axios from "axios";
import ChatInput from "../components/ChatInput";
import JsonResponse from "../components/JsonResponse";
import ConfigModal, { stepConfigFields } from "../components/ConfigModal";
import PdfResponse from "../components/PdfResponse";
import dynamic from "next/dynamic";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DownloadIcon from "@mui/icons-material/Download";
import LoginModal from "@/components/LoginModal";
import ListIcon from "@mui/icons-material/List";


const FileViewer = dynamic(() => import("react-file-viewer"), { ssr: false });

// --- Centralized API call helper for 401 handling ---
async function apiCallWith401<T>(
  apiCall: () => Promise<T>,
  on401: () => void
): Promise<T | undefined> {
  try {
    return await apiCall();
  } catch (error: any) {
    if (
      (error?.response && error.response.status === 401) ||
      error?.status === 401 ||
      error?.status === 400
    ) {
      localStorage.removeItem("token");
      on401();
      return;
    }
    throw error;
  }
}

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
  const [configStep, setConfigStep] = useState(0);
  const [configFields, setConfigFields] = useState({
    subject: "",
    lessonTopic: "",
    level: "",
    numStudents: "",
    studentType: [{ type: "", percentage: "" }],
    studyPeriod: "",
    limitation: "",
  });
  const [showResponse, setShowResponse] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  const [fileViewError, setFileViewError] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [errorWarning, setErrorWarning] = useState(false);
  const [fileViewerKey, setFileViewerKey] = useState(0);
  const fileViewerContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Centralized fetchSession using apiCallWith401
  const fetchSession = (sessionId?: string | null) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoginModalOpen(true);
      return;
    }
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.userId);

      apiCallWith401(
        async () => {
          const res = await axios.post(
            "/api/session",
            { sessionId: sessionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = res.data;
          if (data.docxBuffer) {
            setModalOpen(false);
            const buffer = Buffer.from(data.docxBuffer, "base64");
            const url = URL.createObjectURL(
              new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              })
            );
            await setDocxUrl(null);
            console.log("Setting DOCX URL:", url);
            await setDocxUrl(url);
            setFileViewerKey((prev) => prev + 1);
          } else {
            setDocxUrl(null);
            setModalOpen(true);
            if (!data.configStep) {
              setConfigStep(0);
              setShowResponse(false);
            } else {
              setConfigStep(data.configStep - 1 ?? 0);
              if (data.configResponse) {
                setConfigResponse(data.configResponse || {});
                setShowResponse(true);
              }
            }
          }
        },
        () => setLoginModalOpen(true)
      );
    } catch (error) {
      localStorage.removeItem("token");
      setLoginModalOpen(true);
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      localStorage.setItem("selectedSessionId", selectedSessionId);
    } else {
      localStorage.removeItem("selectedSessionId");
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedSessionId) {
      setLoginModalOpen(false);
      fetchSession(selectedSessionId);
    } else {
      setLoginModalOpen("session");
    }
    // eslint-disable-next-line
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoginModalOpen(true);
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
          { ...configFields, sessionId: selectedSessionId },
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
    console.log("Submitting config step:", configStep);
    setLoading(true);
    await apiCallWith401(
      async () => {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `/api/chat/step/${configStep}`,
          { ...configFields, sessionId: selectedSessionId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = res.data;
        setConfigResponse(data.response);
        setShowResponse(true);
      },
      () => setLoginModalOpen(true)
    ).catch((error) => {
      if (error?.response && error.response.status === 404) {
        setErrorWarning(true);
        setShowResponse(false);
      } else {
        console.error("Error advancing step:", error);
      }
    });
    setLoading(false);
  };

  const handleConfigPreviousStep = async () => {
    // If previous step has no input fields, just go back a step

    if (showResponse) {
      setShowResponse(false);
      setConfigResponse("");
    } else {
      setLoading(true);
      await apiCallWith401(
        async () => {
          setConfigStep((prev) => Math.max(prev - 1, 0));
          const token = localStorage.getItem("token");
          const res = await axios.post(
            "/api/session",
            { sessionId: selectedSessionId, configStep: configStep },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = res.data;
          setConfigResponse(data.configResponse || "");
          setShowResponse(true);
        },
        () => setLoginModalOpen(true)
      );
      setLoading(false);
    }
  };

  const handleModalSubmit = async () => {
    setLoading(true);

    await apiCallWith401(
      async () => {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "/api/generate",
          { ...configFields, userId, sessionId: selectedSessionId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "arraybuffer",
          }
        );

        const contentType = res.headers["content-type"];
        if (
          contentType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          const url = URL.createObjectURL(blob);
          setDocxUrl(url);
          setPdfUrl(null);
          setGenerateJsonResponse(null);
        } else if (contentType === "application/pdf") {
          const blob = new Blob([res.data], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setDocxUrl(null);
          setGenerateJsonResponse(null);
        } else {
          const text = new TextDecoder().decode(res.data);
          const data = JSON.parse(text);

          if (data.type === "json") {
            setGenerateJsonResponse(data.lessonPlan || data.improvedLessonPlan);
            setPdfUrl(null);
            setDocxUrl(null);
          } else if (data.type === "text") {
            setGenerateTextResponse(
              data.nextQuestion || "No further questions."
            );
            setPdfUrl(null);
            setDocxUrl(null);
            setGenerateJsonResponse(null);
          }
        }

        // Save reflection if present (last step)
        if (
          configFields.reflection1 ||
          configFields.reflection2 ||
          configFields.reflection3 ||
          configFields.reflection4 ||
          configFields.reflection5
        ) {
          await apiCallWith401(
            async () => {
              await axios.post(
                "/api/session/reflection",
                {
                  sessionId: selectedSessionId,
                  reflection: {
                    reflection1: configFields.reflection1,
                    reflection2: configFields.reflection2,
                    reflection3: configFields.reflection3,
                    reflection4: configFields.reflection4,
                    reflection5: configFields.reflection5,
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
            },
            () => setLoginModalOpen(true)
          );
        }

        setModalOpen(false);
      },
      () => setLoginModalOpen(true)
    );

    setLoading(false);
  };

  const handleClearSession = async () => {
    await apiCallWith401(
      async () => {
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
      },
      () => setLoginModalOpen(true)
    );
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    console.log("Submitting feedback:", feedback);
    const feedbackField = `feedback${configStep + 1}`;
    setLoading(true);
    await apiCallWith401(
      async () => {
        const token = localStorage.getItem("token");
        await axios.post(
          "/api/session/feedback",
          {
            sessionId: selectedSessionId,
            feedbackField,
            feedback,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setConfigFields((prev) => ({
          ...prev,
          [feedbackField]: feedback,
        }));
        await handleConfigNextStep();
      },
      () => setLoginModalOpen(true)
    );
    setLoading(false);
  };

  // Detect iframe load inside FileViewer
  useEffect(() => {
    if (!docxUrl || !fileViewerContainerRef.current) return;
    const iframe = fileViewerContainerRef.current.querySelector("iframe");
    if (iframe) {
      const handleLoad = () => setLoading(false);
      iframe.addEventListener("load", handleLoad);
      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }
  }, [docxUrl, fileViewerKey]);

  return (
    <Container maxWidth="md">
      {/* Page-level loading backdrop (shows only if both modals are closed) */}
      <Backdrop
        open={loading && !modalOpen && !loginModalOpen}
        sx={{
          color: "#333",
          zIndex: (theme) => theme.zIndex.drawer + 2,
          backgroundColor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(6px)",
          position: "fixed",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          กำลังโหลดเอกสาร...
        </Typography>
      </Backdrop>

      <LoginModal
        open={!!loginModalOpen}
        forceSessionStep={loginModalOpen === "session"}
        onLoginSuccess={(sessionId) => {
          setLoading(true);
          console.log("Login successful, sessionId:", sessionId);
          setLoginModalOpen(false);
          setSelectedSessionId(sessionId);
          fetchSession(sessionId);
          setLoading(false);
        }}
      />

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
                ออกจากระบบ
              </Button>
              {/* Session Selection Button */}
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<ListIcon />}
                onClick={() => setLoginModalOpen("session")}
                sx={{ minWidth: 0, px: 1.5 }}
              >
                แผนการสอนของคุณ
              </Button>
            </Box>
          </Box>
        </Box>

        <ConfigModal
          open={modalOpen}
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
          onSectionSelection={() => setLoginModalOpen("session")}
          onFeedbackSubmit={handleFeedbackSubmit}
          onError={() => setShowResponse(false)}
          errorWarning={errorWarning}
          onClearErrorWarning={() => {
            setErrorWarning(false);
            setShowResponse(false);
          }}
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
                      ref={fileViewerContainerRef}
                      style={{
                        width: "100%",
                        height: "80vh",
                        overflow: "auto",
                        border: "1px solid #ccc",
                      }}
                    >
                      <FileViewer
                        key={fileViewerKey}
                        fileType="docx"
                        filePath={docxUrl}
                        onError={() => {
                          setFileViewError(true);
                          setLoading(false);
                        }}
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
