import React, { useState } from "react";
import { Modal, Button, Tag, Input, message, Row, Col, Space } from "antd";
import {
  PrinterOutlined,
  MailOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  UserOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { formatDate } from "../../lib/dateUtils";
import { sendClientNotificationMock } from "../../api/clientNotificationsMock";

export interface RecuPaiementData {
  referenceQuittance?: string;
  demandeReference?: string;
  abonnementReference?: string;
  datePaiement?: string;
  clientNom: string;
  clientEmail?: string;
  clientTelephone?: string;
  clientCinOuIce?: string;
  typeClient?: string;
  parkingNom?: string;
  formuleNom?: string;
  immatriculation?: string;
  dureeMois?: number;
  montantAbonnement?: number;
  fraisCarteRfid?: number;
  montantTotal: number;
  modePaiement: "ESPECE" | "CHEQUE" | "ESPECE";
  numeroCheque?: string;
  banque?: string;
  caissierNom?: string;
}

interface RecuPaiementModalProps {
  open: boolean;
  onClose: () => void;
  data: RecuPaiementData | null;
}

export function RecuPaiementModal({ open, onClose, data }: RecuPaiementModalProps) {
  const [emailInput, setEmailInput] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // Sync initial email when modal opens
  React.useEffect(() => {
    if (data?.clientEmail) {
      setEmailInput(data.clientEmail);
    } else {
      setEmailInput("");
    }
  }, [data, open]);

  if (!data) return null;

  const refQuittance =
    data.referenceQuittance ||
    `RCU-2026-${(data.demandeReference || data.abonnementReference || "0001")
      .replace(/[^0-9]/g, "")
      .padStart(6, "0")}`;

  const dateAffichee = data.datePaiement ? formatDate(data.datePaiement) : formatDate(new Date().toISOString());

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    const targetEmail = emailInput.trim() || data.clientEmail || "";
    if (!targetEmail || !targetEmail.includes("@")) {
      message.error("Veuillez saisir une adresse email valide.");
      return;
    }

    setIsSendingEmail(true);
    try {
      sendClientNotificationMock({
        channel: "EMAIL",
        typeEvenement: "PAIEMENT_CONFIRME",
        destinataireNom: data.clientNom,
        destinataireEmail: targetEmail,
        destinataireTelephone: data.clientTelephone || "0600000000",
        sujet: `RRM - Votre Reçu Officiel d'Encaissement ${refQuittance}`,
        contenu: `Bonjour ${data.clientNom}, nous vous confirmons l'encaissement de votre paiement d'un montant de ${data.montantTotal.toLocaleString(
          "fr-FR"
        )} MAD TTC pour votre abonnement de stationnement au parking ${
          data.parkingNom || "RRM"
        }. Veuillez trouver ci-joint votre quittance officielle.`,
      });

      message.success(`Reçu officiel de paiement envoyé avec succès à : ${targetEmail}`);
    } catch {
      message.error("Erreur lors de l'envoi de l'email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const montantBase = data.montantAbonnement ?? (data.montantTotal - (data.fraisCarteRfid || 0));
  const fraisBadge = data.fraisCarteRfid ?? (data.montantTotal - montantBase);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      className="recu-paiement-modal-container"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .recu-print-area, .recu-print-area * {
            visibility: visible;
          }
          .recu-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Zone Imprimable du Reçu */}
      <div
        className="recu-print-area"
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#0f172a",
        }}
      >
        {/* En-tête officiel */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #006398", paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#006398", letterSpacing: "0.5px" }}>
              RABAT RÉGION MOBILITÉ
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
              Société de Développement Local (SDL) — Gestion du Stationnement
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              Rabat • Salé • Témara
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Tag color="blue" style={{ fontSize: 13, fontWeight: 800, padding: "3px 10px", borderRadius: 6 }}>
              QUITTANCE OFFICIELLE DE PAIEMENT
            </Tag>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
              N° {refQuittance}
            </div>
            <div style={{ fontSize: 12, color: "#475569" }}>
              Date d'émission : <strong>{dateAffichee}</strong>
            </div>
          </div>
        </div>

        {/* Détails du souscripteur et du véhicule */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", height: "100%" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#006398", textTransform: "uppercase", marginBottom: 6 }}>
                <UserOutlined style={{ marginRight: 6 }} /> Souscripteur
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                {data.clientNom}
              </div>
              {data.clientCinOuIce && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  Identifiant ({data.typeClient === "ENTREPRISE" ? "ICE" : "CIN"}) : <strong>{data.clientCinOuIce}</strong>
                </div>
              )}
              {data.clientTelephone && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  Tél : {data.clientTelephone}
                </div>
              )}
              {data.clientEmail && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  Email : {data.clientEmail}
                </div>
              )}
            </div>
          </Col>

          <Col span={12}>
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", height: "100%" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#006398", textTransform: "uppercase", marginBottom: 6 }}>
                <CarOutlined style={{ marginRight: 6 }} /> Prestation & Parking
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                Parking : {data.parkingNom || "Parking Régional RRM"}
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                Formule : <strong>{data.formuleNom || "Formule Abonnement"}</strong>
              </div>
              {data.dureeMois && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  Durée : <strong>{data.dureeMois} Mois</strong>
                </div>
              )}
              {data.immatriculation && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  Véhicule : <Tag color="cyan" style={{ fontWeight: 700 }}>{data.immatriculation}</Tag>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Tableau Financier */}
        <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left", borderBottom: "1px solid #cbd5e1" }}>
                <th style={{ padding: "10px 14px", color: "#334155" }}>Désignation de la prestation</th>
                <th style={{ padding: "10px 14px", textAlign: "right", color: "#334155" }}>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 14px" }}>
                  Abonnement stationnement — {data.parkingNom || "RRM"} ({data.formuleNom || "Période"})
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600 }}>
                  {montantBase.toLocaleString("fr-FR")} MAD
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 14px" }}>
                  Frais de carte RFID {fraisBadge > 0 ? "(Nouvelle émission / duplicata)" : "(Réutilisation carte existante)"}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: fraisBadge > 0 ? "#d97706" : "#16a34a" }}>
                  {fraisBadge > 0 ? `+${fraisBadge.toLocaleString("fr-FR")} MAD` : "0 MAD (Exonéré)"}
                </td>
              </tr>
              <tr style={{ background: "#f8fafc" }}>
                <td style={{ padding: "12px 14px", fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                  TOTAL NET RÉGLÉ & QUITTANCÉ
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 900, fontSize: 17, color: "#16a34a" }}>
                  {data.montantTotal.toLocaleString("fr-FR")} MAD TTC
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Détails du règlement et encaissement */}
        <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <Row gutter={[16, 8]} align="middle">
            <Col span={12}>
              <div style={{ fontSize: 12, color: "#475569" }}>
                Mode de règlement :{" "}
                <Tag color={data.modePaiement === "CHEQUE" ? "purple" : "green"} style={{ fontWeight: 800 }}>
                  {data.modePaiement === "CHEQUE" ? "CHÈQUE BANCAIRE" : "ESPÈCES"}
                </Tag>
              </div>
              {data.numeroCheque && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  N° Chèque : <strong>{data.numeroCheque}</strong>
                  {data.banque && ` (${data.banque})`}
                </div>
              )}
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#475569" }}>
                Encaissé par : <strong>{data.caissierNom || "Agent Guichet RRM"}</strong>
              </div>
              <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} /> Règlement Confirmé & Archivé
              </div>
            </Col>
          </Row>
        </div>

        {/* Mention légale & Cachet */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #cbd5e1", paddingTop: 12, fontSize: 11, color: "#64748b" }}>
          <div>
            Ce reçu tient lieu de quittance de paiement pour le compte de Rabat Région Mobilité.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#006398" }}>
            <SafetyCertificateOutlined /> Cachet Automatique Guichet RRM
          </div>
        </div>
      </div>

      {/* Zone de choix : Envoi par Email ou Impression (Non visible à l'impression) */}
      <div className="no-print" style={{ marginTop: 20, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
        <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <MailOutlined style={{ color: "#0284c7" }} /> Transmettre le reçu au souscripteur par Email :
          </div>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Adresse email du client..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onPressEnter={handleSendEmail}
              prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
              style={{ fontSize: 13 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={isSendingEmail}
              onClick={handleSendEmail}
              style={{ backgroundColor: "#0284c7", borderColor: "#0284c7", fontWeight: 600 }}
            >
              Envoyer par Email
            </Button>
          </Space.Compact>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <Button onClick={onClose} style={{ fontWeight: 600 }}>
            Fermer
          </Button>

          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 700, height: 38, paddingInline: 20 }}
          >
            Imprimer la Quittance / Télécharger PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
