import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface DemoVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        วิดีโอแนะนำการใช้งาน
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            src="https://www.youtube.com/embed/_PVXw8DhvO8?si=3h_FES2O00g9YW--"
            title="Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoVideoModal;
