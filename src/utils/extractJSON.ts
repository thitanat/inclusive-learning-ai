export async function extractJSON(str: string) {
  // Find the first occurrence of [ or {
  const firstBracket = str.indexOf('[');
  const firstBrace = str.indexOf('{');
  let start = -1;
  let openChar = '';
  let closeChar = '';
  if (
    (firstBracket !== -1 && firstBrace === -1) ||
    (firstBracket !== -1 && firstBracket < firstBrace)
  ) {
    start = firstBracket;
    openChar = '[';
    closeChar = ']';
  } else if (firstBrace !== -1) {
    start = firstBrace;
    openChar = '{';
    closeChar = '}';
  }
  if (start === -1) return null;

  // Find the matching closing bracket/brace, respecting nesting
  let depth = 0;
  let end = -1;
  for (let i = start; i < str.length; i++) {
    if (str[i] === openChar) depth++;
    if (str[i] === closeChar) depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
  if (end === -1) return null;

  let jsonStr = str.slice(start, end + 1);

  try {
    const parsed = JSON.parse(jsonStr);
    // If it's an array, convert to object with numeric keys
    if (Array.isArray(parsed)) {
      const obj: Record<number, unknown> = {};
      parsed.forEach((item, idx) => {
        obj[idx] = item;
      });
      return obj;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to parse extracted JSON:", e);
    return null;
  }
}