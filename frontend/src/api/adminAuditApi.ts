import client from "./client";
import { mockLogs } from "./adminMock";
import type { AuditLog } from "../features/admin/types";

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const response = await client.get<AuditLog[]>("/admin/logs");
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    throw new Error("Table audit_log vide ou en cours de chargement");
  } catch (err) {
    console.warn("Backend /admin/logs non disponible, utilisation du fallback:", err);
    return mockLogs;
  }
}
