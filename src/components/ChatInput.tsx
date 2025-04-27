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
      sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
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
                bgcolor: "grey.200",
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
                bgcolor: "primary.main",
                color: "white",
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
                bgcolor: "grey.200",
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
        <Box p={2} bgcolor="grey.100" borderRadius={2}>
          <Typography variant="subtitle1">
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
          sx={{ mt: 2, mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Send"}
        </Button>
      </form>
    </Paper>
  );
}
