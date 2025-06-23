import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Backdrop, // <-- Add this import
  CircularProgress, // <-- Add this import
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface LoginModalProps {
  open: boolean;
  onLoginSuccess: (sessionId: string | null) => void;
  forceSessionStep?: boolean;
}

export default function LoginModal({ open, onLoginSuccess, forceSessionStep }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // เพิ่ม state
  const [lastName, setLastName] = useState("");   // เพิ่ม state
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (open && forceSessionStep) {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUserId(decoded.userId);
        setLoading(true);
        fetch("/api/session/all_sessions", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((sessionList) => {
            setSessions(sessionList);
            setStep(2);
          })
          .catch(() => {
            setStep(1);
            setUserId(null);
          })
          .finally(() => setLoading(false));
      } else {
        setStep(0);
        setUserId(null);
      }
    } else if (open && !forceSessionStep) {
      setStep(0); // Always start at welcome step
      setUserId(null);
    }
  }, [open, forceSessionStep]);

  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.token) {
      localStorage.setItem("token", data.token);
      // decode userId from token
      const decoded = JSON.parse(atob(data.token.split(".")[1]));
      setUserId(decoded.userId);

      // fetch sessions
      setLoading(true);
      const sessionRes = await fetch("/api/session/all_sessions", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const sessionList = await sessionRes.json();
      setSessions(sessionList);
      setLoading(false);
      setStep(2);
    } else {
      alert(data.error || "Login failed.");
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }), // ส่งเพิ่ม
    });

    const data = await res.json();
    setLoading(false);
    if (data.message) {
      setIsRegister(false);
      alert("Registration successful! Please log in.");
    } else {
      alert(data.error || "Registration failed.");
    }
  };

  const handleContinueSession = (sessionId: string) => {
    onLoginSuccess(sessionId);
  };

  const handleNewSession = async () => {
    if (!userId) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/session/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, configStep: 0 }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.insertedId) {
      onLoginSuccess(data.insertedId);
    } else {
      alert("Failed to create new session.");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    setLoading(true);
    const res = await fetch(`/api/session`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });
    setLoading(false);
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } else {
      alert("Failed to delete session.");
    }
  };

  return (
    <Dialog open={open} disableEscapeKeyDown maxWidth="md" fullWidth sx={{ minWidth: 500 }}>
      {/* Loading Backdrop for LoginModal only */}
      <Backdrop
        open={loading}
        sx={{
          color: "#333",
          zIndex: (theme) => theme.zIndex.modal + 1,
          backgroundColor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(6px)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          flexDirection: "column",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          กำลังดำเนินการ...
        </Typography>
      </Backdrop>
      {step === 0 ? (
        <>
          <DialogTitle>AI ออกแบบแผนการสอน</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 400, py: 2, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                ยินดีต้อนรับ!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ขอเชิญท่านผู้เชี่ยวชาญด้านการศึกษา พัฒนา AI ออกแบบแผนการสอนร่วมกัน
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsRegister(false);
                  setStep(1);
                }}
                sx={{ mt: 2, mb: 1 }}
                fullWidth
              >
                เข้าสู่ระบบ
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setIsRegister(true);
                  setStep(1);
                }}
                fullWidth
              >
                ลงทะเบียน
              </Button>
            </Box>
          </DialogContent>
        </>
      ) : step === 1 ? (
        <>
          <DialogTitle>{isRegister ? "ลงทะเบียน" : "เข้าสู่ระบบ"}</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 400,
                mt: 1,
              }}
            >
              {isRegister && (
                <>
                  <TextField
                    fullWidth
                    label="ชื่อ"
                    variant="outlined"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="นามสกุล"
                    variant="outlined"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                  />
                </>
              )}
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="รหัสผ่าน"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, flexDirection: "column", gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={isRegister ? handleRegister : handleLogin}
              fullWidth
              disabled={loading}
            >
              {isRegister ? "Register" : "Login"}
            </Button>
            <Typography variant="body2" sx={{ width: "100%", textAlign: "center" }}>
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <Link
                    component="button"
                    onClick={() => setIsRegister(false)}
                    disabled={loading}
                    underline="hover"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </>
              ) : (
                <>
                  ท่านยังไม่เป็นสมาชิก?{" "}
                  <Link
                    component="button"
                    onClick={() => setIsRegister(true)}
                    disabled={loading}
                    underline="hover"
                  >
                    ลงทะเบียน
                  </Link>
                </>
              )}
            </Typography>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>โปรดเลือกแผนการสอน</DialogTitle>
          <DialogContent>
            <List>
              {sessions.map((session) => (
                <ListItem
                  key={session._id}
                  button
                  onClick={() => handleContinueSession(session._id)}
                  disabled={loading}
                  sx={{ cursor: "pointer" }}
                >
                  <ListItemText
                    primary={`Session: ${session.lessonTopic || session._id}`}
                    secondary={`Step: ${session.configStep ?? 0}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      color="primary"
                      onClick={() => handleContinueSession(session._id)}
                      sx={{ mr: 1 }}
                      disabled={loading}
                    >
                      <ArrowForwardIcon /> {/* Changed from PlayArrowIcon */}
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteSession(session._id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleNewSession}
                disabled={loading}
              >
                New Session
              </Button>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}