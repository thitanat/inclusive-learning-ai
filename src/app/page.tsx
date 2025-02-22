"use client";

import { useState } from "react";
import { Container, Grid, Typography } from "@mui/material";
import ChatInput from "../components/ChatInput";
import JsonResponse from "../components/JsonResponse";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [jsonResponse, setJsonResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTextResponse("");
    setJsonResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.type === "json") {
        setJsonResponse(data.response);
      } else if (data.type === "text") {
        setTextResponse(data.response);
      } else {
        setTextResponse("Unexpected response type.");
      }
    } catch (error) {
      setTextResponse("Error fetching response.");
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom align="center">
        Inclusive Learning
      </Typography>
      <Grid container spacing={3}>
        {/* Input & Text Response */}
        <Grid item xs={12} md={6}>
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            textResponse={textResponse}
            loading={loading}
            handleSubmit={handleSubmit}
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
