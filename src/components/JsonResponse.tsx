import { Paper, Typography, Box } from "@mui/material";

export default function JsonResponse({ jsonResponse }) {
  if (!jsonResponse) return (
    <Paper elevation={3} sx={{ p: 3 }}>
       <Typography variant="subtitle1">
        <strong>Preview</strong>
      </Typography>
      <Box component="pre" bgcolor="grey.200" p={2} borderRadius={2} sx={{ overflowX: "auto" }}>
        {JSON.stringify(jsonResponse, null, 2)}
      </Box>
    </Paper>
  );

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="subtitle1">
        <strong>Preview</strong>
      </Typography>
      <Box component="pre" bgcolor="grey.200" p={2} borderRadius={2} sx={{ overflowX: "auto" }}>
        {JSON.stringify(jsonResponse, null, 2)}
      </Box>
    </Paper>
  );
}
