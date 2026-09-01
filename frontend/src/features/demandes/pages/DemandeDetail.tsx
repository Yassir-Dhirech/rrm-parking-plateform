import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Modal,
  Input,
  Form,
  Select,
  InputNumber,
  message,
  Tag,
  Divider,
  Alert,
  Steps,
  Row,
  Col,
  Image,
} from "antd";
import {
  CheckCircleOutlined,
  DollarOutlined,
  FileDoneOutlined,
  ArrowLeftOutlined,
  FolderOutlined,
  LockOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  CheckOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  NotificationOutlined,
  IdcardOutlined,
  CarOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import {
  getDemandeByIdMock,
  validerDemandeMock,
  enregistrerPaiementAgentMock,
  rejeterDemandeMock,
} from "../../../api/demandesMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { sendClientNotificationMock } from "../../../api/clientNotificationsMock";
import { type TypeDemande, typeDemandeLabels } from "../../../lib/enums";
import { formatDate } from "../../../lib/dateUtils";
import { type PaymentInfoInput } from "../types";

const BANK_OPTIONS = [
  { label: "CIH Bank", value: "CIH" },
  { label: "Attijariwafa Bank", value: "ATTIJARI" },
  { label: "BMCE Bank of Africa", value: "BMCE" },
  { label: "Société Générale", value: "SOCIETE GENERALE" },
  { label: "Banque Populaire", value: "BANQUE POPULAIRE" },
  { label: "Al Barid Bank", value: "AL BARID" },
  { label: "Autre", value: "Autre" },
];

function generateCinSvgUrl(nom: string, cin: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
    <defs>
      <linearGradient id="cinBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="50%" stop-color="#eef6f2"/>
        <stop offset="100%" stop-color="#dcefe6"/>
      </linearGradient>
    </defs>
    <rect width="500" height="315" rx="14" fill="url(#cinBg)" stroke="#1b4332" stroke-width="2"/>
    <rect x="0" y="0" width="500" height="44" fill="#1b4332" rx="14 14 0 0"/>
    <text x="250" y="19" fill="#d8f3dc" font-size="10" font-weight="bold" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="2">ROYAUME DU MAROC • المملكة المغربية</text>
    <text x="250" y="35" fill="#ffffff" font-size="12" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="1">CARTE NATIONALE D'IDENTITÉ ÉLECTRONIQUE (CIN)</text>
    
    <rect x="185" y="60" width="46" height="34" rx="4" fill="#d4af37" stroke="#b89728" stroke-width="1.5"/>
    <path d="M190 77 h36 M208 60 v34 M199 60 v34 M217 60 v34" stroke="#997d1e" stroke-width="1"/>
    
    <rect x="25" y="60" width="130" height="170" rx="8" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
    <circle cx="90" cy="115" r="30" fill="#64748b"/>
    <path d="M50 190 C50 150, 130 150, 130 190 Z" fill="#64748b"/>
    <rect x="25" y="238" width="130" height="22" rx="4" fill="#0f172a" opacity="0.85"/>
    <text x="90" y="253" fill="#f8fafc" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">OFFICIEL RRM</text>

    <text x="180" y="116" fill="#475569" font-size="10" font-weight="bold" font-family="Arial">NOM / PRÉNOM :</text>
    <text x="180" y="136" fill="#0f172a" font-size="15" font-weight="900" font-family="Arial">${(nom || "SOUSCRIPTEUR").toUpperCase()}</text>
    
    <text x="180" y="166" fill="#475569" font-size="10" font-weight="bold" font-family="Arial">N° D'IDENTITÉ NATIONALE (CIN) :</text>
    <text x="180" y="188" fill="#1b4332" font-size="18" font-weight="900" font-family="monospace" letter-spacing="2">${(cin || "A748392").toUpperCase()}</text>
    
    <text x="180" y="216" fill="#475569" font-size="10" font-weight="bold" font-family="Arial">NATIONALITÉ : <tspan fill="#0f172a" font-weight="bold">MAROCAINE</tspan></text>
    <text x="180" y="236" fill="#475569" font-size="10" font-weight="bold" font-family="Arial">VALIDITÉ : <tspan fill="#0f172a" font-weight="bold">12/2032</tspan> | LIEU : <tspan fill="#0f172a" font-weight="bold">RABAT</tspan></text>

    <rect x="15" y="270" width="470" height="32" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="25" y="284" fill="#1e293b" font-size="9" font-weight="bold" font-family="monospace">IDMAR${(cin || "A748392").toUpperCase()}<<<<<<<<<<<<<<<<<<<<<<</text>
    <text x="25" y="296" fill="#1e293b" font-size="9" font-weight="bold" font-family="monospace">9001014M3212318MAR<<<<<<<<<<<${(nom || "CLIENT").replace(/\\s+/g, "<").toUpperCase()}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function generateCarteGriseSvgUrl(nom: string, immat: string, vehicule: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
    <defs>
      <linearGradient id="cgBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#faf5ff"/>
        <stop offset="50%" stop-color="#f3e8ff"/>
        <stop offset="100%" stop-color="#e9d5ff"/>
      </linearGradient>
    </defs>
    <rect width="500" height="315" rx="14" fill="url(#cgBg)" stroke="#6b21a8" stroke-width="2"/>
    <rect x="0" y="0" width="500" height="44" fill="#581c87" rx="14 14 0 0"/>
    <text x="250" y="18" fill="#f3e8ff" font-size="9" font-weight="bold" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="1">ROYAUME DU MAROC • MINISTÈRE DU TRANSPORT</text>
    <text x="250" y="35" fill="#ffffff" font-size="12" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="2">CERTIFICAT D'IMMATRICULATION (CARTE GRISE)</text>

    <rect x="30" y="56" width="440" height="42" rx="8" fill="#ffffff" stroke="#9333ea" stroke-width="1.5"/>
    <text x="45" y="73" fill="#6b21a8" font-size="9" font-weight="bold" font-family="Arial">A. NUMÉRO D'IMMATRICULATION DU VÉHICULE :</text>
    <text x="250" y="90" fill="#0f172a" font-size="16" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="3">${immat || "12345 | A | 1"}</text>

    <rect x="30" y="108" width="210" height="150" rx="8" fill="#ffffff" stroke="#e9d5ff" stroke-width="1"/>
    <text x="42" y="126" fill="#7e22ce" font-size="9" font-weight="bold">C.1 TITULAIRE DU VÉHICULE :</text>
    <text x="42" y="144" fill="#0f172a" font-size="13" font-weight="900">${(nom || "SOUSCRIPTEUR").toUpperCase()}</text>
    
    <text x="42" y="170" fill="#7e22ce" font-size="9" font-weight="bold">D.1 MARQUE / MODÈLE :</text>
    <text x="42" y="188" fill="#0f172a" font-size="12" font-weight="bold">RENAULT / CLIO V</text>
    
    <text x="42" y="214" fill="#7e22ce" font-size="9" font-weight="bold">GENRE DU VÉHICULE :</text>
    <text x="42" y="232" fill="#0f172a" font-size="12" font-weight="bold">${(vehicule || "VOITURE").toUpperCase()}</text>

    <rect x="260" y="108" width="210" height="150" rx="8" fill="#ffffff" stroke="#e9d5ff" stroke-width="1"/>
    <text x="272" y="126" fill="#7e22ce" font-size="9" font-weight="bold">E. N° CHÂSSIS (VIN) :</text>
    <text x="272" y="144" fill="#0f172a" font-size="11" font-weight="900" font-family="monospace">VF1BB05CF9920148</text>

    <text x="272" y="170" fill="#7e22ce" font-size="9" font-weight="bold">P.1 PUISSANCE FISCALE :</text>
    <text x="272" y="188" fill="#0f172a" font-size="12" font-weight="bold">6 CV • DIESEL</text>

    <text x="272" y="214" fill="#7e22ce" font-size="9" font-weight="bold">B. 1ÈRE MISE EN CIRCULATION :</text>
    <text x="272" y="232" fill="#0f172a" font-size="12" font-weight="bold">14/03/2023 • RABAT</text>

    <rect x="30" y="268" width="440" height="34" rx="6" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1"/>
    <text x="250" y="289" fill="#6b21a8" font-size="10" font-weight="bold" font-family="Arial" text-anchor="middle">AGENCE NATIONALE DE LA SÉCURITÉ ROUTIÈRE (NARSA) — CONTRÔLE RRM</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export function DemandeDetail() {
  const { id } = useParams<{ id: string }>();
  const demandeId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role, userName } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectType, setRejectType] = useState<"DOSSIER" | "PAIEMENT">("DOSSIER");
  const [raison, setRaison] = useState("");
  
  const [paymentForm] = Form.useForm<PaymentInfoInput>();
  const currentPaymentMode = Form.useWatch("modePaiement", paymentForm) ?? "ESPECES";

  const { data, isLoading } = useQuery({
    queryKey: ["demande", demandeId],
    queryFn: () => getDemandeByIdMock(demandeId),
    enabled: !isNaN(demandeId),
  });

  // Action 1: Encaisser / Enregistrer le paiement (Agent & Superviseur) -> statut = PAIEMENT_ENREGISTRE
  const enregistrerPaiementMutation = useMutation<void, Error, PaymentInfoInput>({
    mutationFn: (payInput: PaymentInfoInput) =>
      enregistrerPaiementAgentMock(demandeId, payInput, `${userName ?? "Utilisateur"} (${role})`),
    onSuccess: () => {
      message.success("Paiement encaissé et confirmé avec succès. Le dossier est prêt pour validation.");
      sendClientNotificationMock({
        channel: "BOTH",
        typeEvenement: "PAIEMENT_CONFIRME",
        destinataireNom: data?.clientNom || "Client Souscripteur",
        destinataireEmail: data?.email || "client.rrm@example.com",
        destinataireTelephone: data?.telephone || "0612345678",
        sujet: "RRM - Confirmation de réception de paiement",
        contenu: `Bonjour ${data?.clientNom || "Client"}, nous vous confirmons la réception et le quittancement de votre paiement pour la demande ${data?.reference}.`,
      });
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });

  // Action 2: Valider la conformité du dossier (Superviseur UNIQUEMENT) -> statut = VALIDEE
  const validerDossierMutation = useMutation<void, Error, void>({
    mutationFn: () =>
      validerDemandeMock(demandeId, undefined, `${userName ?? "Utilisateur"} (${role})`),
    onSuccess: () => {
      message.success("Conformité du dossier validée avec succès par le superviseur !");
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
    onError: (err) => {
      message.error(err.message);
    },
  });

  const rejeterMutation = useMutation({
    mutationFn: () => rejeterDemandeMock(demandeId, `[Refus ${rejectType}] ${raison}`),
    onSuccess: () => {
      message.success(`Demande rejetée (${rejectType === "PAIEMENT" ? "Paiement non conforme" : "Dossier non conforme"})`);
      sendClientNotificationMock({
        channel: "BOTH",
        typeEvenement: rejectType === "PAIEMENT" ? "CHEQUE_REFUSE" : "CHEQUE_REFUSE",
        destinataireNom: data?.clientNom || "Client Souscripteur",
        destinataireEmail: data?.email || "client.rrm@example.com",
        destinataireTelephone: data?.telephone || "0612345678",
        sujet: `RRM - Information urgente : ${rejectType === "PAIEMENT" ? "Paiement non conforme" : "Dossier incomplet"}`,
        contenu: `Bonjour ${data?.clientNom || "Client"}, votre dossier ${data?.reference} nécessite une régularisation. Motif : ${raison}.`,
      });
      setRejectModalOpen(false);
      setRaison("");
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  const isPaiementDone = Boolean(data.paiementInfo) || data.statut === "PAIEMENT_ENREGISTRE" || data.statut === "VALIDEE";
  const isDossierValide = data.statut === "VALIDEE";
  const isAgent = role === "AGENT";
  const isSuperviseur = role === "SUPERVISEUR";

  const currentStep = isDossierValide ? 2 : isPaiementDone ? 1 : 0;

  const isNouvelAbo = data.typeDemande === "NOUVEL_ABONNEMENT";
  const isPerteCarte = data.typeDemande === "PERTE_CARTE";
  const isRenouvellement = data.typeDemande === "RENOUVELLEMENT";
  const fraisCarteRfid = (isNouvelAbo || isPerteCarte) ? 50 : 0;
  const montantBaseAbo = isPerteCarte ? 0 : (data.montantTotal || (isRenouvellement ? 6600 : 3600));
  const montantTotalExige = isPerteCarte ? 50 : (montantBaseAbo + (isNouvelAbo ? 50 : 0));

  const handleOpenPaymentModal = () => {
    paymentForm.resetFields();
    paymentForm.setFieldsValue({
      modePaiement: data.typeClient === "ENTREPRISE" ? "CHEQUE" : "ESPECES",
      montant: montantTotalExige,
    });
    setPaymentModalOpen(true);
  };

  const handleOpenRejectModal = (type: "DOSSIER" | "PAIEMENT") => {
    setRejectType(type);
    setRejectModalOpen(true);
  };

  const handlePaymentSubmit = (values: PaymentInfoInput) => {
    enregistrerPaiementMutation.mutate(values);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`${basePath}/demandes`)}
        style={{ marginBottom: 16 }}
      >
        Retour à la liste des demandes
      </Button>

      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Traitement de la Demande: {data.reference}</span>
            <StatusBadge statut={data.statut} />
          </div>
        }
      >
        {/* Stepper de Progression du Workflow */}
        <div style={{ marginBottom: 24, padding: "16px 24px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <Steps
            current={currentStep}
            items={[
              {
                title: "1. Soumission Demande",
                description: data.dateCreation,
              },
              {
                title: "2. Enregistrement Paiement",
                description: isPaiementDone ? `Paiement reçu (${data.paiementInfo?.modePaiement ?? "Effectué"})` : "En attente",
                icon: <DollarOutlined />,
              },
              {
                title: "3. Validation Dossier",
                description: isDossierValide ? "Validé et Activé" : "En attente",
                icon: <SafetyCertificateOutlined />,
              },
            ]}
          />
        </div>

        {data.statut === "REJETEE" && data.raisonRejet && (
          <Alert
            type="error"
            message="Motif du rejet"
            description={data.raisonRejet}
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        {/* Attribution Intervenant & Suivi SLA 7 Jours */}
        <Card size="small" style={{ marginBottom: 20, backgroundColor: "#f8fafc", borderRadius: 8, borderColor: "#cbd5e1" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Intervenant Traitant :</div>
              <strong style={{ fontSize: 14, color: "#003566" }}>
                <UserOutlined style={{ marginRight: 4 }} />
                {data.traiteParNom || data.agentAffecteNom || "Agent d'Exploitation"}
              </strong>
              {data.roleTraitePar && <Tag color="blue" style={{ marginLeft: 6 }}>{data.roleTraitePar}</Tag>}
            </Col>

            <Col xs={24} md={8}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Durée Traitement :</div>
              {data.dureeTraitementJours !== undefined ? (
                <strong style={{ fontSize: 14, color: "#16a34a" }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {data.dureeTraitementJours} Jours — {formatDate(data.dateTraitement ?? "")}
                </strong>
              ) : (
                <strong style={{ fontSize: 14, color: "#0284c7" }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  En cours — {data.slaRestantJours ?? 5}j restants
                </strong>
              )}
            </Col>

            <Col xs={24} md={8} style={{ textAlign: "right" }}>
              {data.slaStatut === "ALERT_1_JOUR" && (
                <Tag color="red" icon={<AlertOutlined />}>URGENT : 1 Jour Restant</Tag>
              )}
              {data.slaStatut === "ALERT_3_JOURS" && (
                <Tag color="warning" icon={<ClockCircleOutlined />}>Alerte : 3 Jours Restants</Tag>
              )}
              {data.slaStatut === "DEPASSE" && (
                <Tag color="red" icon={<AlertOutlined />}>Retard SLA (&gt;7 Jours)</Tag>
              )}
              {(!data.slaStatut || data.slaStatut === "DANS_LES_DELAIS") && (
                <Tag color="green" icon={<CheckCircleOutlined />}>Dans les Délais</Tag>
              )}
            </Col>
          </Row>
        </Card>

        {/* Informations Générales Souscripteur */}
        <Descriptions title="Informations Souscripteur & Contact" column={{ xs: 1, sm: 2, md: 2 }} bordered size="small" style={{ marginBottom: 20 }}>
          <Descriptions.Item label="Type de Demande">
            <Tag color={typeDemandeLabels[data.typeDemande as TypeDemande]?.color || "blue"}>
              {typeDemandeLabels[data.typeDemande as TypeDemande]?.label || data.typeDemande}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Catégorie Client">
            <Tag color={data.typeClient === "ENTREPRISE" ? "purple" : "blue"}>
              {data.typeClient === "ENTREPRISE" ? "Entreprise" : "Particulier"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Souscripteur">
            <strong>{data.clientNom}</strong>
          </Descriptions.Item>
          <Descriptions.Item label={data.typeClient === "ENTREPRISE" ? "ICE" : "CIN"}>
            <strong>{data.ice || data.cin || "A748392"}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
          <Descriptions.Item label="GSM">{data.telephone}</Descriptions.Item>
          <Descriptions.Item label="Date Soumission" span={2}>
            {formatDate(data.dateCreation)}
          </Descriptions.Item>
        </Descriptions>

        {/* Documents Justificatifs Officiels (CIN & Carte Grise) */}
        <Card
          size="small"
          title={
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Space>
                <FileImageOutlined style={{ color: "#0284c7", fontSize: 16 }} />
                <span style={{ color: "#003566", fontWeight: 800, fontSize: 14 }}>
                  Pièces Justificatives du Dossier (CIN & Carte Grise)
                </span>
              </Space>
              <Tag color="cyan" className="font-bold m-0">
                Documents Téléversés par le Souscripteur
              </Tag>
            </div>
          }
          style={{ marginBottom: 20, borderRadius: 10, borderColor: "#cbd5e1", backgroundColor: "#f8fafc" }}
        >
          <div className="mb-3 text-xs text-slate-500 font-medium">
            Cliquez sur un document pour l'agrandir en plein écran, zoomer ou faire pivoter pour contrôle de conformité.
          </div>

          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {/* Document 1 : Carte Nationale d'Identité (CIN) */}
              <Col xs={24} md={12}>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                      <IdcardOutlined style={{ color: "#16a34a" }} />
                      Carte Nationale d'Identité (CIN)
                    </span>
                    <Tag color="success" className="font-bold text-[10px] m-0">Recto Vérifié</Tag>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group">
                    <Image
                      src={data.cinRectoUrl || generateCinSvgUrl(data.clientNom, data.cin || "A748392")}
                      alt="CIN Recto Souscripteur"
                      className="w-full h-auto object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                      style={{ maxHeight: 220, borderRadius: 8 }}
                    />
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>N° CIN : <strong>{data.cin || "A748392"}</strong></span>
                    <span>Titulaire : <strong>{data.clientNom}</strong></span>
                  </div>
                </div>
              </Col>

              {/* Document 2 : Carte Grise (Certificat d'Immatriculation) */}
              <Col xs={24} md={12}>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                      <CarOutlined style={{ color: "#7e22ce" }} />
                      Carte Grise (Certificat d'Immatriculation)
                    </span>
                    <Tag color="purple" className="font-bold text-[10px] m-0">Véhicule Conforme</Tag>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group">
                    <Image
                      src={data.carteGriseRectoUrl || generateCarteGriseSvgUrl(data.clientNom, data.immatriculation, data.typeVehicule || "Voiture")}
                      alt="Carte Grise Véhicule"
                      className="w-full h-auto object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                      style={{ maxHeight: 220, borderRadius: 8 }}
                    />
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Immatriculation : <strong>{data.immatriculation || "12345 | A | 1"}</strong></span>
                    <span>Châssis : <strong className="font-mono">VF1BB05CF...</strong></span>
                  </div>
                </div>
              </Col>
            </Row>
          </Image.PreviewGroup>
        </Card>

        {/* Détails Spécifiques au Type de Demande */}
        <Card
          size="small"
          title={
            <Space>
              <FolderOutlined style={{ color: "#0284c7" }} />
              <span style={{ color: "#003566", fontWeight: 700 }}>
                Spécificités : {typeDemandeLabels[data.typeDemande as TypeDemande]?.label}
              </span>
            </Space>
          }
          style={{ marginBottom: 20, borderRadius: 10, borderColor: "#cbd5e1" }}
        >
          {data.typeDemande === "NOUVEL_ABONNEMENT" && (
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="small">
              <Descriptions.Item label="Parking Sollicité">
                <strong>{data.parkingNom}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Formule Tarifaire">
                <Tag color="blue">{data.forfaitNom || "Pass Permanent 24h/7j"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durée Souscription">
                {data.dureeMois || 6} Mois
              </Descriptions.Item>
              <Descriptions.Item label="Immatriculation">
                <Tag color="cyan">{data.immatriculation}</Tag> — {data.typeVehicule || "Voiture"}
              </Descriptions.Item>
              <Descriptions.Item label="Frais d'Émission Carte RFID">
                <Tag color="orange" style={{ fontWeight: 700 }}>+50 MAD TTC</Tag>
                <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>
                  Nouvelle carte pour premier abonné
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Montant Total Net" span={2}>
                <strong style={{ fontSize: 16, color: "#16a34a" }}>
                  {montantTotalExige} MAD TTC
                </strong>
                <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>
                  Abonnement : {montantBaseAbo} MAD + Badge RFID : 50 MAD
                </span>
              </Descriptions.Item>
            </Descriptions>
          )}

          {data.typeDemande === "RENOUVELLEMENT" && (
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="small">
              <Descriptions.Item label="Carte RFID Réutilisée">
                <Tag color="gold" style={{ fontSize: 13, fontWeight: 700 }}>
                  {data.numeroCarteAbonne || "CRT-2025-001099"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Parking d'Attache">
                <strong>{data.parkingNom}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Formule">
                <Tag color="purple">{data.forfaitNom || "Pass Permanent 24h/7j"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Période Prolongation">
                {data.dureeMois || 12} Mois
              </Descriptions.Item>
              <Descriptions.Item label="Immatriculation">
                <Tag color="cyan">{data.immatriculation}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Frais de Carte RFID">
                <Tag color="green" style={{ fontWeight: 700 }}>0 MAD — Exonéré</Tag>
                <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>
                  Même carte physique conservée
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Montant Renouvellement Total" span={2}>
                <strong style={{ fontSize: 16, color: "#16a34a" }}>
                  {montantTotalExige} MAD TTC
                </strong>
              </Descriptions.Item>
            </Descriptions>
          )}

          {data.typeDemande === "CHANGEMENT_PARKING" && (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Carte RFID">
                <Tag color="gold">{data.numeroCarteAbonne || "CRT-2025-000844"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Parking Origine">
                <Tag color="default">{data.parkingNom}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Parking Destination" span={2}>
                <Tag color="orange" style={{ fontSize: 13, padding: "2px 8px" }}>
                  <ArrowRightOutlined style={{ marginRight: 6 }} />
                  {data.nouveauParkingNom || "Parking Agdal Gare"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Motif Transfert" span={2}>
                <em>{data.motifChangement || "Changement de lieu de travail ou de résidence."}</em>
              </Descriptions.Item>
            </Descriptions>
          )}

          {data.typeDemande === "PERTE_CARTE" && (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Carte Perdue">
                <Tag color="volcano" style={{ fontSize: 13, fontWeight: 700 }}>
                  {data.numeroCarteAbonne || "CRT-2025-000310"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Statut Origine">
                <Tag color="red">Désactivée & Bloquée</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Parking d'Attache">
                <strong>{data.parkingNom}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Immatriculation">
                <Tag color="cyan">{data.immatriculation}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Motif Déclaration" span={2}>
                {data.motifPerte || "Perte accidentelle du badge."}
              </Descriptions.Item>
              <Descriptions.Item label="Frais Duplicata" span={2}>
                <strong style={{ fontSize: 15, color: "#c2410c" }}>
                  {data.fraisDuplicata || 50} MAD TTC
                </strong>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        {/* Enregistrement de Paiement */}
        {data.paiementInfo && (
          <>
            <Divider titlePlacement="left" style={{ borderColor: "#cbd5e1" }}>
              <DollarOutlined style={{ color: "#16a34a" }} /> Informations de Paiement
            </Divider>
            <Descriptions column={2} bordered size="small" style={{ backgroundColor: "#f8fafc" }}>
              <Descriptions.Item label="Mode Paiement">
                <Tag color="green">{data.paiementInfo.modePaiement}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Montant Réglé">
                <strong style={{ color: "#15803d" }}>
                  {data.paiementInfo.montant?.toLocaleString("fr-FR")} MAD
                </strong>
              </Descriptions.Item>
              {data.paiementInfo.numeroCheque && (
                <Descriptions.Item label="N° Chèque">
                  {data.paiementInfo.numeroCheque}
                </Descriptions.Item>
              )}
              {data.paiementInfo.banque && (
                <Descriptions.Item label="Banque">{data.paiementInfo.banque}</Descriptions.Item>
              )}
              {data.paiementInfo.datePaiement && (
                <Descriptions.Item label="Date Enregistrement">
                  {data.paiementInfo.datePaiement}
                </Descriptions.Item>
              )}
              {data.paiementInfo.validePar && (
                <Descriptions.Item label="Enregistré Par">
                  {data.paiementInfo.validePar}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <Button
                type="primary"
                icon={<FileDoneOutlined />}
                onClick={() => message.info("Génération du reçu de paiement client en cours...")}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                Imprimer Reçu de Paiement
              </Button>
            </div>
          </>
        )}

        {/* Section Actions Métier */}
        {!isDossierValide && data.statut !== "REJETEE" && (
          <div style={{ marginTop: 20, padding: "16px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: role === "RESPONSABLE" ? "1fr" : "1fr 1fr", gap: 16 }}>
              {/* ÉTAPE 1: Encaissement - strictly for AGENT and SUPERVISEUR, completely removed for RESPONSABLE */}
              {role !== "RESPONSABLE" && (
                <div style={{ padding: 14, background: "#ffffff", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                  <h5 style={{ margin: "0 0 10px 0", color: "#16a34a", fontSize: 13, fontWeight: 700 }}>
                    <DollarOutlined /> Étape 1 : Encaissement
                  </h5>
                  {isPaiementDone ? (
                    <Tag color="green" style={{ padding: "4px 10px", fontSize: 12 }}>
                      <CheckOutlined style={{ marginRight: 4 }} />Paiement encaissé
                    </Tag>
                  ) : (
                    <Space size="middle">
                      <Button
                        type="primary"
                        icon={<DollarOutlined />}
                        style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 600, borderRadius: 8, padding: "6px 16px" }}
                        onClick={handleOpenPaymentModal}
                      >
                        Encaisser Paiement
                      </Button>
                      <Button
                        danger
                        onClick={() => handleOpenRejectModal("PAIEMENT")}
                        style={{ fontWeight: 600, borderRadius: 8, padding: "6px 16px" }}
                      >
                        Refuser Paiement
                      </Button>
                    </Space>
                  )}
                </div>
              )}

              {/* ÉTAPE 2: Validation Dossier */}
              <div style={{ padding: 14, background: "#ffffff", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                <h5 style={{ margin: "0 0 10px 0", color: "#2563eb", fontSize: 13, fontWeight: 700 }}>
                  <FolderOutlined /> {role === "RESPONSABLE" ? "Validation du Dossier" : "Étape 2 : Validation Dossier"}
                </h5>
                
                {isAgent && (
                  <Button disabled icon={<LockOutlined />}>
                    Validation en attente
                  </Button>
                )}

                {(isSuperviseur || role === "RESPONSABLE") && (
                  <Space wrap>
                    {isPaiementDone ? (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => validerDossierMutation.mutate()}
                        loading={validerDossierMutation.isPending}
                        style={{ backgroundColor: "#2563eb", borderColor: "#2563eb" }}
                      >
                        Valider & Activer Dossier
                      </Button>
                    ) : (
                      <Button disabled icon={<LockOutlined />}>
                        En attente du paiement
                      </Button>
                    )}
                    <Button
                      danger
                      size="small"
                      onClick={() => handleOpenRejectModal("DOSSIER")}
                    >
                      Refuser Dossier
                    </Button>
                  </Space>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal: Saisir les infos de paiement */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DollarOutlined style={{ color: "#16a34a" }} />
            <span>Saisir les informations de paiement</span>
          </div>
        }
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={paymentForm}
          layout="vertical"
          initialValues={{ modePaiement: "ESPECES", montant: 450 }}
          onFinish={handlePaymentSubmit}
        >
          <Form.Item
            name="modePaiement"
            label="Mode de Règlement & Légalisation"
            rules={[{ required: true, message: "Veuillez choisir un mode de paiement" }]}
          >
            {data.typeClient === "ENTREPRISE" ? (
              <Input
                readOnly
                value="Chèque Bancaire & Contrat Signé Légalisé"
                style={{ fontWeight: "bold", color: "#7e22ce", backgroundColor: "#f3e8ff", borderColor: "#d8b4fe" }}
              />
            ) : (
              <Select
                options={[
                  { label: "Espèces", value: "ESPECES" },
                  { label: "Chèque Bancaire", value: "CHEQUE" },
                ]}
              />
            )}
          </Form.Item>

          <Form.Item
            name="montant"
            label="Montant en MAD"
            rules={[{ required: true, message: "Veuillez entrer le montant" }]}
            tooltip="Le montant de l'abonnement est fixe et non modifiable"
          >
            <InputNumber disabled style={{ width: "100%" }} addonAfter="MAD" min={0} />
          </Form.Item>

          {currentPaymentMode === "CHEQUE" && (
            <>
              <Form.Item
                name="numeroCheque"
                label="Numéro de Chèque"
                rules={[{ required: true, message: "Numéro de chèque requis" }]}
              >
                <Input placeholder="Ex: CHQ-987654" />
              </Form.Item>
              <Form.Item
                name="banque"
                label="Banque Émettrice"
                rules={[{ required: true, message: "Nom de la banque requis" }]}
              >
                <Select
                  placeholder="Sélectionner la banque..."
                  options={BANK_OPTIONS}
                />
              </Form.Item>
            </>
          )}

          <Form.Item name="remarques" label="Remarques / Observations">
            <Input.TextArea rows={2} placeholder="Observations éventuelles sur le paiement..." />
          </Form.Item>

          {/* Card Fee Breakdown Information Box */}
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: fraisCarteRfid > 0 ? "#fffbeb" : "#f0fdf4",
              border: `1px solid ${fraisCarteRfid > 0 ? "#fde68a" : "#bbf7d0"}`,
              marginBottom: 16,
              fontSize: 12,
            }}
          >
            <div style={{ fontWeight: 700, color: fraisCarteRfid > 0 ? "#92400e" : "#166534", marginBottom: 4 }}>
              Détail du Montant Encaissé :
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ color: "#475569" }}>Coût de l'Abonnement :</span>
              <strong>{montantBaseAbo} MAD</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#475569" }}>Frais d'Émission Carte RFID :</span>
              <strong style={{ color: fraisCarteRfid > 0 ? "#b45309" : "#16a34a" }}>
                {fraisCarteRfid > 0 ? `+${fraisCarteRfid} MAD — Nouvelle Carte` : "0 MAD — Même Carte Conservée"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #cbd5e1", paddingTop: 4, fontWeight: 800 }}>
              <span style={{ color: "#0f172a" }}>Total Net Quittancé au Guichet :</span>
              <span style={{ color: "#16a34a", fontSize: 14 }}>{montantTotalExige} MAD TTC</span>
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setPaymentModalOpen(false)}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={enregistrerPaiementMutation.isPending}
                icon={<FileDoneOutlined />}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                Confirmer & Enregistrer le Paiement
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Refuser la demande */}
      <Modal
        title={`Refuser la demande (${rejectType === "PAIEMENT" ? "Non-conformité Paiement" : "Dossier incomplet"})`}
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={() => rejeterMutation.mutate()}
        confirmLoading={rejeterMutation.isPending}
        okText="Confirmer le Refus & Notifier Client"
        okButtonProps={{ danger: true }}
      >
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
          Saisir le motif du refus :
        </p>
        <Input.TextArea
          placeholder="Motif du refus..."
          value={raison}
          onChange={(e) => setRaison(e.target.value)}
          rows={3}
        />
        <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: "#475569" }}>
            <NotificationOutlined style={{ color: "#d97706" }} />
            Notification Automatique Client (SMS & Email)
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
            Le souscripteur recevra immédiatement une notification SMS et un Email détaillant le motif du refus.
          </div>
        </div>
      </Modal>
    </div>
  );
}