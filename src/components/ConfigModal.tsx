import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import JsonDynamicRenderer from "./JsonDynamicRenderer";

interface ConfigModalProps { // Renamed
  open: boolean;
  loading: boolean;
  configStep: number;
  configFields: { [key: string]: string };
  response: string;
  showResponse: boolean;
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onStepSubmit: () => void;
  onSubmit: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

export const stepConfigFields = [
  [
    { label: "วิชา", field: "subject" },
    { label: "บทเรียน", field: "lessonTopic" },
    { label: "ระดับชั้น", field: "level" },
  ],
  [],
  [
    { label: "จำนวนนักเรียนในชั้น", field: "numStudents" },
    { label: "นักเรียนที่มีความแตกต่าง", field: "studentType" },
    { label: "เวลาในการสอนทั้งหมด", field: "studyHours" },
    { label: "เวลาต่อคาบ", field: "timePerClass" },
  ],
];

const ConfigModal: React.FC<ConfigModalProps> = ({ // Renamed
  open,
  loading,
  configStep,
  configFields,
  response,
  showResponse,
  onClose,
  onChange,
  onStepSubmit,
  onSubmit,
  onNextStep,
  onPreviousStep,
}) => {
  const currentFields = stepConfigFields[configStep] || [{ label: "Unknown Step", field: "" }];
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          ขั้นตอน {configStep + 1}:{" "}
          {currentFields.length === 1
            ? currentFields[0].label
            : currentFields.length === 0
            ? "กำลังค้นหาค้นหาข้อมูลหลักสูตร..."
            : "กรุณากรอกข้อมูลพื้นฐานเกี่ยวกับชั้นเรียนของท่าน"}
        </Typography>
        {/* Show input fields only if response is not shown */}
        {!showResponse && currentFields.length > 0 &&
          currentFields.map((fieldObj) => (
            fieldObj.field === "studentType" ? (
              <Box key="studentType" sx={{ mb: 2 }}>
                <Typography variant="subtitle1">ประเภทของนักเรียนที่มีความหลากหลาย</Typography>
                {Array.isArray(configFields.studentType) &&
                  configFields.studentType.map((student, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <TextField
                        label="ประเภท"
                        value={student.type}
                        onChange={(e) => {
                          const updated = [...configFields.studentType];
                          updated[idx].type = e.target.value;
                          onChange("studentType", updated);
                        }}
                        size="small"
                      />
                      <TextField
                        label="จำนวนร้อยละของชั้นเรียน"
                        value={student.percentage}
                        onChange={(e) => {
                          const updated = [...configFields.studentType];
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
                          const updated = configFields.studentType.filter(
                            (_: any, i: number) => i !== idx
                          );
                          onChange("studentType", updated);
                        }}
                        disabled={configFields.studentType.length === 1}
                      >
                        ลบประเภทนักเรียน
                      </Button>
                    </Box>
                  ))}
                <Button
                  variant="outlined"
                  onClick={() => {
                    onChange("studentType", [
                      ...configFields.studentType,
                      { type: "", percentage: "" },
                    ]);
                  }}
                  sx={{ mt: 1 }}
                >
                  เพิ่มประเภทนักเรียน
                </Button>
              </Box>
            ) : (
              <TextField
                key={fieldObj.field}
                fullWidth
                label={fieldObj.label}
                value={fieldObj.field ? configFields[fieldObj.field] || "" : ""}
                onChange={(e) => onChange(fieldObj.field, e.target.value)}
                margin="normal"
                type={
                  fieldObj.field === "numStudents" ||
                  fieldObj.field === "studyHours" ||
                  fieldObj.field === "timePerClass"
                    ? "number"
                    : "text"
                }
              />
            )
          ))
        }

        {/* Show response box only if response is shown */}
        {showResponse && response && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "background.default",
              border: "1px solid #ccc",
              borderRadius: 2,
              maxHeight: 400,
              overflowY: "auto",
              overflowX: "auto"
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
            color="primary"
            onClick={onPreviousStep}
            disabled={configStep === 0} // Only disable on first step
          >
            Previous
          </Button>
          {/* Button logic updated below */}
          {!showResponse ? (
            // Show "Submit" or "Next" until the last step
            configStep === stepConfigFields.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={onStepSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={onStepSubmit}
                disabled={loading}
              >
                {loading ? "Loading..." : "Next"}
              </Button>
            )
          ) : (
            // After submitting last step, show response and "Generate" button
            configStep === stepConfigFields.length - 1 && response ? (
              <Button
                variant="contained"
                color="primary"
                onClick={onSubmit}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate"}
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
            )
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfigModal; // Renamed