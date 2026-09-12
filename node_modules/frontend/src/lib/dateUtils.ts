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

/**
 * Parses a date string formatted as DD/MM/YYYY or ISO 8601 into a Date object.
 */
export function parseDateSafe(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy, hh, min] = ddmmyyyy;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh || 0), Number(min || 0));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Returns the expiration date (creation date + days, default 7 days) formatted as DD/MM/YYYY.
 */
export function getExpirationDateFormatted(creationDate?: string | Date | null, days = 7): string {
  const base = creationDate instanceof Date ? creationDate : parseDateSafe(creationDate) || new Date();
  const exp = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  const day = String(exp.getDate()).padStart(2, "0");
  const month = String(exp.getMonth() + 1).padStart(2, "0");
  const year = exp.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculates remaining validity days out of 7 days.
 * Returns 0 if expired.
 */
export function getValidityDaysRemaining(creationDate?: string | Date | null, maxDays = 7): number {
  const base = creationDate instanceof Date ? creationDate : parseDateSafe(creationDate);
  if (!base) return maxDays;
  const now = new Date();
  const diffMs = (base.getTime() + maxDays * 24 * 60 * 60 * 1000) - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Checks if a dossier has exceeded its 7-day validity period without payment.
 */
export function isDossierExpired(creationDate?: string | Date | null, maxDays = 7): boolean {
  const base = creationDate instanceof Date ? creationDate : parseDateSafe(creationDate);
  if (!base) return false;
  const now = new Date();
  const expirationMs = base.getTime() + maxDays * 24 * 60 * 60 * 1000;
  return now.getTime() > expirationMs;
}
