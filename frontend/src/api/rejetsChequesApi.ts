import apiClient from "./client";

export type StatutRejetCheque = "EN_ATTENTE_VALIDATION" | "BLOCAGE_EN_COURS" |
  "BLOQUE" | "REGULARISATION_ENREGISTREE" | "REACTIVATION_EN_COURS" | "TERMINE";

export interface ChequeCandidat {
  paiementId: number;
  referencePaiement: string;
  numeroCheque: string;
  banqueCheque: string;
  dateEmissionCheque: string;
  statutCheque: string;
  montantTtc: number;
  abonnementId: number;
  referenceAbonnement: string;
  statutAbonnement: string;
  clientNom: string;
}

export interface DossierRejetCheque {
  id: number;
  statut: StatutRejetCheque;
  paiementInitialId: number;
  referencePaiement: string;
  numeroCheque: string;
  abonnementId: number;
  referenceAbonnement: string;
  clientNom: string;
  clientId: number;
  clientIdentifiant: string | null;
  clientEmail: string | null;
  clientTelephone: string | null;
  parkingNom: string;
  statutAbonnement: string;
  montantInitialTtc: number;
  montantAbonnementTtc: number | null;
  fraisCarteTtc: number | null;
  factureInitialeNumero: string | null;
  documentCorrectifReference: string | null;
  dateLettreBanque: string;
  constatComptable: string;
  dateDeclaration: string;
  dateDecision: string | null;
  dateBlocageCartes: string | null;
  paiementRegularisationId: number | null;
  referencePaiementRegularisation: string | null;
  statutPaiementRegularisation: string | null;
  modePaiementRegularisation: string | null;
  numeroChequeRegularisation: string | null;
  banqueChequeRegularisation: string | null;
  dateEmissionChequeRegularisation: string | null;
  agentRegularisation: string | null;
  dateRegularisation: string | null;
  dateValidationPaiement: string | null;
  factureRegularisationNumero: string | null;
  dateReactivation: string | null;
  dateActivationCartes: string | null;
}

export interface OperationRejetCheque {
  id: number;
  reference: string;
  carteReference: string;
  numeroCarte: string;
  statut: string;
}

export interface NotificationRejetCheque {
  id: number;
  sujet: string;
  contenu: string;
  dateCreation: string;
}

export async function listerNotificationsRejet() {
  const { data } = await apiClient.get<NotificationRejetCheque[]>("/rejets-cheques/notifications");
  return data;
}

export async function rechercherCheques(recherche: string, page: number) {
  const { data } = await apiClient.get<{ content: ChequeCandidat[]; totalPages: number }>(
    "/rejets-cheques/cheques", { params: { recherche, page } });
  return data;
}

export async function listerRejetsCheques() {
  const { data } = await apiClient.get<DossierRejetCheque[]>("/rejets-cheques");
  return data;
}

export async function declarerRejet(paiementId: number, dateLettreBanque: string, constatComptable: string) {
  await apiClient.post("/rejets-cheques", { paiementId, dateLettreBanque, constatComptable });
}

export async function agirDossier(id: number, action: "valider" | "reactiver") {
  await apiClient.post(`/rejets-cheques/${id}/${action}`);
}

export async function regulariserCheque(id: number, donnees: {
  modePaiement: "ESPECE" | "CHEQUE";
  numeroCheque?: string;
  banqueCheque?: string;
  dateEmissionCheque?: string;
  chequeCertifie?: boolean;
}) {
  await apiClient.post(`/rejets-cheques/${id}/regulariser`, donnees);
}

export async function listerOperationsRejet(id: number, action: "bloquer" | "reactiver") {
  const { data } = await apiClient.get<OperationRejetCheque[]>(
    `/rejets-cheques/${id}/operations-a-${action}`);
  return data;
}

export async function confirmerOperationRejet(id: number, operationId: number, action: "bloquer" | "reactiver") {
  await apiClient.post(`/rejets-cheques/${id}/operations/${operationId}/${action === "bloquer"
    ? "blocage-termine" : "activation-terminee"}`);
}

export async function telechargerDocumentCorrectif(id: number) {
  const { data } = await apiClient.get<Blob>(`/rejets-cheques/${id}/document-correctif`,
    { responseType: "blob" });
  const lien = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = lien;
  a.download = `document-correctif-${id}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(lien), 10_000);
}
