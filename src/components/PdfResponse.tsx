import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";

interface PdfResponseProps {
  pdfUrl: string | ArrayBuffer | Uint8Array;
}

const PdfResponse: React.FC<PdfResponseProps> = ({ pdfUrl }) => {
  // Memoize the object URL to avoid unnecessary re-creation
  const objectUrl = useMemo(() => {
    if (!pdfUrl) return null;

    // If it's a string and starts with "%PDF", treat as raw PDF string
    if (typeof pdfUrl === "string" && pdfUrl.trim().startsWith("%PDF")) {
      const blob = new Blob([pdfUrl], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    }

    // If it's a string and looks like a URL, use as is
    if (typeof pdfUrl === "string" && pdfUrl.startsWith("blob:")) {
      return pdfUrl;
    }

    // If it's an ArrayBuffer or Uint8Array, convert to Blob
    if (pdfUrl instanceof ArrayBuffer || pdfUrl instanceof Uint8Array) {
      const blob = new Blob([pdfUrl], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    }

    return null;
  }, [pdfUrl]);

  if (!objectUrl) {
    return <Typography sx={{ color: "#dcfce7" }}>No PDF available.</Typography>;
  }

  return (
    <Box 
      sx={{ 
        width: "100%", 
        height: "80vh", 
        border: "1px solid rgba(34, 197, 94, 0.2)",
        borderRadius: 2,
        background: "rgba(21, 128, 61, 0.05)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        overflow: "hidden",
      }}
    >
      <iframe
        src={objectUrl}
        title="PDF Preview"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </Box>
  );
};

export default PdfResponse;