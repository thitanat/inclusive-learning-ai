import React from "react";
import { Box, Typography } from "@mui/material";

interface JsonRendererProps {
  data: string | object;
}

const renderValue = (value: any, level = 0) => {
  // If the value is a number, render it directly
  if (typeof value === "number") {
    return value;
  }
  // Each level gets its own Box, so nesting is visible
  if (Array.isArray(value)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        gap={1}
        ml={level * 2}
        sx={{
          bgcolor: level === 0 ? "transparent" : "#f0f4ff",
          p: level === 0 ? 0 : 1,
          borderRadius: level === 0 ? 0 : 1,
          border: level === 0 ? "none" : "1px solid #e0e0e0",
        }}
      >
        {value.map((item, idx) => (
          <Box key={idx}>{renderValue(item, level + 1)}</Box>
        ))}
      </Box>
    );
  } else if (typeof value === "object" && value !== null) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        gap={1}
        ml={level * 2}
        sx={{
          bgcolor: level === 0 ? "transparent" : "#f0f4ff",
          p: level === 0 ? 0 : 1,
          borderRadius: level === 0 ? 0 : 1,
          border: level === 0 ? "none" : "1px solid #e0e0e0",
        }}
      >
        {Object.entries(value).map(([k, v]) => {
          // If the field name is a number, render only the value
          if (!isNaN(Number(k))) {
            return <React.Fragment key={k}>{renderValue(v, level + 1)}</React.Fragment>;
          }
          return (
            <Box key={k} mb={1}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  color: "#005cc5",
                  fontFamily: "monospace",
                  fontSize: "0.95em",
                }}
              >
                {k}
              </Typography>
              {renderValue(v, level + 1)}
            </Box>
          );
        })}
      </Box>
    );
  } else {
    return (
      <Box
        ml={level * 2}
        sx={{
          bgcolor: level === 0 ? "transparent" : "#f0f4ff",
          p: level === 0 ? 0 : 1,
          borderRadius: level === 0 ? 0 : 1,
          border: level === 0 ? "none" : "1px solid #e0e0e0",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {String(value)}
        </Typography>
      </Box>
    );
  }
};

const JsonDynamicRenderer: React.FC<JsonRendererProps> = ({ data }) => {
  let jsonObj: any = {};
  try {
    jsonObj =
      typeof data === "string"
        ? JSON.parse(data)
        : data;
  } catch {
    return <Typography color="error">Invalid JSON</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {renderValue(jsonObj)}
    </Box>
  );
};

export default JsonDynamicRenderer;