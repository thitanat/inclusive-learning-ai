import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

interface LessonTopicModalProps {
  open: boolean;
  loading: boolean;
  lessonTopic: string;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const LessonTopicModal: React.FC<LessonTopicModalProps> = ({
  open,
  loading,
  lessonTopic,
  onClose,
  onChange,
  onSubmit,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Enter Lesson Topic
        </Typography>
        <TextField
          fullWidth
          label="Lesson Topic"
          value={lessonTopic}
          onChange={onChange}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Generating..." : "Submit"}
        </Button>
      </Box>
    </Modal>
  );
};

export default LessonTopicModal;