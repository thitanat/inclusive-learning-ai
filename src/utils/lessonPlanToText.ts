type Step = {
  ขั้น: string;
  กิจกรรม: Record<string, any>;
};

function formatObject(obj: any, indent = 0): string {
  let output = "";
  const indentation = "  ".repeat(indent);

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      output += `${indentation}- [${idx + 1}]\n`;
      output += formatObject(item, indent + 1);
    });
  } else if (typeof obj === "object" && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        output += `${indentation}${key}:\n`;
        output += formatObject(value, indent + 1);
      } else {
        output += `${indentation}${key}: ${value}\n`;
      }
    });
  } else {
    output += `${indentation}${obj}\n`;
  }
  return output;
}

export function lessonPlanToText(lessonPlan: Record<string, any>): string {
  return formatObject(lessonPlan);
}