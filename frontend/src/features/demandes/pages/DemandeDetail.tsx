import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Row,
  Space,
  Spin,
  Steps,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  CarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FolderOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  chargerContenuPieceJointe,
  extraireMessageErreur,
  obtenirDetailDemande,
} from "../../../api/demandesApi";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { formatDate } from "../../../lib/dateUtils";
import { roleConfig } from "../../../lib/roleConfig";
import { PaiementModal } from "../components/PaiementModal";
import type {
  EnregistrementPaiementResponse,
  PieceJointeDetailResponse,
  TypePieceJointe,
} from "../types";

interface DocumentDefinition {
  type: TypePieceJointe;
  titre: string;
  couleur: string;
  icone: React.ReactNode;
}

const DOCUMENTS_ATTENDUS: DocumentDefinition[] = [
  {
    type: "CIN_RECTO",
    titre: "Carte nationale d’identité — Recto",
    couleur: "green",
    icone: <IdcardOutlined />,
  },
  {
    type: "CIN_VERSO",
    titre: "Carte nationale d’identité — Verso",
    couleur: "green",
    icone: <IdcardOutlined />,
  },
  {
    type: "CARTE_GRISE_RECTO",
    titre: "Carte grise — Recto",
    couleur: "purple",
    icone: <CarOutlined />,
  },
  {
    type: "CARTE_GRISE_VERSO",
    titre: "Carte grise — Verso",
    couleur: "purple",
    icone: <CarOutlined />,
  },
];

function formaterMontant(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(montant);
}

function formaterTaille(tailleOctets: number): string {
  if (tailleOctets < 1024) {
    return `${tailleOctets} octets`;
  }

  if (tailleOctets < 1024 * 1024) {
    return `${(tailleOctets / 1024).toFixed(1)} Ko`;
  }

  return `${(tailleOctets / (1024 * 1024)).toFixed(1)} Mo`;
}

function DocumentCard({
  definition,
  piece,
  contenuUrl,
  chargement,
  erreur,
}: {
  definition: DocumentDefinition;
  piece?: PieceJointeDetailResponse;
  contenuUrl?: string;
  chargement: boolean;
  erreur: boolean;
}) {
  if (!piece) {
    return (
      <Card
        size="small"
        style={{
          height: "100%",
          borderRadius: 10,
          borderColor: "#fecaca",
        }}
      >
        <Alert
          type="warning"
          showIcon
          message={definition.titre}
          description="Document absent du dossier."
        />
      </Card>
    );
  }

  const estPdf = piece.typeMime === "application/pdf";
  const estImage = piece.typeMime.startsWith("image/");

  return (
    <Card
      size="small"
      style={{
        height: "100%",
        borderRadius: 10,
        borderColor: "#cbd5e1",
      }}
      title={
        <Space>
          <span style={{ color: definition.couleur }}>
            {definition.icone}
          </span>

          <span style={{ fontSize: 13, fontWeight: 700 }}>
            {definition.titre}
          </span>
        </Space>
      }
      extra={
        <Tag color={piece.statut === "TELEVERSEE" ? "success" : "default"}>
          {piece.statut}
        </Tag>
      }
    >
      <div
        style={{
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {chargement && <Spin />}

        {!chargement && erreur && (
          <Alert
            type="error"
            showIcon
            message="Chargement impossible"
            description="Le contenu du document n’a pas pu être récupéré."
          />
        )}

        {!chargement && !erreur && contenuUrl && estImage && (
          <Image
            src={contenuUrl}
            alt={definition.titre}
            style={{
              maxHeight: 220,
              width: "100%",
              objectFit: "contain",
            }}
          />
        )}

        {!chargement && !erreur && contenuUrl && estPdf && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <FilePdfOutlined
              style={{
                display: "block",
                marginBottom: 14,
                color: "#dc2626",
                fontSize: 58,
              }}
            />

            <Button
              type="primary"
              icon={<EyeOutlined />}
              href={contenuUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir le PDF
            </Button>
          </div>
        )}

        {!chargement &&
          !erreur &&
          contenuUrl &&
          !estImage &&
          !estPdf && (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              href={contenuUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir le document
            </Button>
          )}
      </div>

      <Descriptions
        column={1}
        size="small"
        style={{ marginTop: 12 }}
      >
        <Descriptions.Item label="Fichier">
          {piece.nomFichierOriginal}
        </Descriptions.Item>

        <Descriptions.Item label="Format">
          {piece.typeMime}
        </Descriptions.Item>

        <Descriptions.Item label="Taille">
          {formaterTaille(piece.tailleOctets)}
        </Descriptions.Item>

        <Descriptions.Item label="Déposé le">
          {formatDate(piece.dateDepot)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

export function DemandeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, hasAuthority } = useAuth();
  const queryClient = useQueryClient();
  const [paiementOuvert, setPaiementOuvert] = useState(false);
  const [paiementEnregistre, setPaiementEnregistre] =
    useState<EnregistrementPaiementResponse | null>(null);

  const demandeId = Number(id);
  const idValide =
    Number.isInteger(demandeId) &&
    demandeId > 0;

  const basePath = role
    ? roleConfig[role].homePath
    : "";

  const detailQuery = useQuery({
    queryKey: ["demande-detail", demandeId],
    queryFn: () => obtenirDetailDemande(demandeId),
    enabled: idValide,
    retry: false,
  });

  const piecesJointes = detailQuery.data?.piecesJointes ?? [];

  const identifiantPieces = piecesJointes
    .map((piece) => piece.id)
    .sort((a, b) => a - b)
    .join("-");

  const contenusQuery = useQuery({
    queryKey: [
      "demande-pieces-jointes",
      demandeId,
      identifiantPieces,
    ],
    queryFn: async (): Promise<Record<number, string>> => {
      const entrees = await Promise.all(
        piecesJointes.map(async (piece) => {
          const contenuUrl =
            await chargerContenuPieceJointe(piece.id);

          return [piece.id, contenuUrl] as const;
        })
      );

      return Object.fromEntries(entrees);
    },
    enabled: piecesJointes.length > 0,
    retry: false,
    gcTime: 0,
  });

  if (!idValide) {
    return (
      <Alert
        type="error"
        showIcon
        message="Identifiant de demande invalide"
      />
    );
  }

  if (detailQuery.isLoading) {
    return <Card loading />;
  }

  if (detailQuery.isError) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`${basePath}/demandes`)}
          style={{ marginBottom: 16 }}
        >
          Retour à la liste des demandes
        </Button>

        <Alert
          type="error"
          showIcon
          message="Impossible de charger la demande"
          description={extraireMessageErreur(detailQuery.error)}
        />
      </div>
    );
  }

  const data = detailQuery.data;

  if (!data) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Demande introuvable"
      />
    );
  }

  const otpValide = Boolean(data.dateValidationOtp);

  const paiementTermine =
    data.statut === "PAYEE" ||
    data.statut === "VALIDEE";

  const etapeCourante = paiementTermine
    ? 2
    : otpValide
      ? 1
      : 0;

  const trouverPiece = (
    typePiece: TypePieceJointe
  ): PieceJointeDetailResponse | undefined =>
    piecesJointes.find(
      (piece) => piece.typePiece === typePiece
    );

  const peutEnregistrerPaiement =
    data.statut === "EN_ATTENTE_PAIEMENT" &&
    hasAuthority("PAIEMENT_ENREGISTRER");

  const traiterPaiementEnregistre = async (
    paiement: EnregistrementPaiementResponse
  ) => {
    setPaiementEnregistre(paiement);
    setPaiementOuvert(false);

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["demande-detail", demandeId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["demandes", "en-attente-paiement"],
      }),
    ]);
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span>
              Détail de la demande : {data.reference}
            </span>

            <StatusBadge statut={data.statut} />
          </div>
        }
      >
        <div
          style={{
            marginBottom: 24,
            padding: "16px 24px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
          }}
        >
          <Steps
            current={etapeCourante}
            items={[
              {
                title: "Soumission",
                description: formatDate(data.dateSoumission),
                icon: <CheckCircleOutlined />,
              },
              {
                title: "Validation OTP",
                description: data.dateValidationOtp
                  ? formatDate(data.dateValidationOtp)
                  : "En attente",
                icon: <SafetyCertificateOutlined />,
              },
              {
                title: "Paiement",
                description: paiementTermine
                  ? "Paiement enregistré"
                  : data.statut === "EN_ATTENTE_PAIEMENT"
                    ? "En attente de paiement"
                    : data.statut,
                icon: <DollarOutlined />,
              },
            ]}
          />
        </div>

        {data.motifRefus && (
          <Alert
            type="error"
            showIcon
            message="Motif du refus"
            description={data.motifRefus}
            style={{ marginBottom: 20 }}
          />
        )}

        {paiementEnregistre && (
          <Alert
            type="success"
            showIcon
            message="Paiement enregistré"
            description={`Paiement ${paiementEnregistre.reference} confirmé pour ${formaterMontant(paiementEnregistre.montant)} MAD.`}
            style={{ marginBottom: 20 }}
          />
        )}

        <Descriptions
          title="Informations du souscripteur"
          column={{ xs: 1, sm: 2 }}
          bordered
          size="small"
          style={{ marginBottom: 20 }}
        >
          <Descriptions.Item label="Type de demande">
            <Tag color="blue">
              Nouvel abonnement régulier
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Catégorie client">
            <Tag color={
              data.typeClient === "ENTREPRISE"
                ? "purple"
                : "cyan"
            }>
              {data.typeClient}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Souscripteur">
            <strong>{data.clientNom}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="CIN">
            <strong>{data.cin}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {data.email}
          </Descriptions.Item>

          <Descriptions.Item label="Téléphone">
            {data.telephone}
          </Descriptions.Item>

          <Descriptions.Item label="Canal d’initiation">
            {data.canalInitiation}
          </Descriptions.Item>

          <Descriptions.Item label="Date de soumission">
            {formatDate(data.dateSoumission)}
          </Descriptions.Item>
        </Descriptions>

        <Card
          size="small"
          title={
            <Space>
              <CarOutlined style={{ color: "#7e22ce" }} />
              <span style={{ color: "#003566", fontWeight: 700 }}>
                Véhicule
              </span>
            </Space>
          }
          style={{
            marginBottom: 20,
            borderRadius: 10,
            borderColor: "#cbd5e1",
          }}
        >
          <Descriptions
            column={{ xs: 1, sm: 2 }}
            bordered
            size="small"
          >
            <Descriptions.Item label="Immatriculation">
              <Tag color="cyan">
                {data.immatriculation}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Type">
              {data.typeVehicule}
            </Descriptions.Item>

            <Descriptions.Item label="Marque">
              {data.marque || "Non renseignée"}
            </Descriptions.Item>

            <Descriptions.Item label="Modèle">
              {data.modele || "Non renseigné"}
            </Descriptions.Item>

            <Descriptions.Item label="Couleur" span={2}>
              {data.couleur || "Non renseignée"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          size="small"
          title={
            <Space>
              <FolderOutlined style={{ color: "#0284c7" }} />
              <span style={{ color: "#003566", fontWeight: 700 }}>
                Parking et formule tarifaire
              </span>
            </Space>
          }
          style={{
            marginBottom: 20,
            borderRadius: 10,
            borderColor: "#cbd5e1",
          }}
        >
          <Descriptions
            column={{ xs: 1, sm: 2 }}
            bordered
            size="small"
          >
            <Descriptions.Item label="Parking">
              <strong>{data.parkingNom}</strong>
            </Descriptions.Item>

            <Descriptions.Item label="Forfait">
              <Tag color="blue">{data.forfaitNom}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Durée">
              {data.dureeMois} mois
            </Descriptions.Item>

            <Descriptions.Item label="Paiement souhaité">
              <Tag color="green">
                {data.modePaiementSouhaite}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Prix HT">
              {formaterMontant(data.prixHT)} MAD
            </Descriptions.Item>

            <Descriptions.Item label="TVA">
              {data.tauxTVA} %
            </Descriptions.Item>

            <Descriptions.Item
              label="Montant abonnement TTC"
            >
              {formaterMontant(data.montantAbonnementTTC)} MAD
            </Descriptions.Item>

            <Descriptions.Item label="Carte d’accès TTC">
              {formaterMontant(data.fraisCarteTTC)} MAD
            </Descriptions.Item>

            <Descriptions.Item label="Montant total à payer" span={2}>
              <strong
                style={{
                  color: "#15803d",
                  fontSize: 17,
                }}
              >
                {formaterMontant(data.montantTotalTTC)} MAD TTC
              </strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          size="small"
          title={
            <Space>
              <FileImageOutlined
                style={{ color: "#0284c7" }}
              />

              <span style={{ color: "#003566", fontWeight: 700 }}>
                Pièces justificatives
              </span>
            </Space>
          }
          extra={
            <Tag color="cyan">
              {piecesJointes.length} document(s)
            </Tag>
          }
          style={{
            marginBottom: 20,
            borderRadius: 10,
            borderColor: "#cbd5e1",
            backgroundColor: "#f8fafc",
          }}
        >
          {contenusQuery.isError && (
            <Alert
              type="error"
              showIcon
              message="Certaines pièces jointes n’ont pas pu être chargées"
              description={extraireMessageErreur(
                contenusQuery.error
              )}
              style={{ marginBottom: 16 }}
            />
          )}

          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {DOCUMENTS_ATTENDUS.map((definition) => {
                const piece = trouverPiece(definition.type);

                return (
                  <Col xs={24} md={12} key={definition.type}>
                    <DocumentCard
                      definition={definition}
                      piece={piece}
                      contenuUrl={
                        piece
                          ? contenusQuery.data?.[piece.id]
                          : undefined
                      }
                      chargement={
                        Boolean(piece) &&
                        contenusQuery.isLoading
                      }
                      erreur={
                        Boolean(piece) &&
                        contenusQuery.isError
                      }
                    />
                  </Col>
                );
              })}
            </Row>
          </Image.PreviewGroup>
        </Card>

        {peutEnregistrerPaiement ? (
          <Card
            size="small"
            title="Action de paiement"
            style={{ borderColor: "#86efac" }}
          >
            <Space
              direction="vertical"
              size="middle"
              style={{ width: "100%" }}
            >
              <Alert
                type="info"
                showIcon
                message={`Mode prévu : ${data.modePaiementSouhaite}`}
                description={`Montant à encaisser : ${formaterMontant(data.montantTotalTTC)} MAD TTC`}
              />

              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => setPaiementOuvert(true)}
              >
                Enregistrer le paiement
              </Button>
            </Space>
          </Card>
        ) : (
          <Alert
            type="info"
            showIcon
            message="Consultation du dossier"
            description={
              paiementTermine
                ? "Le paiement de cette demande a déjà été enregistré."
                : "Aucune action de paiement n’est disponible pour votre profil ou pour le statut actuel."
            }
          />
        )}

        <PaiementModal
          demande={data}
          ouvert={paiementOuvert}
          onFermer={() => setPaiementOuvert(false)}
          onSucces={(paiement) => {
            void traiterPaiementEnregistre(paiement);
          }}
        />
      </Card>
    </div>
  );
}
