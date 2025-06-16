import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import JsonDynamicRenderer from "./JsonDynamicRenderer";

interface LessonTopicModalProps {
  open: boolean;
  loading: boolean;
  currentStep: number;
  curriculumFields: { [key: string]: string };
  response: string;
  showResponse: boolean;
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onStepSubmit: () => void;
  onSubmit: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

export const stepcurriculumFields = [
  // Step 0: group three fields
  [
    { label: "Subject", field: "subject" },
    { label: "Lesson Topic", field: "lessonTopic" },
    { label: "Level", field: "level" },
  ],
  // Step 1: No input fields
  [],
  // Step 2: studentType and numStudents
  [
    { label: "Number of Student", field: "numStudents" },
    { label: "Student Type", field: "studentType" },
  ],
  [{ label: "Learning Time (Months)", field: "learningTime" }],
  [{ label: "Time Slot (Hours/Week)", field: "timeSlot" }],
  [{ label: "Limitation", field: "limitation" }],
];

const LessonTopicModal: React.FC<LessonTopicModalProps> = ({
  open,
  loading,
  currentStep,
  curriculumFields,
  response,
  showResponse,
  onClose,
  onChange,
  onStepSubmit,
  onSubmit,
  onNextStep,
  onPreviousStep,
}) => {
  const currentFields = stepcurriculumFields[currentStep] || [{ label: "Unknown Step", field: "" }];
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Step {currentStep + 1}:{" "}
          {currentFields.length === 1
            ? currentFields[0].label
            : currentFields.length === 0
            ? "Processing..."
            : "Basic Information"}
        </Typography>
        {/* Show input fields only if response is not shown */}
        {!showResponse && currentFields.length > 0 &&
          currentFields.map((fieldObj) =>
            fieldObj.field === "studentType" ? (
              <Box key="studentType" sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Student Types</Typography>
                {Array.isArray(curriculumFields.studentType) &&
                  curriculumFields.studentType.map((student, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <TextField
                        label="Type"
                        value={student.type}
                        onChange={(e) => {
                          const updated = [...curriculumFields.studentType];
                          updated[idx].type = e.target.value;
                          onChange("studentType", updated);
                        }}
                        size="small"
                      />
                      <TextField
                        label="Percentage"
                        value={student.percentage}
                        onChange={(e) => {
                          const updated = [...curriculumFields.studentType];
                          updated[idx].percentage = e.target.value;
                          onChange("studentType", updated);
                        }}
                        size="small"
                        type="number"
                        InputProps={{ endAdornment: <span>%</span> }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const updated = curriculumFields.studentType.filter(
                            (_: any, i: number) => i !== idx
                          );
                          onChange("studentType", updated);
                        }}
                        disabled={curriculumFields.studentType.length === 1}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                <Button
                  variant="outlined"
                  onClick={() => {
                    onChange("studentType", [
                      ...curriculumFields.studentType,
                      { type: "", percentage: "" },
                    ]);
                  }}
                  sx={{ mt: 1 }}
                >
                  Add Student Type
                </Button>
              </Box>
            ) : (
              <TextField
                key={fieldObj.field}
                fullWidth
                label={fieldObj.label}
                value={fieldObj.field ? curriculumFields[fieldObj.field] || "" : ""}
                onChange={(e) => onChange(fieldObj.field, e.target.value)}
                margin="normal"
              />
            )
          )}
        {/* Show response box only if response is shown */}
        {showResponse && response && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "background.default",
              border: "1px solid #ccc",
              borderRadius: 2,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Response from API:
            </Typography>
            <JsonDynamicRenderer data={response} />
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={onPreviousStep}
            disabled={currentStep === 0 || loading || showResponse}
          >
            Back
          </Button>
          {/* Show "Submit" if not showing response, otherwise "Next" */}
          {!showResponse ? (
            <Button
              variant="contained"
              color="primary"
              onClick={onStepSubmit}
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={onNextStep}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default LessonTopicModal;