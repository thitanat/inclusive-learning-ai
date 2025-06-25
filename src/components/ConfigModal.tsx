import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Backdrop,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import JsonDynamicRenderer from "./JsonDynamicRenderer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ListIcon from "@mui/icons-material/List";

interface ConfigModalProps {
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
  onSectionSelection?: () => void; // Add this prop
  onFeedbackSubmit: (feedback: string) => void; // Add this prop
  onError?: (msg: string) => void;
  errorWarning?: boolean; // Add this prop
  onClearErrorWarning?: () => void; // Add this prop
}

export const stepConfigFields = [
  [
    { label: "กลุ่มสาระ", field: "subject" },
    { label: "เรื่อง", field: "lessonTopic" },
    { label: "ระดับชั้น", field: "level" },
  ],
  [],
  [
    { label: "จำนวนนักเรียนในชั้น", field: "numStudents" },
    { label: "นักเรียนที่มีความแตกต่าง", field: "studentType" },
    { label: "จำนวนคาบ", field: "studyPeriod" },
  ],
  [],
  [
    {
      label:
        "ท่านคิดว่าแผนการสอนนี้สามารถนำไปปฏิบัติได้จริงหรือไม่? มีข้อจำกัดอะไรบ้าง?",
      field: "reflection1",
    },
    {
      label: "แผนการสอนนี้สอดคล้องกับวัตถุประสงค์หรือไม่? (ให้คะแนนเต็ม 10)",
      field: "reflection3",
    },
    {
      label: "โปรดให้ ข้อเสนอแนะในภาพรวมของการออกแบบการสอนแบบห้องเรียนรวม",
      field: "reflection4",
    },
    {
      label: "โปรดให้ ข้อเสนอแนะในภาพรวมของคำตอบจาก เอไอ",
      field: "reflection5",
    },
  ],
];

const LOADING_SENTENCE =
  "กำลังประมวลผล เพื่อความรวดเร็ว แม่นยำ สำหรับ AI version นี้ กรุณาอย่าปิดหน้าจอ";

const TypingLoader: React.FC = () => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [dots, setDots] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < LOADING_SENTENCE.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + LOADING_SENTENCE[idx]);
        setIdx(idx + 1);
      }, 40); // typing speed
      return () => clearTimeout(timeout);
    } else {
      setDone(true);
    }
  }, [idx]);

  useEffect(() => {
    if (!done) return;
    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setDots(".".repeat(dotCount));
    }, 400);
    return () => clearInterval(interval);
  }, [done]);

  useEffect(() => {
    // Reset when remount
    setDisplayed("");
    setDone(false);
    setDots("");
    setIdx(0);
  }, []);

  return (
    <Typography variant="h6" sx={{ mt: 2, minHeight: 32 }}>
      {displayed}
      {done && <span>{dots}</span>}
    </Typography>
  );
};

const SUBJECT_OPTIONS = [
  "ภาษาไทย",
  "คณิตศาสตร์",
  "วิทยาศาสตร์",
  "สังคมศึกษา ศาสนาและวัฒนธรรม",
  "สุขศึกษาและพลศึกษา",
  "ศิลปะ",
  "การงานอาชีพและเทคโนโลยี",
  "ภาษาต่างประเทศ",
];

const ConfigModal: React.FC<ConfigModalProps> = ({
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
  onSectionSelection,
  onFeedbackSubmit,
  onError,
  errorWarning,
  onClearErrorWarning,
}) => {
  const currentFields = stepConfigFields[configStep] || [
    { label: "Unknown Step", field: "" },
  ];
  const feedbackField = `feedback${configStep + 1}`;
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // Reset feedback when step changes or modal opens
    setFeedback(configFields[feedbackField] || "");
    // eslint-disable-next-line
  }, [configStep, showResponse, open]);

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
          p: 0,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Loading Backdrop for ConfigModal only */}
        <Backdrop
          open={loading}
          sx={{
            color: "#333",
            zIndex: (theme) => theme.zIndex.modal + 1,
            backgroundColor: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(6px)",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            flexDirection: "column",
          }}
        >
          <TypingLoader />
        </Backdrop>
        {/* Header with buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 3,
            py: 2,
            borderBottom: "1px solid #eee",
            background: "#fafbfc",
            minHeight: 64,
          }}
        >
          <Button
            startIcon={<ListIcon />}
            onClick={onSectionSelection}
            color="primary"
            variant="outlined"
            sx={{ ml: 1 }}
          >
            แผนการสอนของคุณ
          </Button>
        </Box>
        {/* Modal content */}
        <Box
          sx={{ p: 4, pt: 2, height: "calc(100% - 64px)", overflowY: "auto" }}
        >
          {/* 404 Error Page */}
          {errorWarning ? (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <Typography variant="h4" color="error" gutterBottom>
                ไม่พบข้อมูลหลักสูตรที่เกี่ยวข้อง
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                กรุณาตรวจสอบข้อมูลที่กรอก หรือเลือกข้อมูลใหม่
              </Typography>
              <Typography variant="body1" color="warning" sx={{ mb: 3 }}>
                **ท่านอาจลองไม่ระบุ ชั้นเรียน
                เพื่อให้ AI ค้นหาข้อมูลหลักสูตรที่เกี่ยวข้องได้กว้างขึ้น**
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={onClearErrorWarning}
              >
                ย้อนกลับ
              </Button>
            </Box>
          ) : (
            <>
              {/* Step Title with custom typography for each step */}
              {(() => {
                switch (configStep) {
                  case 0:
                    return (
                      <Typography variant="h5" color="primary" gutterBottom>
                        ส่วนที่ 1: ข้อมูลหลักสูตร
                      </Typography>
                    );
                  case 1:
                    return (
                      <Typography variant="h5" color="primary" gutterBottom>
                        ส่วนที่ 2: จุดประสงค์การเรียนรู้
                      </Typography>
                    );
                  case 2:
                    return (
                      <Typography variant="h5" color="primary" gutterBottom>
                        ส่วนที่ 3: กระบวนการจัดกิจกรรมการเรียนรู้
                      </Typography>
                    );
                  case 3:
                    return (
                      <Typography variant="h5" color="primary" gutterBottom>
                        ส่วนที่ 4: การวัดประเมินผล
                      </Typography>
                    );
                  case 4:
                    return (
                      <Typography variant="h5" color="primary" gutterBottom>
                        ส่วนที่ 5: ขออนุเคราะห์ผลป้อนกลับ
                      </Typography>
                    );
                  default:
                    return (
                      <Typography variant="h6" gutterBottom>
                        ส่วน {configStep + 1}:{" "}
                        {currentFields.length === 1
                          ? currentFields[0].label
                          : currentFields.length === 0
                          ? "กำลังประมวลผล..."
                          : "โปรดระบุข้อมูลสำหรับการออกแบบแผนการสอน"}
                      </Typography>
                    );
                }
              })()}

              {/* Show input fields only if response is not shown */}
              {!showResponse &&
                currentFields.length > 0 &&
                currentFields.map((fieldObj) =>
                  fieldObj.field === "studentType" ? (
                    <Box key="studentType" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        ประเภทของนักเรียนที่มีความหลากหลาย
                      </Typography>
                      {Array.isArray(configFields.studentType) &&
                        configFields.studentType.map((student, idx) => (
                          <Box
                            key={idx}
                            sx={{ display: "flex", gap: 1, mb: 1 }}
                          >
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
                              disabled={
                                configFields.studentType.length == 1 &&
                                !!showResponse
                              }
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
                  ) : fieldObj.field === "subject" ? (
                    <FormControl fullWidth margin="normal" key={fieldObj.field}>
                      <InputLabel id="subject-select-label">
                        {fieldObj.label}
                      </InputLabel>
                      <Select
                        labelId="subject-select-label"
                        value={configFields.subject || ""}
                        label={fieldObj.label}
                        onChange={(e) => onChange("subject", e.target.value)}
                      >
                        {SUBJECT_OPTIONS.map((option) => (
                          <MenuItem value={option} key={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      key={fieldObj.field}
                      fullWidth
                      label={fieldObj.label}
                      value={
                        fieldObj.field ? configFields[fieldObj.field] || "" : ""
                      }
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
                    height: 250, // fixed height
                    maxHeight: 250, // ensure fixed
                    minHeight: 250, // ensure fixed
                    overflowY: "auto",
                    overflowX: "auto",
                  }}
                >
                  <JsonDynamicRenderer data={response} />
                </Box>
              )}

              {/* Feedback input when showResponse is true */}
              {showResponse && (
                <TextField
                  fullWidth
                  label={`ขอความอนุเคราะห์ข้อเสนอแนะสำหรับการตอบของ AI ในส่วนที่ ${
                    configStep + 1
                  }`}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  margin="normal"
                  multiline
                  minRows={2}
                />
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onPreviousStep}
                  disabled={configStep === 0 && !showResponse}
                >
                  กลับ
                </Button>
                {configStep === stepConfigFields.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onSubmit}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate"}
                  </Button>
                ) : !showResponse ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onStepSubmit}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "ถัดไป"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onFeedbackSubmit(feedback)}
                    disabled={loading}
                  >
                    ไปต่อ
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfigModal; // Renamed
