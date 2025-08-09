import {
  TextField,
  Button,
  Paper,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

export default function ChatInput({
  prompt,
  setPrompt,
  nextQuestion,
  loading,
  handleSubmit,
  conversationHistory,
}) {
  return (
    <Paper
      elevation={3}
      sx={{ 
        p: 3, 
        display: "flex", 
        flexDirection: "column", 
        gap: 2,
        background: "rgba(21, 128, 61, 0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(34, 197, 94, 0.18)",
        boxShadow: "0 8px 32px 0 rgba(21, 128, 61, 0.2)",
      }}
    >
      {/* Conversation History */}
      <Box
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mb: 2,
        }}
      >
        {conversationHistory.map((entry, index) => (
          <Box key={index}>
            {/* GPT Response */}
            <Box
              sx={{
                alignSelf: "flex-start",
                background: "rgba(240, 253, 244, 0.15)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                color: "#dcfce7",
                p: 1.5,
                borderRadius: 2,
                maxWidth: "75%",
                mb: 0.5,
              }}
            >
              <Typography variant="body2">
                <strong>Question:</strong> {entry.question}
              </Typography>
            </Box>
            {/* User Answer */}
            <Box
              sx={{
                alignSelf: "flex-end",
                background: "rgba(34, 197, 94, 0.2)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#bbf7d0",
                p: 1.5,
                borderRadius: 2,
                maxWidth: "75%",
                mb: 0.5,
              }}
            >
              <Typography variant="body2">User : {entry.userMessage}</Typography>
            </Box>
            {/* GPT Response */}
            <Box
              sx={{
                alignSelf: "flex-start",
                background: "rgba(240, 253, 244, 0.15)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                color: "#dcfce7",
                p: 1.5,
                borderRadius: 2,
                maxWidth: "75%",
                mb: 0.5,
              }}
            >
              <Typography variant="body2">
                <strong>Response:</strong> {entry.response}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Current Question */}
      {nextQuestion && (
        <Box 
          sx={{
            p: 2, 
            background: "rgba(240, 253, 244, 0.1)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(34, 197, 94, 0.15)",
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "#dcfce7" }}>
            <strong>Current Question:</strong> {nextQuestion}
          </Typography>
        </Box>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Your Answer"
          variant="outlined"
          fullWidth
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          sx={{ 
            mt: 2, 
            mb: 2,
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
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
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
          {loading ? <CircularProgress size={24} sx={{ color: "#22c55e" }} /> : "Send"}
        </Button>
      </form>
    </Paper>
  );
}
