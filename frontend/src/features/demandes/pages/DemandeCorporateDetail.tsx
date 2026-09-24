import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Space,
  Spin,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  MailOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  extraireMessageErreur,
  convoquerClientCorporate,
  obtenirDetailDemandeCorporate,
  refuserDemandeCorporate,
  telechargerContratCorporatePdf,
  validerDemandeCorporate,
} from "../../../api/demandesApi";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatDate } from "../../../lib/dateUtils";

function montant(valeur: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valeur);
}

export function DemandeCorporateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const demandeId = Number(id);
  const idValide = Number.isInteger(demandeId) && demandeId > 0;
  const [refusOuvert, setRefusOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [traitement, setTraitement] = useState(false);
  const [telechargement, setTelechargement] = useState(false);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["demande-corporate", demandeId],
    queryFn: () => obtenirDetailDemandeCorporate(demandeId),
    enabled: idValide,
    retry: false,
  });

  const rafraichir = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["demande-corporate", demandeId] }),
      queryClient.invalidateQueries({ queryKey: ["demandes", "corporate", "a-valider"] }),
    ]);
  };

  const valider = () => {
    Modal.confirm({
      title: "Valider cette demande corporate ?",
      content:
        "La capacité du parking sera contrôlée une nouvelle fois et un contrat non signé sera généré. Aucun abonnement, paiement, facture ou carte ne sera créé à cette étape.",
      okText: "Valider et générer le contrat",
      cancelText: "Annuler",
      onOk: async () => {
        setTraitement(true);
        setErreur(null);
        try {
          const resultat = await validerDemandeCorporate(demandeId);
          setMessageSucces(
            `Demande validée. Contrat ${resultat.referenceContrat} généré avec succès.`
          );
          await rafraichir();
        } catch (cause) {
          setErreur(extraireMessageErreur(cause));
          throw cause;
        } finally {
          setTraitement(false);
        }
      },
    });
  };

  const refuser = async () => {
    const valeur = motif.trim();
    if (!valeur) {
      setErreur("Le motif de refus est obligatoire.");
      return;
    }
    setTraitement(true);
    setErreur(null);
    try {
      await refuserDemandeCorporate(demandeId, valeur);
      setRefusOuvert(false);
      setMotif("");
      setMessageSucces("Demande refusée. Le représentant a été informé par e-mail.");
      await rafraichir();
    } catch (cause) {
      setErreur(extraireMessageErreur(cause));
    } finally {
      setTraitement(false);
    }
  };

  const telecharger = async () => {
    setTelechargement(true);
    setErreur(null);
    try {
      const url = await telechargerContratCorporatePdf(demandeId);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      setErreur(extraireMessageErreur(cause));
    } finally {
      setTelechargement(false);
    }
  };

  const convoquer = () => {
    Modal.confirm({
      title: "Inviter le client au siège RRM ?",
      content:
        "Un e-mail sera envoyé au représentant pour lui demander de venir avec le chèque, signer le contrat, le faire légaliser puis le remettre à RRM. Le contrat ne sera pas joint à l'e-mail et cette convocation ne pourra pas être renvoyée.",
      okText: "Envoyer la convocation",
      cancelText: "Annuler",
      onOk: async () => {
        setTraitement(true);
        setErreur(null);
        try {
          const resultat = await convoquerClientCorporate(demandeId);
          setMessageSucces(
            `Convocation envoyée à ${resultat.emailRepresentant}.`
          );
          await rafraichir();
        } catch (cause) {
          setErreur(extraireMessageErreur(cause));
          throw cause;
        } finally {
          setTraitement(false);
        }
      },
    });
  };

  if (!idValide) {
    return <Alert type="error" showIcon message="Identifiant de demande invalide" />;
  }
  if (query.isLoading) {
    return <Card><Spin /></Card>;
  }
  if (query.isError || !query.data) {
    return (
      <Alert
        type="error"
        showIcon
        message="Impossible de charger la demande corporate"
        description={query.isError ? extraireMessageErreur(query.error) : undefined}
      />
    );
  }

  const demande = query.data;
  const peutDecider =
    demande.statut === "EN_ATTENTE_VALIDATION_RESPONSABLE";
  const peutConvoquer =
    demande.statut === "VALIDEE" &&
    demande.contratId !== null &&
    demande.dateConvocation === null;

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/responsable/demandes-corporate")}
        style={{ marginBottom: 16 }}
      >
        Retour aux demandes corporate
      </Button>

      {messageSucces && (
        <Alert type="success" showIcon message={messageSucces} style={{ marginBottom: 16 }} />
      )}
      {erreur && (
        <Alert
          type="error"
          showIcon
          message="Opération impossible"
          description={erreur}
          closable
          onClose={() => setErreur(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card
        title={`Demande corporate : ${demande.reference}`}
        extra={<StatusBadge statut={demande.statut} />}
      >
        <Descriptions
          title="Entreprise et représentant"
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item label="Raison sociale"><strong>{demande.raisonSociale}</strong></Descriptions.Item>
          <Descriptions.Item label="ICE">{demande.ice}</Descriptions.Item>
          <Descriptions.Item label="Registre de commerce">{demande.numeroRc}</Descriptions.Item>
          <Descriptions.Item label="Titre foncier">{demande.titreFoncier}</Descriptions.Item>
          <Descriptions.Item label="Représentant">
            {demande.prenomRepresentant} {demande.nomRepresentant}
          </Descriptions.Item>
          <Descriptions.Item label="Téléphone">{demande.telephoneRepresentant}</Descriptions.Item>
          <Descriptions.Item label="E-mail">{demande.emailRepresentant}</Descriptions.Item>
          <Descriptions.Item label="CIN du représentant">{demande.cinRepresentant}</Descriptions.Item>
          <Descriptions.Item label="OTP validé le">
            {demande.dateValidationOtp ? formatDate(demande.dateValidationOtp) : "—"}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          title="Projet et stationnement"
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item label="Projet">{demande.libelleProjet}</Descriptions.Item>
          <Descriptions.Item label="Adresse">{demande.adresseProjet}</Descriptions.Item>
          <Descriptions.Item label="Plage horaire">{demande.plageHoraire}</Descriptions.Item>
          <Descriptions.Item label="Parking"><strong>{demande.parkingNom}</strong></Descriptions.Item>
          <Descriptions.Item label="Places / cartes">{demande.nombrePlaces}</Descriptions.Item>
          <Descriptions.Item label="Durée">20 ans ({demande.dureeEnMois} mois)</Descriptions.Item>
          <Descriptions.Item label="Immatriculations déclarées">
            {demande.immatriculations.length > 0
              ? demande.immatriculations.map((valeur) => <Tag key={valeur}>{valeur}</Tag>)
              : "Aucune — facultatif"}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          title="Décompte financier TTC"
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item label="Prix mensuel par place">
            {montant(demande.prixMensuelUnitaireTtc)} DH
          </Descriptions.Item>
          <Descriptions.Item label="Abonnement 240 mois">
            {montant(demande.montantAbonnementTtc)} DH
          </Descriptions.Item>
          <Descriptions.Item label="Cartes RFID">
            {montant(demande.fraisCartesTtc)} DH
          </Descriptions.Item>
          <Descriptions.Item label="Total TTC">
            <strong style={{ color: "#15803d", fontSize: 17 }}>
              {montant(demande.montantTotalTtc)} DH
            </strong>
          </Descriptions.Item>
        </Descriptions>

        {demande.referenceContrat && (
          <Alert
            type="success"
            showIcon
            message={`Contrat non signé généré : ${demande.referenceContrat}`}
            description={`Statut du contrat : ${demande.statutContrat}`}
            action={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={telechargement}
                onClick={() => void telecharger()}
              >
                Télécharger le PDF
              </Button>
            }
            style={{ marginBottom: 20 }}
          />
        )}

        {peutConvoquer && (
          <Card
            size="small"
            title="Convocation du représentant"
            style={{ borderColor: "#86efac", marginBottom: 20 }}
          >
            <Alert
              type="info"
              showIcon
              message="Le contrat est prêt"
              description="Invitez le représentant à venir au siège RRM avec le chèque pour signer le contrat. Il devra ensuite le faire légaliser et le remettre au responsable."
              style={{ marginBottom: 16 }}
            />
            <Button
              type="primary"
              icon={<MailOutlined />}
              loading={traitement}
              onClick={convoquer}
            >
              Inviter le client au bureau
            </Button>
          </Card>
        )}

        {demande.dateConvocation && (
          <Alert
            type="success"
            showIcon
            message="Convocation envoyée"
            description={`Le représentant a été invité par e-mail le ${formatDate(demande.dateConvocation)}. Paiement par chèque et signature du contrat attendus au siège RRM.`}
            style={{ marginBottom: 20 }}
          />
        )}

        {peutDecider && (
          <Card size="small" title="Décision du responsable" style={{ borderColor: "#c4b5fd" }}>
            <Alert
              type="info"
              showIcon
              message="Contrôle avant décision"
              description="Vérifiez les informations. La capacité du parking sera recalculée lors de la validation."
              style={{ marginBottom: 16 }}
            />
            <Space wrap>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={traitement}
                onClick={valider}
              >
                Valider et générer le contrat
              </Button>
              <Button
                danger
                icon={<StopOutlined />}
                disabled={traitement}
                onClick={() => setRefusOuvert(true)}
              >
                Refuser la demande
              </Button>
            </Space>
          </Card>
        )}
      </Card>

      <Modal
        open={refusOuvert}
        title="Refuser la demande corporate"
        okText="Confirmer le refus"
        cancelText="Annuler"
        okButtonProps={{ danger: true, loading: traitement }}
        onOk={() => void refuser()}
        onCancel={() => !traitement && setRefusOuvert(false)}
      >
        <p>Le motif sera envoyé par e-mail au représentant de l’entreprise.</p>
        <Input.TextArea
          rows={5}
          maxLength={1000}
          showCount
          value={motif}
          placeholder="Saisissez le motif précis du refus"
          onChange={(event) => setMotif(event.target.value)}
        />
      </Modal>
    </div>
  );
}
