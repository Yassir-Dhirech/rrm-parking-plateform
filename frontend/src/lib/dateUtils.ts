/**
 * Formats any date string (ISO YYYY-MM-DD, YYYY-MM-DD HH:mm, etc.) into standard DD/MM/YYYY format.
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";

  // Already formatted as DD/MM/YYYY or DD/MM/YYYY HH:mm
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    return dateStr;
  }

  // Matches YYYY-MM-DD or YYYY-MM-DD HH:mm
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}:\d{2}(?::\d{2})?))?/);
  if (match) {
    const [, yyyy, mm, dd, time] = match;
    return time ? `${dd}/${mm}/${yyyy} ${time}` : `${dd}/${mm}/${yyyy}`;
  }

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns today's date formatted as DD/MM/YYYY.
 */
export function getTodayFormatted(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
