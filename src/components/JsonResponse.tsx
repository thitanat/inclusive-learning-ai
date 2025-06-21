import { Paper, Typography, Box, List, ListItem, ListItemText, Divider } from "@mui/material";

export default function JsonResponse({ generateJsonResponse }) {
  if (!generateJsonResponse) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="subtitle1">
          <strong>แสดงตัวอย่างเค้าโครงการสอน</strong>
        </Typography>
        <Box bgcolor="grey.200" p={2} borderRadius={2} sx={{ overflowX: "auto" }}>
          ยังไม่มีข้อมูลเค้าโครงการสอน
        </Box>
      </Paper>
    );
  }

  let parsed;
  try {
    parsed = typeof generateJsonResponse === "string"
      ? JSON.parse(generateJsonResponse)
      : generateJsonResponse;
  } catch (e) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography color="error">เกิดข้อผิดพลาดในการแปลงข้อมูล JSON</Typography>
      </Paper>
    );
  }

  if (!parsed || !parsed.lesson) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="subtitle1">
          <strong>แสดงตัวอย่างเค้าโครงการสอน</strong>
        </Typography>
        <Box bgcolor="grey.200" p={2} borderRadius={2} sx={{ overflowX: "auto" }}>
          ยังไม่มีข้อมูลเค้าโครงการสอน
        </Box>
      </Paper>
    );
  }

  const lesson = parsed.lesson;
  const listItems = (arr) => (
    <List dense>{arr.map((item, i) => (<ListItem key={i}><ListItemText primary={`• ${item}`} /></ListItem>))}</List>
  );

  const scoreTable = Object.entries(lesson["10_assessment"]["10_3_criteria"].scoringDetails).map(
    ([label, score], idx) => (
      <Typography key={idx}>• {label}: {score}</Typography>
    )
  );

  return (
    <Paper elevation={3} sx={{ p: 3, maxHeight: "90vh", overflowY: "scroll" }}>
      <Typography variant="h5" gutterBottom>แผนการจัดการเรียนรู้</Typography>

      {/* Basic Info */}
      <Typography><strong>ชื่อหลักสูตร:</strong> {parsed.courseTitle}</Typography>
      <Typography><strong>ชั้น:</strong> {parsed.gradeLevel}</Typography>
      <Typography><strong>กลุ่มสาระ:</strong> {parsed.subject}</Typography>
      <Typography><strong>ชั่วโมงรวม:</strong> {parsed.totalHours}</Typography>
      <Typography><strong>บทเรียน:</strong> {lesson.lessonTitle} (ชั่วโมง {lesson.hours})</Typography>
      <Typography><strong>สอนวันที่:</strong> {lesson.teachingDates.join(", ")}</Typography>
      <Typography><strong>ครูผู้สอน:</strong> {lesson.teacher}</Typography>
      <Divider sx={{ my: 2 }} />

      {/* Sections */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">1. สาระสำคัญ</Typography>
        <Typography>{lesson["1_essentialUnderstanding"]}</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">2. มาตรฐานการเรียนรู้</Typography>
        {lesson["2_standards"].map((s, i) => (
          <Typography key={i}>• ({s.code}) {s.description}</Typography>
        ))}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">3. ตัวชี้วัด</Typography>
        {listItems(lesson["3_indicators"])}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">4. จุดประสงค์การเรียนรู้</Typography>
        <Typography variant="subtitle2">4.1 ด้านความรู้</Typography>
        {listItems(lesson["4_learningObjectives"]["4_1_knowledge"])}
        <Typography variant="subtitle2">4.2 ด้านทักษะ/กระบวนการ</Typography>
        {listItems(lesson["4_learningObjectives"]["4_2_skills"])}
        <Typography variant="subtitle2">4.3 ด้านคุณลักษณะอันพึงประสงค์</Typography>
        {listItems(lesson["4_learningObjectives"]["4_3_attributes"])}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">5. สมรรถนะสำคัญ</Typography>
        {listItems(lesson["5_keyCompetencies"])}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">6. สาระการเรียนรู้</Typography>
        {listItems(lesson["6_contents"])}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">7. ชิ้นงาน / ภาระงาน</Typography>
        {listItems(lesson["7_assignments"])}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">8. กระบวนการจัดกิจกรรมการเรียนรู้</Typography>
        <Typography><strong>รูปแบบ:</strong> {lesson["8_learningProcess"].model}</Typography>

        <Typography variant="subtitle2">8.1 ขั้นนำเข้าสู่บทเรียน</Typography>
        {listItems(lesson["8_learningProcess"]["8_1_introduction"].activities)}

        {["8_2_1_engagement", "8_2_2_exploration", "8_2_3_explanation", "8_2_4_elaboration", "8_2_5_evaluation"].map((k, i) => {
          const activity = lesson["8_learningProcess"]["8_2_mainActivities"][k];
          const phaseNames = [
            "8.2.1 ขั้นสร้างความสนใจ (Engagement)",
            "8.2.2 ขั้นสำรวจและค้นหา (Exploration)",
            "8.2.3 ขั้นอธิบายและลงข้อสรุป (Explanation)",
            "8.2.4 ขั้นขยายความรู้ (Elaboration)",
            "8.2.5 ขั้นประเมิน (Evaluation)"
          ];
          return (
            <Box key={k} sx={{ mt: 1 }}>
              <Typography variant="subtitle2">{phaseNames[i]}</Typography>
              {activity.duration && <Typography>เวลา: {activity.duration}</Typography>}
              {activity.mode && <Typography>รูปแบบ: {activity.mode}</Typography>}
              {listItems(activity.activities)}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">9. สื่อ / อุปกรณ์ / แหล่งเรียนรู้</Typography>
        {listItems(lesson["9_materials"])}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">10. กระบวนการวัดและประเมินผล</Typography>

        <Typography variant="subtitle2">10.1 วิธีวัดและประเมินผล</Typography>
        {listItems(lesson["10_assessment"]["10_1_methods"])}

        <Typography variant="subtitle2">10.2 เครื่องมือที่ใช้วัดและประเมินผล</Typography>
        {listItems(lesson["10_assessment"]["10_2_tools"])}

        <Typography variant="subtitle2">10.3 เกณฑ์การวัดและประเมินผล</Typography>
        <Typography>เกณฑ์ผ่าน: {lesson["10_assessment"]["10_3_criteria"].passingScore}</Typography>
        {scoreTable}
      </Box>
    </Paper>
  );
}
