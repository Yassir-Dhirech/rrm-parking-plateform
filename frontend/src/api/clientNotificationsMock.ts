import { message } from "antd";

export interface ClientNotificationLog {
  id: string;
  abonnementReference?: string;
  channel: "EMAIL" | "SMS" | "BOTH";
  typeEvenement:
    | "EXPIRATION_J10"
    | "EXPIRATION_J4"
    | "EXPIRATION_TERMINEE"
    | "CARTE_PRETE"
    | "CHEQUE_REFUSE"
    | "ABONNEMENT_EXPIRATION"
    | "SUSPENSION"
    | "PAIEMENT_CONFIRME";
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
    abonnementReference: "ABO-2026-000001",
    channel: "BOTH",
    typeEvenement: "CARTE_PRETE",
    destinataireNom: "Karim El Amrani",
    destinataireEmail: "karim.elamrani@example.com",
    destinataireTelephone: "0612345678",
    sujet: "RRM - Votre Carte RFID est prête au guichet",
    contenu: "Bonjour Karim El Amrani, votre carte RFID pour le Parking Bab El Had est préparée, testée et disponible au guichet RRM.",
    dateEnvoi: "28/08/2026 14:15",
    statutEnvoi: "SUCCES",
  },
  {
    id: "LOG-002",
    abonnementReference: "ABO-2026-000002",
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
  {
    id: "LOG-003",
    abonnementReference: "ABO-2026-000003",
    channel: "BOTH",
    typeEvenement: "EXPIRATION_J10",
    destinataireNom: "Sara Bennis",
    destinataireEmail: "sara.bennis@example.com",
    destinataireTelephone: "0661223344",
    sujet: "RRM - Relance 1 : Expiration de votre abonnement dans 10 jours",
    contenu: "Bonjour Sara Bennis, votre abonnement pour le Parking Bab El Had arrive à expiration dans 10 jours (le 01/04/2026). Pensez à renouveler dès à présent au guichet RRM.",
    dateEnvoi: "22/03/2026 09:00",
    statutEnvoi: "SUCCES",
  },
  {
    id: "LOG-004",
    abonnementReference: "ABO-2026-000003",
    channel: "BOTH",
    typeEvenement: "EXPIRATION_J4",
    destinataireNom: "Sara Bennis",
    destinataireEmail: "sara.bennis@example.com",
    destinataireTelephone: "0661223344",
    sujet: "RRM - Relance 2 Urgente : Expiration de votre abonnement dans 4 jours",
    contenu: "Alerte RRM : Plus que 4 jours avant la fin de validité de votre abonnement au Parking Bab El Had. Pour éviter la coupure de votre badge RFID, renouvelez au plus vite.",
    dateEnvoi: "28/03/2026 10:15",
    statutEnvoi: "SUCCES",
  },
  {
    id: "LOG-005",
    abonnementReference: "ABO-2026-000003",
    channel: "BOTH",
    typeEvenement: "EXPIRATION_TERMINEE",
    destinataireNom: "Sara Bennis",
    destinataireEmail: "sara.bennis@example.com",
    destinataireTelephone: "0661223344",
    sujet: "RRM - Notification 3 : Abonnement Expiré & Badge RFID Suspendu",
    contenu: "Votre abonnement pour le Parking Bab El Had a expiré ce jour (01/04/2026). Votre carte d'accès RFID a été désactivée aux barrières. Présentez-vous au guichet pour réactiver.",
    dateEnvoi: "01/04/2026 08:00",
    statutEnvoi: "SUCCES",
  },
];

export function getExpirationNotificationTemplate(
  palier: "J_MOINS_10" | "J_MOINS_4" | "EXPIRE",
  clientNom: string,
  parkingNom: string,
  dateFin: string
) {
  switch (palier) {
    case "J_MOINS_10":
      return {
        typeEvenement: "EXPIRATION_J10" as const,
        sujet: `RRM - Relance 1 : Expiration de votre abonnement dans 10 jours (${parkingNom})`,
        contenu: `Bonjour ${clientNom},\n\nNous vous informons que votre abonnement pour le ${parkingNom} arrive à échéance dans 10 jours, le ${dateFin}.\n\nAfin d'éviter toute interruption d'accès à nos parkings, nous vous invitons à renouveler votre formule dès maintenant auprès de notre guichet RRM ou via votre espace client.\n\nCordialement,\nRabat Région Mobilité (RRM)`,
      };
    case "J_MOINS_4":
      return {
        typeEvenement: "EXPIRATION_J4" as const,
        sujet: `RRM - Relance 2 Urgente : Expiration dans 4 jours (${parkingNom})`,
        contenu: `Alerte Renouvellement RRM - Bonjour ${clientNom},\n\nIl ne reste plus que 4 jours avant l'expiration définitive de votre abonnement (${parkingNom}) le ${dateFin}.\n\nPassé ce délai, votre carte d'accès physique RFID sera automatiquement désactivée aux barrières d'entrée et de sortie. Nous vous recommandons de procéder au renouvellement sans attendre.\n\nCordialement,\nRabat Région Mobilité (RRM)`,
      };
    case "EXPIRE":
    default:
      return {
        typeEvenement: "EXPIRATION_TERMINEE" as const,
        sujet: `RRM - Notification 3 : Abonnement Expiré & Suspension du Badge d'Accès (${parkingNom})`,
        contenu: `Notification Officielle RRM - Bonjour ${clientNom},\n\nVotre abonnement pour le ${parkingNom} est arrivé à expiration le ${dateFin} et n'est désormais plus valide.\n\nEn conséquence, votre carte d'accès RFID a été suspendue sur les scanners de barrières. Vous pouvez réactiver votre badge sans frais additionnels dès régularisation de votre renouvellement au guichet RRM.\n\nCordialement,\nRabat Région Mobilité (RRM)`,
      };
  }
}

export async function sendClientNotificationMock(params: {
  abonnementReference?: string;
  channel: "EMAIL" | "SMS" | "BOTH";
  typeEvenement:
    | "EXPIRATION_J10"
    | "EXPIRATION_J4"
    | "EXPIRATION_TERMINEE"
    | "CARTE_PRETE"
    | "CHEQUE_REFUSE"
    | "ABONNEMENT_EXPIRATION"
    | "SUSPENSION"
    | "PAIEMENT_CONFIRME";
  destinataireNom: string;
  destinataireEmail?: string;
  destinataireTelephone?: string;
  sujet: string;
  contenu: string;
}): Promise<ClientNotificationLog> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const dateStr = `${day}/${month}/${year} ${hours}:${minutes}`;

  const newLog: ClientNotificationLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    abonnementReference: params.abonnementReference,
    channel: params.channel,
    typeEvenement: params.typeEvenement,
    destinataireNom: params.destinataireNom,
    destinataireEmail: params.destinataireEmail,
    destinataireTelephone: params.destinataireTelephone,
    sujet: params.sujet,
    contenu: params.contenu,
    dateEnvoi: dateStr,
    statutEnvoi: "SUCCES",
  };

  mockClientNotificationsLog.unshift(newLog);

  const channelText = params.channel === "BOTH" ? "Email & SMS" : params.channel === "SMS" ? "SMS" : "Email";
  message.success(`Notification client transmise avec succès par ${channelText} à ${params.destinataireNom} !`);

  return newLog;
}

export async function getClientNotificationLogsMock(filter?: {
  destinataireNom?: string;
  abonnementReference?: string;
}): Promise<ClientNotificationLog[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockClientNotificationsLog.filter((l) => {
    if (filter?.abonnementReference && l.abonnementReference === filter.abonnementReference) {
      return true;
    }
    if (filter?.destinataireNom && l.destinataireNom.toLowerCase().includes(filter.destinataireNom.toLowerCase())) {
      return true;
    }
    return !filter?.destinataireNom && !filter?.abonnementReference;
  });
}
