import { Paper, Typography, Box } from "@mui/material";

export default function JsonResponse({ jsonResponse }) {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="subtitle1">
        <strong>Lesson Plan Preview</strong>
      </Typography>
      <Box component="pre" bgcolor="grey.200" p={2} borderRadius={2} sx={{ overflowX: "auto" }}>
        {jsonResponse ? JSON.stringify(jsonResponse, null, 2) : "No lesson plan available yet."}
      </Box>
    </Paper>
  );
}
