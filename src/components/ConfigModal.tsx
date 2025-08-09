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
import LineQROpenModal from "./LineQROpenModal";
import LineIcon from "./LineIcon";

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
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (idx < LOADING_SENTENCE.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + LOADING_SENTENCE[idx]);
        setIdx(idx + 1);
      }, 35); // slightly faster typing speed
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
    }, 350);
    return () => clearInterval(interval);
  }, [done]);

  useEffect(() => {
    // Cursor blinking animation
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reset when remount
    setDisplayed("");
    setDone(false);
    setDots("");
    setIdx(0);
    setCursorVisible(true);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {/* AI Brain Loading Icon */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.3))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '2px solid rgba(34, 197, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)',
            },
            '50%': {
              transform: 'scale(1.05)',
              boxShadow: '0 0 0 15px rgba(34, 197, 94, 0.1)',
            },
            '100%': {
              transform: 'scale(1)',
              boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)',
            },
          },
        }}
      >
        {/* Neural network dots */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            '& .neural-dot': {
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #10b981)',
              animation: 'neuralPulse 1.5s ease-in-out infinite',
            },
            '& .neural-dot:nth-of-type(1)': {
              top: '20%',
              left: '30%',
              animationDelay: '0s',
            },
            '& .neural-dot:nth-of-type(2)': {
              top: '30%',
              right: '25%',
              animationDelay: '0.3s',
            },
            '& .neural-dot:nth-of-type(3)': {
              bottom: '25%',
              left: '25%',
              animationDelay: '0.6s',
            },
            '& .neural-dot:nth-of-type(4)': {
              bottom: '30%',
              right: '30%',
              animationDelay: '0.9s',
            },
            '& .neural-dot:nth-of-type(5)': {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDelay: '1.2s',
            },
            '@keyframes neuralPulse': {
              '0%, 100%': {
                opacity: 0.4,
                transform: 'scale(0.8)',
              },
              '50%': {
                opacity: 1,
                transform: 'scale(1.2)',
              },
            },
          }}
        >
          <div className="neural-dot" />
          <div className="neural-dot" />
          <div className="neural-dot" />
          <div className="neural-dot" />
          <div className="neural-dot" />
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box
        sx={{
          width: 300,
          height: 4,
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: '100%',
            background: 'linear-gradient(90deg, #22c55e, #10b981, #22c55e)',
            backgroundSize: '200% 100%',
            borderRadius: 2,
            animation: 'progressFlow 2s linear infinite',
            width: done ? '100%' : `${(idx / LOADING_SENTENCE.length) * 100}%`,
            transition: 'width 0.1s ease-out',
            '@keyframes progressFlow': {
              '0%': {
                backgroundPosition: '-200% 0',
              },
              '100%': {
                backgroundPosition: '200% 0',
              },
            },
          }}
        />
      </Box>

      {/* Typography with enhanced styling */}
      <Typography 
        variant="h6" 
        sx={{ 
          minHeight: 40, 
          color: "#f0fdf4",
          textAlign: 'center',
          fontWeight: 400,
          letterSpacing: 0.5,
          textShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
        }}
      >
        {displayed}
        {!done && (
          <span 
            style={{
              opacity: cursorVisible ? 1 : 0,
              transition: 'opacity 0.1s ease-in-out',
              color: '#22c55e',
              fontWeight: 'bold',
              marginLeft: '2px'
            }}
          >
            |
          </span>
        )}
        {done && (
          <span 
            style={{
              color: '#22c55e',
              fontWeight: 'bold',
              animation: 'dotBounce 0.35s ease-in-out infinite',
            }}
          >
            {dots}
          </span>
        )}
      </Typography>

      <style>
        {`
          @keyframes dotBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}
      </style>
    </Box>
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
  const [lineModalOpen, setLineModalOpen] = useState(false);

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
          background: "rgba(21, 128, 61, 0.12)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(34, 197, 94, 0.25)",
          boxShadow: "0 25px 50px -12px rgba(21, 128, 61, 0.5)",
          p: 0,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Loading Backdrop for ConfigModal only */}
        <Backdrop
          open={loading}
          sx={{
            color: "#f0fdf4",
            zIndex: (theme) => theme.zIndex.modal + 1,
            background: 'linear-gradient(135deg, rgba(21, 128, 61, 0.4), rgba(16, 185, 129, 0.3))',
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: 'center',
            alignItems: 'center',
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
            borderBottom: "1px solid rgba(34, 197, 94, 0.15)",
            background: "rgba(240, 253, 244, 0.05)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            minHeight: 64,
          }}
        >
          <Button
            startIcon={<ListIcon />}
            onClick={onSectionSelection}
            variant="outlined"
            sx={{ 
              ml: 1,
              background: "rgba(34, 197, 94, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#bbf7d0",
              "&:hover": {
                background: "rgba(34, 197, 94, 0.25)",
                borderColor: "rgba(34, 197, 94, 0.5)",
                boxShadow: "0 8px 25px 0 rgba(34, 197, 94, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            แผนการสอนของคุณ
          </Button>
          <Button
            startIcon={<LineIcon />}
            onClick={() => setLineModalOpen(true)}
            color="success"
            variant="contained"
            sx={{ ml: 1, bgcolor: "#06C755", "&:hover": { bgcolor: "#05b94a" } }}
          >
            Line OA
          </Button>
        </Box>
        <LineQROpenModal open={lineModalOpen} onClose={() => setLineModalOpen(false)} />
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
                      <Typography variant="h5" gutterBottom sx={{ color: "#f0fdf4", fontWeight: 600 }}>
                        ส่วนที่ 1: ข้อมูลหลักสูตร
                      </Typography>
                    );
                  case 1:
                    return (
                      <Typography variant="h5" gutterBottom sx={{ color: "#f0fdf4", fontWeight: 600 }}>
                        ส่วนที่ 2: จุดประสงค์การเรียนรู้
                      </Typography>
                    );
                  case 2:
                    return (
                      <Typography variant="h5" gutterBottom sx={{ color: "#f0fdf4", fontWeight: 600 }}>
                        ส่วนที่ 3: กระบวนการจัดกิจกรรมการเรียนรู้
                      </Typography>
                    );
                  case 3:
                    return (
                      <Typography variant="h5" gutterBottom sx={{ color: "#f0fdf4", fontWeight: 600 }}>
                        ส่วนที่ 4: การวัดประเมินผล
                      </Typography>
                    );
                  case 4:
                    return (
                      <Typography variant="h5" gutterBottom sx={{ color: "#f0fdf4", fontWeight: 600 }}>
                        ส่วนที่ 5: ขออนุเคราะห์ผลป้อนกลับ
                      </Typography>
                    );
                  default:
                    return (
                      <Typography variant="h6" gutterBottom sx={{ color: "#f0fdf4" }}>
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
                      <Typography variant="subtitle1" sx={{ color: "#dcfce7" }}>
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
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  background: "rgba(240, 253, 244, 0.1)",
                                  backdropFilter: "blur(8px)",
                                  WebkitBackdropFilter: "blur(8px)",
                                  "& fieldset": {
                                    borderColor: "rgba(34, 197, 94, 0.2)",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "rgba(34, 197, 94, 0.4)",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "rgba(34, 197, 94, 0.6)",
                                  },
                                  "& input": {
                                    color: "#f0fdf4",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#bbf7d0",
                                },
                              }}
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
                              InputProps={{ 
                                endAdornment: <span style={{ color: "#bbf7d0" }}>%</span>,
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  background: "rgba(240, 253, 244, 0.1)",
                                  backdropFilter: "blur(8px)",
                                  WebkitBackdropFilter: "blur(8px)",
                                  "& fieldset": {
                                    borderColor: "rgba(34, 197, 94, 0.2)",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "rgba(34, 197, 94, 0.4)",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "rgba(34, 197, 94, 0.6)",
                                  },
                                  "& input": {
                                    color: "#f0fdf4",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#bbf7d0",
                                },
                              }}
                            />
                            <Button
                              variant="outlined"
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
                              sx={{
                                background: "rgba(239, 68, 68, 0.15)",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#fecaca",
                                "&:hover": {
                                  background: "rgba(239, 68, 68, 0.25)",
                                  borderColor: "rgba(239, 68, 68, 0.5)",
                                },
                              }}
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
                        sx={{ 
                          mt: 1,
                          background: "rgba(34, 197, 94, 0.15)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
                          color: "#bbf7d0",
                          "&:hover": {
                            background: "rgba(34, 197, 94, 0.25)",
                            borderColor: "rgba(34, 197, 94, 0.5)",
                            boxShadow: "0 8px 25px 0 rgba(34, 197, 94, 0.4)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        เพิ่มประเภทนักเรียน
                      </Button>
                    </Box>
                  ) : fieldObj.field === "subject" ? (
                    <FormControl fullWidth margin="normal" key={fieldObj.field}>
                      <InputLabel 
                        id="subject-select-label"
                        sx={{ color: "#bbf7d0" }}
                      >
                        {fieldObj.label}
                      </InputLabel>
                      <Select
                        labelId="subject-select-label"
                        value={configFields.subject || ""}
                        label={fieldObj.label}
                        onChange={(e) => onChange("subject", e.target.value)}
                        sx={{
                          background: "rgba(240, 253, 244, 0.1)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(34, 197, 94, 0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(34, 197, 94, 0.4)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(34, 197, 94, 0.6)",
                          },
                          "& .MuiSelect-select": {
                            color: "#f0fdf4",
                          },
                          "& .MuiSvgIcon-root": {
                            color: "#bbf7d0",
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              background: "rgba(21, 128, 61, 0.12)",
                              backdropFilter: "blur(20px)",
                              WebkitBackdropFilter: "blur(20px)",
                              border: "1px solid rgba(34, 197, 94, 0.25)",
                              "& .MuiMenuItem-root": {
                                color: "#f0fdf4",
                                "&:hover": {
                                  background: "rgba(34, 197, 94, 0.15)",
                                },
                                "&.Mui-selected": {
                                  background: "rgba(34, 197, 94, 0.2)",
                                },
                              },
                            },
                          },
                        }}
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          background: "rgba(240, 253, 244, 0.1)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          "& fieldset": {
                            borderColor: "rgba(34, 197, 94, 0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(34, 197, 94, 0.4)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "rgba(34, 197, 94, 0.6)",
                          },
                          "& input": {
                            color: "#f0fdf4",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#bbf7d0",
                        },
                      }}
                    />
                  )
                )}
              

              {/* Show response box only if response is shown */}
              {showResponse && response && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    background: "rgba(240, 253, 244, 0.08)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    boxShadow: "0 8px 32px 0 rgba(21, 128, 61, 0.15)",
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(240, 253, 244, 0.1)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      "& fieldset": {
                        borderColor: "rgba(34, 197, 94, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(34, 197, 94, 0.4)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(34, 197, 94, 0.6)",
                      },
                      "& textarea": {
                        color: "#f0fdf4",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#bbf7d0",
                    },
                  }}
                />
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="outlined"
                  onClick={onPreviousStep}
                  disabled={configStep === 0 && !showResponse}
                  sx={{
                    background: "rgba(156, 163, 175, 0.15)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(156, 163, 175, 0.3)",
                    color: "#d1d5db",
                    "&:hover": {
                      background: "rgba(156, 163, 175, 0.25)",
                      borderColor: "rgba(156, 163, 175, 0.5)",
                    },
                    "&:disabled": {
                      background: "rgba(156, 163, 175, 0.05)",
                      borderColor: "rgba(156, 163, 175, 0.1)",
                      color: "rgba(156, 163, 175, 0.4)",
                    },
                  }}
                >
                  กลับ
                </Button>
                {configStep === stepConfigFields.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={loading}
                    sx={{
                      background: "rgba(34, 197, 94, 0.2)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      color: "#bbf7d0",
                      "&:hover": {
                        background: "rgba(34, 197, 94, 0.3)",
                        borderColor: "rgba(34, 197, 94, 0.5)",
                        boxShadow: "0 8px 25px 0 rgba(34, 197, 94, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        background: "rgba(34, 197, 94, 0.1)",
                        borderColor: "rgba(34, 197, 94, 0.15)",
                        color: "rgba(34, 197, 94, 0.4)",
                      },
                    }}
                  >
                    {loading ? "Generating..." : "Generate"}
                  </Button>
                ) : !showResponse ? (
                  <Button
                    variant="contained"
                    onClick={onStepSubmit}
                    disabled={loading}
                    sx={{
                      background: "rgba(34, 197, 94, 0.2)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      color: "#bbf7d0",
                      "&:hover": {
                        background: "rgba(34, 197, 94, 0.3)",
                        borderColor: "rgba(34, 197, 94, 0.5)",
                        boxShadow: "0 8px 25px 0 rgba(34, 197, 94, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        background: "rgba(34, 197, 94, 0.1)",
                        borderColor: "rgba(34, 197, 94, 0.15)",
                        color: "rgba(34, 197, 94, 0.4)",
                      },
                    }}
                  >
                    {loading ? "Loading..." : "ถัดไป"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => onFeedbackSubmit(feedback)}
                    disabled={loading}
                    sx={{
                      background: "rgba(34, 197, 94, 0.2)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      color: "#bbf7d0",
                      "&:hover": {
                        background: "rgba(34, 197, 94, 0.3)",
                        borderColor: "rgba(34, 197, 94, 0.5)",
                        boxShadow: "0 8px 25px 0 rgba(34, 197, 94, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        background: "rgba(34, 197, 94, 0.1)",
                        borderColor: "rgba(34, 197, 94, 0.15)",
                        color: "rgba(34, 197, 94, 0.4)",
                      },
                    }}
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
