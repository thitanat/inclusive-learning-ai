import { Paper, Typography, Box, List, ListItem, ListItemText } from "@mui/material";

export default function JsonResponse({ jsonResponse }) {
  const parsed = JSON.parse(jsonResponse);
  console.log("JSON Response:", parsed);
  console.log("unit:", parsed?.unit);
  if (!parsed) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="subtitle1">
          <strong>แสดงตัวอย่างแผนการสอน</strong>
        </Typography>
        <Box bgcolor="grey.200" p={2} borderRadius={2} sx={{ overflowX: "auto" }}>
          ยังไม่มีแผนการสอนในขณะนี้
        </Box>
      </Paper>
    );
  }

  const renderUnit = (unit) => (
    <Box key={unit?.unitTitle || "หน่วยไม่มีชื่อ"} sx={{ mb: 2 }}>
      <Typography variant="h6">หน่วย: {unit?.unitTitle || "ไม่มีข้อมูล"}</Typography>
      <Typography>ระยะเวลา: {unit?.duration || "ไม่มีข้อมูล"}</Typography>
      <Typography>
        จุดเน้นความสามารถ: {unit?.competencyFocus?.join(", ") || "ไม่มีข้อมูล"}
      </Typography>
      <Typography>
        ผลลัพธ์การเรียนรู้: {unit?.learningOutcomes?.join(", ") || "ไม่มีข้อมูล"}
      </Typography>
      <Typography>สถานการณ์: {unit?.scenarios || "ไม่มีข้อมูล"}</Typography>
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle2">การออกแบบ UDL:</Typography>
        <Typography>
          - การมีส่วนร่วม: {unit?.udlDesign?.multipleMeansOfEngagement || "ไม่มีข้อมูล"}
        </Typography>
        <Typography>
          - การนำเสนอ: {unit?.udlDesign?.multipleMeansOfRepresentation || "ไม่มีข้อมูล"}
        </Typography>
        <Typography>
          - การกระทำ/การแสดงออก: {unit?.udlDesign?.multipleMeansOfActionExpression || "ไม่มีข้อมูล"}
        </Typography>
      </Box>
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle2">กิจกรรม:</Typography>
        <List>
          {unit?.activities?.length > 0 ? (
            unit.activities.map((activity, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`กิจกรรม: ${activity?.activityTitle || "ไม่มีข้อมูล"}`}
                  secondary={`กลยุทธ์: ${
                    activity?.strategies?.join(", ") || "ไม่มีข้อมูล"
                  }, การสนับสนุน: ${
                    activity?.scaffolding ? "มี" : "ไม่มี"
                  }, การสนับสนุนทางเทคโนโลยี: ${
                    activity?.technologySupport?.join(", ") || "ไม่มีข้อมูล"
                  }, การสนับสนุนการรวม: ${
                    activity?.inclusionSupport?.join(", ") || "ไม่มีข้อมูล"
                  }`}
                />
              </ListItem>
            ))
          ) : (
            <Typography>ไม่มีข้อมูลกิจกรรม</Typography>
          )}
        </List>
      </Box>
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle2">การประเมินผล:</Typography>
        <Typography>- การประเมินผลเชิงรูปธรรม: {unit?.assessment?.formative || "ไม่มีข้อมูล"}</Typography>
        <Typography>- การประเมินผลเชิงสรุป: {unit?.assessment?.summative || "ไม่มีข้อมูล"}</Typography>
        <Typography>
          - วิธีการประเมินที่หลากหลาย:{" "}
          {unit?.assessment?.diverseAssessmentMethods?.join(", ") || "ไม่มีข้อมูล"}
        </Typography>
        <Typography>
          - การประเมินผลการถ่ายโอน: แนวตั้ง:{" "}
          {unit?.assessment?.transferAssessment?.vertical || "ไม่มีข้อมูล"}, แนวนอน:{" "}
          {unit?.assessment?.transferAssessment?.horizontal || "ไม่มีข้อมูล"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        แสดงตัวอย่างแผนการสอน
      </Typography>
      <Typography variant="h6">
        ชื่อหลักสูตร: {parsed?.courseTitle || "ไม่มีข้อมูล"}
      </Typography>
      <Typography>ระดับ: {parsed?.level || "ไม่มีข้อมูล"}</Typography>
      <Typography>วิชา: {parsed?.subject || "ไม่มีข้อมูล"}</Typography>
      <Typography>ระยะเวลา (ชั่วโมง): {parsed?.durationHours || "ไม่มีข้อมูล"}</Typography>
      <Box sx={{ mt: 2, bgcolor: "grey.100", p: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          หน่วย:
        </Typography>
        {Array.isArray(parsed?.unit) && parsed.unit.length > 0 ? (
          parsed.unit.map(renderUnit)
        ) : (
          <Typography>ไม่มีข้อมูลหน่วย</Typography>
        )}
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">การพัฒนาครู:</Typography>
        <Typography>
          {parsed?.teacherDevelopment?.join(", ") || "ไม่มีข้อมูล"}
        </Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">ความร่วมมือ:</Typography>
        <Typography>
          - กับผู้ปกครอง: {parsed?.collaboration?.withParents || "ไม่มีข้อมูล"}
        </Typography>
        <Typography>
          - กับผู้เชี่ยวชาญ: {parsed?.collaboration?.withExperts || "ไม่มีข้อมูล"}
        </Typography>
        <Typography>
          - กับครูร่วม: {parsed?.collaboration?.withCoTeachers || "ไม่มีข้อมูล"}
        </Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">สภาพแวดล้อมในห้องเรียน:</Typography>
        <Typography>
          - ความยืดหยุ่นทางกายภาพ:{" "}
          {parsed?.classroomEnvironment?.physicalFlexibility ? "ใช่" : "ไม่ใช่"}
        </Typography>
        <Typography>
          - ความปลอดภัยทางอารมณ์:{" "}
          {parsed?.classroomEnvironment?.emotionalSafety ? "ใช่" : "ไม่ใช่"}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2">การสนับสนุนพฤติกรรมเชิงบวก:</Typography>
          <Typography>
            - กฎระเบียบ: {parsed?.classroomEnvironment?.positiveBehaviorSupport?.rules || "ไม่มีข้อมูล"}
          </Typography>
          <Typography>
            - การเสริมแรง:{" "}
            {parsed?.classroomEnvironment?.positiveBehaviorSupport?.reinforcements || "ไม่มีข้อมูล"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
