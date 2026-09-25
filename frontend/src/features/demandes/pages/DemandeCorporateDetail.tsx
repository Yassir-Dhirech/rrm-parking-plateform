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
  CreditCardOutlined,
  FileDoneOutlined,
  PrinterOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  declarerRetourContratCorporate,
  enregistrerPaiementCorporate,
  extraireMessageErreur,
  finaliserDemandeCorporate,
  genererFactureCorporate,
  convoquerClientCorporate,
  obtenirDetailDemandeCorporate,
  refuserDemandeCorporate,
  telechargerContratCorporatePdf,
  validerDemandeCorporate,
} from "../../../api/demandesApi";
import { telechargerFacturePdf } from "../../../api/facturationApi";
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
  const [paiementOuvert, setPaiementOuvert] = useState(false);
  const [numeroCheque, setNumeroCheque] = useState("");
  const [banqueCheque, setBanqueCheque] = useState("");
  const [dateEmissionCheque, setDateEmissionCheque] = useState("");
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

  const enregistrerCheque = async () => {
    if (!numeroCheque.trim() || !banqueCheque.trim() || !dateEmissionCheque) {
      setErreur("Le numéro, la banque et la date d'émission du chèque sont obligatoires.");
      return;
    }
    setTraitement(true);
    setErreur(null);
    try {
      await enregistrerPaiementCorporate(demandeId, {
        numeroCheque: numeroCheque.trim(),
        banqueCheque: banqueCheque.trim(),
        dateEmissionCheque,
      });
      setPaiementOuvert(false);
      setMessageSucces(
        "Paiement confirmé et remise du contrat au client enregistrés."
      );
      await rafraichir();
    } catch (cause) {
      setErreur(extraireMessageErreur(cause));
    } finally {
      setTraitement(false);
    }
  };

  const declarerRetour = () => {
    Modal.confirm({
      title: "Déclarer le retour du contrat légalisé ?",
      content:
        "Cette déclaration confirme que le responsable a physiquement récupéré le contrat signé et légalisé. Aucun document n'est téléversé.",
      okText: "Confirmer le retour",
      cancelText: "Annuler",
      onOk: async () => {
        setTraitement(true);
        setErreur(null);
        try {
          await declarerRetourContratCorporate(demandeId);
          setMessageSucces("Retour du contrat légalisé déclaré. La facture peut être générée.");
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

  const facturer = () => {
    Modal.confirm({
      title: "Générer la facture et lancer les cartes ?",
      content:
        "La signature du DG est gérée hors système. Cette action active le contrat pour 20 ans, crée l'abonnement, émet la facture et crée une demande d'impression pour chaque place.",
      okText: "Générer la facture",
      cancelText: "Annuler",
      onOk: async () => {
        setTraitement(true);
        setErreur(null);
        try {
          await genererFactureCorporate(demandeId);
          setMessageSucces("Facture générée et demandes d'impression créées.");
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

  const telechargerFacture = async (factureId: number) => {
    setTelechargement(true);
    setErreur(null);
    try {
      const url = await telechargerFacturePdf(factureId);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      setErreur(extraireMessageErreur(cause));
    } finally {
      setTelechargement(false);
    }
  };

  const finaliser = () => {
    Modal.confirm({
      title: "Finaliser la demande corporate ?",
      content:
        "Un e-mail indiquera au client que toutes les cartes et la facture sont disponibles au siège RRM. La facture ne sera pas jointe.",
      okText: "Finaliser et informer",
      cancelText: "Annuler",
      onOk: async () => {
        setTraitement(true);
        setErreur(null);
        try {
          await finaliserDemandeCorporate(demandeId);
          setMessageSucces("Demande finalisée. Le client a été informé par e-mail.");
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
  const peutEnregistrerPaiement =
    demande.statut === "EN_ATTENTE_PAIEMENT_SIGNATURE";
  const peutDeclarerRetour =
    demande.statut === "EN_ATTENTE_RETOUR_CONTRAT_LEGALISE";
  const peutFacturer = demande.statut === "EN_ATTENTE_FACTURATION";
  const peutFinaliser = demande.statut === "PRETE_A_FINALISER";

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

        {demande.paiementReference && (
          <Descriptions
            title="Paiement par chèque"
            bordered
            size="small"
            column={{ xs: 1, sm: 2 }}
            style={{ marginBottom: 20 }}
          >
            <Descriptions.Item label="Référence paiement">
              {demande.paiementReference}
            </Descriptions.Item>
            <Descriptions.Item label="Montant confirmé">
              <strong>{montant(demande.montantTotalTtc)} DH TTC</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Numéro du chèque">
              {demande.numeroCheque}
            </Descriptions.Item>
            <Descriptions.Item label="Banque">{demande.banqueCheque}</Descriptions.Item>
            <Descriptions.Item label="Date d'émission">
              {demande.dateEmissionCheque ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Contrat remis le">
              {demande.datePaiementEtRemiseContrat
                ? formatDate(demande.datePaiementEtRemiseContrat)
                : "—"}
            </Descriptions.Item>
          </Descriptions>
        )}

        {demande.factureId && (
          <Alert
            type="success"
            showIcon
            message={`Facture émise : ${demande.numeroFacture}`}
            description={`Abonnement ${demande.referenceAbonnement} créé. ${demande.nombreCartes} demande(s) d'impression générée(s).`}
            action={
              <Button
                icon={<DownloadOutlined />}
                loading={telechargement}
                onClick={() => void telechargerFacture(demande.factureId!)}
              >
                Télécharger la facture
              </Button>
            }
            style={{ marginBottom: 20 }}
          />
        )}

        {demande.statut === "EN_PREPARATION_CARTES" && (
          <Alert
            type="info"
            showIcon
            message="Impression et activation des cartes en cours"
            description={`${demande.nombreCartesActivees} carte(s) active(s) sur ${demande.nombrePlaces}. La demande passera automatiquement à l'étape de finalisation après la déclaration d'activation de la dernière carte.`}
            style={{ marginBottom: 20 }}
          />
        )}

        {demande.dateActivationCartes && (
          <Alert
            type="success"
            showIcon
            message="Toutes les cartes sont activées et testées"
            description={`Dernière déclaration d'activation : ${formatDate(demande.dateActivationCartes)}.`}
            style={{ marginBottom: 20 }}
          />
        )}

        {peutEnregistrerPaiement && (
          <Card size="small" title="Paiement et remise du contrat" style={{ marginBottom: 20 }}>
            <Alert
              type="warning"
              showIcon
              message="Le client est attendu au siège"
              description="Enregistrez le chèque après contrôle. Le montant est repris automatiquement du décompte et le paiement est immédiatement confirmé. Cette action déclare aussi la remise du contrat au client pour légalisation."
              style={{ marginBottom: 16 }}
            />
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              loading={traitement}
              onClick={() => setPaiementOuvert(true)}
            >
              Enregistrer le chèque et remettre le contrat
            </Button>
          </Card>
        )}

        {peutDeclarerRetour && (
          <Card size="small" title="Retour du contrat légalisé" style={{ marginBottom: 20 }}>
            <p>Déclarez uniquement la réception physique du contrat. Aucun téléversement n'est demandé.</p>
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              loading={traitement}
              onClick={declarerRetour}
            >
              Déclarer le contrat légalisé reçu
            </Button>
          </Card>
        )}

        {peutFacturer && (
          <Card size="small" title="Facturation et lancement des cartes" style={{ marginBottom: 20 }}>
            <p>La signature du DG est réalisée hors système. Générez la facture dès que le contrat signé est repéré.</p>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              loading={traitement}
              onClick={facturer}
            >
              Générer la facture et les demandes d'impression
            </Button>
          </Card>
        )}

        {peutFinaliser && (
          <Card size="small" title="Finalisation du dossier" style={{ marginBottom: 20 }}>
            <p>Toutes les cartes sont actives. Finalisez le dossier pour envoyer l'e-mail de disponibilité.</p>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={traitement}
              onClick={finaliser}
            >
              Finaliser et informer le client
            </Button>
          </Card>
        )}

        {demande.statut === "FINALISEE" && (
          <Alert
            type="success"
            showIcon
            message="Dossier corporate finalisé"
            description={`Le client a été informé le ${demande.dateFinalisation ? formatDate(demande.dateFinalisation) : "—"} que ses cartes et sa facture sont disponibles au siège RRM.`}
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
        open={paiementOuvert}
        title="Enregistrer le paiement corporate par chèque"
        okText="Confirmer le paiement"
        cancelText="Annuler"
        confirmLoading={traitement}
        onOk={() => void enregistrerCheque()}
        onCancel={() => !traitement && setPaiementOuvert(false)}
      >
        <Alert
          type="info"
          showIcon
          message={`Montant à confirmer : ${montant(demande.montantTotalTtc)} DH TTC`}
          style={{ marginBottom: 16 }}
        />
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Input
            value={numeroCheque}
            maxLength={80}
            placeholder="Numéro du chèque"
            onChange={(event) => setNumeroCheque(event.target.value)}
          />
          <Input
            value={banqueCheque}
            maxLength={120}
            placeholder="Banque"
            onChange={(event) => setBanqueCheque(event.target.value)}
          />
          <Input
            type="date"
            value={dateEmissionCheque}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setDateEmissionCheque(event.target.value)}
          />
        </Space>
      </Modal>

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
