import { TextField, Button, Paper, Box, Typography, CircularProgress } from "@mui/material";

export default function ChatInput({ prompt, setPrompt, textResponse, loading, handleSubmit }) {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Enter your prompt"
          variant="outlined"
          fullWidth
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Send"}
        </Button>
      </form>

      {/* Text Response */}
      {textResponse && (
        <Box mt={3} p={2} bgcolor="grey.100" borderRadius={2}>
          <Typography variant="subtitle1">
            <strong>Response:</strong> {textResponse}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
