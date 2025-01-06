export function safeParse(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return '';
  }
}