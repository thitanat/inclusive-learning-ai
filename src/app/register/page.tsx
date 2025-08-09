'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.message) {
      router.push("/login"); // Redirect to login page
    } else {
      alert(data.error || "Registration failed.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: 3,
          background: "rgba(21, 128, 61, 0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(34, 197, 94, 0.18)",
          boxShadow: "0 8px 32px 0 rgba(21, 128, 61, 0.2)",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: "#f0fdf4", fontWeight: 700 }}>
          Register
        </Typography>
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              background: "rgba(240, 253, 244, 0.1)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              "& fieldset": {
                borderColor: "rgba(34, 197, 94, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(34, 197, 94, 0.4)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(34, 197, 94, 0.6)",
              },
              "& input": {
                color: "#f0fdf4",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#bbf7d0",
            },
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              background: "rgba(240, 253, 244, 0.1)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              "& fieldset": {
                borderColor: "rgba(34, 197, 94, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(34, 197, 94, 0.4)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(34, 197, 94, 0.6)",
              },
              "& input": {
                color: "#f0fdf4",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#bbf7d0",
            },
          }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleRegister}
          sx={{
            background: "rgba(34, 197, 94, 0.2)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            color: "#bbf7d0",
            "&:hover": {
              background: "rgba(34, 197, 94, 0.3)",
              borderColor: "rgba(34, 197, 94, 0.5)",
              boxShadow: "0 8px 25px 0 rgba(34, 197, 94, 0.4)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Register
        </Button>
      </Box>
    </Container>
  );
}