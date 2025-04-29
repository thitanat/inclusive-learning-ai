import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

interface LessonTopicModalProps {
  open: boolean;
  loading: boolean;
  lessonTopic: string;
  subject: string;
  level: string;
  ageRange: string;
  studentType: string;
  learningTime: string;
  timeSlot: string;
  limitation: string;
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

const LessonTopicModal: React.FC<LessonTopicModalProps> = ({
  open,
  loading,
  lessonTopic,
  subject,
  level,
  ageRange,
  studentType,
  learningTime,
  timeSlot,
  limitation,
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
          Enter Lesson Details
        </Typography>
        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={(e) => onChange("subject", e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Lesson Topic"
          value={lessonTopic}
          onChange={(e) => onChange("lessonTopic", e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Level"
          value={level}
          onChange={(e) => onChange("level", e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Age Range"
          value={ageRange}
          onChange={(e) => onChange("ageRange", e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Student Type"
          value={studentType}
          onChange={(e) => onChange("studentType", e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Learning Time (Months)"
          value={learningTime}
          onChange={(e) => onChange("learningTime", e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Time Slot (Hours/Week)"
          value={timeSlot}
          onChange={(e) => onChange("timeSlot", e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Limitation"
          value={limitation}
          onChange={(e) => onChange("limitation", e.target.value)}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Generating..." : "Submit"}
        </Button>
      </Box>
    </Modal>
  );
};

export default LessonTopicModal;