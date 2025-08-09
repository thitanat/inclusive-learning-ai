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
          bgcolor: level === 0 ? "transparent" : "rgba(15, 76, 58, 0.8)",
          backdropFilter: level === 0 ? "none" : "blur(8px)",
          p: level === 0 ? 0 : 2,
          borderRadius: level === 0 ? 0 : 3,
          border: level === 0 ? "none" : "2px solid rgba(34, 197, 94, 0.4)",
          boxShadow: level === 0 ? "none" : "0 4px 16px 0 rgba(15, 76, 58, 0.3)",
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
          bgcolor: level === 0 ? "transparent" : "rgba(15, 76, 58, 0.8)",
          backdropFilter: level === 0 ? "none" : "blur(8px)",
          p: level === 0 ? 0 : 2,
          borderRadius: level === 0 ? 0 : 3,
          border: level === 0 ? "none" : "2px solid rgba(34, 197, 94, 0.4)",
          boxShadow: level === 0 ? "none" : "0 4px 16px 0 rgba(15, 76, 58, 0.3)",
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
                  color: "#4ade80",
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
                  mb: 0.5,
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
          bgcolor: level === 0 ? "transparent" : "rgba(15, 76, 58, 0.8)",
          backdropFilter: level === 0 ? "none" : "blur(8px)",
          p: level === 0 ? 0 : 2,
          borderRadius: level === 0 ? 0 : 3,
          border: level === 0 ? "none" : "2px solid rgba(34, 197, 94, 0.4)",
          boxShadow: level === 0 ? "none" : "0 4px 16px 0 rgba(15, 76, 58, 0.3)",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            color: "#dcfce7",
            fontSize: "0.95rem",
            lineHeight: 1.4,
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
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
    return (
      <Typography 
        sx={{ 
          color: "#fca5a5", 
          fontWeight: "bold",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" 
        }}
      >
        Invalid JSON
      </Typography>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      gap={2}
      sx={{
        background: "rgba(6, 44, 32, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "2px solid rgba(34, 197, 94, 0.3)",
        borderRadius: 4,
        p: 3,
        boxShadow: "0 8px 32px 0 rgba(6, 44, 32, 0.4)",
        minHeight: "200px",
      }}
    >
      {renderValue(jsonObj)}
    </Box>
  );
};

export default JsonDynamicRenderer;