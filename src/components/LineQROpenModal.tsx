import React from "react";
import { Dialog, DialogTitle, DialogContent, Box } from "@mui/material";

export default function LineQROpenModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>เพิ่มเพื่อน Line OA</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" p={2}>
          <img
            src="https://qr-official.line.me/gs/M_811zqfvu_GW.png?oat_content=qr"
            alt="Line OA QR Code"
            style={{ width: 220, height: 220, marginBottom: 12 }}
          />
          <Box fontSize={16} textAlign="center" mb={1}>
            สแกน QR Code เพื่อเพิ่มเพื่อน Line OA
          </Box>
          <a
            href="https://lin.ee/C5ND0Pd" // <-- Replace with your actual Line OA link
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#06C755", fontWeight: 500, textDecoration: "none", fontSize: 16 }}
          >
            หรือคลิกที่นี่เพื่อเพิ่มเพื่อน
          </a>
        </Box>
      </DialogContent>
    </Dialog>
  );
}