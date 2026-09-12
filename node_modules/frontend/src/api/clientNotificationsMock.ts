import { message } from "antd";

export interface ClientNotificationLog {
  id: string;
  channel: "EMAIL" | "SMS" | "BOTH";
  typeEvenement: "CARTE_PRETE" | "CHEQUE_REFUSE" | "ABONNEMENT_EXPIRATION" | "SUSPENSION" | "PAIEMENT_CONFIRME";
  destinataireNom: string;
  destinataireEmail?: string;
  destinataireTelephone?: string;
  sujet: string;
  contenu: string;
  dateEnvoi: string;
  statutEnvoi: "SUCCES" | "EN_COURS" | "ECHEC";
}

const mockClientNotificationsLog: ClientNotificationLog[] = [
  {
    id: "LOG-001",
    channel: "BOTH",
    typeEvenement: "CARTE_PRETE",
    destinataireNom: "Karim El Amrani",
    destinataireEmail: "karim.elamrani@example.com",
    destinataireTelephone: "0612345678",
    sujet: "RRM - Votre Carte RFID est prête au guichet",
    contenu: "Bonjour Karim El Amrani, votre carte RFID pour le Parking Agdal Gare est préparée, testée et disponible au guichet RRM.",
    dateEnvoi: "28/08/2026 14:15",
    statutEnvoi: "SUCCES",
  },
  {
    id: "LOG-002",
    channel: "EMAIL",
    typeEvenement: "CHEQUE_REFUSE",
    destinataireNom: "Société Atlas Trans",
    destinataireEmail: "contact@atlastrans.ma",
    destinataireTelephone: "0537001122",
    sujet: "RRM - Notification de non-conformité chèque",
    contenu: "Bonjour, le chèque n° CHQ-889012 n'a pas pu être régularisé. Veuillez vous présenter au guichet RRM.",
    dateEnvoi: "27/08/2026 11:30",
    statutEnvoi: "SUCCES",
  },
];

export async function sendClientNotificationMock(params: {
  channel: "EMAIL" | "SMS" | "BOTH";
  typeEvenement: "CARTE_PRETE" | "CHEQUE_REFUSE" | "ABONNEMENT_EXPIRATION" | "SUSPENSION" | "PAIEMENT_CONFIRME";
  destinataireNom: string;
  destinataireEmail?: string;
  destinataireTelephone?: string;
  sujet: string;
  contenu: string;
}): Promise<ClientNotificationLog> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newLog: ClientNotificationLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    channel: params.channel,
    typeEvenement: params.typeEvenement,
    destinataireNom: params.destinataireNom,
    destinataireEmail: params.destinataireEmail,
    destinataireTelephone: params.destinataireTelephone,
    sujet: params.sujet,
    contenu: params.contenu,
    dateEnvoi: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    statutEnvoi: "SUCCES",
  };

  mockClientNotificationsLog.unshift(newLog);

  const channelText = params.channel === "BOTH" ? "Email & SMS" : params.channel === "SMS" ? "SMS" : "Email";
  message.success(`⚡ Notification client transmise avec succès par ${channelText} à ${params.destinataireNom} !`);

  return newLog;
}

export async function getClientNotificationLogsMock(destinataireNom?: string): Promise<ClientNotificationLog[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (!destinataireNom) return mockClientNotificationsLog;
  return mockClientNotificationsLog.filter(
    (l) => l.destinataireNom.toLowerCase().includes(destinataireNom.toLowerCase())
  );
}
