import { Paper, Typography, Box, List, ListItem, ListItemText } from "@mui/material";

export default function JsonResponse({ jsonResponse }) {
  const parsed = JSON.parse(jsonResponse);
  if (!parsed) {
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

  const renderWeeklyPlan = (week) => (
    <Box key={week.week} sx={{ mb: 2 }}>
      <Typography variant="subtitle1">สัปดาห์ที่ {week.week}: {week.topic}</Typography>
      <Typography>จำนวนชั่วโมง: {week.hours}</Typography>
      <Typography>วิธีการสอน: {week.teachingMethods.join(", ")}</Typography>
      <Typography>สื่อการสอน: {week.teachingMaterials.join(", ")}</Typography>
      <Typography>การประเมิน: {week.assessment.join(", ")}</Typography>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        เค้าโครงการสอน
      </Typography>

      {/* Course Info */}
      <Typography variant="h6">ข้อมูลรายวิชา</Typography>
      <Typography>รหัสวิชา: {parsed.courseInfo.courseCode}</Typography>
      <Typography>ชื่อวิชา: {parsed.courseInfo.courseTitle}</Typography>
      <Typography>จำนวนหน่วยกิต: {parsed.courseInfo.credits}</Typography>
      <Typography>ผู้สอน: {parsed.courseInfo.instructor}</Typography>
      <Typography>ภาคการศึกษา: {parsed.courseInfo.semester} ปีการศึกษา: {parsed.courseInfo.academicYear}</Typography>
      <Typography>สาขา: {parsed.courseInfo.program}</Typography>
      <Typography>คณะ: {parsed.courseInfo.faculty}</Typography>

      {/* Description */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">คำอธิบายรายวิชา</Typography>
        <Typography>{parsed.courseDescription}</Typography>
      </Box>

      {/* Objectives */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">จุดประสงค์รายวิชา</Typography>
        <Typography variant="subtitle2">พุทธิพิสัย:</Typography>
        <List>{parsed.courseObjectives.cognitive.map((obj, i) => (<ListItem key={i}><ListItemText primary={obj} /></ListItem>))}</List>
        <Typography variant="subtitle2">ทักษะพิสัย:</Typography>
        <List>{parsed.courseObjectives.psychomotor.map((obj, i) => (<ListItem key={i}><ListItemText primary={obj} /></ListItem>))}</List>
        <Typography variant="subtitle2">จิตพิสัย:</Typography>
        <List>{parsed.courseObjectives.affective.map((obj, i) => (<ListItem key={i}><ListItemText primary={obj} /></ListItem>))}</List>
      </Box>

      {/* Weekly Plan */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">แผนการสอนรายสัปดาห์</Typography>
        {parsed.weeklyPlan.map(renderWeeklyPlan)}
      </Box>

      {/* Student-Centered Learning */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">กิจกรรมที่เน้นผู้เรียนเป็นสำคัญ</Typography>
        <Typography>{parsed.studentCenteredLearning.join(", ")}</Typography>
      </Box>

      {/* Teaching Aids */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">สื่อการสอน</Typography>
        <Typography>{parsed.teachingAids.join(", ")}</Typography>
      </Box>

      {/* Technology Usage */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">การใช้เทคโนโลยี</Typography>
        <Typography>{parsed.useOfTechnology.join(", ")}</Typography>
      </Box>

      {/* Grading */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">เกณฑ์การวัดผล</Typography>
        <Typography>คะแนนเก็บ: {parsed.grading.continuousAssessment}</Typography>
        <Typography>สอบกลางภาค: {parsed.grading.midtermExam}</Typography>
        <Typography>สอบปลายภาค: {parsed.grading.finalExam}</Typography>
      </Box>

      {/* References */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">เอกสารอ้างอิง</Typography>
        <Typography variant="subtitle2">หนังสือบังคับ:</Typography>
        <List>{parsed.references.mandatoryBooks.map((book, i) => (<ListItem key={i}><ListItemText primary={book} /></ListItem>))}</List>
        <Typography variant="subtitle2">หนังสือเพิ่มเติม:</Typography>
        <List>{parsed.references.additionalBooks.map((book, i) => (<ListItem key={i}><ListItemText primary={book} /></ListItem>))}</List>
      </Box>

    </Paper>
  );
}
