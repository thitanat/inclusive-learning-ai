import { useState } from "react";
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
} from "@mui/material";

interface LoginModalProps {
  open: boolean;
  onLoginSuccess: () => void;
}

export default function LoginModal({ open, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

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
      onLoginSuccess();
    } else {
      alert(data.error || "Login failed.");
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.message) {
      // Registration successful, switch to login mode
      setIsRegister(false);
      alert("Registration successful! Please log in.");
    } else {
      alert(data.error || "Registration failed.");
    }
  };

  return (
    <Dialog open={open} disableEscapeKeyDown>
      <DialogTitle>{isRegister ? "Register" : "Login"}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 320,
            mt: 1,
          }}
        >
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
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
                Login
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                component="button"
                onClick={() => setIsRegister(true)}
                disabled={loading}
                underline="hover"
              >
                Register
              </Link>
            </>
          )}
        </Typography>
      </DialogActions>
    </Dialog>
  );
}